// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {IOptionAdapter} from "../IOptionAdapter.sol";

import {ReentrancyGuard} from "../../../oz/security/ReentrancyGuard.sol";
import {OtokenInterface} from "../../interfaces/gamma/OtokenInterface.sol";
import {IAddressBook} from "../../interfaces/gamma/IAddressBook.sol";
import {Actions, GammaTypes, IController} from "../../interfaces/gamma/IController.sol";

/**
 * @notice OpynAdapter is an options-protocol adapter for Opyn Gamma
 * that provides the implementation for the IOptionAdapter functions
 */
contract OpynAdapter is IOptionAdapter, ReentrancyGuard {
    /// -- CUSTOM ERRORS --
    error NotInUse();

    /// -- STATE VARIABLES --

    /// @notice Address of Opyn Gamma's AddressBook
    IAddressBook public immutable addressBook;

    constructor(address _addressBook) {
        addressBook = IAddressBook(_addressBook);
    }

    /// -- FUNCTIONS --

    function getCollateral(address _option)
        public
        view
        override
        returns (Collateral)
    {
        return Collateral.wrap(OtokenInterface(_option).collateralAsset());
    }

    function getUnderlying(address _option)
        public
        view
        override
        returns (Underlying)
    {
        return Underlying.wrap(OtokenInterface(_option).underlyingAsset());
    }

    function getExpirationDate(address _option)
        public
        view
        override
        returns (ExpirationDate)
    {
        return ExpirationDate.wrap(OtokenInterface(_option).expiryTimestamp());
    }

    function getStrikePrice(address _option)
        public
        view
        override
        returns (StrikePrice)
    {
        return StrikePrice.wrap(OtokenInterface(_option).strikePrice());
    }

    function getIsPut(address _option) public view override returns (bool) {
        return OtokenInterface(_option).isPut();
    }

    function getOptionDetails(address _option)
        public
        view
        override
        returns (
            Collateral,
            Underlying,
            ExpirationDate,
            StrikePrice,
            bool
        )
    {
        return (
            getCollateral(_option),
            getUnderlying(_option),
            getExpirationDate(_option),
            getStrikePrice(_option),
            getIsPut(_option)
        );
    }

    function getPositionsCollatAmt(bytes calldata _arguments)
        external
        view
        override
        returns (bytes memory)
    {
        uint256 vaultId = abi.decode(_arguments, (uint256));

        GammaTypes.Vault memory vault = IController(addressBook.getController())
            .getVault(msg.sender, vaultId);
    }

    function batchOperation(bytes calldata _args)
        external
        override
        nonReentrant
        returns (bytes memory, uint256)
    {
        IController controller = IController(addressBook.getController());

        Actions.ActionArgs[] memory actions = abi.decode(
            _args,
            (Actions.ActionArgs[])
        );

        controller.operate(actions);
    }

    function addCollateral(bytes calldata _args)
        external
        override
        nonReentrant
        returns (bytes memory, uint256)
    {
        _executeNonBatch(Actions.ActionType.DepositCollateral, _args);
    }

    function removeCollateral(bytes calldata _args)
        external
        override
        nonReentrant
        returns (bytes memory, uint256)
    {
        _executeNonBatch(Actions.ActionType.WithdrawCollateral, _args);
    }

    function openVault(bytes calldata _args)
        external
        override
        nonReentrant
        returns (bytes memory, uint256)
    {
        _executeNonBatch(Actions.ActionType.OpenVault, _args);
    }

    function writeOption(bytes calldata _args)
        external
        override
        nonReentrant
        returns (bytes memory, uint256)
    {
        _executeNonBatch(Actions.ActionType.MintShortOption, _args);
    }

    function burnOption(bytes calldata _args)
        external
        override
        nonReentrant
        returns (bytes memory, uint256)
    {
        _executeNonBatch(Actions.ActionType.BurnShortOption, _args);
    }

    function settle(bytes calldata _args)
        external
        override
        nonReentrant
        returns (bytes memory, uint256)
    {
        _executeNonBatch(Actions.ActionType.SettleVault, _args);
    }

    function exercise(bytes calldata _args)
        external
        pure
        override
        returns (bytes memory, uint256)
    {
        _args; // used to silence warning
        revert NotInUse();
    }

    function _executeNonBatch(
        Actions.ActionType _actionType,
        bytes calldata _args
    ) internal {
        Actions.ActionArgs[] memory action = new Actions.ActionArgs[](1);

        action[0].actionType = _actionType;

        (
            action[0].owner,
            action[0].secondAddress,
            action[0].asset,
            action[0].vaultId,
            action[0].amount,
            action[0].index,
            action[0].data
        ) = abi.decode(
            _args,
            (address, address, address, uint256, uint256, uint256, bytes)
        );

        IController(addressBook.getController()).operate(action);
    }
}
