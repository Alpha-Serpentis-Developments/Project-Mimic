// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.8.0;

import "./SocialTraderToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TraderManager {
    struct SocialTrader {
        address user;
        SocialTraderToken socialTraderToken;
        bool verified;
    }

    mapping(address => SocialTrader) private listOfSocialTraders;
    address private admin;

    constructor(address _admin) {
        require(
            _admin != address(0)
        );
        admin = _admin;
    }

    modifier onlyAdmin {
        onlyAdminCheck();
        _;
    }
    modifier onlySocialTrader {
        onlySocialTraderCheck();
        _;
    }

    function becomeSocialTrader(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        address _FEE_TOKEN_ADDRESS,
        uint256 _FEE,
        uint256 _MINIMUM_MINT
    ) 
        public 
        returns(address token) 
    {
        token = address(
            new SocialTraderToken(
                msg.sender,
                _name,
                _symbol,
                _decimals,
                _FEE_TOKEN_ADDRESS,
                _FEE,
                _MINIMUM_MINT
            )
        );

        SocialTrader memory st;

        st.user = msg.sender;
        st.socialTraderToken = SocialTraderToken(token);

        listOfSocialTraders[msg.sender] = st;

        return token;
    }
    function followSocialTrader(
        address _socialTrader, 
        uint256 _amount
    ) 
        external 
    {
        require(
            listOfSocialTraders[_socialTrader].user != address(0),
            "Invalid social trader"
        );
        SocialTraderToken token = listOfSocialTraders[_socialTrader].socialTraderToken;
        token.mintTokens(_amount);
    }
    function unfollowSocialTrader(address _socialTrader) external {
        require(
            listOfSocialTraders[_socialTrader].user != address(0)
        );
        SocialTraderToken token = listOfSocialTraders[_socialTrader].socialTraderToken;
        token.burnTokens(token.balanceOf(msg.sender));
    }
    function verifySocialTrader(address _socialTrader) external onlyAdmin {
        require(
            listOfSocialTraders[_socialTrader].user != address(0)
        );
        listOfSocialTraders[_socialTrader].verified = true;
    }
    function onlyAdminCheck() internal view {
        require(
            msg.sender == admin,
            "Not admin"
        );
    }
    function onlySocialTraderCheck() internal view {
        require(
            listOfSocialTraders[msg.sender].user == msg.sender,
            "Not social trader"
        );
    }
}
