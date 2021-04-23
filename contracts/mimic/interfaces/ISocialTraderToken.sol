// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {ITraderManager} from "../interfaces/ITraderManager.sol";

interface ISocialTraderToken is ITraderManager {
    function executeTrade(TradeOperation[] memory _operations) external;
    function executePredeterminedTrade() external;
    function collectFee() external;
    function addUnsafeModule(address _module) external;
    function removeUnsafeModule(address _module) external;
    function interactWithUnsafeModule(address _module, bytes32 _function) external payable;
}