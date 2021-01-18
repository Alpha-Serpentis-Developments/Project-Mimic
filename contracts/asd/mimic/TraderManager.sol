// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0 <0.8.0;

import "./SocialTraderToken.sol";
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
        SHORT_STRANGLE
    }
    /**
     * @dev Struct that outlines a Position
     * strategy is the position's strategy type.
     * style is the position's option style
     * closed represents if the position is closed
     */
    struct Position {
        TradingType strategy;
        OptionStyle style;
        bool closed;
    }
    /**
     * @dev Struct that outlines the SocialTrader
     */
    struct SocialTrader {
        address user;
        SocialTraderToken socialTraderToken;
        Position[] positions;
        bool verified;
    }

    /**
     * @dev Mapping of Social Traders 
     */
    mapping(address => SocialTrader) private listOfSocialTraders;
    /**
     * @dev Address of the admin of the TraderManager contract
     */
    address private admin;

    event SocialTraderRegistered(address socialTrader, address token);
    event SocialTraderVerified(address socialTrader);
    event AdminChanged(address newAdmin);

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
    modifier onlySocialTraderToken {
        onlySocialTraderTokenCheck();
        _;
    }

    function becomeSocialTrader(
        string memory _name,
        string memory _symbol,
        address _FEE_TOKEN_ADDRESS,
        uint256 _FEE,
        uint16 _PROFIT_TAKE_FEE,
        uint256 _MINIMUM_MINT
    ) 
        public 
        returns(address token) 
    {
        token = address(
            new SocialTraderToken(
                _name,
                _symbol,
                address(this),
                _FEE_TOKEN_ADDRESS,
                _FEE,
                _PROFIT_TAKE_FEE,
                _MINIMUM_MINT,
                msg.sender
            )
        );

        SocialTrader memory st;

        st.user = msg.sender;
        st.socialTraderToken = SocialTraderToken(token);

        listOfSocialTraders[msg.sender] = st;

        return token;
    }
    function getEligibleTraders(

    ) 
        public
        view 
        returns(address[] memory eligibleAddresses) 
    {
        
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
    function openPosition(
        OptionStyle _style,
        TradingType _type,
        address _option
    ) 
        external 
        onlySocialTraderToken
        returns(uint256 positionIndex) 
    {

    }
    function closePosition(
        uint256 positionIndex
    ) 
        external 
        onlySocialTraderToken 
    {

    }
    function changeAdmin(address _admin) external onlyAdmin {
        require(
            _admin != address(0)
        );
        admin = _admin;
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
    function onlySocialTraderTokenCheck() internal view {
        require(
            address(listOfSocialTraders[msg.sender].socialTraderToken) == msg.sender,
            "Not token contract"
        );
    }
}
