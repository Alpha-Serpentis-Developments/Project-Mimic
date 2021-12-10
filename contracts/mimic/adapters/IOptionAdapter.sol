// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { GeneralActions } from "../interfaces/mimic/GeneralActions.sol";

interface IOptionAdapter is GeneralActions {
    /// -- USER-DEFINED TYPES --

    type Collateral is address;
    type Underlying is address;
    type ExpirationDate is uint256;
    type StrikePrice is uint256;
    
    /// -- ENUMS & STRUCTS --

    /**
     @notice Option protocols may use the following types to define their option tokens
     - CALL represents a call option
     - PUT represents a put option
     - OTHER represents a non-conforming 'option' token (e.g., Squeeth)
     */
    enum OptionType { NULL, CALL, PUT, OTHER }

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

    /// -- FUNCTIONS --

    function batchOperation(bytes calldata _arguments) external returns(bytes memory);
    function addCollateral(bytes calldata _arguments) external returns(bytes memory);
    function removeCollateral(bytes calldata _arguments) external returns(bytes memory);
    function openVault(bytes calldata _arguments) external returns(bytes memory);
    function writeOption(bytes calldata _arguments) external returns(bytes memory);
    function burnOption(bytes calldata _arguments) external returns(bytes memory);
    function settle(bytes calldata _arguments) external returns(bytes memory);
    function exercise(bytes calldata _arguments) external returns(bytes memory);

    function getPositionsCollatAmt(bytes calldata _arguments) external view returns(bytes memory);

    function getCollateral(address _option) external view returns(Collateral);
    function getUnderlying(address _option) external view returns(Underlying);
    function getExpirationDate(address _option) external view returns(ExpirationDate);
    function getStrikePrice(address _option) external view returns(StrikePrice);
    function getIsPut(address _option) external view returns(bool);
    function getOptionDetails(address _option) external view returns(
        Collateral,
        Underlying,
        ExpirationDate,
        StrikePrice,
        bool
    );

}