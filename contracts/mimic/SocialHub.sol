// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SocialTraderToken} from "./SocialTraderToken.sol";

contract SocialHub {
    error Unauthorized();
    error NotASocialTrader(address trader);
    error ZeroAddress();

    /// @notice Struct that outlines the Social Trader
    struct SocialTrader {
        SocialTraderToken token;
        string twitterURL;
        bool verified;
    }
    /// @notice Mapping of social traders
    mapping(address => SocialTrader) public listOfSocialTraders;
    /// @notice Protocol minting fee
    uint16 public mintingFee;
    /// @notice Protocol take profit fee
    uint16 public takeProfitFee;
    /// @notice Address of the admin of the SocialHub
    address public admin;

    event AdminChanged(address newAdmin);
    event SocialTraderRegistered(address indexed token, address indexed trader);
    event SocialTraderVerified(address indexed token);

    constructor(address _admin) {
        if(_admin == address(0))
            revert ZeroAddress();
            
        admin = _admin;
    }

    modifier onlyAdmin {
        _onlyAdmin();
        _;
    }

    function modifyMintingFee(uint16 _newFee) public onlyAdmin {
        mintingFee = _newFee;
    }

    function modifyTakeProfitFee(uint16 _newFee) public onlyAdmin {
        takeProfitFee = _newFee;
    }

    /**
     * @dev Register to become a social trader
     */
    function becomeSocialTrader(
        string memory _tokenName,
        string memory _symbol,
        uint16 _mintingFee,
        uint16 _profitTakeFee
    )
        public
    {
        SocialTrader storage st = listOfSocialTraders[msg.sender];

        st.token = new SocialTraderToken(_tokenName, _symbol, _mintingFee, _profitTakeFee, msg.sender);

        emit SocialTraderRegistered(address(st.token), msg.sender);
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
        if(msg.sender != admin)
            revert Unauthorized();
    }
}