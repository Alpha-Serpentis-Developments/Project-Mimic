// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { SocialTokenComponents } from "./SocialTokenComponents.sol";

import { ERC20Upgradeable } from "../oz/token/ERC20/ERC20Upgradeable.sol";
import { ERC20, IERC20 } from "../oz/token/ERC20/ERC20.sol";
import { SafeERC20 } from "../oz/token/ERC20/utils/SafeERC20.sol";

contract SocialToken is ERC20Upgradeable, SocialTokenComponents {
    using SafeERC20 for IERC20;

    /// -- USER-DEFINED TYPES --

    type DenomAmt is uint256; // shorthand for DenominationAmount
    type SocialTokenAmt is uint256;
    type FeePercentage is uint16;

    /// -- MODIFIERS & FUNCTIONS --

    function deposit(DenomAmt _amt) external nonReentrant {
        _deposit(_amt);    
    }
    function withdraw(SocialTokenAmt _amt) external nonReentrant {
        _withdraw(_amt);
    }

    function _deposit(DenomAmt _amt) internal virtual returns(SocialTokenAmt) {

    }
    function _withdraw(SocialTokenAmt _amt) internal virtual returns(DenomAmt) {

    }

    function _feeCalculation(uint256 _amount) internal {

    }

}