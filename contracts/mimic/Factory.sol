// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import { Clones } from "../oz/proxy/Clones.sol";
import { ReentrancyGuard } from "../oz/security/ReentrancyGuard.sol";

contract Factory is ReentrancyGuard {

    error Unauthorized();

    /// @notice Address of the ProtocolManager
    address public protocolManager;

    constructor(address _protocolManager) {
        protocolManager = _protocolManager;
    }

    modifier onlyProtocol {
        _onlyProtocol();
        _;
    }

    function _onlyProtocol() internal view {
        if(msg.sender != protocolManager)
            revert Unauthorized();
    }

}