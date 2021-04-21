// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ITraderManager} from "../interfaces/ITraderManager.sol";

interface ISocialTraderToken is IERC20, ITraderManager {
    function executeTrade(TradeOperation[] memory _operations) external;
    function executePredeterminedTrade() external;
    function collectFee() external;
    function addUnsafeModule(address _module) external;
    function removeUnsafeModule(address _module) external;
    function interactWithUnsafeModule(address _module, bytes32 _function) external payable;
}