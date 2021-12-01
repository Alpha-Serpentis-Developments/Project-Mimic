// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IExchangeAdapter {

    /// -- USER-DEFINED TYPES --
    type Token is address;
    type Exchange is address;
    type Size is uint256;

    /// -- STRUCTS --

    /**
     @notice The order represents the trade details
     - outgoing represents the outgoing token in the trade
     - incoming represents the incoming token in the trade
     - outgoingSize represents the size 
     */
    struct Order {
        Token outgoing;
        Token incoming;
        Size outgoingSize;
        Exchange exchange;
    }

    function buy(bytes memory _arguments) external returns(bytes memory);
    function sell(bytes memory _arguments) external returns(bytes memory);
}