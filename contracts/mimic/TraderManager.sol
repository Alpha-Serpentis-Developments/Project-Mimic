// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import {ITraderManager} from "./interfaces/ITraderManager.sol";
import {SocialHub} from "./SocialHub.sol";
import {Whitelist} from "./Whitelist.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TraderManager is ITraderManager {
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
    event NewTradingTypeAdded(string tradingType, TradeOperation[] operations);
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

    function openPosition(
        
    ) external override onlySocialTrader {

    }
    function closePosition() external override onlySocialTrader {

    }
    function changeAdmin(address _admin) external override onlyAdmin {
        require(
            _admin != address(0),
            "Zero address"
        );
        admin = _admin;
    }
    function _executeTradingOperation(
        TradeOperation[] memory _operations
    )
        internal
    {
        for(uint256 i = 0; i < _operations.length; i++) {
            TradeOperation operation = _operations[i];
            // BUY
            if(operation == TradeOperation.BUY) {
            
            // SELL
            } else if(operation == TradeOperation.SELL) {
            
            // WRITE
            } else if(operation == TradeOperation.WRITE) {

            // BURN
            } else if(operation == TradeOperation.BURN) {

            // EXERCISE
            } else if(operation == TradeOperation.EXERCISE) {

            // REDEEM COLLATERAL
            } else if(operation == TradeOperation.REDEEM_COLLATERAL) {

            }
        }
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
