// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {ITraderManager} from "./interfaces/ITraderManager.sol";

contract TraderManager is ITraderManager {
    function executeTrade(
        TradeOperation[] memory _operations,
        Position memory _position
    ) external override {
        _executeTradeOperations(_operations, _position);
    }

    function _executeTradeOperations(
        TradeOperation[] memory _operations,
        Position memory _position
    ) internal {
        for(uint256 i; i < _operations.length; i++) {
            TradeOperation operation = _operations[i];

             // BUY
            if(operation == TradeOperation.BUY) {

            // SELL
            } else if(operation == TradeOperation.SELL) {

            // OPEN VAULT
            } else if(operation == TradeOperation.OPENVAULT) {

            // WRITE
            } else if(operation == TradeOperation.WRITE) {

            // BURN
            } else if(operation == TradeOperation.BURN) {

            // EXERCISE
            } else if(operation == TradeOperation.EXERCISE) {

            // REDEEM COLLATERAL
            } else if(operation == TradeOperation.REDEEM_COLLATERAL) {

            }
        }
    }
}