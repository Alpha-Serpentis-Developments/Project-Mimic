// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IOptionAdapter {
    type Collateral is address;
    type Underlying is address;
    type ExpirationDate is uint256;
    type StrikePrice is uint256;

    /**
     @notice Option protocols may use the following types to define their option tokens
     - CALL represents a call option
     - PUT represents a put option
     - OTHER represents a non-conforming 'option' token (e.g., Squeeth)
     */
    enum OptionTypes { CALL, PUT, OTHER }

    /**
     @notice Option protocols may use the following actions
     - ADD_COLLATERAL adds collateral to the protocol
     - REMOVE_COLLATERAL removes collateral from the protocol
     - OPEN_VAULT opens up a 'vault'
     - WRITE_OPTION writes options
     - BURN_OPTION burns options
     - SETTLE settles options
     - EXERCISE exercies options
     */
    enum Actions {
        ADD_COLLATERAL,
        REMOVE_COLLATERAL,
        OPEN_VAULT,
        WRITE_OPTION,
        BURN_OPTION,
        SETTLE,
        EXERCISE
    }

    struct Option {
        OptionTypes optionType;
        Collateral collateral;
        ExpirationDate expiration;
        StrikePrice strike;
    }
}