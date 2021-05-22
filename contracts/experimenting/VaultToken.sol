// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;

import {ERC20, IERC20} from "../oz/token/ERC20/ERC20.sol";
import {SafeERC20} from "../oz/token/ERC20/utils/SafeERC20.sol";

contract VaultToken is ERC20 {
    using SafeERC20 for IERC20;

    error Unauthorized();
    error InvalidAmount();
    error RatioAlreadyDefined();
    error RatioNotDefined();
    error WithdrawalWindowNotActive();
    error WithdrawalWindowActive();

    /// @notice Time in which the withdrawal window expires
    uint256 private withdrawalWindowExpires;
    /// @notice Length of time where the withdrawal window is active
    uint256 private constant withdrawalWindowLength = 1 days;
    /// @notice Amount of collateral for the address already used for collateral
    uint256 private collateralAmount;
    /// @notice Address of the current oToken
    address private oToken;
    /// @notice Address of the underlying asset to trade
    address public immutable asset;
    /// @notice Address of the manager (admin)
    address public immutable manager;

    event WithdrawalWindowActivated(uint256 closesAfter);

    constructor(string memory _name, string memory _symbol, address _asset, address _manager) ERC20(_name, _symbol) {
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
    
    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        if(msg.sender == manager)
            require(balanceOf(msg.sender) - amount < 1e18, "VaultToken: Cannot withdraw initial tokens");
            
        _transfer(_msgSender(), recipient, amount);
        return true;
    }
    
    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        if(sender == manager)
            require(balanceOf(sender) - amount >= 1e18, "VaultToken: Cannot withdraw initial tokens");
            
        _transfer(sender, recipient, amount);

        uint256 currentAllowance = allowance(sender, _msgSender());
        require(currentAllowance >= amount, "ERC20: transfer amount exceeds allowance");
        _approve(sender, _msgSender(), currentAllowance - amount);

        return true;
    }
    
    /// @notice Deposit assets and receive vault tokens to represent a share
    /// @dev Deposits an amount of assets specified then mints vault tokens to the msg.sender
    /// @param _amount deposit amount for the ASSET
    function deposit(uint256 _amount) external {
        if(_amount == 0)
            revert InvalidAmount();
            
        uint256 normalizedAssetBalance = _normalize(IERC20(asset).balanceOf(address(this)), ERC20(asset).decimals(), 18);
        uint256 normalizedAmount = _normalize(_amount, ERC20(asset).decimals(), 18);

        IERC20(asset).safeTransferFrom(msg.sender, address(this), _amount);
        _mint(msg.sender, (normalizedAssetBalance + collateralAmount) * normalizedAmount / totalSupply());
    }

    /// @notice Redeem vault tokens for assets
    /// @dev Burns vault tokens in redemption for the assets to msg.sender
    /// @param _amount withdrawal amount for the VAULT TOKENS
    function withdraw(uint256 _amount) external withdrawalWindowCheck(true) {
        if(msg.sender == manager && balanceOf(msg.sender) - _amount < 1e18)
            revert Unauthorized();
        if(_amount == 0)
            revert InvalidAmount();
            
        uint256 normalizedAssetBalance = _normalize(IERC20(asset).balanceOf(address(this)), ERC20(asset).decimals(), 18);

        IERC20(asset).safeTransfer(msg.sender, _amount * IERC20(asset).balanceOf(address(this)) / totalSupply());
        _burn(address(msg.sender), _amount);
    }

    function initializeRatio() external onlyManager {
        if(totalSupply() > 0)
            revert RatioAlreadyDefined();

        _mint(address(msg.sender), 1e18);
        IERC20(asset).safeTransferFrom(msg.sender, address(this), 1 * 10**ERC20(asset).decimals());
        
        withdrawalWindowExpires = block.timestamp + withdrawalWindowLength;
        
        emit WithdrawalWindowActivated(withdrawalWindowExpires);
    }

    function writeCalls() external onlyManager {
        if(_withdrawalWindowCheck(false))
            revert WithdrawalWindowActive();
    }
    
    function sellCalls() external onlyManager {
        if(_withdrawalWindowCheck(false))
            revert WithdrawalWindowActive();
    }

    function settleVault() external onlyManager {
        if(_withdrawalWindowCheck(false))
            revert WithdrawalWindowActive();
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