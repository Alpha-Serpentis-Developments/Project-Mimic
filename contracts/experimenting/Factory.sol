// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;

import {VaultToken} from "./VaultToken.sol";

contract Factory {
    error ContractCreationFailed();
    error ZeroAddress();

    /// @notice Address of the airswap exchange
    address public immutable AIRSWAP_EXCHANGE;

    event NewVaultToken(address indexed manager, address indexed asset, address indexed vaultToken);

    constructor(address _exchange) {
        require(_exchange != address(0), "0 address");
        AIRSWAP_EXCHANGE = _exchange;
    }

    /// @notice Deploys a new vault token
    /// @dev Deploys a new vault token under the given parameters for the caller
    /// @param _name name of the vault token
    /// @param _symbol symbol of the vault token
    /// @param _controller address of the Gamma controller
    /// @param _asset address of the asset token (what the vault is denominated in)
    function deployNewVaultToken(string memory _name, string memory _symbol, address _controller, address _asset, uint256 _maximumAssets) external {
        if(_controller == address(0) || _asset == address(0))
            revert ZeroAddress();
        VaultToken vToken = new VaultToken(_name, _symbol, _controller, AIRSWAP_EXCHANGE, _asset, msg.sender, _maximumAssets);

        if(address(vToken) == address(0))
            revert ContractCreationFailed();
        
        emit NewVaultToken(msg.sender, _asset, address(vToken));
    }
}