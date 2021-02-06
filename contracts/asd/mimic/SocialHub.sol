// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import {Incentive} from "./Incentive.sol";
import {TraderManager} from "./TraderManager.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";

contract SocialHub {
    using SafeMath for uint256;
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
        address feeTokenAddress;
        uint256 entryFee;
        uint256 maximumFollowers; // Greater than 50 is NOT recommended. Staying below 25 is optimal!
        //Follower[] followers;
        address[] followersAddr;
        uint16 profitTakeFee; // Represented as a percentage with two decimal precision
        bool exists; // Used as a check if social trader exists
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
     * @dev Rate in which the cleaning incentive is put for each element cleaned
     */
    uint256 public incentiveRate;
    /**
     * @dev Address of the incentive smart contract
     */
    Incentive public incentive;
    /**
     * @dev Address of the admin of the SocialHub
     */
    address public admin;

    event AdminChanged(address newAdmin);
    event IncentiveRateChanged(uint256 newRate);
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
                _socialTrader, // Pays direct to social trader
                st.entryFee
            );
        }
        // Prepare follower
        Follower memory follower;
        follower.styles = _styles;
        follower.types = _tradeTypes;
        follower.allowedTokens = _allowedTokens;
        // Follow social trader
        _addFollower(st);
        hashedFollowing[
            keccak256(
                abi.encode(
                    msg.sender,
                    _socialTrader
                )
            )
        ] = follower;

        emit Followed(msg.sender, _socialTrader);
    }
    function unfollowSocialTrader(
        address _socialTrader,
        bool _optionalClean,
        uint256 _maxElementsToClean
    )
        external
    {
        SocialTrader storage st = listOfSocialTraders[_socialTrader];
        require(
            st.exists,
            "Not a social trader"
        );
        _removeFollower(st);
        delete hashedFollowing[keccak256(abi.encode(msg.sender, _socialTrader))];
        if(_optionalClean) {
            _incentive(_cleanFollowers(st, _maxElementsToClean));
        }

        emit Unfollowed(msg.sender, _socialTrader);
    }
    function cleanFollowers(
        address _socialTrader,
        uint256 _maxElementsToClean
    )
        external
    {
        SocialTrader storage st = listOfSocialTraders[_socialTrader];
        require(
            st.exists,
            "Not a social trader"
        );
        _incentive(_cleanFollowers(st, _maxElementsToClean));
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
    function _addFollower(
        SocialTrader storage _st
    )
        internal
    {
        for(uint256 i = 0; i < _st.followersAddr.length; i++) {
            if(_st.followersAddr[i] == address(0)) {
                _st.followersAddr[i] = msg.sender;
                break;
            }
        }
    }
    function _removeFollower(
        SocialTrader storage _st
    )
        internal
    {
        for(uint256 i = 0; i < _st.followersAddr.length; i++) {
            if(_st.followersAddr[i] == msg.sender) {
                delete _st.followersAddr[i];
                break;
            }
        }
    }
    function _cleanFollowers(
        SocialTrader storage _st,
        uint256 _maxElementsToClean
    )
        internal
        returns(uint256 _elementsCleaned)
    {
        require(
            _maxElementsToClean > 0,
            "Needs at least one element to clean"
        );

        bool beginToShift;
        for(uint256 i = 0; i < _st.followersAddr.length; i++) {
            if(beginToShift) {
                _st.followersAddr[i] = _st.followersAddr[i+1]; // Shift to the left
                if(i == _st.followersAddr.length - 1) { // Prevent index out of bounds
                    break;
                } else if(_st.followersAddr[i] == address(0)) { // Check for more empty slots
                    _st.followersAddr[i] = _st.followersAddr[i+1];
                    _elementsCleaned++;
                }
            } else if(_st.followersAddr[i] == address(0)) {
                beginToShift = true;
                _st.followersAddr[i] = _st.followersAddr[i+1];
                _elementsCleaned++;
            }

            if(_elementsCleaned >= _maxElementsToClean)
                break;
        }
    }
    function _incentive(
        uint256 _elementsCleaned
    )
        internal
    {
        require(
            _elementsCleaned > 0,
            "No elements cleaned"
        );
        incentive.pullIncentive(msg.sender, _elementsCleaned.mul(incentiveRate));
    }
}