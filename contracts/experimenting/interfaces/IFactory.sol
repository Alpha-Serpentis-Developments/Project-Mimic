// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;

interface IFactory {
    function depositFee() external view returns(uint16);
    function withdrawalFee() external view returns(uint16);
}