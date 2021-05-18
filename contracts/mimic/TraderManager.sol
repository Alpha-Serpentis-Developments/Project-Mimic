// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {ITraderManager} from "./interfaces/ITraderManager.sol";

contract TraderManager is ITraderManager {
    function executeTrade(uint256 _timestamp, ITraderManager.TradeOperation[] memory _operations) external override {
        
    }
}