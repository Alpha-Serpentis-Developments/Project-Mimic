// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {IERC20} from "../oz/token/ERC20/IERC20.sol";
import {ISocialHub} from "./interfaces/ISocialHub.sol";
import {SocialTraderToken} from "./SocialTraderToken.sol";

contract SocialHub is ISocialHub {
    error Unauthorized();
    error NotASocialTrader(address trader);
    error AlreadyASocialTrader();
    error OutOfBounds(uint256 max, uint256 given);
    error NotDeprecated();
    error Deprecated(address _succesor);
    error ZeroAddress();

    /// @notice Struct that outlines the Social Trader
    struct SocialTrader {
        SocialTraderToken token;
        bytes32 twitterHandle;
        bool verified;
    }
    
    /// @notice Mapping of social traders
    mapping(address => SocialTrader) private listOfSocialTraders;
    /// @notice Mapping of whitelisted addresses (used for SocialTraderToken on non-unsafe modules)
    mapping(address => bool) public whitelisted;
    /// @notice Protocol minting fee
    uint16 public mintingFee;
    /// @notice Protocol take profit fee
    uint16 public takeProfitFee;
    /// @notice Protocol withdrawal fee
    uint16 public withdrawalFee;
    /// @notice Address of the predecessor
    address private predecessor;
    /// @notice Address of the successor
    address private successor;
    /// @notice Address of the admin of the SocialHub
    address private admin;
    /// @notice UNIX time of deployment (used for version checking)
    uint256 private immutable deploymentTime;

    event MintingFeeChanged(uint16 newFee);
    event TakeProfitFeeChanged(uint16 newFee);
    event WithdrawalFeeChanged(uint16 newFee);
    event AddressAddedToWhitelist(address indexed addedAddress);
    event AddressRemovedFromWhitelist(address indexed removedAddress);
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

    /// @notice bytes32 to string
    /// @dev Converts bytes32 to a string memory type
    /// @param _bytes32 bytes32 type to convert into a string
    /// @return a string memory type 
    function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
        uint8 i = 0;
        while(i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
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
    /// @param _newFees is a Fees struct containing the new fees
    /// @param _allowUnsafeModules boolean to determine if unsafe modules should be used
    function receiveTransferDetails(
        address _token,
        address _socialTrader,
        bytes32 _twitterHandle,
        bool _verified,
        bool _generateNewToken,
        bytes32 _newName,
        bytes32 _newSymbol,
        Fees memory _newFees,
        bool _allowUnsafeModules
    ) external override {
        // Only allow the predecessor to send calls to the function
        if(msg.sender != predecessor)
            revert Unauthorized();

        SocialTrader storage st = listOfSocialTraders[_socialTrader];
        
        if(_generateNewToken) {
            st.token = new SocialTraderToken(bytes32ToString(_newName), bytes32ToString(_newSymbol), _newFees.mintingFee, _newFees.takeProfitFee, _newFees.withdrawalFee, _allowUnsafeModules, _socialTrader);
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
        bytes32 _newName,
        bytes32 _newSymbol,
        uint16 _newMintingFee,
        uint16 _newProfitTakeFee,
        uint16 _newWithdrawalFee,
        bool _allowUnsafeModules
    ) external override {
        // Check if the SocialHub is deprecated
        if(!_deprecatedCheck(false))
            revert NotDeprecated();

        SocialTrader storage st = listOfSocialTraders[_socialTrader];

        // Ensure msg.sender is the SocialTraderToken
        if(msg.sender != address(listOfSocialTraders[_socialTrader].token))
            revert Unauthorized();
            
        Fees memory newFees;
        newFees.mintingFee = _newMintingFee;
        newFees.takeProfitFee = _newProfitTakeFee;
        newFees.withdrawalFee = _newWithdrawalFee;

        ISocialHub(successor).receiveTransferDetails(
            address(st.token),
            _socialTrader,
            st.twitterHandle,
            st.verified,
            _generateNewToken,
            _newName,
            _newSymbol,
            newFees,
            _allowUnsafeModules
        );

        delete listOfSocialTraders[_socialTrader];
        emit DetailsSent(_socialTrader);
    }

    /**
     * @dev Register to become a social trader
     */
    function becomeSocialTrader(
        bytes32 _tokenName,
        bytes32 _symbol,
        bytes32 _twitterHandle,
        uint16 _mintingFee,
        uint16 _profitTakeFee,
        uint16 _withdrawalFee,
        bool _allowUnsafeModules
    )
        external
        override
        deprecatedCheck(true)
    {
        SocialTrader storage st = listOfSocialTraders[msg.sender];

        if(address(st.token) != address(0))
            revert AlreadyASocialTrader();

        st.token = new SocialTraderToken(bytes32ToString(_tokenName), bytes32ToString(_symbol), _mintingFee, _profitTakeFee, _withdrawalFee, _allowUnsafeModules, msg.sender);
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