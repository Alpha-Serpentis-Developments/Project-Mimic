// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {ERC20, IERC20} from "../oz/token/ERC20/ERC20.sol";
import {SafeERC20} from "../oz/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "../oz/security/ReentrancyGuard.sol";
import {VaultToken} from "./VaultToken.sol";

// DO NOT USE IN PROD - STILL EVALUATING
contract MassDeposit is ERC20, ReentrancyGuard {
    using SafeERC20 for IERC20;

    error Invalid_ExitTooLarge();
    error Invalid_ApprovalTooSmall();
    error Unauthorized_SenderIsNotDepositor();
    error MaxQueueHit();

    struct QueueDeposit {
        uint256 depositAmount;
        address depositor;
    }

    /// @notice Address of where the mass deposit is being handled for 
    VaultToken public immutable depositingOn;
    /// @notice Mapping
    mapping(address => QueueDeposit) public queued;
    /// @notice Pending deposits
    address[] public addressQueue;
    /// @notice The collective queue
    uint256 public collectiveQueue;
    /// @notice Maximum queue allowed
    uint256 public maxQueue;

    event NewQueuedDeposit(address depositor, uint256 amount);
    event RemovedDeposit(address depositor, uint256 amount);
    event ClearedQueue();

    constructor(address _depositingOn, uint256 _maxQueue) ERC20("Cheap Deposit", "TEST") {
        require(_depositingOn != address(0), "0 address");

        depositingOn = VaultToken(_depositingOn);
        maxQueue = _maxQueue;

        addressQueue.push(address(0));
    }

    /// @notice Queue the provided deposit
    /// @dev msg.sender queues _depositAmount to be deposited into the vault
    /// @param _depositAmount Amount of the asset token to deposit
    function queueDeposit(uint256 _depositAmount) external nonReentrant() {
        // Check if the queue is filled
        if(addressQueue.length == maxQueue)
            revert MaxQueueHit();
        
        QueueDeposit storage deposit = queued[msg.sender];
        
        if(deposit.depositor != msg.sender) {
            addressQueue.push(msg.sender);
            deposit.depositor = msg.sender;
        }

        deposit.depositAmount += _depositAmount;
        //collectiveQueue += _depositAmount;

        IERC20(depositingOn.asset()).safeTransferFrom(msg.sender, address(this), _depositAmount);
        // _mint(msg.sender, _depositAmount);

        emit NewQueuedDeposit(msg.sender, _depositAmount);
    }

    // function queueDeposit(uint256 _depositAmount) external nonReentrant() {
    //     IERC20(depositingOn.asset()).safeTransferFrom(msg.sender, address(this), _depositAmount);
    //     _mint(msg.sender, _depositAmount);

    //     emit NewQueuedDeposit(msg.sender, _depositAmount);
    // }
    
    /// @notice Exit the queue with the amount to exit
    /// @dev Reduces msg.sender amount in queue up to the initial queued amount
    /// @param _index Index of where the queued deposit is at
    /// @param _amountToExit Amount to remove from the queue
    function exitQueue(uint256 _index, uint256 _amountToExit) external nonReentrant() {
        QueueDeposit storage deposit = queued[msg.sender];
        IERC20 assetToken = IERC20(depositingOn.asset());

        if(deposit.depositor != msg.sender)
            revert Unauthorized_SenderIsNotDepositor();

        if(deposit.depositAmount < _amountToExit) {
            revert Invalid_ExitTooLarge();
        } else if(deposit.depositAmount == _amountToExit) {
            delete queued[msg.sender];
            delete addressQueue[_index];
            _cleanArray();
        } else {
            deposit.depositAmount -= _amountToExit;
        }

        //collectiveQueue -= _amountToExit;
        assetToken.safeTransfer(msg.sender, _amountToExit);
        
        emit RemovedDeposit(msg.sender, _amountToExit);
    }

    function executeDeposits() external nonReentrant() {
        IERC20 assetToken = IERC20(depositingOn.asset());

        assetToken.safeApprove(address(depositingOn), assetToken.balanceOf(address(this)));
        depositingOn.deposit(assetToken.balanceOf(address(this)));

        for(uint256 i; i < addressQueue.length; i++) {
            QueueDeposit storage deposit = queued[addressQueue[i]];

            depositingOn.transfer(deposit.depositor, (depositingOn.balanceOf(address(this))/collectiveQueue));
        }

        collectiveQueue = 0;
    }

    function _cleanArray() internal {

    }
}