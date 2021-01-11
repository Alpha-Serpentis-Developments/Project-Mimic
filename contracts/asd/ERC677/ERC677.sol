// SPDX-License-Identifier: MIT
// ERC677 proposed @ https://github.com/ethereum/EIPs/issues/677
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC677 is ERC20 {
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {}

    function transferAndCall(
        address _receiver, 
        uint256 _amount, 
        bytes memory _data
    ) 
        public 
        virtual 
        returns(bool success) 
    {
        require(super.transfer(_receiver, _amount), "ERC20.transfer(): transfer() returned false"); // Call ERC20 transfer() method, returns a bool
        
        // Check if _receiver is a contract
        // !! Commented out as to not cause issues between smart contracts and EOAs !!
        // if(isContract(_receiver)) {
        //    _receiver.call(abi.encodeWithSignature(("onTokenTransfer(address,uint256,bytes)"), _receiver, _amount, _data));
        // }

        (bool result,) = _receiver.call(abi.encodeWithSignature(
            ("onTokenTransfer(address,uint256,bytes)"), 
            _receiver, 
            _amount, 
            _data
            )
        );

        return true; // The return value is unclear on how to be used.
    }

    /**
     * @dev Returns true if `account` is a contract.
     * 
     * !! Commented out as to not cause issues between smart contracts and users !!
     *
     * Written by OpenZeppelin
     * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.3/contracts/utils/Address.sol
     * 
     */
    // function isContract(address _account) internal view returns(bool) {
        // This method relies on extcodesize, which returns 0 for contracts in
        // construction, since the code is only stored at the end of the
        // constructor execution.

        // uint256 size;
        // // solhint-disable-next-line no-inline-assembly
        // assembly { size := extcodesize(_account) }
        // return size > 0;
    // }
}