// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IOptionAdapter {
    /// -- USER-DEFINED TYPES --

    type Collateral is address;
    type Underlying is address;
    type ExpirationDate is uint256;
    type StrikePrice is uint256;

    /// -- CUSTOM ERRORS --

    error Invalid_ActionDNE();
    
    /// -- ENUMS --

    /**
     @notice Option protocols may use the following types to define their option tokens
     - CALL represents a call option
     - PUT represents a put option
     - OTHER represents a non-conforming 'option' token (e.g., Squeeth)
     */
    enum OptionType { CALL, PUT, OTHER }

    /**
     @notice Option protocols may use the following actions
     - ADD_COLLATERAL adds collateral to the protocol
     - REMOVE_COLLATERAL removes collateral from the protocol
     - OPEN_VAULT opens up a 'vault'
     - WRITE_OPTION writes options
     - BURN_OPTION burns options
     - SETTLE settles options
     - EXERCISE exercies options
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
        BATCH
    }

    /**
     @notice Option protocols may use the following struct to define their option token
     - collateral is the address of the token used for collateralizing the option
     - underlying is the address of the token used for what the option references
     - expiration is the time in seconds on when the option will expire
     - strike is the strike price of the option
     - token is the address of the option token the struct references
     - optionType is the type of option it is
     */
    struct Option {
        Collateral collateral;
        Underlying underlying;
        ExpirationDate expiration;
        StrikePrice strike;
        address token;
        OptionType optionType;
    }

}