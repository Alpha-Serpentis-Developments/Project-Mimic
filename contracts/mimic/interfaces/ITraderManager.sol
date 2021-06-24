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
     * - closed represents if the position is closed
     */
    struct Position {
        bytes32 openingStrategy;
        bytes32 closingStrategy;
        address oToken;
        address underlying;
        bool closed;
        OptionStyle style;
    }

    function executeTrade(
        ITraderManager.TradeOperation[] memory _operations,
        ITraderManager.Position memory _position
    ) external;
}