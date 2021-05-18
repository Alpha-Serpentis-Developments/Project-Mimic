// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

interface ITraderManager {
    /**
     * @dev Option style between American (v1) or European (v2)
     */
    enum OptionStyle {
        AMERICAN,
        EUROPEAN
    }
    /**
     * @dev List of trading operations
     */
    enum TradeOperation {
        BUY,
        SELL,
        OPENVAULT,
        WRITE,
        BURN,
        EXERCISE,
        REDEEM_COLLATERAL
    }
    /**
     * @dev Struct that outlines a Position
     * - openingStrategy is the opening strategy
     * - closingStrategy is the closing strategy
     * - style is the position's option style
     * - oToken represents the address of the token
     * - numeraire represents the address of the numeraire
     * - closed represents if the position is closed
     */
    struct Position {
        bytes32 openingStrategy;
        bytes32 closingStrategy;
        OptionStyle style;
        address oToken;
        address underlying;
        address numeraire;
        bool closed;
    }

    function openPosition(
        bytes32 _openingStrategy,
        address _oToken,
        OptionStyle _style
    ) external returns(uint256);
    function closePosition(uint256 _timestamp, bytes32 _closingStrategy) external;
    function changeAdmin(address _admin) external;
}