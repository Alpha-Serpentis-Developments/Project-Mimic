// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { IOptionAdapter } from "./IOptionAdapter.sol";
import { ReentrancyGuard } from "../../oz/security/ReentrancyGuard.sol";

abstract contract OptionAdapter is IOptionAdapter, ReentrancyGuard {

    /// @notice Operates the specified action(s)
    /// @dev Allows to execute the specified actions with said arguments
    /// @param _actions is an array of the provided actions
    /// @param _arguments is an array of encoded data of the arguments being passed that coincides with the action
    function operateActions(Action[] memory _actions, bytes[] memory _arguments) external nonReentrant {
        for(uint256 i; i < _actions.length; i++) {
            if(_actions[i] == Action.BATCH) {
                batchOperation(_arguments[i]);
                return;
            } else if(_actions[i] == Action.ADD_COLLATERAL) {
                addCollateral(_arguments[i]);
            } else if(_actions[i] == Action.REMOVE_COLLATERAL) {
                removeCollateral(_arguments[i]);
            } else if(_actions[i] == Action.OPEN_VAULT) {
                openVault(_arguments[i]);
            } else if(_actions[i] == Action.WRITE_OPTION) {
                writeOption(_arguments[i]);
            } else if(_actions[i] == Action.BURN_OPTION) {
                burnOption(_arguments[i]);
            } else if(_actions[i] == Action.SETTLE) {
                settle(_arguments[i]);
            } else if(_actions[i] == Action.EXERCISE) {
                exercise(_arguments[i]);
            } else {
                revert Invalid_ActionDNE();
            }
        } 
    }

    function batchOperation(bytes memory _arguments) internal virtual;
    function addCollateral(bytes memory _arguments) internal virtual;
    function removeCollateral(bytes memory _arguments) internal virtual;
    function openVault(bytes memory _arguments) internal virtual;
    function writeOption(bytes memory _arguments) internal virtual;
    function burnOption(bytes memory _arguments) internal virtual;
    function settle(bytes memory _arguments) internal virtual;
    function exercise(bytes memory _arguments) internal virtual;
    
}