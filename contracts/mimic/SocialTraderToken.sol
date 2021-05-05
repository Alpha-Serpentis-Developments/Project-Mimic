// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {ISocialTraderToken} from "./interfaces/ISocialTraderToken.sol";
import {IExchange} from "./interfaces/IExchange.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title Social Trader Token
/// @author Amethyst C. (AlphaSerpentis)
/// @notice The token social traders will use to trade assets for other users
/// @dev ERC20-compliant token that contains a pool of funds that are used to trade on Opyn
contract SocialTraderToken is ERC20, ISocialTraderToken {
    using SafeERC20 for IERC20;
    /// @notice Mapping of a strategy to execute predefined
    mapping(string => TradeOperation[]) public strategies;
    /// @notice Mapping of a position (timestamp => position)
    mapping(uint256 => Position) public positions;
    /// @notice Mapping of token addresses representing how much fees are obligated to the owner
    mapping(address => uint256) public obligatedFees;
    /// @notice Minting fee in either the underlying or numeraire represented in % (100.00%)
    uint16 public mintingFee;
    /// @notice Profit take fee represented in % (100.00%)
    uint16 public takeProfitFee;
    /// @notice Interface for an exchange
    IExchange public exchange;
    /// @notice Address of the Social Hub (where protocol fees are deposited to)
    address public socialHub;
    /// @notice Address of the admin (the social trader)
    address public admin;

    event PositionOpened(uint256 indexed timestamp, string indexed openingStrategy);
    event PositionClosed(uint256 indexed timestamp, string indexed closingStrategy);
    event PredeterminedStrategyAdded(string indexed strategy, TradeOperation[] indexed operations);
    event MintingFeeModified(uint16 newFee);
    event TakeProfitFeeModified(uint16 newFee);
    event AdminChanged(address newAdmin);

    constructor(string memory _name, string memory _symbol, uint16 _mintingFee, uint16 _takeProfitFee, address _admin) ERC20(_name, _symbol) {
        if(_admin == address(0))
            revert ZeroAddress();
        mintingFee = _mintingFee;
        takeProfitFee = _takeProfitFee;
        socialHub = msg.sender;
        admin = _admin;
    }

    modifier onlyAdmin {
        _onlyAdmin();
        _;
    }

    function modifyMintingFee(uint16 _newMintingFee) public onlyAdmin {
        mintingFee = _newMintingFee;

        emit MintingFeeModified(_newMintingFee);
    }
    
    function modifyTakeProfitFee(uint16 _newTakeProfitFee) public onlyAdmin {
        takeProfitFee = _newTakeProfitFee;

        emit TakeProfitFeeModified(_newTakeProfitFee);
    }

    function isInActivePosition(uint256 _timestamp) public view returns(bool) {
        return !positions[_timestamp].closed;
    }

    function openPosition(string memory _openingStrategy, address _oToken) external override onlyAdmin returns(uint256) {
        Position storage pos = positions[block.timestamp];

        pos.openingStrategy = _openingStrategy;
        pos.oToken = _oToken;

        _executeTradingOperation(strategies[_openingStrategy], pos);
        
        emit PositionOpened(block.timestamp, _openingStrategy);
    }

    function closePosition(uint256 _timestamp, string memory _closingStrategy) external override onlyAdmin {
        Position storage pos = positions[_timestamp];

        pos.closingStrategy = _closingStrategy;
        pos.closed = true;

        emit PositionClosed(block.timestamp, _closingStrategy);
    }

    function changeAdmin(address _admin) external override onlyAdmin {
        if(_admin == address(0))
            revert ZeroAddress();
        
        admin = _admin;

        emit AdminChanged(_admin);
    }

    function createPredeterminedStrategy(string memory _strategy, TradeOperation[] memory _operations) external override onlyAdmin {
        TradeOperation[] storage strategy = strategies[_strategy];

        if(strategy.length != 0)
            revert PredeterminedStrategyExists(_strategy);

        strategies[_strategy] = _operations;

        emit PredeterminedStrategyAdded(_strategy, _operations);
    }

    function executeTrade(uint256 _timestamp, TradeOperation[] memory _operations) external override onlyAdmin {
        Position storage pos = positions[_timestamp];
        
        _executeTradingOperation(_operations, pos);
    }

    function executePredeterminedStrategy(uint256 _timestamp, string memory _strategy) external override onlyAdmin {
        Position storage pos = positions[_timestamp];
        
        _executeTradingOperation(strategies[_strategy], pos);
    }

    function collectFees(address _token) external override onlyAdmin {

    }

    function addUnsafeModule(address _module) external override onlyAdmin {

    }

    function removeUnsafeModule(address _module) external override onlyAdmin {

    }

    function interactWithUnsafeModule(address _module, bytes memory _function, bool _revertIfUnsuccessful) external override payable onlyAdmin returns(bool, bytes memory) {
        (bool success, bytes memory returnData) = _module.call{value: msg.value}(_function);

        if(_revertIfUnsuccessful)
            revert UnsafeModule_Revert();

        return (success, returnData);
    }

    function _onlyAdmin() internal view {
        if(msg.sender != admin)
            revert Unauthorized_Admin();
    }

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