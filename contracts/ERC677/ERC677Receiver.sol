// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @dev Implementation for a receiving contract to use. 
 */
abstract contract ERC677Receiver {
    function onTokenTransfer(
        address _from, 
        uint256 _amount, 
        bytes memory _data
    ) 
    public 
    virtual 
    returns(bool success);
}