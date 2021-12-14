// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {SocialToken} from "./SocialToken.sol";
import {SocialTokenComponents} from "./SocialTokenComponents.sol";
import {IOptionAdapter, GeneralActions} from "../adapters/IOptionAdapter.sol";

import {ERC20, IERC20} from "../../oz/token/ERC20/ERC20.sol";
import {IController} from "../interfaces/gamma/IController.sol";

/**
 * @notice Optional's implementation of a social token integrating
 * the Opyn ecosystem
 */
contract Opyn_ST is SocialToken {
    /// -- NOTES --

    /**
     * For Position.optionalData, the data is formatted as (uint256)
     * - (0) uint256 represents the vault's ID
     */

    /// -- CUSTOM ERRORS --
    error Position_CannotSettle();

    /// -- STATE VARIABLES --
    uint256 public vaultCounter;

    /// -- FUNCTIONS --

    function initialize(
        string memory _name,
        string memory _symbol,
        address _protocolManager,
        address _denominationAsset,
        address _optionAdapter,
        address _exchangeAdapter,
        address _lendingAdapter,
        address _trader,
        uint16 _depositFee,
        uint16 _withdrawalFee,
        uint16 _managementFee,
        uint16 _performanceFee
    ) external override initializer {
        _initialize(
            _name,
            _symbol,
            _protocolManager,
            _denominationAsset,
            _optionAdapter,
            _exchangeAdapter,
            _lendingAdapter,
            _trader,
            _depositFee,
            _withdrawalFee,
            _managementFee,
            _performanceFee
        );

        vaultCounter = 1;
    }

    function allowOpynAdapter(address _controller)
        external
        onlyOwner
        nonReentrant
    {
        IController(_controller).setOperator(optionAdapter, true);
    }

    function settleVault(uint256 _position) external nonReentrant {
        Position storage position = positions[_position];

        // Check if position is active and short
        if (PositionSize.unwrap(position.size) == 0 || position.isLong != 0) {
            revert Position_CannotSettle();
        }

        GeneralActions.Action[] memory action = new GeneralActions.Action[](1);
        bytes[] memory arg = new bytes[](1);

        action[0] = GeneralActions.Action.SETTLE;
        arg[0] = abi.encode(
                address(this),
                address(this),
                address(0),
                abi.decode(position.optionalData, (uint256)), // vault id
                IERC20(position.option.token).balanceOf(address(this)),
                0,
                ""
            );

        _closePosition(
            action,
            _position,
            arg
        );
    }

    function _openPosition(
        GeneralActions.Action[] memory _actions,
        Position memory _position,
        bytes[] memory _args
    ) internal override {
        if (_position.option.token == address(0)) revert Invalid_ZeroValue();

        uint256 posId = positionId++;

        Position storage pos = positions[posId];

        if (PositionSize.unwrap(pos.size) != 0) revert Position_AlreadyOpen();

        bytes memory optionalData = _operateActions(
            _actions,
            _args,
            pos
        );

        if(optionalData.length != 0) {
            if(abi.decode(optionalData, (uint256)) != vaultCounter) {
                vaultCounter++;
            }
        }
        
        activePositions.push(posId);
        pos.option = _position.option;
        pos.size = _position.size;
        pos.isLong = _position.isLong;

        emit PositionOpened(posId);
    }

    function _deposit(DenomAmt _amt)
        internal
        view
        override
        returns (SocialTokenAmt _share)
    {
        _share = totalSupply() == 0
            ? SocialTokenAmt.wrap(DenomAmt.unwrap(_amt))
            : SocialTokenAmt.wrap(
                (totalSupply() * DenomAmt.unwrap(_amt)) /
                    (IERC20(denominationAsset).balanceOf(address(this)) +
                        _calculateTempWithheld() -
                        DenomAmt.unwrap(_amt) -
                        unredeemedFees)
            );
    }

    function _withdraw(SocialTokenAmt _amt)
        internal
        view
        override
        returns (DenomAmt _value)
    {
        _value = DenomAmt.wrap(
            (SocialTokenAmt.unwrap(_amt) *
                (IERC20(denominationAsset).balanceOf(address(this)) +
                    _calculateTempWithheld() -
                    unredeemedFees)) / totalSupply()
        );
    }

    function _calculateTempWithheld()
        internal
        view
        returns (uint256 tempWithheld)
    {
        for (uint256 i; i < activePositions.length; i++) {
            tempWithheld += CostBasis.unwrap(
                positions[activePositions[i]].costBasis
            );
        }
    }

    function _calculateCostBasisInDenom(Position storage _pos)
        internal
        view
        override
        returns (uint256)
    {}
}
