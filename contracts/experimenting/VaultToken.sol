// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;

import {IFactory} from "./interfaces/IFactory.sol";
import {ISwap, Types} from "./airswap/interfaces/ISwap.sol";
import {IAddressBook} from "./gamma/interfaces/IAddressBook.sol";
import {Actions, GammaTypes, IController} from "./gamma/interfaces/IController.sol";
import {OtokenInterface} from "./gamma/interfaces/OtokenInterface.sol";
import {ERC20, IERC20} from "../oz/token/ERC20/ERC20.sol";
import {SafeERC20} from "../oz/token/ERC20/utils/SafeERC20.sol";
import {Pausable} from "../oz/security/Pausable.sol";
import {ReentrancyGuard} from "../oz/security/ReentrancyGuard.sol";

contract VaultToken is ERC20, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error Unauthorized();
    error Unauthorized_COUNTERPARTY_DID_NOT_SIGN();
    error Invalid();
    error MaximumFundsReached();
    error RatioAlreadyDefined();
    error RatioNotDefined();
    error WithdrawalWindowNotActive();
    error WithdrawalWindowActive();
    error oTokenNotCleared();
    error SettlementNotReady();

    /// @notice Time in which the withdrawal window expires
    uint256 public withdrawalWindowExpires;
    /// @notice Length of time where the withdrawal window is active
    uint256 private immutable withdrawalWindowLength;
    /// @notice Amount of collateral for the address already used for collateral
    uint256 public collateralAmount;
    /// @notice Current active vault
    uint256 private currentVaultId;
    /// @notice Maximum funds
    uint256 public maximumAssets;
    /// @notice Obligated fees to the manager
    uint256 private obligatedFees;
    /// @notice Deposit fee
    uint16 public depositFee;
    /// @notice Take profit fee
    uint16 public withdrawalFee;
    /// @notice Address of the current oToken
    address private oToken;
    /// @notice Address of the AddressBook
    IAddressBook private immutable addressBook;
    /// @notice Address of the exchange
    address private immutable AIRSWAP_EXCHANGE;
    /// @notice Address of the underlying asset to trade
    address public immutable asset;
    /// @notice Address of the manager (admin)
    address public immutable manager;
    /// @notice Address of the factory
    address private immutable factory;

    event Deposit(uint256 assetDeposited, uint256 vaultTokensMinted);
    event Withdrawal(uint256 assetWithdrew, uint256 vaultTokensBurned);
    event WithdrawalWindowActivated(uint256 closesAfter);
    event CallsMinted(uint256 collateralDeposited, address indexed newOtoken, uint256 vaultId);
    event CallsBurned(uint256 oTokensBurned);
    event CallsSold(uint256 amountSold, uint256 premiumReceived);
    event DepositFeeModified(uint16 newFee);
    event WithdrawalFeeModified(uint16 newFee);

    constructor(
        string memory _name,
        string memory _symbol,
        address _airswap,
        address _addressBook,
        address _asset,
        address _manager,
        uint256 _withdrawalWindowLength,
        uint256 _maximumAssets
    ) ERC20(_name, _symbol) {
        AIRSWAP_EXCHANGE = _airswap;
        addressBook = IAddressBook(_addressBook);
        asset = _asset;
        manager = _manager;
        withdrawalWindowLength = _withdrawalWindowLength;
        maximumAssets = _maximumAssets;

        factory = msg.sender;
    }

    modifier onlyManager {
        _onlyManager();
        _;
    }
    modifier withdrawalWindowCheck(bool _revertIfClosed) {
        _withdrawalWindowCheck(_revertIfClosed);
        _;
    }

    /// @notice For emergency use
    /// @dev Stops all activities on the vault (or reactivates them)
    /// @param _pause true to pause the vault, false to unpause the vault
    function emergency(bool _pause) public onlyManager {
        if(_pause)
            super._pause();
        else
            super._unpause();
    }

    /// @notice Changes the maximum allowed deposits under management
    /// @dev Changes the maximumAssets to the new amount
    /// @param _newValue new maximumAssets value
    function adjustTheMaximumAssets(uint256 _newValue) public onlyManager nonReentrant() whenNotPaused() {
        if(_newValue < collateralAmount + IERC20(asset).balanceOf(address(this)))
            revert Invalid();

        maximumAssets = _newValue;
    }

    function adjustDepositFee(uint16 _newValue) external onlyManager nonReentrant() whenNotPaused() {
        if(_newValue > 5000)
            revert Invalid();

        depositFee = _newValue;

        emit DepositFeeModified(_newValue);
    }

    function adjustWithdrawalFee(uint16 _newValue) external onlyManager nonReentrant() whenNotPaused() {
        if(_newValue > 5000)
            revert Invalid();

        withdrawalFee = _newValue;

        emit WithdrawalFeeModified(_newValue);
    }
    
    /// @notice Deposit assets and receive vault tokens to represent a share
    /// @dev Deposits an amount of assets specified then mints vault tokens to the msg.sender
    /// @param _amount amount to deposit of ASSET
    function deposit(uint256 _amount) external nonReentrant() whenNotPaused() {
        if(_amount == 0)
            revert Invalid();
        if(totalSupply() == 0)
            revert RatioNotDefined();
        if(collateralAmount + IERC20(asset).balanceOf(address(this)) + _amount > maximumAssets)
            revert MaximumFundsReached();

        // Calculate protocol-level fees
        uint256 protocolFees = _calculateFees(_amount, depositFee);
        if(protocolFees != 0)
            IERC20(asset).safeTransfer(factory, protocolFees);

        // Calculate vault-level fees
        uint256 vaultLevelFees = _calculateFees(_amount, IFactory(factory).withdrawalFee());

        uint256 vaultMint = totalSupply() * (_amount - protocolFees - vaultLevelFees) / (IERC20(asset).balanceOf(address(this)) + collateralAmount);

        if(vaultMint == 0) // Safety check for rounding errors
            revert Invalid();

        IERC20(asset).safeTransferFrom(msg.sender, address(this), _amount);
        _mint(msg.sender, vaultMint);

        emit Deposit(_amount, vaultMint);
    }

    /// @notice Redeem vault tokens for assets
    /// @dev Burns vault tokens in redemption for the assets to msg.sender
    /// @param _amount amount of VAULT TOKENS to burn
    function withdraw(uint256 _amount) external withdrawalWindowCheck(true) nonReentrant() whenNotPaused() {
        if(_amount == 0)
            revert Invalid();

        uint256 assetAmount = _amount * IERC20(asset).balanceOf(address(this)) / totalSupply();

        IERC20(asset).safeTransfer(msg.sender, assetAmount); // Vault Token Amount to Burn * Balance of Vault for Asset  / Total Vault Token Supply
        _burn(address(msg.sender), _amount);

        emit Withdrawal(assetAmount, _amount);
    }

    /// @notice Sets the ratio between the asset and vault token (initialization is not charged a fee)
    /// @dev Allows anyone to set the ratio 1:1 if total supply is 0 for whatever reason
    /// @param _amount amount of the VAULT TOKEN to mint
    function initializeRatio(uint256 _amount) external nonReentrant() whenNotPaused() {
        if(totalSupply() > 0)
            revert RatioAlreadyDefined();

        uint256 normalizedAssetAmount = _normalize(_amount, decimals(), ERC20(asset).decimals());
        
        if(normalizedAssetAmount == 0) // Safety check for rounding errors
            revert Invalid();

        _mint(address(msg.sender), _amount);
        IERC20(asset).safeTransferFrom(msg.sender, address(this), normalizedAssetAmount);
        
        withdrawalWindowExpires = block.timestamp + withdrawalWindowLength; // This WILL reset the withdrawal window if the supply was zero
        
        emit WithdrawalWindowActivated(withdrawalWindowExpires);
    }

    /// @notice Write calls for an _amount of asset for the specified oToken
    /// @dev Allows the manager to write calls for an x 
    /// @param _amount amount of the asset to deposit as collateral
    /// @param _oToken address of the oToken
    function writeCalls(uint256 _amount, address _oToken) external onlyManager nonReentrant() whenNotPaused() {
        if(!_withdrawalWindowCheck(false))
            revert WithdrawalWindowActive();
        if(_amount == 0 || _oToken == address(0))
            revert Invalid();
        if(_oToken != oToken && oToken != address(0))
            revert oTokenNotCleared();

        Actions.ActionArgs[] memory actions;
        GammaTypes.Vault memory vault;

        IController controller = IController(addressBook.getController());

        // Check if the vault is even open and open if no vault is open
        vault = controller.getVault(address(this), currentVaultId);
        if(
            vault.shortOtokens.length == 0 &&
            vault.collateralAssets.length == 0
        ) {
            actions = new Actions.ActionArgs[](3);
            currentVaultId = controller.getAccountVaultCounter(address(this)) + 1;

            actions[0] = Actions.ActionArgs(
                Actions.ActionType.OpenVault,
                address(this),
                address(this),
                address(0),
                currentVaultId,
                0,
                0,
                ""
            );
            
        } else {
            actions = new Actions.ActionArgs[](2);
        }

        // Deposit _amount of asset to the vault
        actions[actions.length - 2] = Actions.ActionArgs(
                Actions.ActionType.DepositCollateral,
                address(this),
                address(this),
                asset,
                currentVaultId,
                _amount,
                0,
                ""
            );
        // Write calls
        actions[actions.length - 1] = Actions.ActionArgs(
                Actions.ActionType.MintShortOption,
                address(this),
                address(this),
                _oToken,
                currentVaultId,
                _normalize(_amount, ERC20(asset).decimals(), 8),
                0,
                ""
            );
        // Approve the tokens to be moved
        IERC20(asset).approve(addressBook.getMarginPool(), _amount);
        
        // Submit the operations to the controller contract
        controller.operate(actions);

        collateralAmount += _amount;
        if(oToken != _oToken)
            oToken = _oToken;

        emit CallsMinted(_amount, oToken, controller.getAccountVaultCounter(address(this)));
    }

    /// @notice Burns away the oTokens to redeem the asset collateral
    /// @dev Operation to burn away the oTOkens in redemption of the asset collateral
    /// @param _amount Amount of calls to burn
    function burnCalls(uint256 _amount) external onlyManager nonReentrant() whenNotPaused() {
        if(!_withdrawalWindowCheck(false))
            revert WithdrawalWindowActive();
        if(_amount > IERC20(oToken).balanceOf(address(this)))
            revert Invalid();

        Actions.ActionArgs[] memory actions = new Actions.ActionArgs[](2);
        uint256 normalizedAmount = _normalize(_amount, 8, 18);
        actions[0] = Actions.ActionArgs(
            Actions.ActionType.BurnShortOption,
            address(this),
            address(this),
            oToken,
            currentVaultId,
            _amount,
            0,
            ""
        );
        actions[1] = Actions.ActionArgs(
            Actions.ActionType.WithdrawCollateral,
            address(this),
            address(this),
            asset,
            currentVaultId,
            normalizedAmount,
            0,
            ""
        );

        IController controller = IController(addressBook.getController());

        controller.operate(actions);
        collateralAmount -= normalizedAmount;

        if(collateralAmount == 0 && IERC20(oToken).balanceOf(address(this)) == 0) {
            // Withdrawal window reopens
            withdrawalWindowExpires = block.timestamp + withdrawalWindowLength;
            oToken = address(0);

            emit WithdrawalWindowActivated(withdrawalWindowExpires);
        }

        emit CallsBurned(_amount);
    }
    
    /// @notice Operation to sell calls to an EXISTING order on AirSwap
    /// @dev Sells calls via AirSwap that exists by the counterparty
    /// @param _amount Amount of calls to sell to the exchange
    /// @param _premiumAmount Token amount to receive of the premium
    /// @param _otherParty Address of the counterparty
    /// @param _nonce Other party's AirSwap nonce
    function sellCalls(uint256 _amount, uint256 _premiumAmount, address _otherParty, uint256 _nonce) external onlyManager nonReentrant() whenNotPaused() {
        if(!_withdrawalWindowCheck(false))
            revert WithdrawalWindowActive();
        if(_amount > IERC20(oToken).balanceOf(address(this)) || oToken == address(0))
            revert Invalid();
        if(!ISwap(AIRSWAP_EXCHANGE).signerAuthorizations(_otherParty, address(this)))
            revert Unauthorized_COUNTERPARTY_DID_NOT_SIGN();

        // Prepare the AirSwap order
        Types.Order memory sellOrder;
        Types.Party memory signer;
        Types.Party memory sender;

        // Prepare the signer Types.Party portion (counterparty) of the order
        signer.kind = 0x36372b07; // ERC20_INTERFACE_ID
        signer.wallet = _otherParty;
        signer.token = asset;
        signer.amount = _premiumAmount;

        // Prepare the sender Types.Party portion (this contract) of the order
        sender.kind = 0x36372b07; // ERC20_INTERFACE_ID
        sender.token = oToken;
        sender.amount = _amount;

        // Define Types.Order
        sellOrder.nonce = _nonce;
        sellOrder.expiry = block.timestamp + 1 days;
        sellOrder.signer = signer;
        sellOrder.sender = sender;
        
        // Approve
        IERC20(oToken).approve(AIRSWAP_EXCHANGE, _amount);

        ISwap(AIRSWAP_EXCHANGE).swap(sellOrder);

        emit CallsSold(_amount, _premiumAmount);
    }

    /// @notice Operation to settle the vault
    /// @dev Settles the currently open vault and opens the withdrawal window
    function settleVault() external onlyManager nonReentrant() whenNotPaused() {
        if(!_withdrawalWindowCheck(false))
            revert WithdrawalWindowActive();

        IController controller = IController(addressBook.getController());

        // Check if ready to settle otherwise revert
        if(!controller.isSettlementAllowed(oToken))
            revert SettlementNotReady();

        // Settle the vault if ready
        Actions.ActionArgs[] memory action = new Actions.ActionArgs[](1);
        action[0] = Actions.ActionArgs(
            Actions.ActionType.SettleVault,
            address(this),
            address(this),
            address(0),
            currentVaultId,
            IERC20(oToken).balanceOf(address(this)),
            0,
            ""
        );

        controller.operate(action);

        // Withdrawal window opens
        withdrawalWindowExpires = block.timestamp + withdrawalWindowLength;
        collateralAmount = 0;
        oToken = address(0);
        
        emit WithdrawalWindowActivated(withdrawalWindowExpires);
    }

    function _onlyManager() internal view {
        if(msg.sender != manager)
            revert Unauthorized();
    }
    
    function _normalize(
        uint256 _valueToNormalize,
        uint256 _valueDecimal,
        uint256 _normalDecimals
    ) internal pure returns (uint256) {
        int256 decimalDiff = int256(_valueDecimal) - int256(_normalDecimals);

        if(decimalDiff > 0) {
            return _valueToNormalize / (10**uint256(decimalDiff));
        } else if(decimalDiff < 0) {
            return _valueToNormalize * 10**uint256(-decimalDiff);
        } else {
            return _valueToNormalize;
        }
    }

    function _withdrawalWindowCheck(bool _revertIfClosed) internal view returns(bool isActive) {
        if(block.timestamp > withdrawalWindowExpires && _revertIfClosed)
            revert WithdrawalWindowNotActive();
        
        return block.timestamp > withdrawalWindowExpires;
    }

    function _calculateFees(uint256 _subtotal, uint16 _fee) internal pure returns(uint256) {
        return _subtotal * _fee / 10000;
    }
}