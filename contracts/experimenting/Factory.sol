// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;

import {VaultToken} from "./VaultToken.sol";

contract Factory {
    event NewVaultToken(address indexed manager, address indexed asset, address indexed token);

    function deployNewVaultToken(string memory _name, string memory _symbol, address _asset) external {
        VaultToken token = new VaultToken(_name, _symbol, _asset, msg.sender);
        
        emit NewVaultToken(msg.sender, _asset, address(token));
    }
}