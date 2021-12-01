// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface ILendingAdapter {
    /// -- ENUMS --

    enum Action {
        OPEN_VAULT,
        DEPOSIT,
        WITHDRAW
    }

    function deposit(bytes memory _args) external;
    function withdraw(bytes memory _args) external;
}