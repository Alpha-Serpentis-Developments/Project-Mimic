// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { SocialToken } from "./SocialToken.sol";

contract Opyn_ST is SocialToken {
    function initialize(
        string memory _name,
        string memory _symbol,
        address _denominationAsset,
        address _optionAdapter,
        address _exchangeAdapter,
        address _lendingAdapter,
        address _trader,
        uint16 _depositFee,
        uint16 _withdrawalFee,
        uint16 _managementFee,
        uint16 _performanceFee
    ) external {
        _initialize(
            _name,
            _symbol,
            _denominationAsset,
            _optionAdapter,
            _exchangeAdapter,
            _lendingAdapter,
            _trader,
            _depositFee,
            _withdrawalFee,
            _managementFee,
            _performanceFee
        );
    }
}