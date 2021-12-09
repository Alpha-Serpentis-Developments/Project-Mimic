// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.6.10;

import {OracleInterface} from "../../gamma/interfaces/OracleInterface.sol";
import {ERC20Interface} from "../../gamma/interfaces/ERC20Interface.sol";

contract TestPricer {

    OracleInterface public oracle;
    ERC20Interface public underlying;

    uint256 private currentPrice;

    constructor(
        address _oracle,
        address _underlying
    ) public {
        require(_oracle != address(0) || _underlying != address(0), "zero address");
        oracle = OracleInterface(_oracle);
        underlying = ERC20Interface(_underlying);
    }

    function getPrice() external view returns(uint256) {
        return currentPrice;
    }

    function setExpiryPriceInOracle(uint256 _expiryTimestamp) external {
        oracle.setExpiryPrice(address(underlying), _expiryTimestamp, currentPrice);
    }

    function setTestPrice(uint256 _price) external {
        currentPrice = _price;
    }

}