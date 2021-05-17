// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {ISocialTraderToken} from "./interfaces/ISocialTraderToken.sol";
import {IExchange} from "./interfaces/IExchange.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SocialHub} from "./SocialHub.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title Social Trader Token
/// @author Amethyst C. (AlphaSerpentis)
/// @notice The token social traders will use to trade assets for other users
/// @dev ERC20-compliant token that contains a pool of funds that are used to trade on Opyn
contract SocialTraderToken is ERC20, ISocialTraderToken {
    using SafeERC20 for IERC20;

    error OutOfBounds(uint256 max, uint256 given);
    error WithdrawalWindowIsInactive();

    /// @notice Mapping of a strategy to execute predefined
    mapping(string => TradeOperation[]) private strategies;
    /// @notice Mapping of a position (timestamp => position)
    mapping(uint256 => Position) private positions;
    /// @notice Mapping of token addresses representing how much fees are obligated to the owner
    mapping(address => uint256) private obligatedFees;
    /// @notice Array of pooled tokens currently
    address[] private pooledTokens;
    /// @notice Mapping of approved UNSAFE modules
    mapping(address => bool) private approvedUnsafeModules;
    /// @notice Active positions (in UNIX) if any
    uint256[] private activePositions;
    /// @notice Boolean representing if the token is under a withdrawal window
    bool private withdrawalWindowActive;
    /// @notice Minting fee in either the underlying or numeraire represented in % (100.00%)
    uint16 private mintingFee;
    /// @notice Profit take fee represented in % (100.00%)
    uint16 private takeProfitFee;
    /// @notice Withdrawal fee represented in % (100.00%)
    uint16 private withdrawalFee;
    /// @notice Minimum minting (default is 1e18)
    uint256 private minimumMint = 1e18;
    /// @notice Interface for exchange on v1
    IExchange private exchangev1;
    /// @notice Interface for exchange on v2
    IExchange private exchangev2;
    /// @notice Address of the Social Hub (where protocol fees are deposited to)
    address private socialHub;
    /// @notice Address of the admin (the social trader)
    address public admin;

    event PositionOpened(uint256 indexed timestamp, string indexed openingStrategy);
    event PositionClosed(uint256 indexed timestamp, string indexed closingStrategy);
    event PredeterminedStrategyAdded(string indexed strategy, TradeOperation[] indexed operations);
    event MintingFeeModified(uint16 indexed newFee);
    event TakeProfitFeeModified(uint16 indexed newFee);
    event AdminChanged(address newAdmin);

    constructor(string memory _name, string memory _symbol, uint16 _mintingFee, uint16 _takeProfitFee, uint16 _withdrawalFee, address _admin) ERC20(_name, _symbol) {
        if(_admin == address(0))
            revert ZeroAddress();
        mintingFee = _mintingFee;
        takeProfitFee = _takeProfitFee;
        withdrawalFee = _withdrawalFee;
        socialHub = msg.sender; // Assumes that the token was deployed from the social hub
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

    /// @notice The admin/social trader can modify the minting fee
    /// @dev Modify the minting fee represented in percentage with two decimals of precision (xxx.xx%)
    /// @param _newMintingFee value representing the minting fee in %; can only go as high as 50.00% (5000) otherwise error OutOfBounds is thrown
    function modifyMintingFee(uint16 _newMintingFee) public onlyAdmin outOfBoundsCheck(5000, _newMintingFee) {
        mintingFee = _newMintingFee;

        emit MintingFeeModified(_newMintingFee);
    }
    
    /// @notice The admin/social trader can modify the take profit fee
    /// @dev Modify the take profit fee represented in percentage with two decimals of precision (xxx.xx%)
    /// @param _newTakeProfitFee value representing the take profit fee in %; can only go as high as 50.00% (5000) otherwise error OutOfBounds is thrown
    function modifyTakeProfitFee(uint16 _newTakeProfitFee) public onlyAdmin outOfBoundsCheck(5000, _newTakeProfitFee) {
        takeProfitFee = _newTakeProfitFee;

        emit TakeProfitFeeModified(_newTakeProfitFee);
    }

    /// @notice Checks if a position is active
    /// @dev Check if a position at a given timestamp is still active
    /// @param _timestamp UNIX time of when the position was opened and used to check if it's active
    /// @return true if the position at the given timestamp is active, otherwise false (false if position doesn't exist)
    function isInActivePosition(uint256 _timestamp) public view returns(bool) {
        return !positions[_timestamp].closed;
    }
    
    /// @notice Changes the social hub
    /// @dev Move to the successor social hub and optionally generate a new token if desired
    /// @param _generateNewToken boolean if the social trader wishes to create a new token
    /// @param _newName memory-type string of the new token name
    /// @param _newSymbol memory-type stirng of the new token symbol
    /// @param _newMintingFee new minting fees of the new token
    /// @param _newProfitTakeFee new profit take fees of the new token
    /// @param _newWithdrawalFee new withdrawal fees of the new token
    function changeSocialHubs(
        bool _generateNewToken,
        bytes32 _newName,
        bytes32 _newSymbol,
        uint16 _newMintingFee,
        uint16 _newProfitTakeFee,
        uint16 _newWithdrawalFee
    ) public onlyAdmin {
        SocialHub(socialHub).transferDetailsToSuccessor(
            admin,
            _generateNewToken,
            _newName,
            _newSymbol,
            _newMintingFee,
            _newProfitTakeFee,
            _newWithdrawalFee
        );
    }
    
    /// @notice Assign the initial ratio
    /// @dev Assigns the initial ratio of the pool; only done once or if the pool becomes empty
    function assignRatio() public {
        
    
    }

    /// @notice Mints social tokens by depositing a proportion of pooled tokens
    /// @dev Mints new social tokens, requiring collateral/underlying; minting is disallowed if withdrawalWindowActive is false
    /// @param _amount amount of tokens to mint
    function mint(uint256 _amount) public {
        if(!withdrawalWindowActive)
            revert WithdrawalWindowIsInactive();
        
        if(_amount < minimumMint)
            revert TooLowMintingAmount();

        // NOTE: There was slippage worries if the pool ratio did change, but the pool ratio shouldn't change...
        // ... if there's no active positions. If the unsafe module is active, slippage could be a concern.

        bool nonZeroAmount;
        // Loop through the current array of pooled tokens
        for(uint256 i; i < pooledTokens.length; i++) {
            ERC20 token = ERC20(pooledTokens[i]);

            if(!nonZeroAmount && token.balanceOf(address(this)) != 0) {
                nonZeroAmount = true;
            }
        }

        if(!nonZeroAmount) {
            revert RatioNotDefined();
        }
        
    }

    /// @notice Burns social tokens in return for the pooled funds
    /// @dev Burns social tokens during inactive period
    /// @param _amount amount of tokens to burn (amount must be approved!)
    function burn(uint256 _amount) public {

    }
    
    /// @notice Open a new position
    /// @dev Opens a new position with the given strategy, oToken, and style
    /// @param _openingStrategy string for the strategy name in the mapping to be used to execute the trade
    /// @param _oToken address of the oToken
    /// @param _style OptionStyle enum of either AMERICAN or EUROPEAN
    /// @return !!! TEMPORARY MESSAGE - MIGHT REMOVE? !!!
    function openPosition(
        string memory _openingStrategy,
        address _oToken,
        OptionStyle _style
    ) external override onlyAdmin returns(uint256) {
        Position storage pos = positions[block.timestamp];

        pos.openingStrategy = _openingStrategy;
        pos.oToken = _oToken;
        pos.style = _style;
        pos.numeraire = _determineNumeraire(_oToken, _style);

        _executeTradingOperation(strategies[_openingStrategy], pos);
        
        emit PositionOpened(block.timestamp, _openingStrategy);
    }

    /// @notice Close an active position
    /// @dev Closes a position with the given position timestamp and strategy; reverts if strategy is closed/does not exist
    /// @param _timestamp UNIX value of when the position was opened
    /// @param _closingStrategy string for the strategy name in the mapping to be used to execute the trade
    function closePosition(uint256 _timestamp, string memory _closingStrategy) external override onlyAdmin {
        if(!isInActivePosition(_timestamp))
            revert PositionNotActive(_timestamp);

        Position storage pos = positions[_timestamp];

        pos.closingStrategy = _closingStrategy;
        pos.closed = true;

        emit PositionClosed(block.timestamp, _closingStrategy);
    }

    /// @notice Changes the admin/social trader of the token
    /// @dev Hand over control of the trading token to a new address
    /// @param _admin address of the new admin
    function changeAdmin(address _admin) external override onlyAdmin {
        if(_admin == address(0))
            revert ZeroAddress();
        
        admin = _admin;

        emit AdminChanged(_admin);
    }

    /// @notice Allows the social trader to create a new predetermined strategy
    /// @dev Create a new strategy paired with a string key and an array of trading operations
    /// @param _strategy string of the predetermined strategy
    /// @param _operations memory array of TradeOperation that will be used to execute a trade
    function createPredeterminedStrategy(string memory _strategy, TradeOperation[] memory _operations) external override onlyAdmin {
        TradeOperation[] storage strategy = strategies[_strategy];

        if(strategy.length != 0)
            revert PredeterminedStrategyExists(_strategy);

        strategies[_strategy] = _operations;

        emit PredeterminedStrategyAdded(_strategy, _operations);
    }

    /// @notice Allows the social trader to make a trade on an active position
    /// @dev Allow manual trading of an active position with an array of custom operations
    /// @param _timestamp UNIX value of when the position was opened
    /// @param _operations memory array of TradeOperation that will be used to execute a trade
    function executeTrade(uint256 _timestamp, TradeOperation[] memory _operations) external override onlyAdmin {
        Position storage pos = positions[_timestamp];
        
        _executeTradingOperation(_operations, pos);
    }

    /// @notice Allows the social trader to make a trade on an active position with a predetermined strategy
    /// @dev Allow trading of an active position with a predetermined strategy
    /// @param _timestamp UNIX value of when the position was opened
    /// @param _strategy string of the predetermined strategy
    function executePredeterminedStrategy(uint256 _timestamp, string memory _strategy) external override onlyAdmin {
        Position storage pos = positions[_timestamp];
        
        _executeTradingOperation(strategies[_strategy], pos);
    }

    /// @notice Social trader can collect fees generated
    /// @dev Collect fees of a specific token
    /// @param _token address of the token to collect fees
    function collectFees(address _token) external override onlyAdmin {
        IERC20(_token).safeTransfer(msg.sender, obligatedFees[_token]);

        obligatedFees[_token] = 0;
    }

    /// @notice Allows the social trader to add an UNSAFE module (UNSAFE MODULES ARE NOT TESTED BY PROJECT MIMIC!)
    /// @dev Add an unsafe module to the token; NOT RECOMMENDED, USE AT YOUR OWN RISK
    /// @param _module address of the unsafe module
    function addUnsafeModule(address _module) external override onlyAdmin {
        if(_module == address(0))
            revert ZeroAddress();

        approvedUnsafeModules[_module] = true;
    }

    /// @notice Allows the social trader to remove an UNSAFE module
    /// @dev Remove an unsafe module from the token
    /// @param _module address of the unsafe module (that's added)
    function removeUnsafeModule(address _module) external override onlyAdmin {
        if(_module == address(0))
            revert ZeroAddress();

        approvedUnsafeModules[_module] = false;
    }

    /// @notice Allows the social trader to interact with an UNSAFE module
    /// @dev Interact with an unsafe module, passing a function and its arguments
    /// @param _module address of the unsafe module
    /// @param _function function data
    /// @param _revertIfUnsuccessful optional argument to pass true to revert if call was unsuccessful for whatever reason
    function interactWithUnsafeModule(address _module, bytes memory _function, bool _revertIfUnsuccessful) external override payable onlyAdmin returns(bool, bytes memory) {
        (bool success, bytes memory returnData) = _module.call{value: msg.value}(_function);

        if(_revertIfUnsuccessful)
            revert UnsafeModule_Revert();

        return (success, returnData);
    }

    /// @notice Checks if caller is an admin (social trader)
    /// @dev Internal function for the modifier "onlyAdmin" to verify msg.sender is an admin
    function _onlyAdmin() internal view {
        if(msg.sender != admin)
            revert Unauthorized_Admin();
    }

    /// @notice Checks if a given value is greater than the max
    /// @dev Verifies that the given value is not greater than the max value otherwise revert
    /// @param _max maximum value
    /// @param _given provided value to check
    function _outOfBoundsCheck(uint256 _max, uint256 _given) internal pure {
        if(_given > _max)
            revert OutOfBounds(_max, _given);
    }

    /// @notice Grab the numeraire of an oToken
    /// @dev Using the OptionStyle, determine the numeraire of an oToken
    /// @param _oToken address of the oToken
    /// @param _style Enum of OptionStyle.AMERICAN or OptionStyle.EUROPEAN
    /// @return numeraire address of the numeraire
    function _determineNumeraire(address _oToken, OptionStyle _style) internal view returns(address numeraire) {
        if(_style == OptionStyle.AMERICAN) {
            
        } else {
            
        }
    }

    /// @notice Calculate the ratio of given token to total supply of social tokens
    /// @dev Calculation of the ratio
    /// @param _token address of the token (in the pool)
    /// @return token ratio
    function _calculateTokenRatio(address _token) internal view returns(uint256) {
        return (10e18 * ERC20(_token).totalSupply())/(10e18 * this.totalSupply());
    }

    /// @notice Execution of trades
    /// @dev Provided a position and operations, it will execute the trades in the provided order in the array
    /// @param _operations memory array of TradeOperation that will be used to execute a trade
    /// @param _position storage-type of Position 
    function _executeTradingOperation(
        TradeOperation[] memory _operations,
        Position storage _position
    )
        internal
    {
        for(uint256 i; i < _operations.length; i++) {
            TradeOperation operation = _operations[i];
            // BUY
            if(operation == TradeOperation.BUY) {

            // SELL
            } else if(operation == TradeOperation.SELL) {
            
            // WRITE
            } else if(operation == TradeOperation.WRITE) {

            // BURN
            } else if(operation == TradeOperation.BURN) {

            // EXERCISE
            } else if(operation == TradeOperation.EXERCISE) {

            // REDEEM COLLATERAL
            } else if(operation == TradeOperation.REDEEM_COLLATERAL) {

            }
        }
    }

}