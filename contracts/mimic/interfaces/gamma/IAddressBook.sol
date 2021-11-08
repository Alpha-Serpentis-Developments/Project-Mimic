// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

interface IAddressBook {
    function getController() external view returns(address);
    function getOracle() external view returns(address);
    function getMarginPool() external view returns(address);
}