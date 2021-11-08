// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface ILendingAdapter {
    /// -- ENUMS --

    enum Action {
        OPEN_VAULT,
        DEPOSIT,
        WITHDRAW
    }
}