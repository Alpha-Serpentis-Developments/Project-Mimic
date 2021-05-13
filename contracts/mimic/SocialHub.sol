// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ISocialHub} from "./interfaces/ISocialHub.sol";
import {SocialTraderToken} from "./SocialTraderToken.sol";

contract SocialHub is ISocialHub {
    error Unauthorized();
    error NotASocialTrader(address trader);
    error OutOfBounds(uint256 max, uint256 given);
    error NotDeprecated();
    error Deprecated(address _succesor);
    error ZeroAddress();

    /// @notice Struct that outlines the Social Trader
    struct SocialTrader {
        SocialTraderToken token;
        string twitterHandle;
        bool verified;
    }
    /// @notice Mapping of social traders
    mapping(address => SocialTrader) private listOfSocialTraders;
    /// @notice Protocol minting fee
    uint16 public mintingFee;
    /// @notice Protocol take profit fee
    uint16 public takeProfitFee;
    /// @notice Protocol withdrawal fee
    uint16 public withdrawalFee;
    /// @notice Address of the predecessor
    address public predecessor;
    /// @notice Address of the successor
    address public successor;
    /// @notice Address of the admin of the SocialHub
    address public admin;
    /// @notice UNIX time of deployment (used for version checking)
    uint256 private immutable deploymentTime;

    event MintingFeeChanged(uint16 newFee);
    event TakeProfitFeeChanged(uint16 newFee);
    event WithdrawalFeeChanged(uint16 newFee);
    event AdminChanged(address newAdmin);
    event SocialTraderRegistered(address indexed token, address indexed trader);
    event SocialTraderVerified(address indexed token);
    event SocialHubDeprecated(address indexed successor);
    event DetailsReceived(address indexed trader);
    event DetailsSent(address indexed trader);

    constructor(address _predecessor, address _admin) {
        if(_admin == address(0))
            revert ZeroAddress();
        
        predecessor = _predecessor;
        admin = _admin;
        deploymentTime = block.timestamp;
    }

    modifier onlyAdmin {
        _onlyAdmin();
        _;
    }

    modifier outOfBoundsCheck(uint256 _max, uint256 _given) {
        _outOfBoundsCheck(_max, _given);
        _;
    }

    modifier deprecatedCheck(bool _revertIfDeprecated) {
        _deprecatedCheck(_revertIfDeprecated);
        _;
    }

    function modifyMintingFee(uint16 _newFee) public onlyAdmin outOfBoundsCheck(5000, _newFee) deprecatedCheck(true) {
        mintingFee = _newFee;

        emit MintingFeeChanged(_newFee);
    }

    function modifyTakeProfitFee(uint16 _newFee) public onlyAdmin outOfBoundsCheck(5000, _newFee) deprecatedCheck(true) {
        takeProfitFee = _newFee;

        emit TakeProfitFeeChanged(_newFee);
    }

    function modifyWithdrawalFee(uint16 _newFee) public onlyAdmin outOfBoundsCheck(5000, _newFee) deprecatedCheck(true) {
        withdrawalFee = _newFee;

        emit WithdrawalFeeChanged(_newFee);
    }

    function deprecate(address _newAddress) public onlyAdmin {
        if(_newAddress == address(0))
            revert ZeroAddress();

        successor = _newAddress;

        emit SocialHubDeprecated(_newAddress);
    }

    /// @notice Transfer social trader details to the current social hub
    /// @dev Receives social trader details from the predecessor social hub
    /// @param _token address of the previous social trading token
    /// @param _socialTrader address of the social trader
    /// @param _twitterHandle twitter handle of the social trader
    /// @param _verified verified status
    /// @param _generateNewToken boolean if the social trader wishes to create a new token
    /// @param _newName memory-type string of the new token name
    /// @param _newSymbol memory-type stirng of the new token symbol
    /// @param _newMintingFee new minting fees of the new token
    /// @param _newProfitTakeFee new profit take fees of the new token
    /// @param _newWithdrawalFee new withdrawal fees of the new token
    function receiveTransferDetails(
        address _token,
        address _socialTrader,
        string memory _twitterHandle,
        bool _verified,
        bool _generateNewToken,
        string memory _newName,
        string memory _newSymbol,
        uint16 _newMintingFee,
        uint16 _newProfitTakeFee,
        uint16 _newWithdrawalFee
    ) external override {
        // Only allow the predecessor to send calls to the function
        if(msg.sender != predecessor)
            revert Unauthorized();

        SocialTrader storage st = listOfSocialTraders[_socialTrader];
        
        if(_generateNewToken) {
            st.token = new SocialTraderToken(_newName, _newSymbol, _newMintingFee, _newProfitTakeFee, _newWithdrawalFee, _socialTrader);
        } else {
            st.token = SocialTraderToken(_token);
        }

        st.twitterHandle = _twitterHandle;
        st.verified = _verified;

        emit DetailsReceived(_socialTrader);
    }
    
    /// @notice Transfer details to the new social hub
    /// @dev Transfer details and optionally generate a new token; can only be called by the social token
    /// @param _socialTrader address of the social trader
    /// @param _generateNewToken boolean if the social trader wishes to create a new token
    /// @param _newName memory-type string of the new token name
    /// @param _newSymbol memory-type stirng of the new token symbol
    /// @param _newMintingFee new minting fees of the new token
    /// @param _newProfitTakeFee new profit take fees of the new token
    /// @param _newWithdrawalFee new withdrawal fees of the new token
    function transferDetailsToSuccessor(
        address _socialTrader,
        bool _generateNewToken,
        string memory _newName,
        string memory _newSymbol,
        uint16 _newMintingFee,
        uint16 _newProfitTakeFee,
        uint16 _newWithdrawalFee
    ) external override {
        // Check if the SocialHub is deprecated
        if(!_deprecatedCheck(false))
            revert NotDeprecated();

        SocialTrader storage st = listOfSocialTraders[_socialTrader];

        // Ensure msg.sender is the SocialTraderToken
        if(msg.sender != address(listOfSocialTraders[_socialTrader].token))
            revert Unauthorized();

        ISocialHub(successor).receiveTransferDetails(
            address(st.token),
            _socialTrader,
            st.twitterHandle,
            st.verified,
            _generateNewToken,
            _newName,
            _newSymbol,
            _newMintingFee,
            _newProfitTakeFee,
            _newWithdrawalFee
        );

        delete listOfSocialTraders[_socialTrader];
        emit DetailsSent(_socialTrader);
    }

    /**
     * @dev Register to become a social trader
     */
    function becomeSocialTrader(
        string memory _tokenName,
        string memory _symbol,
        string memory _twitterHandle,
        uint16 _mintingFee,
        uint16 _profitTakeFee,
        uint16 _withdrawalFee
    )
        external
        override
        deprecatedCheck(true)
    {
        SocialTrader storage st = listOfSocialTraders[msg.sender];

        st.token = new SocialTraderToken(_tokenName, _symbol, _mintingFee, _profitTakeFee, _withdrawalFee, msg.sender);
        st.twitterHandle = _twitterHandle;

        emit SocialTraderRegistered(address(st.token), msg.sender);
    }
    /**
     * @dev Verifies the social trader
     */
    function verifySocialTrader(address _socialTrader) external override onlyAdmin deprecatedCheck(true) {
        SocialTrader storage st = listOfSocialTraders[_socialTrader];

        if(st.token.admin.address == address(0))
            revert NotASocialTrader(_socialTrader);
        
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
        override
        view
        returns(bool)
    {
        return listOfSocialTraders[_socialTrader].token.admin.address != address(0);
    }

    /// @notice Checks if a given value is greater than the max
    /// @dev Verifies that the given value is not greater than the max value otherwise revert
    /// @param _max maximum value
    /// @param _given provided value to check
    function _outOfBoundsCheck(uint256 _max, uint256 _given) internal pure {
        if(_given > _max)
            revert OutOfBounds(_max, _given);
    }

    /// @notice Checks if the contract is deprecated
    /// @dev Checks that the successor is a zero address or not, and if false, throw error Deprecated(successor);
    /// @param _revertIfDeprecated true to revert if the hub is deprecated, otherwise return true
    /// @return true if deprecated, false if not deprecated
    function _deprecatedCheck(bool _revertIfDeprecated) internal view returns(bool) {
        if(successor != address(0) && _revertIfDeprecated)
            revert Deprecated(successor);

        return successor != address(0);
    }

    /// @notice Checks if caller is an admin (social trader)
    /// @dev Internal function for the modifier "onlyAdmin" to verify msg.sender is an admin
    function _onlyAdmin() internal view {
        if(msg.sender != admin)
            revert Unauthorized();
    }
}