// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SocialTraderToken} from "./SocialTraderToken.sol";

contract SocialHub {
    /// @notice Struct that outlines the Social Trader
    struct SocialTrader {
        SocialTraderToken token;
        string twitterURL;
        bool verified;
    }
    /// @notice Mapping of social traders
    mapping(address => SocialTrader) public listOfSocialTraders;
    /// @notice Address of the admin of the SocialHub
    address public admin;

    event AdminChanged(address newAdmin);
    event SocialTraderRegistered(address token);
    event SocialTraderVerified(address token);

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
        string memory _tokenName,
        string memory _symbol,
        uint256 _mintingFee,
        uint16 _profitTakeFee
    )
        public
    {
        SocialTrader storage st = listOfSocialTraders[msg.sender];

        st.token = new SocialTraderToken(_tokenName, _symbol, _mintingFee, _profitTakeFee, msg.sender);

        emit SocialTraderRegistered(address(st.token));
    }
    /**
     * @dev Verifies the social trader
     */
    function verifySocialTrader(address _socialTrader) external onlyAdmin {
        SocialTrader storage st = listOfSocialTraders[_socialTrader];
        require(
            st.token.admin.address != address(0),
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
        return listOfSocialTraders[_socialTrader].token.admin.address != address(0);
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
            listOfSocialTraders[msg.sender].token.admin.address != address(0),
            "Unauthorized (social trader)"
        );
    }
}