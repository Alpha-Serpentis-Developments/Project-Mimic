// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;

import {VaultToken} from "./VaultToken.sol";

contract Factory {
    error ContractCreationFailed();

    event NewVaultToken(address indexed manager, address indexed asset, address indexed token);

    function deployNewVaultToken(string memory _name, string memory _symbol, address _controller, address _asset) external {
        VaultToken token = new VaultToken(_name, _symbol, _controller, _asset, msg.sender);

        if(address(token) == address(0))
            revert ContractCreationFailed();
        
        emit NewVaultToken(msg.sender, _asset, address(token));
    }
}