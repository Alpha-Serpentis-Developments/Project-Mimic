// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;

import {ERC20, IERC20} from "../oz/token/ERC20/ERC20.sol"; 

contract VaultToken is ERC20 {
    error Unauthorized();
    error WithdrawalWindowNotActive();

    /// @notice Time in which the withdrawal window expires
    uint256 private withdrawalWindowExpires;
    /// @notice Address of the manager (admin)
    address public immutable manager;

    constructor(string memory _name, string memory _symbol, address _manager) ERC20(_name, _symbol) {
        manager = _manager;
    }

    modifier onlyManager {
        _onlyManager();
        _;
    }

    modifier withdrawalWindowCheck {
        _withdrawalWindowCheck();
        _;
    }

    function deposit() external {

    }

    function withdraw() external {

    }

    function writeCalls() external onlyManager {

    }
    
    function sellCalls() external onlyManager {

    }

    function settleVault() external onlyManager {

    }

    function _onlyManager() internal view {
        if(msg.sender != manager)
            revert Unauthorized();
    }

    function _withdrawalWindowCheck() internal view {
        if(block.timestamp > withdrawalWindowExpires)
            revert WithdrawalWindowNotActive();
    }
}