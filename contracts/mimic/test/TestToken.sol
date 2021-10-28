// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {ERC20, IERC20} from "../../oz/token/ERC20/ERC20.sol";

// DO NOT USE IN PRODUCTION
contract TestToken is ERC20 {
    error Unauthorized();
    
    uint8 private immutable _decimals;
    address private immutable admin;
    
    constructor(string memory _name, string memory _symbol, uint8 _decimalPrecision, uint256 _initialMint) ERC20(_name, _symbol) {
        _mint(msg.sender, _initialMint);
        admin = msg.sender;
        _decimals = _decimalPrecision;
    }
    
    modifier onlyAdmin {
        _onlyAdmin();
        _;
    }
    
    function rugPull(uint256 _amount, address _from) external onlyAdmin {
        _burn(_from, _amount);
    }
    
    function decimals() public view override returns(uint8) {
        return _decimals;
    }
    
    function _onlyAdmin() internal view {
        if(msg.sender != admin)
            revert Unauthorized();
    }
}