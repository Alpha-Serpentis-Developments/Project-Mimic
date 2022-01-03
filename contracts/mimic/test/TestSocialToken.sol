// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { GeneralActions } from "../interfaces/mimic/GeneralActions.sol";
import { IOptionAdapter } from "../adapters/IOptionAdapter.sol";
import { SocialToken } from "../socialtoken/SocialToken.sol";
import { IController } from "../interfaces/gamma/IController.sol";

// lightly an opyn social token
contract TestSocialToken is SocialToken {
    function allowOpynAdapter(address _controller) external onlyOwner() nonReentrant {
        IController(_controller).setOperator(optionAdapter, true);
    }

    function openVault() external onlyOwner() nonReentrant {
        GeneralActions.Action[] memory action = new GeneralActions.Action[](1);
        bytes[] memory args = new bytes[](1);
        Position memory pos;

        pos.option = IOptionAdapter.Option(
            IOptionAdapter.Collateral.wrap(0x0000000000000000000000000000000000000000),
            IOptionAdapter.Underlying.wrap(0x0000000000000000000000000000000000000000),
            IOptionAdapter.ExpirationDate.wrap(0),
            IOptionAdapter.StrikePrice.wrap(0),
            0x0000000000000000000000000000000000000000,
            IOptionAdapter.OptionType.NULL
        );

        args[0] = abi.encode(
            address(this),
            address(this),
            "0x0000000000000000000000000000000000000000",
            1,
            0,
            0,
            ""
        );

        action[0] = GeneralActions.Action.OPEN_VAULT;

        _openPosition(
            action,
            pos,
            args
        );
    }

    // function _calculateCostBasisInDenom(Position storage _pos) internal view override returns(uint256) {
        
    // }
}