// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.8.0;

import "./TraderManager.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SocialHub {
    /**
     * @dev Struct that outlines the Follower
     */
    struct Follower {
        TraderManager.OptionStyle[2] styles;
        TraderManager.TradingType[] types;
        address[] allowedTokens;
    }
    /**
     * @dev Struct that outlines the Social Trader
     */
    struct SocialTrader {
        address user;
        address feeTokenAddress;
        uint256 entryFee;
        mapping(address => bool) following;
        uint16 profitTakeFee; // Represented as a percentage with two decimal precision
        bool verified;
    }
    /**
     * @dev Mapping of Social Traders
     */
    mapping(address => SocialTrader) private listOfSocialTraders;
    /**
     * @dev Address of the admin of the SocialHub
     */
    address public admin;

    event AdminChanged(address newAdmin);
    event Followed(address follower, address following);
    event Unfollowed(address follower, address following);
    event SocialTraderRegistered(address socialTrader, address token);
    event SocialTraderVerified(address socialTrader);

    constructor(address _admin) {
        require(
            _admin != address(0),
            "Invalid address"
        );
        admin = _admin;
    }

    modifier onlyAdmin {
        _onlyAdmin();
        _;
    }
    modifier onlySocialTrader {
        _onlySocialTrader();
        _;
    }

    /**
     * @dev Register to become a social trader
     */
    function becomeSocialTrader(
        address _FEE_TOKEN_ADDRESS,
        uint256 _FEE,
        uint16 _PROFIT_TAKE_FEE,
        uint256 _MINIMUM_MINT
    )
        public
        returns(address token)
    {
        SocialTrader memory st;

        st.user = msg.sender;

        listOfSocialTraders[msg.sender] = st;

        return token;
    }
    function followSocialTrader(
        address _socialTrader,
        TraderManager.OptionStyle[2] _styles,
        TraderManager.TradingType[] _tradeTypes,
        address[] _allowedTokens
    )
        external
    {
        require(
            listOfSocialTraders[_socialTrader].user != address(0),
            "Invalid social trader"
        );
        // Assumes user approved entry fee
        IERC20 fee = IERC20(listOfSocialTraders[_socialTrader].feeTokenAddress);
        fee.transferFrom(
            msg.sender,
            _socialTrader,
            listOfSocialTraders[_socialTrader].entryFee
        );
    }
    function unfollowSocialTrader(address _socialTrader) external {
        require(
            listOfSocialTraders[_socialTrader].user != address(0),
            "Does not exist"
        );
    }
    function redeemFees() external onlySocialTrader {

    }
    function verifySocialTrader(address _socialTrader) external onlyAdmin {
        require(
            listOfSocialTraders[_socialTrader].user != address(0),
            "Does not exist"
        );
        listOfSocialTraders[_socialTrader].verified = true;

        emit SocialTraderVerified(_socialTrader);
    }
    function _onlyAdmin() internal view {
        require(
            msg.sender == admin,
            "Unauthorized"
        );
    }
    function _onlySocialTrader() internal view {
        require(
            listOfSocialTraders[msg.sender].user == msg.sender,
            "Not social trader"
        );
    }
}