// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "./TraderManager.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SocialHub {
    /**
     * @dev Struct that outlines the Follower
     */
    struct Follower {
        address user;
        TraderManager.OptionStyle[2] styles;
        TraderManager.TradingType[] types;
        address[] allowedTokens;
    }
    /**
     * @dev Struct that outlines the Social Trader
     */
    struct SocialTrader {
        address feeTokenAddress;
        uint256 entryFee;
        uint256 maximumFollowers;
        Follower[] followers;
        mapping(address => bool) isFollowing; // Used as a check for the followers array
        uint16 profitTakeFee; // Represented as a percentage with two decimal precision
        bool exists; // Used as a check if social trader exists
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
    event SocialTraderRegistered(address socialTrader);
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
        address _feeTokenAddress,
        uint256 _entryFeeAmt,
        uint256 _maximumFollowers,
        uint16 _profitTakeFee
    )
        public
    {
        SocialTrader storage st = listOfSocialTraders[msg.sender];

        st.exists = true;
        st.feeTokenAddress = _feeTokenAddress;
        st.entryFee = _entryFeeAmt;
        st.maximumFollowers = _maximumFollowers;
        st.profitTakeFee = _profitTakeFee;

        emit SocialTraderRegistered(msg.sender);
    }
    function followSocialTrader(
        address _socialTrader,
        TraderManager.OptionStyle[2] memory _styles,
        TraderManager.TradingType[] memory _tradeTypes,
        address[] memory _allowedTokens
    )
        external
    {
        SocialTrader storage st = listOfSocialTraders[_socialTrader];
        require(
            st.exists,
            "Not a social trader"
        );
        require(
            st.followers.length == st.maximumFollowers,
            "Maximum follow count"
        );
        // Assumes user approved entry fee
        IERC20 fee = IERC20(st.feeTokenAddress);
        fee.transferFrom(
            msg.sender,
            _socialTrader, // Pays direct to social trader
            st.entryFee
        );
        // Prepare follower
        Follower memory follower;
        follower.user = msg.sender;
        follower.styles = _styles;
        follower.types = _tradeTypes;
        follower.allowedTokens = _allowedTokens;
        // Follow social trader
        st.followers.push(follower);
        st.isFollowing[msg.sender] = true;

        emit Followed(msg.sender, _socialTrader);
    }
    function unfollowSocialTrader(address _socialTrader) external {
        SocialTrader storage st = listOfSocialTraders[_socialTrader];
        require(
            st.exists,
            "Not a social trader"
        );
        st.isFollowing[msg.sender] = false;

        emit Unfollowed(msg.sender, _socialTrader);
    }
    function redeemFees() external onlySocialTrader {

    }
    function verifySocialTrader(address _socialTrader) external onlyAdmin {
        SocialTrader storage st = listOfSocialTraders[_socialTrader];
        require(
            st.exists,
            "Not a social trader"
        );
        st.verified = true;

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
            listOfSocialTraders[msg.sender].exists,
            "Unauthorized (social trader)"
        );
    }
}