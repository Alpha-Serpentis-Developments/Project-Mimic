// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {Whitelist} from "./Whitelist.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";

contract SocialHub {
    using SafeMath for uint256;
    /**
     * @dev Struct that outlines the Social Trader
     */
    struct SocialTrader {
        address trader;
        uint256 entryFee;
        address[] followersAddr;
        string twitterURL;
        uint16 profitTakeFee; // Represented as a percentage with two decimal precision (1xx.xx%)
        bool verified;
    }
    /**
     * @dev Mapping of Social Traders
     */
    mapping(address => SocialTrader) private listOfSocialTraders;
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
        uint256 _entryFeeAmt,
        uint16 _profitTakeFee
    )
        public
    {
        SocialTrader storage st = listOfSocialTraders[msg.sender];

        st.trader = msg.sender;
        st.entryFee = _entryFeeAmt;
        st.profitTakeFee = _profitTakeFee;

        emit SocialTraderRegistered(msg.sender);
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
}