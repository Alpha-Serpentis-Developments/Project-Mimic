// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;

import {IFactory} from "./interfaces/IFactory.sol";
import {ISwap, Types} from "./airswap/interfaces/ISwap.sol";
import {IAddressBook} from "./gamma/interfaces/IAddressBook.sol";
import {Actions, GammaTypes, IController} from "./gamma/interfaces/IController.sol";
import {OtokenInterface} from "./gamma/interfaces/OtokenInterface.sol";
import {ERC20Upgradeable} from "../oz/token/ERC20/ERC20Upgradeable.sol";
import {ERC20, IERC20} from "../oz/token/ERC20/ERC20.sol";
import {SafeERC20} from "../oz/token/ERC20/utils/SafeERC20.sol";
import {PausableUpgradeable} from "../oz/security/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "../oz/security/ReentrancyGuardUpgradeable.sol";

contract VaultToken is ERC20Upgradeable, PausableUpgradeable, ReentrancyGuardUpgradeable {
    using SafeERC20 for IERC20;

    error Unauthorized();
    error Unauthorized_COUNTERPARTY_DID_NOT_SIGN();
    error Invalid();
    error NotEnoughFunds();
    error NotEnoughFunds_ReserveViolation();
    error MaximumFundsReached();
    error RatioAlreadyDefined();
    error WithdrawalWindowNotActive();
    error WithdrawalWindowActive();
    error oTokenNotCleared();
    error SettlementNotReady();
    error ClosedPermanently();

    /// @notice Time in which the withdrawal window expires
    uint256 public withdrawalWindowExpires;
    /// @notice Length of time where the withdrawal window is active
    uint256 public withdrawalWindowLength;
    /// @notice Amount of collateral for the address already used for collateral
    uint256 public collateralAmount;
    /// @notice Current active vault
    uint256 private currentVaultId;
    /// @notice Maximum funds
    uint256 public maximumAssets;
    /// @notice Obligated fees to the manager
    uint256 public obligatedFees;
    /// @notice Deposit fee
    uint16 public depositFee;
    /// @notice Take profit fee
    uint16 public withdrawalFee;
    /// @notice Performance fee (taken when options are sold)
    uint16 public performanceFee;
    /// @notice Withdrawal reserve percentage
    uint16 public withdrawalReserve;
    /// @notice Current reserves
    uint256 public currentReserves;
    /// @notice Address of the current oToken
    address public oToken;
    /// @notice Address of the AddressBook
    IAddressBook private addressBook;
    /// @notice Address of the underlying asset to trade
    address public asset;
    /// @notice Address of the manager (admin)
    address public manager;
    /// @notice Address of the factory
    IFactory public factory;
    /// @notice Determines if the vault is closed permanently
    bool public closedPermanently;

    event Deposit(uint256 assetDeposited, uint256 vaultTokensMinted);
    event Withdrawal(uint256 assetWithdrew, uint256 vaultTokensBurned);
    event WithdrawalWindowActivated(uint256 closesAfter);
    event OptionsMinted(uint256 collateralDeposited, address indexed newOtoken, uint256 vaultId);
    event OptionsBurned(uint256 oTokensBurned);
    event OptionsSold(uint256 amountSold, uint256 premiumReceived);
    event ReservesEstablished(uint256 allocatedReserves);
    event MaximumAssetsModified(uint256 newAUM);
    event DepositFeeModified(uint16 newFee);
    event WithdrawalFeeModified(uint16 newFee);
    event PerformanceFeeModified(uint16 newFee);
    event WithdrawalReserveModified(uint16 newReserve);

    modifier onlyManager {
        _onlyManager();
        _;
    }
    modifier withdrawalWindowCheck(bool _revertIfClosed) {
        _withdrawalWindowCheck(_revertIfClosed);
        _;
    }

    function initialize(
        string memory _name,
        string memory _symbol,
        address _asset,
        address _manager,
        address _addressBook,
        address _factory,
        uint256 _withdrawalWindowLength,
        uint256 _maximumAssets
    ) external initializer {
        __ERC20_init_unchained(_name, _symbol);
        asset = _asset;
        manager = _manager;
        addressBook = IAddressBook(_addressBook);
        factory = IFactory(_factory);
        withdrawalWindowLength = _withdrawalWindowLength;
        maximumAssets = _maximumAssets;
    }

    /// @notice For emergency use
    /// @dev Stops all activities on the vault (or reactivates them)
    /// @param _pause true to pause the vault, false to unpause the vault
    function emergency(bool _pause) external onlyManager {
        if(_pause)
            super._pause();
        else
            super._unpause();
    }

    /// @notice Changes the maximum allowed deposits under management
    /// @dev Changes the maximumAssets to the new amount
    /// @param _newValue new maximumAssets value
    function adjustTheMaximumAssets(uint256 _newValue) external onlyManager nonReentrant() whenNotPaused() {
        if(_newValue < collateralAmount + IERC20(asset).balanceOf(address(this)))
            revert Invalid();

        maximumAssets = _newValue;

        emit MaximumAssetsModified(_newValue);
    }

    /// @notice Changes the deposit fee
    /// @dev Changes the depositFee with two decimals of precision up to 50.00% (5000)
    /// @param _newValue new depositFee with two decimals of precision
    function adjustDepositFee(uint16 _newValue) external onlyManager nonReentrant() whenNotPaused() {
        if(_newValue > 5000)
            revert Invalid();

        depositFee = _newValue;

        emit DepositFeeModified(_newValue);
    }

    /// @notice Changes the withdrawal fee
    /// @dev Changes the withdrawalFee with two decimals of precision up to 50.00% (5000)
    /// @param _newValue new withdrawalFee with two decimals of precision
    function adjustWithdrawalFee(uint16 _newValue) external onlyManager nonReentrant() whenNotPaused() {
        if(_newValue > 5000)
            revert Invalid();

        withdrawalFee = _newValue;

        emit WithdrawalFeeModified(_newValue);
    }
    
    /// @notice Changes the performance fee
    /// @dev Changes the performanceFee with two decimals of precision up to 50.00% (5000)
    /// @param _newValue new performanceFee with two decimals of precision
    function adjustPerformanceFee(uint16 _newValue) external onlyManager nonReentrant() whenNotPaused() {
        if(_newValue > 5000)
            revert Invalid();
            
        performanceFee = _newValue;
        
        emit PerformanceFeeModified(_newValue);
    }

    /// @notice Changes the withdrawal reserve percentage
    /// @dev Changes the withdrawalReserve with two decimals of precision up to 50.00% (5000)
    /// @param _newValue new withdrawalReserve with two decimals of precision
    function adjustWithdrawalReserve(uint16 _newValue) external onlyManager nonReentrant() whenNotPaused() {
        if(_newValue > 5000)
            revert Invalid();

        withdrawalReserve = _newValue;

        emit WithdrawalReserveModified(_newValue);
    }

    /// @notice Changes the withdrawal window length
    /// @dev Changes the withdrawalWindowLength with 6 hour minimum
    /// @param _newValue new withdrawalWindowLength that's at least 6 hours
    function adjustWithdrawalWindowLength(uint256 _newValue) external onlyManager nonReentrant() whenNotPaused() {
        if(_newValue < 21600) // 6 hour minimum
            revert Invalid();

        withdrawalWindowLength = _newValue;
    }

    /// @notice Allows the manager to collect fees
    /// @dev Transfers all of the obligatedFees to the manager and sets it to zero
    function sweepFees() external onlyManager nonReentrant() whenNotPaused() {
        IERC20(asset).safeTransfer(msg.sender, obligatedFees);
        obligatedFees = 0;
    }
    
    /// @notice Deposit assets and receive vault tokens to represent a share
    /// @dev Deposits an amount of assets specified then mints vault tokens to the msg.sender
    /// @param _amount amount to deposit of ASSET
    function deposit(uint256 _amount) external nonReentrant() whenNotPaused() {
        if(closedPermanently)
            revert ClosedPermanently();
        if(_amount == 0)
            revert Invalid();
        if(collateralAmount + IERC20(asset).balanceOf(address(this)) + _amount - obligatedFees > maximumAssets)
            revert MaximumFundsReached();

        uint256 vaultMint;
        uint256 protocolFees;
        uint256 vaultFees;

        // Calculate protocol-level fees
        if(factory.depositFee() != 0) {
            protocolFees = _percentMultiply(_amount, factory.depositFee());
        }

        // Calculate vault-level fees
        if(depositFee != 0) {
            vaultFees = _percentMultiply(_amount, depositFee);
        }

        // Check if the total supply is zero
        if(totalSupply() == 0) {
            vaultMint = _normalize(_amount - protocolFees - vaultFees, ERC20(asset).decimals(), decimals());
            withdrawalWindowExpires = block.timestamp + withdrawalWindowLength;
        } else {
            vaultMint = totalSupply() * (_amount - protocolFees - vaultFees) / (IERC20(asset).balanceOf(address(this)) + collateralAmount - obligatedFees);
        }

        obligatedFees += vaultFees;

        if(vaultMint == 0) // Safety check for rounding errors
            revert Invalid();

        IERC20(asset).safeTransferFrom(msg.sender, address(this), _amount);
        IERC20(asset).safeTransfer(factory.admin(), protocolFees);
        _mint(msg.sender, vaultMint);

        emit Deposit(_amount, vaultMint);
    }

    /// @notice Redeem vault tokens for assets
    /// @dev Burns vault tokens in redemption for the assets to msg.sender
    /// @param _amount amount of VAULT TOKENS to burn
    function withdraw(uint256 _amount) external nonReentrant() whenNotPaused() {
        if(_amount == 0)
            revert Invalid();

        uint256 assetAmount = _amount * (IERC20(asset).balanceOf(address(this)) + collateralAmount - obligatedFees) / totalSupply();
        uint256 protocolFee;
        
        if(factory.withdrawalFee() > 0) {
            protocolFee = _percentMultiply(_amount, factory.withdrawalFee());
            IERC20(asset).safeTransfer(factory.admin(), protocolFee);
        }
        uint256 vaultFee = _percentMultiply(_amount, withdrawalFee);

        assetAmount -= (protocolFee + vaultFee);
        obligatedFees += vaultFee;

        // Safety check
        if(assetAmount == 0)
            revert Invalid();

        // (Reserve) safety check
        if(assetAmount > currentReserves && _withdrawalWindowCheck(false))
            revert NotEnoughFunds_ReserveViolation();

        IERC20(asset).safeTransfer(msg.sender, assetAmount); // Vault Token Amount to Burn * Balance of Vault for Asset  / Total Vault Token Supply
        _burn(address(msg.sender), _amount);

        emit Withdrawal(assetAmount, _amount);
    }

    /// @notice Allows anyone to call it in the event the withdrawal window is closed, but no action has occurred within 1 day
    /// @dev Reopens the withdrawal window for a minimum of one day, whichever is greater
    function reactivateWithdrawalWindow() external nonReentrant() whenNotPaused() {
        if(block.timestamp < withdrawalWindowExpires + 1 days)
            revert Invalid();
        
        if(withdrawalWindowLength > 1 days)
            withdrawalWindowExpires = block.timestamp + withdrawalWindowLength;
        else
            withdrawalWindowExpires = block.timestamp + 1 days;

        emit WithdrawalWindowActivated(withdrawalWindowExpires);
    }

    /// @notice Write calls for an _amount of asset for the specified oToken
    /// @dev Allows the manager to write calls for an x 
    /// @param _amount amount of the asset to deposit as collateral
    /// @param _oToken address of the oToken
    function writeOptions(uint256 _amount, address _oToken) external onlyManager nonReentrant() whenNotPaused() {
        _writeOptions(_amount, _oToken);
    }

    /// @notice Write calls for a _percentage of the current balance of the vault
    /// @dev Uses percentage of the vault instead of a specific number (helpful for multi-sigs)
    /// @param _percentage A uint16 representing up to 10000 (100.00%) with two decimals of precision for the amount of asset tokens to write
    /// @param _oToken address of the oToken
    function writeOptions(uint16 _percentage, address _oToken) external onlyManager nonReentrant() whenNotPaused() {
        _writeOptions(
            _percentMultiply(
                IERC20(asset).balanceOf(address(this)) - obligatedFees, _percentage
            ),
            _oToken
        );
    }

    /// @notice Burns away the oTokens to redeem the asset collateral
    /// @dev Operation to burn away the oTOkens in redemption of the asset collateral
    /// @param _amount Amount of calls to burn
    function burnOptions(uint256 _amount) external onlyManager nonReentrant() whenNotPaused() {
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

        emit OptionsBurned(_amount);
    }
    
    /// @notice Operation to sell calls to an EXISTING order on AirSwap
    /// @dev Sells calls via AirSwap that exists by the counterparty
    /// @param _amount Amount of calls to sell to the exchange
    /// @param _premiumAmount Token amount to receive of the premium
    /// @param _otherParty Address of the counterparty
    /// @param _nonce Other party's AirSwap nonce
    function sellOptions(uint256 _amount, uint256 _premiumAmount, address _otherParty, uint256 _nonce) external onlyManager nonReentrant() whenNotPaused() {
        _sellOptions(_amount, _premiumAmount, _otherParty, _nonce);
    }

    /// @notice Operation to both write AND sell options
    /// @dev Operation that can handle both the `writeOptions()` and `sellCalls()` at the same time
    /// @param _amount Amount of the asset token to collateralize the option
    /// @param _oToken Address of the oToken to write with
    /// @param _premiumAmount Amount of the oTokens to sell
    /// @param _otherParty address of the counterparty via AirSwap
    /// @param _nonce other party's AirSwap nonce
    function writeAndSellOptions(
        uint256 _amount,
        address _oToken,
        uint256 _premiumAmount,
        address _otherParty,
        uint256 _nonce
    ) external onlyManager nonReentrant() whenNotPaused() {
        uint256 oTokenPrevBal = IERC20(_oToken).balanceOf(address(this));

        _writeOptions(
            _amount,
            _oToken
        );
        _sellOptions(
            IERC20(_oToken).balanceOf(address(this)) - oTokenPrevBal, // This should NEVER underflow
            _premiumAmount,
            _otherParty,
            _nonce
        );
    }

    /// @notice Operation to both write AND sell options
    /// @dev Operation that can handle both the `writeOptions()` and `sellCalls()` at the same time
    /// @param _percentage Percentage of the available asset tokens to write and sell
    /// @param _oToken Address of the oToken to write with
    /// @param _premiumAmount Amount of the oTokens to sell
    /// @param _otherParty address of the counterparty via AirSwap
    /// @param _nonce other party's AirSwap nonce
    function writeAndSellOptions(
        uint16 _percentage,
        address _oToken,
        uint256 _premiumAmount,
        address _otherParty,
        uint256 _nonce
    ) external onlyManager nonReentrant() whenNotPaused() {
        uint256 oTokenPrevBal = IERC20(_oToken).balanceOf(address(this));

        _writeOptions(
            _percentMultiply(
                IERC20(asset).balanceOf(address(this)) - obligatedFees,
                _percentage
            ),
            _oToken
        );
        _sellOptions(
            IERC20(_oToken).balanceOf(address(this)) - oTokenPrevBal, // This should NEVER underflow
            _premiumAmount,
            _otherParty,
            _nonce
        );
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

    function _writeOptions(uint256 _amount, address _oToken) internal {
        if(!_withdrawalWindowCheck(false))
            revert WithdrawalWindowActive();
        if(_amount == 0 || _oToken == address(0))
            revert Invalid();
        if(_amount > IERC20(asset).balanceOf(address(this)) - obligatedFees)
            revert NotEnoughFunds();
        if(_oToken != oToken && oToken != address(0))
            revert oTokenNotCleared();

        // Calculate reserves if not already done
        if(oToken == address(0))
            _calculateAndSetReserves();

        // Check if the _amount exceeds the reserves
        if(_amount > IERC20(asset).balanceOf(address(this)) - obligatedFees - currentReserves)
            revert NotEnoughFunds_ReserveViolation();

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
        // Write options
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

        emit OptionsMinted(_amount, oToken, controller.getAccountVaultCounter(address(this)));
    }

    function _sellOptions(uint256 _amount, uint256 _premiumAmount, address _otherParty, uint256 _nonce) internal {
        if(!_withdrawalWindowCheck(false))
            revert WithdrawalWindowActive();
        if(_amount > IERC20(oToken).balanceOf(address(this)) || oToken == address(0))
            revert Invalid();
        if(!ISwap(factory.airswapExchange()).signerAuthorizations(_otherParty, address(this)))
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
        IERC20(oToken).approve(factory.airswapExchange(), _amount);

        ISwap(factory.airswapExchange()).swap(sellOrder);
        
        // Calculate performance fee
        obligatedFees += _percentMultiply(_premiumAmount, performanceFee);

        emit OptionsSold(_amount, _premiumAmount);
    }

    function _calculateAndSetReserves() internal {
        currentReserves = _percentMultiply(IERC20(asset).balanceOf(address(this)), withdrawalReserve);
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

    function _percentMultiply(uint256 _subtotal, uint16 _fee) internal pure returns(uint256) {
        return _subtotal * _fee / 10000;
    }
}