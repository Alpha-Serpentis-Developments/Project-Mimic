// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface GeneralActions {

    /// -- CUSTOM ERRORS --

    error Invalid_ActionDNE();

    /// -- ENUMS --

    /**
     @notice Protocols may use the following actions
     - [0] ADD_COLLATERAL adds collateral to the protocol
     - [1] REMOVE_COLLATERAL removes collateral from the protocol
     - [2] OPEN_VAULT opens up a 'vault'
     - [3] WRITE_OPTION writes options
     - [4] BURN_OPTION burns options
     - [5] REDEEM redeems the vault
     - [6] SETTLE settles options
     - [7] EXERCISE exercies options
     - [8] BUY executes a buy order (with the denomination asset)
     - [9] SELL executes a sell order (with some other asset)
     - [10] LEND executes to lend out deposits
     - [11] WITHDRAW_LEND executes to withdraw lent out assets
     - [12] INCREASE_ALLOWANCE executes an increase in approval (PRIORITY IN THE ARRAY OF ACTIONS)
     - [13] DECREASE_ALLOWANCE executes a decrease in approval
     - [14] BATCH tells the adapter to not individually call the functions (SECOND PRIORITY IN THE ARRAY OF ACTIONS) - WILL END EXECUTION AFTER BATCH CALL
     */
    enum Action {
        ADD_COLLATERAL,
        REMOVE_COLLATERAL,
        OPEN_VAULT,
        WRITE_OPTION,
        BURN_OPTION,
        REDEEM,
        SETTLE,
        EXERCISE,
        BUY,
        SELL,
        LEND,
        WITHDRAW_LEND,
        INCREASE_ALLOWANCE,
        DECREASE_ALLOWANCE,
        BATCH
    }
}