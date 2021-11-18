// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { IExchangeAdapter } from "../IExchangeAdapter.sol";

contract AirSwapAdapter is IExchangeAdapter {
    function buy(Order memory _order, bytes memory _arguments) external override {

    }
    function sell(Order memory _order, bytes memory _arguments) external override {

    }

    function _swap(Order memory _order) internal {

    }
}