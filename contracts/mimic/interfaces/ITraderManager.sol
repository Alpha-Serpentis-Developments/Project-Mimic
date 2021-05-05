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
        string openingStrategy;
        string closingStrategy;
        OptionStyle style;
        address oToken;
        address numeraire;
        bool closed;
    }

    function openPosition(string memory _openingStrategy, address _oToken) external returns(uint256);
    function closePosition(uint256 _timestamp, string memory _closingStrategy) external;
    function changeAdmin(address _admin) external;
}