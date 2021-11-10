// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import { ProtocolManager } from "./ProtocolManager.sol";
import { SocialToken } from "./socialtoken/SocialToken.sol";

import { Clones } from "../oz/proxy/Clones.sol";
import { ReentrancyGuard } from "../oz/security/ReentrancyGuard.sol";

contract Factory is ReentrancyGuard {

    /// -- CUSTOM ERRORS --
    
    error ZeroAddress();
    error NotWhitelisted();
    error Unauthorized();

    /// -- CONSTANTS --

    bytes public constant SC_TAG = "0x534f4349414c544f4b454e494d504c"; // bytes("SOCIALTOKENIMPL")
    bytes public constant OA_TAG = "0x4f5054494f4e41444150544552"; // bytes("OPTIONADAPTER")
    bytes public constant EA_TAG = "0x45584348414e474541444150544552"; // bytes("EXCHANGEADAPTER")
    bytes public constant L_TAG = "0x4c454e44494e4741444150544552"; // bytes("LENDINGADAPTER")

    /// -- STATE VARIABLES --

    /// @notice Address of the ProtocolManager
    ProtocolManager public protocolManager;

    constructor(address _protocolManager) {
        protocolManager = ProtocolManager(_protocolManager);
    }

    /// -- EVENTS --

    event NewSocialToken(address indexed token);

    /// -- MODIFIER & FUNCTIONS --

    modifier onlyProtocol {
        _onlyProtocol();
        _;
    }

    function deployNewSocialToken(
        string memory _name,
        string memory _symbol,
        address _scImplementation,
        address _denominationAsset,
        address _optionAdapter,
        address _exchangeAdapter,
        address _lendingAdapter,
        address _trader,
        uint16 _depositFee,
        uint16 _withdrawalFee,
        uint16 _managementFee,
        uint16 _performanceFee,
        bytes memory _otherInitData
    ) external nonReentrant {
        if(
            protocolManager.isWhitelisted(SC_TAG, _scImplementation) &&
            protocolManager.isWhitelisted(OA_TAG, _optionAdapter) &&
            protocolManager.isWhitelisted(EA_TAG, _exchangeAdapter) &&
            protocolManager.isWhitelisted(L_TAG, _lendingAdapter)
        ) {
            if(_trader == address(0)) {
                revert ZeroAddress();
            }

            SocialToken st = SocialToken(Clones.clone(_scImplementation));

            st.initialize(
                _name,
                _symbol,
                address(protocolManager),
                _denominationAsset,
                _optionAdapter,
                _exchangeAdapter,
                _lendingAdapter,
                _trader,
                _depositFee,
                _withdrawalFee,
                _managementFee,
                _performanceFee,
                _otherInitData
            );
        } else {
            revert NotWhitelisted();
        }
    }

    function _onlyProtocol() internal view {
        if(msg.sender != address(protocolManager))
            revert Unauthorized();
    }

}