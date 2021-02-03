// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "./SocialHub.sol";
import "./Whitelist.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TraderManager {
    /**
     * @dev Option style between American (v1) or European (v2)
     */
    enum OptionStyle {
        AMERICAN,
        EUROPEAN
    }
    /**
     * @dev List of trading strategies that are supported by Mimic
     */
    enum TradingType {
        LONG_CALL,
        LONG_PUT,
        SHORT_CALL,
        SHORT_PUT,
        CALL_DEBIT_SPREAD,
        CALL_CREDIT_SPREAD,
        PUT_DEBIT_SPREAD,
        PUT_CREDIT_SPREAD,
        STRADDLE,
        LONG_STRANGLE,
        SHORT_STRANGLE,
        CUSTOM
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
     * strategy is the position's strategy type.
     * style is the position's option style
     * oToken represents the address of the token
     * closed represents if the position is closed
     */
    struct Position {
        TradingType strategy;
        OptionStyle style;
        address oToken;
        bool closed;
    }
    /**
     * @dev Mapping of each Social Trader's open positions
     */
    mapping(address => Position[]) private traderOpenPositions;
    /**
     * @dev Address of the admin of the TraderManager contract
     */
    address private admin;

    event AdminChanged(address newAdmin);
    event PositionOpened(address socialTrader, TradingType strategy, OptionStyle style, address oToken, uint256 positionIndex);
    event PositionClosed(address socialTrader, uint256 positionIndex);

    constructor(address _admin) {
        require(
            _admin != address(0),
            "Zero address"
        );
        admin = _admin;
    }

    modifier onlyAdmin {
        onlyAdminCheck();
        _;
    }

    function getEligibleTraders(

    )
        public
        view
        returns(address[] memory eligibleAddresses)
    {
        
    }
    // TODO: Re-add open and close functions
    function changeAdmin(address _admin) external onlyAdmin {
        require(
            _admin != address(0),
            "Zero address"
        );
        admin = _admin;
    }
    function onlyAdminCheck() internal view {
        require(
            msg.sender == admin,
            "Not admin"
        );
    }
}
