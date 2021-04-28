// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

interface IExchange {
    function tokenExchange(address _inputToken, uint256 _input, address _outputToken) external;
}