// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;

import {VaultToken} from "./VaultToken.sol";

contract Factory {
    error ContractCreationFailed();

    /// @notice Address of the airswap exchange
    address private immutable AIRSWAP_EXCHANGE;

    event NewVaultToken(address indexed manager, address indexed asset, address indexed token);

    constructor(address _exchange) {
        require(_exchange != address(0), "0 address");
        AIRSWAP_EXCHANGE = _exchange;
    }

    function deployNewVaultToken(string memory _name, string memory _symbol, address _controller, address _uniswap, address _asset) external {
        VaultToken token = new VaultToken(_name, _symbol, _controller, AIRSWAP_EXCHANGE, _uniswap, _asset, msg.sender);

        if(address(token) == address(0))
            revert ContractCreationFailed();
        
        emit NewVaultToken(msg.sender, _asset, address(token));
    }
}