// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {IExchange} from "../interfaces/IExchange.sol";

/// @title Convexity Exchange
/// @author Amethyst C. (AlphaSerpentis)
/// @notice Enable trades for Opyn v1 (Convexity)
/// @dev Perform trades for Opyn v1 (Convexity) on Uniswap v1
contract ConvexityExchange is IExchange {
    function tokenExchange(address _inputToken, uint256 _input, address _outputToken) external override {

    }
}