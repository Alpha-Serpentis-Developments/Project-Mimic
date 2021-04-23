// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {ISocialTraderToken} from "./interfaces/ISocialTraderToken.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SocialTraderToken is ERC20, ISocialTraderToken {

    error ZeroAddress();
    error Unauthorized_Admin();
    error UnsafeModule_DoesNotExist();
    error TradingOperationFailed(TradeOperation operation);

    address private admin;

    constructor(string memory _name, string memory _symbol, address _admin) ERC20(_name, _symbol) {
        if(_admin == address(0))
            revert ZeroAddress();
        admin = _admin;
    }

    modifier onlyAdmin {
        _onlyAdmin();
        _;
    }

    function isInActivePosition() public view returns(bool) {
    
    }

    function openPosition() external override {

    }

    function closePosition() external override {

    }

    function changeAdmin(address _admin) external override {

    }

    function executeTrade(TradeOperation[] memory _operations) external override {

    }

    function executePredeterminedTrade() external override {

    }

    function collectFee() external override {

    }

    function addUnsafeModule(address _module) external override {

    }

    function removeUnsafeModule(address _module) external override {

    }

    function interactWithUnsafeModule(address _module, bytes32 _function) external override payable {

    }

    function _onlyAdmin() internal view {
        if(msg.sender != admin)
            revert Unauthorized_Admin();
    }

    function _executeTradingOperation(
        TradeOperation[] memory _operations
    )
        internal
    {
        for(uint256 i = 0; i < _operations.length; i++) {
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