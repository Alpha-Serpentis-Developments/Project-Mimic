// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { IOptionAdapter } from "./IOptionAdapter.sol";

import { OtokenInterface } from "../interfaces/gamma/OtokenInterface.sol";
import { IAddressBook } from "../interfaces/gamma/IAddressBook.sol";
import { Actions, GammaTypes, IController } from "../interfaces/gamma/IController.sol";

contract OpynAdapter is IOptionAdapter {

    /// @notice Address of Opyn Gamma's AddressBook
    IAddressBook public addressBook;

    function getCollateral(address _option) public view override returns(Collateral) {
        return Collateral.wrap(OtokenInterface(_option).collateralAsset());
    }
    function getUnderlying(address _option) public view override returns(Underlying) {
        return Underlying.wrap(OtokenInterface(_option).underlyingAsset());
    }
    function getExpirationDate(address _option) public view override returns(ExpirationDate) {
        return ExpirationDate.wrap(OtokenInterface(_option).expiryTimestamp());
    }
    function getStrikePrice(address _option) public view override returns(StrikePrice) {
        return StrikePrice.wrap(OtokenInterface(_option).strikePrice());
    }
    function getIsPut(address _option) public view override returns(bool) {
        return OtokenInterface(_option).isPut();
    }
    function getOptionDetails(address _option) public view override returns(
        Collateral,
        Underlying,
        ExpirationDate,
        StrikePrice,
        bool
    ) {
        return (
            getCollateral(_option),
            getUnderlying(_option),
            getExpirationDate(_option),
            getStrikePrice(_option),
            getIsPut(_option)
        );
    }

    function batchOperation(bytes memory _args) external override {
        Actions.ActionArgs[] memory actions = abi.decode(_args, (Actions.ActionArgs[]));

        IController(addressBook.getController()).operate(actions);
    }
    function addCollateral(bytes memory _args) external override {
        
    }
    function removeCollateral(bytes memory _args) external override {

    }
    function openVault(bytes memory _args) external override {

    }
    function writeOption(bytes memory _args) external override {

    }
    function burnOption(bytes memory _args) external override {

    }
    function settle(bytes memory _args) external override {

    }
    function exercise(bytes memory _args) external override {

    }

}