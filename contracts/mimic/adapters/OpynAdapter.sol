// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { OptionAdapter, IOptionAdapter } from "./OptionAdapter.sol";

import { OtokenInterface } from "../interfaces/gamma/OtokenInterface.sol";
import { IAddressBook } from "../interfaces/gamma/IAddressBook.sol";
import { Actions, GammaTypes, IController } from "../interfaces/gamma/IController.sol";

contract OpynAdapter is OptionAdapter {

    /// @notice Address of Opyn Gamma's AddressBook
    IAddressBook public addressBook;

    function batchOperation(bytes memory _args) internal override {
        Actions.ActionArgs[] memory actions = abi.decode(_args, (Actions.ActionArgs[]));

        IController(addressBook.getController()).operate(actions);
    }
    function addCollateral(bytes memory _args) internal override {
        
    }
    function removeCollateral(bytes memory _args) internal override {

    }
    function openVault(bytes memory _args) internal override {

    }
    function writeOption(bytes memory _args) internal override {

    }
    function burnOption(bytes memory _args) internal override {

    }
    function settle(bytes memory _args) internal override {

    }
    function exercise(bytes memory _args) internal override {

    }

}