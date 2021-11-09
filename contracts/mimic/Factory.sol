// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import { Clones } from "../oz/proxy/Clones.sol";
import { ReentrancyGuard } from "../oz/security/ReentrancyGuard.sol";

contract Factory is ReentrancyGuard {

    error Unauthorized();

    /// -- CONSTANTS --

    bytes public constant SC_TAG = "0x534f4349414c544f4b454e494d504c"; // bytes("SOCIALTOKENIMPL")
    bytes public OA_TAG = "0x4f5054494f4e41444150544552"; // bytes("OPTIONADAPTER")
    bytes public EA_TAG = "0x45584348414e474541444150544552"; // bytes("EXCHANGEADAPTER")
    bytes public L_TAG = "0x4c454e44494e4741444150544552"; // bytes("LENDINGADAPTER")

    /// -- STATE VARIABLES --

    /// @notice Address of the ProtocolManager
    address public protocolManager;

    constructor(address _protocolManager) {
        protocolManager = _protocolManager;
    }

    /// -- MODIFIER & FUNCTIONS --

    modifier onlyProtocol {
        _onlyProtocol();
        _;
    }

    function deployNewSocialToken(
        address _scImplementation,
        address _protocolManager,
        address _optionAdapter,
        address _exchangeAdapter,
        address _lendingAdapter,
        address _trader,
        uint16 _depositFee,
        uint16 _withdrawalFee,
        uint16 _managementFee,
        uint16 _performanceFee
    ) external nonReentrant {
        
    }

    function _onlyProtocol() internal view {
        if(msg.sender != protocolManager)
            revert Unauthorized();
    }

}