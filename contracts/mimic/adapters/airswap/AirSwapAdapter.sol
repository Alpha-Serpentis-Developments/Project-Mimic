// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {IExchangeAdapter} from "../IExchangeAdapter.sol";

import {ISwap} from "./interfaces/ISwap.sol";
import {Types} from "./types/Types.sol";

contract AirSwapAdapter is IExchangeAdapter {
    address public immutable airswapExchange;

    constructor(address _exchange) {
        airswapExchange = _exchange;
    }

    function buy(bytes calldata _arguments)
        external
        override
        returns (bytes memory)
    {
        _swap(_arguments);
    }

    function sell(bytes calldata _arguments)
        external
        override
        returns (bytes memory)
    {
        _swap(_arguments);
    }

    function _swap(bytes memory _arguments) internal {
        ISwap(airswapExchange).swap(abi.decode(_arguments, (Types.Order)));
    }
}
