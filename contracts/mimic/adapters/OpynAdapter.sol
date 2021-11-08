// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { OptionAdapter, IOptionAdapter } from "./OptionAdapter.sol";

import { OtokenInterface } from "../interfaces/gamma/OtokenInterface.sol";
import { IAddressBook } from "../interfaces/gamma/IAddressBook.sol";
import { Actions, GammaTypes, IController } from "../interfaces/gamma/IController.sol";

contract OpynAdapter is OptionAdapter {

    /// @notice Address of Opyn Gamma's AddressBook
    IAddressBook public addressBook;

    function getCollateral(address _option) external view override returns(Collateral) {
        return Collateral.wrap(OtokenInterface(_option).collateralAsset());
    }
    function getUnderlying(address _option) external view override returns(Underlying) {
        return Underlying.wrap(OtokenInterface(_option).underlyingAsset());
    }
    function getExpirationDate(address _option) external view override returns(ExpirationDate) {
        return ExpirationDate.wrap(OtokenInterface(_option).expiryTimestamp());
    }
    function getStrikePrice(address _option) external view override returns(StrikePrice) {
        return StrikePrice.wrap(OtokenInterface(_option).strikePrice());
    }
    function getIsPut(address _option) external view override returns(bool) {
        return OtokenInterface(_option).isPut();
    }

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