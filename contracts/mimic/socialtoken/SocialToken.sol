// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { SocialTokenComponents } from "./SocialTokenComponents.sol";

import { ERC20Upgradeable } from "../../oz/token/ERC20/ERC20Upgradeable.sol";
import { ERC20, IERC20 } from "../../oz/token/ERC20/ERC20.sol";
import { SafeERC20 } from "../../oz/token/ERC20/utils/SafeERC20.sol";

abstract contract SocialToken is ERC20Upgradeable, SocialTokenComponents {
    using SafeERC20 for IERC20;

    /// -- USER-DEFINED TYPES --

    type DenomAmt is uint256; // shorthand for DenominationAmount
    type SocialTokenAmt is uint256;
    type FeePercentage is uint16;

    /// -- MODIFIERS & FUNCTIONS --

    function deposit(DenomAmt _amt) external nonReentrant {
        uint256 mint = SocialTokenAmt.unwrap(_deposit(_amt));
        if(mint == 0 || DenomAmt.unwrap(_amt) == 0)
            revert Invalid_ZeroValue();

        _mint(msg.sender, mint);

        IERC20(denominationAsset).safeTransferFrom(msg.sender, address(this), DenomAmt.unwrap(_amt));
    }
    function withdraw(SocialTokenAmt _amt) external nonReentrant {
        _burn(msg.sender, SocialTokenAmt.unwrap(_amt));

        IERC20(denominationAsset).safeTransfer(msg.sender, DenomAmt.unwrap(_withdraw(_amt)));
    }

    function _deposit(DenomAmt _amt) internal virtual returns(SocialTokenAmt _share) {
        if(totalSupply() == 0) {
            _share = SocialTokenAmt.wrap(DenomAmt.unwrap(_amt));
        } else {
            _share = SocialTokenAmt.wrap(
                (totalSupply() * DenomAmt.unwrap(_amt)) / IERC20(denominationAsset).balanceOf(address(this))
            );
        }
    }
    function _withdraw(SocialTokenAmt _amt) internal virtual returns(DenomAmt _value) {
        _value = DenomAmt.wrap(
            (SocialTokenAmt.unwrap(_amt) * IERC20(denominationAsset).balanceOf(address(this))) / totalSupply()
        );
    }

    function _initialize(
        string memory _name,
        string memory _symbol,
        address _denominationAsset,
        address _optionAdapter,
        address _exchangeAdapter,
        address _lendingAdapter,
        address _trader,
        uint16 _depositFee,
        uint16 _withdrawalFee,
        uint16 _managementFee,
        uint16 _performanceFee
    ) internal initializer {
        __ERC20_init(_name, _symbol);
        __Ownable_init();
        if(msg.sender != _trader)
            transferOwnership(_trader);

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
        address _sendTo
    ) internal returns(uint256) {
        
    }

}