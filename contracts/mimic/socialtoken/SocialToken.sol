// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { SocialTokenComponents } from "./SocialTokenComponents.sol";
import { ProtocolManager } from "../ProtocolManager.sol";

import { ERC20Upgradeable } from "../../oz/token/ERC20/ERC20Upgradeable.sol";
import { ERC20, IERC20 } from "../../oz/token/ERC20/ERC20.sol";
import { SafeERC20 } from "../../oz/token/ERC20/utils/SafeERC20.sol";

/**
 * @notice The SocialToken provides the most basic framework to operate
 * but requires to be inherited by another contract to be deployed
 */
abstract contract SocialToken is ERC20Upgradeable, SocialTokenComponents {
    using SafeERC20 for IERC20;

    /// -- USER-DEFINED TYPES --

    type DenomAmt is uint256; // shorthand for DenominationAmount
    type SocialTokenAmt is uint256;
    type FeePercentage is uint16;

    /// -- MODIFIERS & FUNCTIONS --

    function initialize(
        string memory _name,
        string memory _symbol,
        address _protocolManager,
        address _denominationAsset,
        address _optionAdapter,
        address _exchangeAdapter,
        address _lendingAdapter,
        address _trader,
        uint16 _depositFee,
        uint16 _withdrawalFee,
        uint16 _managementFee,
        uint16 _performanceFee
    ) external virtual initializer {
        _initialize(
            _name,
            _symbol,
            _protocolManager,
            _denominationAsset,
            _optionAdapter,
            _exchangeAdapter,
            _lendingAdapter,
            _trader,
            _depositFee,
            _withdrawalFee,
            _managementFee,
            _performanceFee
        );
    }

    /// @notice Deposits some asset in exchange for social tokens
    /// @dev Deposit the denominationAsset in which new social tokens get minted
    /// @param _amt Is the deposit amount 
    function deposit(DenomAmt _amt) external nonReentrant {
        uint256 mint;

        // Calculate both the protocol and social token fees
        (uint256 protocolFee, uint256 tokenFee) = (
            _feeCalculation(ProtocolManager(protocolManager).depositFee(), mint, denominationAsset, protocolManager),
            _feeCalculation(depositFee, mint, denominationAsset, address(this))
        );
        
        // Calculate the minting amount
        mint = SocialTokenAmt.unwrap(_deposit(DenomAmt.wrap(DenomAmt.unwrap(_amt) - protocolFee - tokenFee)));

        // Zero-value safety checks
        if(mint == 0 || DenomAmt.unwrap(_amt) == 0)
            revert Invalid_ZeroValue();

        // Mint new social tokens
        _mint(msg.sender, mint);

        // Deposit the denomination asset to the vault
        IERC20(denominationAsset).safeTransferFrom(msg.sender, address(this), DenomAmt.unwrap(_amt) - protocolFee - tokenFee);
    }
    /// @notice Withdraw some asset in exchange for the social token
    /// @dev Burns the social tokens and redeems the denomination asset
    /// @param _amt is the amount of social tokens being burned
    function withdraw(SocialTokenAmt _amt) external nonReentrant {
        uint256 share = DenomAmt.unwrap(_withdraw(_amt));
        if(share == 0 || SocialTokenAmt.unwrap(_amt) == 0)
            revert Invalid_ZeroValue();

        (uint256 protocolFee, uint256 tokenFee) = (
            _feeCalculation(ProtocolManager(protocolManager).withdrawalFee(), share, denominationAsset, protocolManager),
            _feeCalculation(depositFee, share, denominationAsset, address(this))
        );

        _burn(msg.sender, SocialTokenAmt.unwrap(_amt));

        IERC20(denominationAsset).safeTransfer(msg.sender, share - protocolFee - tokenFee);
    }

    function _deposit(DenomAmt _amt) internal virtual returns(SocialTokenAmt _share) { // Basic Formula = (social token supply * deposit) / (denominationAsset)
        if(totalSupply() == 0) {
            _share = SocialTokenAmt.wrap(DenomAmt.unwrap(_amt));
        } else {
            _share = SocialTokenAmt.wrap(
                (totalSupply() * DenomAmt.unwrap(_amt)) / (IERC20(denominationAsset).balanceOf(address(this)) - unredeemedFees)
            );
        }
    }
    function _withdraw(SocialTokenAmt _amt) internal virtual returns(DenomAmt _value) {
        _value = DenomAmt.wrap(
            (SocialTokenAmt.unwrap(_amt) * (IERC20(denominationAsset).balanceOf(address(this)) - unredeemedFees)) / totalSupply()
        );
    }
    function _initialize(
        string memory _name,
        string memory _symbol,
        address _protocolManager,
        address _denominationAsset,
        address _optionAdapter,
        address _exchangeAdapter,
        address _lendingAdapter,
        address _trader,
        uint16 _depositFee,
        uint16 _withdrawalFee,
        uint16 _managementFee,
        uint16 _performanceFee
    ) internal virtual {
        __ERC20_init(_name, _symbol);
        __Ownable_init();
        if(msg.sender != _trader)
            transferOwnership(_trader);

        protocolManager = _protocolManager;
        denominationAsset = _denominationAsset;
        optionAdapter = _optionAdapter;
        exchangeAdapter = _exchangeAdapter;
        lendingAdapter = _lendingAdapter;
        depositFee = _depositFee;
        withdrawalFee = _withdrawalFee;
        managementFee = _managementFee;
        performanceFee = _performanceFee;
    }

    function _feeCalculation(
        uint16 _rate,
        uint256 _amount,
        address _token,
        address _sendTo
    ) internal virtual returns(uint256 fee) {
        fee = _amount * _rate / 10000;

        if(fee != 0 && _token != address(0)) {
            if(_sendTo == address(this))
                unredeemedFees += fee;
            else
                IERC20(_token).safeTransferFrom(msg.sender, address(_sendTo), fee);
        }
    }

}