// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;

import {VaultToken} from "./VaultToken.sol";

contract Factory {
    error ContractCreationFailed();

    /// @notice Address of the exchange
    address private immutable exchange;

    event NewVaultToken(address indexed manager, address indexed asset, address indexed token);

    constructor(address _exchange) {
        require(_exchange != address(0), "0 address");
        exchange = _exchange;
    }

    function deployNewVaultToken(string memory _name, string memory _symbol, address _controller, address _asset) external {
        VaultToken token = new VaultToken(_name, _symbol, _controller, exchange, _asset, msg.sender);

        if(address(token) == address(0))
            revert ContractCreationFailed();
        
        emit NewVaultToken(msg.sender, _asset, address(token));
    }
}