// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface GeneralActions {
    /**
     @notice Protocols may use the following actions
     - ADD_COLLATERAL adds collateral to the protocol
     - REMOVE_COLLATERAL removes collateral from the protocol
     - OPEN_VAULT opens up a 'vault'
     - WRITE_OPTION writes options
     - BURN_OPTION burns options
     - SETTLE settles options
     - EXERCISE exercies options
     - BUY executes a buy order (with the denomination asset)
     - SELL executes a sell order (with some other asset)
     - BATCH tells the adapter to not individually call the functions
     */
    enum Action {
        ADD_COLLATERAL,
        REMOVE_COLLATERAL,
        OPEN_VAULT,
        WRITE_OPTION,
        BURN_OPTION,
        SETTLE,
        EXERCISE,
        BUY,
        SELL,
        BATCH
    }
}