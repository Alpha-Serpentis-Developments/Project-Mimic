// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.0;

import "../ERC677/ERC677.sol";

contract SocialTraderToken is ERC677 {
    address immutable public socialTrader;
    uint256 public maxHolders;

    constructor(address _socialTrader, string memory _name, string memory _symbol, uint8 _decimals) ERC677(_name, _symbol) {
        require(
            _socialTrader != address(0)
        );
        socialTrader = _socialTrader;
        _setupDecimals(_decimals);
    }
}
