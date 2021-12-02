// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {ILendingAdapter} from "../ILendingAdapter.sol";

contract RibbonAdapter is ILendingAdapter {
    function deposit(bytes memory _args) external override {}

    function withdraw(bytes memory _args) external override {}
}
