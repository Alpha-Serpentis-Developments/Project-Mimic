// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { SocialToken } from "./SocialToken.sol";
import { IOptionAdapter } from "../adapters/IOptionAdapter.sol";

import { ERC20, IERC20 } from "../../oz/token/ERC20/ERC20.sol";

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

    /// -- FUNCTIONS --

    function settleVault(bytes memory _position) external nonReentrant {
        Position storage position = positions[_position];

        // Check if position is active and short
        if(PositionSize.unwrap(position.size) == 0 || position.isLong) {
            revert Position_CannotSettle();
        }

        IOptionAdapter oa = IOptionAdapter(optionAdapter);
        oa.settle(
            abi.encode(
                address(this),
                address(this),
                address(0),
                abi.decode(position.optionalData, (uint256)), // vault id
                IERC20(position.option.token).balanceOf(address(this)),
                0,
                ""
            )
        );
    }

    function _deposit(DenomAmt _amt) internal view override returns(SocialTokenAmt _share) {
        if(totalSupply() == 0) {
            _share = SocialTokenAmt.wrap(DenomAmt.unwrap(_amt));
        } else {
            _share = SocialTokenAmt.wrap(
                (totalSupply() * DenomAmt.unwrap(_amt)) / (IERC20(denominationAsset).balanceOf(address(this)) + _calculateCollateralAmount() - unredeemedFees)
            );
        }
    }

    function _withdraw(SocialTokenAmt _amt) internal view override returns(DenomAmt _value) {
        _value = DenomAmt.wrap(
            (SocialTokenAmt.unwrap(_amt) * (IERC20(denominationAsset).balanceOf(address(this)) + _calculateCollateralAmount() - unredeemedFees)) / totalSupply()
        );
    }

    function _calculateCollateralAmount() internal view returns(uint256 collat) {
        for(uint256 i; i < activePositions.length; i++) {
            collat += CostBasis.unwrap(positions[activePositions[i]].costBasis);
        }
    }

}