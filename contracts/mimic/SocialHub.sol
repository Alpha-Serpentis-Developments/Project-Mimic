// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {IERC20} from "../oz/token/ERC20/IERC20.sol";
import {ISocialHub} from "./interfaces/ISocialHub.sol";
import {SocialTraderToken} from "./SocialTraderToken.sol";

contract SocialHub is ISocialHub {

    /// @notice Struct that outlines the Social Trader
    struct SocialTrader {
        address socialTrader;
        bool verified;
    }
    
    /// @notice Mapping of social traders (token -> Social Trader)
    mapping(address => SocialTrader) public listOfSocialTraders;
    /// @notice Mapping of whitelisted addresses (used for SocialTraderToken on non-unsafe modules)
    mapping(address => bool) public whitelisted;
    /// @notice Protocol minting fee
    uint16 public mintingFee;
    /// @notice Protocol take profit fee
    uint16 public takeProfitFee;
    /// @notice Protocol withdrawal fee
    uint16 public withdrawalFee;
    /// @notice Address of the predecessor
    address public immutable predecessor;
    /// @notice Address of the successor
    address public successor;
    /// @notice Address of the admin of the SocialHub
    address public admin;

    event MintingFeeChanged(uint16 newFee);
    event TakeProfitFeeChanged(uint16 newFee);
    event WithdrawalFeeChanged(uint16 newFee);
    event AddressAddedToWhitelist(address indexed addedAddress);
    event AddressRemovedFromWhitelist(address indexed removedAddress);
    event AdminChanged(address newAdmin);
    event SocialTraderTokenRegistered(address indexed token, address indexed trader);
    event SocialTraderTokenVerified(address indexed token);
    event SocialHubDeprecated(address indexed successor);
    event DetailsReceived(address indexed trader);
    event DetailsSent(address indexed trader);

    constructor(address _predecessor, address _admin) {
        if(_admin == address(0))
            revert ZeroAddress();
        
        predecessor = _predecessor;
        admin = _admin;
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

    function changeAdmin(address _admin) external onlyAdmin {
        if(_admin == address(0))
            revert ZeroAddress();
        
        admin = _admin;
        emit AdminChanged(_admin);
    }

    function modifyMintingFee(uint16 _newFee) external onlyAdmin outOfBoundsCheck(5000, _newFee) deprecatedCheck(true) {
        mintingFee = _newFee;

        emit MintingFeeChanged(_newFee);
    }

    function modifyTakeProfitFee(uint16 _newFee) external onlyAdmin outOfBoundsCheck(5000, _newFee) deprecatedCheck(true) {
        takeProfitFee = _newFee;

        emit TakeProfitFeeChanged(_newFee);
    }

    function modifyWithdrawalFee(uint16 _newFee) external onlyAdmin outOfBoundsCheck(5000, _newFee) deprecatedCheck(true) {
        withdrawalFee = _newFee;

        emit WithdrawalFeeChanged(_newFee);
    }

    function deprecate(address _newAddress) external onlyAdmin {
        if(_newAddress == address(0))
            revert ZeroAddress();

        successor = _newAddress;

        emit SocialHubDeprecated(_newAddress);
    }
    
    function addToWhitelist(address _add) external onlyAdmin {
        if(_add == address(0))
            revert ZeroAddress();
            
        whitelisted[_add] = true;
        emit AddressAddedToWhitelist(_add);
    }
    
    function removeFromWhitelist(address _remove) external onlyAdmin {
        whitelisted[_remove] = false;
        emit AddressRemovedFromWhitelist(_remove);
    }

    /// @notice Transfer social trader details to the current social hub
    /// @dev Receives social trader details from the predecessor social hub
    /// @param _token address of the previous social trading token
    /// @param _socialTrader address of the social trader
    /// @param _verified verified status
    /// @param _generateNewToken boolean if the social trader wishes to create a new token
    /// @param _tokenSettings struct that details the new token settings
    function receiveTransferDetails(
        address _token,
        address _socialTrader,
        bool _verified,
        bool _generateNewToken,
        NewTokenSettings memory _tokenSettings
    ) external override {
        // Only allow the predecessor to send calls to the function
        if(msg.sender != predecessor)
            revert Unauthorized();

        SocialTraderToken token;
        
        if(_generateNewToken) {
            token = new SocialTraderToken(
                bytes32ToString(_tokenSettings.newName),
                bytes32ToString(_tokenSettings.newSymbol),
                _tokenSettings.mintingFee,
                _tokenSettings.takeProfitFee,
                _tokenSettings.withdrawalFee,
                _tokenSettings.allowUnsafeModules,
                _tokenSettings.traderManager,
                _socialTrader
            );

            if(address(token) == address(0))
                revert ZeroAddress();
        } else {
            token = SocialTraderToken(_token);
        }

        SocialTrader storage st = listOfSocialTraders[address(token)];

        st.socialTrader = _socialTrader;
        st.verified = _verified;

        emit DetailsReceived(_socialTrader);
    }
    
    /// @notice Transfer details to the new social hub
    /// @dev Transfer details and optionally generate a new token; can only be called by the social token
    /// @param _socialTrader address of the social trader
    /// @param _generateNewToken boolean if the social trader wishes to create a new token
    /// @param _newName memory-type bytes32 of the new token name
    /// @param _newSymbol memory-type bytes32 of the new token symbol
    /// @param _newMintingFee new minting fees of the new token
    /// @param _newProfitTakeFee new profit take fees of the new token
    /// @param _newWithdrawalFee new withdrawal fees of the new token
    /// @param _allowUnsafeModules boolean to determine if the token can use unsafe modules
    /// @param _traderManager address of the trader manager contract
    function transferDetailsToSuccessor(
        address _socialTrader,
        bool _generateNewToken,
        bytes32 _newName,
        bytes32 _newSymbol,
        uint16 _newMintingFee,
        uint16 _newProfitTakeFee,
        uint16 _newWithdrawalFee,
        bool _allowUnsafeModules,
        address _traderManager
    ) external override {
        // Check if the SocialHub is deprecated
        if(!_deprecatedCheck(false))
            revert NotDeprecated();

        SocialTrader storage st = listOfSocialTraders[msg.sender];

        // Ensure msg.sender is the social trader
        if(st.socialTrader != SocialTraderToken(msg.sender).admin())
            revert Unauthorized();
            
        NewTokenSettings memory newTokenSettings;
        newTokenSettings.mintingFee = _newMintingFee;
        newTokenSettings.takeProfitFee = _newProfitTakeFee;
        newTokenSettings.withdrawalFee = _newWithdrawalFee;
        newTokenSettings.newName = _newName;
        newTokenSettings.newSymbol = _newSymbol;
        newTokenSettings.traderManager = _traderManager;
        newTokenSettings.allowUnsafeModules = _allowUnsafeModules;

        ISocialHub(successor).receiveTransferDetails(
            msg.sender,
            _socialTrader,
            st.verified,
            _generateNewToken,
            newTokenSettings
        );

        delete listOfSocialTraders[msg.sender];
        emit DetailsSent(msg.sender);
    }

    /// @notice Register a new social trading token
    /// @dev Deploys a new SocialTraderToken
    /// @param _tokenName bytes32 of the token name
    /// @param _symbol bytes32 of the token symbol
    /// @param _mintingFee minting fees represented up to a max of (5000 == 50.00%)
    /// @param _profitTakeFee profit take fees represented up to a max of (5000 == 50.00%)
    /// @param _withdrawalFee withdrawal fees represented up to a max of (5000 == 50.00%)
    /// @param _allowUnsafeModules boolean to determine if the token can use unsafe modules
    /// @param _traderManager address of the trader manager contract
    function becomeSocialTrader(
        bytes32 _tokenName,
        bytes32 _symbol,
        uint16 _mintingFee,
        uint16 _profitTakeFee,
        uint16 _withdrawalFee,
        bool _allowUnsafeModules,
        address _traderManager
    )
        external
        override
        deprecatedCheck(true)
    {
        if(!whitelisted[_traderManager])
            revert Unauthorized();
        
        _outOfBoundsCheck(5000, _mintingFee);
        _outOfBoundsCheck(5000, _profitTakeFee);
        _outOfBoundsCheck(5000, _withdrawalFee);

        SocialTraderToken token = new SocialTraderToken(bytes32ToString(_tokenName), bytes32ToString(_symbol), _mintingFee, _profitTakeFee, _withdrawalFee, _allowUnsafeModules, _traderManager, msg.sender);
        
        listOfSocialTraders[address(token)].socialTrader = msg.sender;

        emit SocialTraderTokenRegistered(address(token), msg.sender);
    }
    
    /// @notice Verifies a social trading token
    /// @dev Marks a social trading token as verified by the admin
    /// @param _token address of the social token to verify
    function verifySocialTraderToken(address _token) external override onlyAdmin deprecatedCheck(true) {
        SocialTrader storage st = listOfSocialTraders[_token];

        if(st.socialTrader == address(0))
            revert NotASocialTraderToken(_token);
        
        st.verified = true;

        emit SocialTraderTokenVerified(_token);
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

    /// @notice bytes32 to string
    /// @dev Converts bytes32 to a string memory type
    /// @param _bytes32 bytes32 type to convert into a string
    /// @return a string memory type 
    function bytes32ToString(bytes32 _bytes32) private pure returns (string memory) {
        uint8 i;
        while(i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

}