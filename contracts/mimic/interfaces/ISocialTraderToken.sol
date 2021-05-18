// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {ITraderManager} from "../interfaces/ITraderManager.sol";

interface ISocialTraderToken is ITraderManager {
    error ZeroAddress();
    error TooLowMintingAmount();
    error RatioNotDefined();
    error PositionNotActive(uint256 positionTimestamp);
    error Unauthorized_Admin();
    error UnsafeModule_Disallowed();
    error UnsafeModule_DoesNotExist();
    error UnsafeModule_Revert();
    error TradingOperationFailed(TradeOperation operation);
    error PredeterminedStrategyExists(bytes32 strategy);

    function createPredeterminedStrategy(bytes32 _strategy, TradeOperation[] memory _operations) external;
    function executeTrade(uint256 _timestamp, TradeOperation[] memory _operations) external;
    function executePredeterminedStrategy(uint256 _timestamp, bytes32 _strategy) external;
    function collectFees(address _token) external;
    function addUnsafeModule(address _module) external;
    function removeUnsafeModule(address _module) external;
    function interactWithUnsafeModule(address _module, bytes memory _function, bool _revertIfUnsuccessful) external payable returns(bool success, bytes memory returnData);
}