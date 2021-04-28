// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {IExchange} from "../interfaces/IExchange.sol";

/// @title Gamma Exchange (0x Variant)
/// @author Amethyst C. (AlphaSerpentis)
/// @notice Enable trades on 0x for Opyn v2 (Gamma)
/// @dev Perform trades for 0x on Opyn v2 (Gamma)
contract GammaExchange is IExchange {
    function tokenExchange(address _inputToken, uint256 _input, address _outputToken) external override {

    }
}