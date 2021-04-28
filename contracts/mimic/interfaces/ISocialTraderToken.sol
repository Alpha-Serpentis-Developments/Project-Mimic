// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {ITraderManager} from "../interfaces/ITraderManager.sol";

interface ISocialTraderToken is ITraderManager {
    error ZeroAddress();
    error Unauthorized_Admin();
    error UnsafeModule_DoesNotExist();
    error TradingOperationFailed(TradeOperation operation);
    error PredeterminedStrategyExists(string strategy);

    function createPredeterminedStrategy(string memory _strategy, TradeOperation[] memory _operations) external;
    function executeTrade(TradeOperation[] memory _operations) external;
    function executePredeterminedStrategy(string memory _strategy) external;
    function collectFees() external;
    function addUnsafeModule(address _module) external;
    function removeUnsafeModule(address _module) external;
    function interactWithUnsafeModule(address _module, bytes memory _function) external payable returns(bool success, bytes memory returnData);
}