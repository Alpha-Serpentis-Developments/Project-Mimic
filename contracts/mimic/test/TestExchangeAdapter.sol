// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {IExchangeAdapter} from "../adapters/IExchangeAdapter.sol";

import {IERC20, ERC20} from "../../oz/token/ERC20/ERC20.sol";
import {SafeERC20} from "../../oz/token/ERC20/utils/SafeERC20.sol";

contract TestExchangeAdapter is IExchangeAdapter {
    using SafeERC20 for IERC20;

    function buy(bytes calldata _arguments) external override returns(bytes memory) {
        return _handleTrade(_arguments);
    }

    function sell(bytes calldata _arguments) external override returns(bytes memory) {
        return _handleTrade(_arguments);
    }

    function _handleTrade(bytes calldata _arguments) internal returns(bytes memory) {
        Order memory _order = abi.decode(_arguments, (Order));

        IERC20(Token.unwrap(_order.outgoing)).safeTransferFrom(msg.sender, address(this), Size.unwrap(_order.outgoingSize));
        IERC20(Token.unwrap(_order.incoming)).safeTransfer(msg.sender, Size.unwrap(_order.incomingSize));

        return "";
    }
}