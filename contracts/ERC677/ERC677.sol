// SPDX-License-Identifier: MIT
// ERC677 proposed @ https://github.com/ethereum/EIPs/issues/677
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC677 is ERC20 {
    constructor(string memory _name, string memory _symbol)
        ERC20(_name, _symbol)
    {}

    function transferAndCall(
        address _receiver,
        uint256 _amount,
        bytes memory _data
    ) public virtual returns (bool success) {
        require(
            super.transfer(_receiver, _amount),
            "ERC20.transfer(): transfer() returned false"
        ); // Call ERC20 transfer() method, returns a bool

        (bool result, ) =
            _receiver.call(
                abi.encodeWithSignature(
                    ("onTokenTransfer(address,uint256,bytes)"),
                    _receiver,
                    _amount,
                    _data
                )
            );

        return result;
    }
}
