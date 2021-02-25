// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import {SocialHub} from "./SocialHub.sol";
import {Whitelist} from "./Whitelist.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TraderManager {
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
     * strategy is the position's strategy type.
     * style is the position's option style
     * oToken represents the address of the token
     * tokens represents the array of tokens utilized
     * closed represents if the position is closed
     */
    struct Position {
        string strategy;
        OptionStyle style;
        address oToken;
        mapping(address => uint256) startingValues;
        bool closed;
    }
    /**
     * @dev List of trading strategies that are supported by Mimic
     */
    string[] public tradingTypes = new string[](
        "LONG_CALL",
        "LONG_PUT",
        "SHORT_CALL",
        "SHORT_PUT",
        "CALL_DEBIT_SPREAD",
        "CALL_CREDIT_SPREAD",
        "PUT_DEBIT_SPREAD",
        "PUT_CREDIT_SPREAD",
        "STRADDLE",
        "LONG_STRANGLE",
        "SHORT_STRANGLE",
        "CUSTOM"
    );
    /**
     * @dev Mapping of each Social Trader's open positions
     */
    mapping(address => Position[]) public traderOpenPositions;
    /**
     * @dev Whitelist contract
     */
    Whitelist public whitelist;
    /**
     * @dev Social Hub contract
     */
    SocialHub public socialHub;
    /**
     * @dev Address of the admin of the TraderManager contract
     */
    address private admin;

    event AdminChanged(address newAdmin);
    event WhitelistChanged(address newWhitelist);
    event SocialHubChanged(address newSocialHub);
    event PositionOpened(address socialTrader, string strategy, OptionStyle style, address oToken, uint256 positionIndex);
    event PositionClosed(address socialTrader, uint256 positionIndex);

    constructor(address _admin, address _whitelist, address _socialHub) {
        require(
            _admin != address(0),
            "Zero address"
        );
        admin = _admin;
        whitelist = Whitelist(_whitelist);
        socialHub = SocialHub(_socialHub);
    }

    modifier onlyAdmin {
        _onlyAdminCheck();
        _;
    }
    modifier onlySocialTrader {
        _onlySocialTrader();
        _;
    }
    modifier onlyWhitelisted {
        _onlyWhitelisted();
        _;
    }

    function getEligibleTraders(

    )
        public
        view
        returns(address[] memory eligibleAddresses)
    {
        
    }
    function openPosition(
        
    ) external onlySocialTrader {

    }
    function closePosition() external onlySocialTrader {

    }
    function changeAdmin(address _admin) external onlyAdmin {
        require(
            _admin != address(0),
            "Zero address"
        );
        admin = _admin;
    }
    function _onlyAdminCheck() internal view {
        require(
            msg.sender == admin,
            "Not admin"
        );
    }
    function _onlySocialTrader() internal view {
        require(
            socialHub.isSocialTrader(msg.sender),
            "Unauthorized (social trader)"
        );
    }
    function _onlyWhitelisted() internal view {
        require(
            whitelist.isWhitelisted(msg.sender),
            "Unauthorized (whitelist)"
        );
    }
}
