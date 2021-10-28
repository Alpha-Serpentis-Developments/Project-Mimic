// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

interface IFactory {
    function admin() external view returns(address);
    function airswapExchange() external view returns(address);
    function depositFee() external view returns(uint16);
    function performanceFee() external view returns(uint16);
    function withdrawalFee() external view returns(uint16);
}