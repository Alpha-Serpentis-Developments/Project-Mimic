// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

interface IExchange {
    function tokenExchange(address _inputToken, uint256 _input, address _outputToken) external;
    function mintOToken(address _inputToken, uint256 _input, address _oToken) external;
    function burnOToken(address _inputOToken, uint256 _input) external;
    function redeemCollateral(address _oToken) external;
}