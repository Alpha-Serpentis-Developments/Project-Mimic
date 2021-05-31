// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;

import {ISwap, Types} from "./airswap/interfaces/ISwap.sol";
import {GammaTypes, IController} from "./gamma/interfaces/IController.sol";
import {OtokenInterface} from "./gamma/interfaces/OtokenInterface.sol";
import {ERC20, IERC20} from "../oz/token/ERC20/ERC20.sol";
import {SafeERC20} from "../oz/token/ERC20/utils/SafeERC20.sol";

import "hardhat/console.sol";

contract VaultToken is ERC20 {
    using SafeERC20 for IERC20;

    error Unauthorized();
    error Unauthorized_COUNTERPARTY_DID_NOT_SIGN();
    error Invalid();
    error RatioAlreadyDefined();
    error RatioNotDefined();
    error WithdrawalWindowNotActive();
    error WithdrawalWindowActive();
    error oTokenNotCleared();
    error SettlementNotReady();

    /// @notice Time in which the withdrawal window expires
    uint256 private withdrawalWindowExpires;
    /// @notice Length of time where the withdrawal window is active
    uint256 private constant withdrawalWindowLength = 1 days;
    /// @notice Amount of collateral for the address already used for collateral
    uint256 private collateralAmount;
    /// @notice Current active vault
    uint256 private currentVaultId;
    /// @notice Address of the Gamma controller
    IController private immutable controller;
    /// @notice Address of the current oToken
    address private oToken;
    /// @notice Nonce for the exchange
    uint256 internal airswapNonce;
    /// @notice Address of the exchange
    address private immutable AIRSWAP_EXCHANGE;
    /// @notice Address of the uniswap v2 exchange
    address private immutable UNISWAP_EXCHANGE;
    /// @notice Address of the underlying asset to trade
    address public immutable asset;
    /// @notice Address of the manager (admin)
    address public immutable manager;

    event Deposit(uint256 assetDeposited, uint256 vaultTokensMinted);
    event Withdrawal(uint256 assetWithdrew, uint256 vaultTokensBurned);
    event WithdrawalWindowActivated(uint256 closesAfter);
    event CallsMinted(uint256 collateralDeposited, address indexed newOtoken, uint256 vaultId);
    event CallsSold(uint256 amountSold, address indexed premiumToken, uint256 premiumReceived);

    constructor(
        string memory _name,
        string memory _symbol,
        address _controller,
        address _airswap,
        address _uniswap,
        address _asset,
        address _manager
    ) ERC20(_name, _symbol) {
        controller = IController(_controller);
        AIRSWAP_EXCHANGE = _airswap;
        UNISWAP_EXCHANGE = _uniswap;
        asset = _asset;
        manager = _manager;
    }

    modifier onlyManager {
        _onlyManager();
        _;
    }

    modifier withdrawalWindowCheck(bool _revertIfClosed) {
        _withdrawalWindowCheck(_revertIfClosed);
        _;
    }
    
    function TEST_forceWithdrawalWindowToClose() external onlyManager {
        withdrawalWindowExpires = block.timestamp;
    }
    function TEST_forceWithdrawalWindowToOpen() external onlyManager {
        withdrawalWindowExpires = block.timestamp + withdrawalWindowLength;
    }
    
    /// @notice Deposit assets and receive vault tokens to represent a share
    /// @dev Deposits an amount of assets specified then mints vault tokens to the msg.sender
    /// @param _amount amount to deposit of ASSET
    function deposit(uint256 _amount) external {
        if(_amount == 0)
            revert Invalid();
        if(totalSupply() == 0)
            revert RatioNotDefined();

        uint256 normalizedAssetBalance = _normalize(IERC20(asset).balanceOf(address(this)), ERC20(asset).decimals(), 18);
        uint256 normalizedAmount = _normalize(_amount, ERC20(asset).decimals(), 18);
        uint256 vaultMint = 1e36 * normalizedAmount / ((normalizedAssetBalance + _normalize(collateralAmount, ERC20(asset).decimals(), 18))) / totalSupply();

        console.log(normalizedAssetBalance);
        console.log(normalizedAmount);
        console.log(vaultMint);

        if(vaultMint == 0) // Safety check for rounding errors
            revert Invalid();

        IERC20(asset).safeTransferFrom(msg.sender, address(this), _amount);
        _mint(msg.sender, vaultMint); // (Balance of Vault for Asset + Collateral Amount of Asset) * Amount of Asset to Deposit / Total Vault Token Supply
    }

    /// @notice Redeem vault tokens for assets
    /// @dev Burns vault tokens in redemption for the assets to msg.sender
    /// @param _amount amount of VAULT TOKENS to burn
    function withdraw(uint256 _amount) external withdrawalWindowCheck(true) {
        if(_amount == 0)
            revert Invalid();

        IERC20(asset).safeTransfer(msg.sender, _amount * IERC20(asset).balanceOf(address(this)) / totalSupply()); // Vault Token Amount to Burn * Balance of Vault for Asset  / Total Vault Token Supply
        _burn(address(msg.sender), _amount);
    }

    /// @notice Sets the ratio between the asset and vault token
    /// @dev Allows anyone to set the ratio 1:1 if total supply is 0 for whatever reason
    /// @param _amount amount of the VAULT TOKEN to mint
    function initializeRatio(uint256 _amount) external {
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
    /// @param _marginPool address of the margin pool
    function writeCalls(uint256 _amount, address _oToken, address _marginPool) external onlyManager {
        if(!_withdrawalWindowCheck(false))
            revert WithdrawalWindowActive();
        if(_amount == 0 || _oToken == address(0) || _marginPool == address(0))
            revert Invalid();
        if(_oToken != oToken && oToken != address(0))
            revert oTokenNotCleared();

        IController.ActionArgs[] memory actions;
        GammaTypes.Vault memory vault;

        // Check if the vault is even open and open if no vault is open
        vault = controller.getVault(address(this), currentVaultId);
        if(
            vault.shortOtokens.length == 0 &&
            vault.collateralAssets.length == 0
        ) {
            actions = new IController.ActionArgs[](3);
            currentVaultId = controller.getAccountVaultCounter(address(this)) + 1;

            actions[0] = IController.ActionArgs(
                IController.ActionType.OpenVault,
                address(this),
                address(this),
                address(0),
                currentVaultId,
                0,
                0,
                ""
            );
            

        } else {
            actions = new IController.ActionArgs[](2);
        }

        // Deposit _amount of asset to the vault
        actions[actions.length - 2] = IController.ActionArgs(
                IController.ActionType.DepositCollateral,
                address(this),
                address(this),
                asset,
                currentVaultId,
                _amount,
                0,
                ""
            );
        // Write calls
        actions[actions.length - 1] = IController.ActionArgs(
                IController.ActionType.MintShortOption,
                address(this),
                address(this),
                _oToken,
                currentVaultId,
                _normalize(_amount, ERC20(asset).decimals(), 8),
                0,
                ""
            );
        // Approve the tokens to be moved
        IERC20(asset).approve(_marginPool, _amount);
        
        // Submit the operations to the controller contract
        controller.operate(actions);

        collateralAmount += _amount;
        oToken = _oToken;

        emit CallsMinted(_amount, oToken, controller.getAccountVaultCounter(address(this)));
    }
    
    /// @notice Operation to sell calls to an EXISTING order on AirSwap
    /// @dev Sells calls via AirSwap that exists by the counterparty
    /// @param _amount Amount of calls to sell to the exchange
    /// @param _premiumIn Token address of the premium
    /// @param _premiumAmount Token amount to receive of the premium
    /// @param _otherParty Address of the counterparty
    function sellCalls(uint256 _amount, address _premiumIn, uint256 _premiumAmount, address _otherParty) external onlyManager {
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
        signer.token = _premiumIn;
        signer.amount = _premiumAmount;

        // Prepare the sender Types.Party portion (this contract) of the order
        sender.kind = 0x36372b07; // ERC20_INTERFACE_ID
        sender.token = oToken;
        sender.amount = _amount;

        // Define Types.Order
        sellOrder.nonce = airswapNonce++;
        sellOrder.expiry = block.timestamp + 1 days;
        sellOrder.signer = signer;
        sellOrder.sender = sender;
        
        // Approve
        IERC20(oToken).approve(AIRSWAP_EXCHANGE, _amount);

        ISwap(AIRSWAP_EXCHANGE).swap(sellOrder);
    }

    /// @notice Converts the premiums of selling calls to the asset
    /// @dev Converts the vault's premiums into the asset
    function convertPremiums() external onlyManager {
        
    }

    /// @notice Operation to settle the vault
    /// @dev Settles the currently open vault and opens the withdrawal window
    function settleVault() external onlyManager {
        if(!_withdrawalWindowCheck(false))
            revert WithdrawalWindowActive();

        // Check if ready to settle otherwise revert
        if(OtokenInterface(oToken).expiryTimestamp() <= block.timestamp)
            revert SettlementNotReady();

        // Settle the vault if ready
        IController.ActionArgs[] memory action = new IController.ActionArgs[](1);
        action[0] = IController.ActionArgs(
            IController.ActionType.SettleVault,
            address(this),
            address(this),
            address(0),
            currentVaultId,
            0,
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
}