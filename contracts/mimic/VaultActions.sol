// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {VaultComponents} from "./VaultComponents.sol";

import {Actions, GammaTypes, IController} from "./gamma/interfaces/IController.sol";
import {OtokenInterface} from "./gamma/interfaces/OtokenInterface.sol";

import {ERC20, IERC20} from "../oz/token/ERC20/ERC20.sol";

contract VaultActions is VaultComponents {

    /// @notice Allows anyone to call it in the event the withdrawal window is closed, but no action has occurred within 1 day
    /// @dev Reopens the withdrawal window for a minimum of one day, whichever is greater
    function reactivateWithdrawalWindow() external ifNotClosed nonReentrant() whenNotPaused() {
        if(block.timestamp < withdrawalWindowExpires + 1 days || oToken != address(0))
            revert Invalid();
        
        if(withdrawalWindowLength > 1 days)
            withdrawalWindowExpires = block.timestamp + withdrawalWindowLength;
        else
            withdrawalWindowExpires = block.timestamp + 1 days;

        emit WithdrawalWindowActivated(withdrawalWindowExpires);
    }

    /// @notice Burns away the oTokens to redeem the asset collateral
    /// @dev Operation to burn away the oTOkens in redemption of the asset collateral
    /// @param _amount Amount of options to burn
    function burnOptions(uint256 _amount) external ifNotClosed onlyManager nonReentrant() whenNotPaused() {
        if(!_withdrawalWindowCheck(false))
            revert WithdrawalWindowActive();
        if(_amount > IERC20(oToken).balanceOf(address(this)))
            revert Invalid();

        Actions.ActionArgs[] memory actions = new Actions.ActionArgs[](2);
        uint256 normalizedAmount;
        
        if(OtokenInterface(oToken).isPut()) {
            normalizedAmount = _normalize(_amount * OtokenInterface(oToken).strikePrice(), 16, ERC20(asset).decimals());
        } else {
           normalizedAmount = _normalize(_amount, 8, 18);
        }

        actions[0] = Actions.ActionArgs(
            Actions.ActionType.BurnShortOption,
            address(this),
            address(this),
            oToken,
            currentVaultId,
            _amount,
            0,
            ""
        );
        actions[1] = Actions.ActionArgs(
            Actions.ActionType.WithdrawCollateral,
            address(this),
            address(this),
            asset,
            currentVaultId,
            normalizedAmount,
            0,
            ""
        );

        IController controller = IController(addressBook.getController());

        controller.operate(actions);
        collateralAmount -= normalizedAmount;

        if(collateralAmount == 0 && IERC20(oToken).balanceOf(address(this)) == 0) {
            // Withdrawal window reopens
            withdrawalWindowExpires = block.timestamp + withdrawalWindowLength;
            oToken = address(0);

            emit WithdrawalWindowActivated(withdrawalWindowExpires);
        }

        emit OptionsBurned(_amount);
    }

    /// @notice Operation to settle the vault
    /// @dev Settles the currently open vault and opens the withdrawal window
    function settleVault() external ifNotClosed nonReentrant() whenNotPaused() {
        if(!_withdrawalWindowCheck(false))
            revert WithdrawalWindowActive();

        IController controller = IController(addressBook.getController());

        // Check if ready to settle otherwise revert
        if(!controller.isSettlementAllowed(oToken))
            revert SettlementNotReady();

        // Settle the vault if ready
        Actions.ActionArgs[] memory action = new Actions.ActionArgs[](1);
        action[0] = Actions.ActionArgs(
            Actions.ActionType.SettleVault,
            address(this),
            address(this),
            address(0),
            currentVaultId,
            IERC20(oToken).balanceOf(address(this)),
            0,
            ""
        );

        controller.operate(action);

        // Withdrawal window opens
        withdrawalWindowExpires = block.timestamp + withdrawalWindowLength;
        collateralAmount = 0;
        oToken = address(0);
        currentReserves = 0;
        premiumsWithheld = 0;
        
        emit WithdrawalWindowActivated(withdrawalWindowExpires);
    }

}