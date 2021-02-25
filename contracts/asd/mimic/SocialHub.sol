// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import {TraderManager} from "./TraderManager.sol";
import {Whitelist} from "./Whitelist.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";

contract SocialHub {
    using SafeMath for uint256;
    /**
     * @dev Struct that outlines the Follower
     */
    struct Follower {
        TraderManager.OptionStyle[2] styles;
        string[] types; // TraderManager.TradingTypes
        address[] allowedTokens;
    }
    /**
     * @dev Struct that outlines the Social Trader
     */
    struct SocialTrader {
        address trader;
        address feeTokenAddress;
        uint256 entryFee;
        uint256 maximumFollowers; // Greater than 50 is NOT recommended. Staying below 25 is optimal!
        //Follower[] followers;
        address[] followersAddr;
        uint16 profitTakeFee; // Represented as a percentage with two decimal precision
        bool openToFollow;
        bool verified;
    }
    /**
     * @dev Mapping of Social Traders
     */
    mapping(address => SocialTrader) private listOfSocialTraders;
    /**
     * @dev Mapping of following hashes to determine if user is following
     */
    mapping(bytes32 => Follower) private hashedFollowing;
    /**
     * @dev Mapping that shows the obligations for each token for each social trader's obligation
     */
    mapping(address => mapping(address => uint256)) public tokenObligations;
    /**
    * @dev Whitelist smart contract that outlines what addresses can be set/interact with this contract
     */
    Whitelist public whitelist;
    /**
     * @dev Address of the admin of the SocialHub
     */
    address public admin;

    event AdminChanged(address newAdmin);
    event Followed(address follower, address following);
    event Unfollowed(address follower, address following);
    event SocialTraderRegistered(address socialTrader);
    event SocialTraderVerified(address socialTrader);

    constructor(address _admin, address _whitelist) {
        require(
            _admin != address(0) && _whitelist != address(0),
            "Invalid address"
        );
        admin = _admin;
        whitelist = Whitelist(_whitelist);
    }

    modifier onlyAdmin {
        _onlyAdmin();
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

        st.trader = msg.sender;
        st.feeTokenAddress = _feeTokenAddress;
        st.entryFee = _entryFeeAmt;
        st.maximumFollowers = _maximumFollowers;
        st.profitTakeFee = _profitTakeFee;
        st.openToFollow = true;

        emit SocialTraderRegistered(msg.sender);
    }
    /**
     * @dev Follows a social trader with required parameters
     */
    function followSocialTrader(
        address _socialTrader,
        TraderManager.OptionStyle[2] memory _styles,
        string[] memory _tradeTypes,
        address[] memory _allowedTokens
    )
        external
    {
        SocialTrader storage st = listOfSocialTraders[_socialTrader];
        require(
            st.trader != address(0),
            "Not a social trader"
        );
        require(
            st.followersAddr.length <= st.maximumFollowers,
            "Maximum follow count"
        );
        require(
            _styles.length > 0,
            "Need at least one style"
        );
        require(
            _tradeTypes.length > 0,
            "Need at least one type"
        );
        require(
            _allowedTokens.length > 0,
            "Need at least one allowed token"
        );
        if(st.entryFee > 0) {
            // Assumes user approved entry fee
            IERC20 fee = IERC20(st.feeTokenAddress);
            fee.transferFrom(
                msg.sender,
                address(this),
                st.entryFee
            );
            tokenObligations[st.feeTokenAddress][_socialTrader].add(st.entryFee);
        }
        // Prepare follower
        Follower memory follower;
        follower.styles = _styles;
        follower.types = _tradeTypes;
        follower.allowedTokens = _allowedTokens;
        // Follow social trader
        _addFollower(st, follower);

        emit Followed(msg.sender, _socialTrader);
    }
    /**
     * @dev Unfollows a social trader with optional cleaning
     */
    function unfollowSocialTrader(
        address _socialTrader
    )
        external
    {
        SocialTrader storage st = listOfSocialTraders[_socialTrader];
        require(
            st.trader != address(0),
            "Not a social trader"
        );
        _removeFollower(st);

        emit Unfollowed(msg.sender, _socialTrader);
    }
    /**
     * @dev Social trader redeems fees
     */
    function redeemFees() external onlySocialTrader {
        address tokenAddr = listOfSocialTraders[msg.sender].feeTokenAddress;
        IERC20(tokenAddr).transfer(
            msg.sender,
            tokenObligations[tokenAddr][msg.sender]
        );

        tokenObligations[tokenAddr][msg.sender] = 0;
    }
    /**
     * @dev Called by a Whitelisted address (TraderManager) to perform a profit take before dispersing out profits if any
     */
    function profitTake(
        address _socialTrader
    )
        external
        onlyWhitelisted
    {
        SocialTrader storage st = listOfSocialTraders[_socialTrader];
        require(
            st.trader != address(0),
            "Social trader does not exist"
        );
    }
    /**
     * @dev Verifies the social trader
     */
    function verifySocialTrader(address _socialTrader) external onlyAdmin {
        SocialTrader storage st = listOfSocialTraders[_socialTrader];
        require(
            st.trader != address(0),
            "Not a social trader"
        );
        st.verified = true;

        emit SocialTraderVerified(_socialTrader);
    }
    /**
     * @dev Verifies an address is a social trader
     */
    function isSocialTrader(
        address _socialTrader
    )
        external
        view
        returns(bool)
    {
        return listOfSocialTraders[_socialTrader].trader != address(0);
    }
    /**
     * @dev Returns if an address is a social trader
     */
    function _onlyAdmin() internal view {
        require(
            msg.sender == admin,
            "Unauthorized"
        );
    }
    function _onlySocialTrader() internal view {
        require(
            listOfSocialTraders[msg.sender].trader != address(0),
            "Unauthorized (social trader)"
        );
    }
    function _onlyWhitelisted() internal view {
        require(
            whitelist.isWhitelisted(msg.sender),
            "Unauthorized (whitelist)"
        );
    }
    function _addFollower(
        SocialTrader storage _st,
        Follower memory _follower
    )
        internal
    {
        _st.followersAddr.push(msg.sender);
        hashedFollowing[
            keccak256(
                abi.encode(
                    msg.sender,
                    _st.trader
                )
            )
        ] = _follower;
    }
    function _removeFollower(
        SocialTrader storage _st
    )
        internal
    {
        for(uint256 i = 0; i < _st.followersAddr.length; i++) {
            if(_st.followersAddr[i] == msg.sender) {
                _st.followersAddr[i] = _st.followersAddr[_st.followersAddr.length - 1];
                _st.followersAddr.pop();
                delete hashedFollowing[keccak256(abi.encode(msg.sender, _st.trader))];
                break;
            }
        }
    }
}