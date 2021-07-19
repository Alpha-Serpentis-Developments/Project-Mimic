// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;

import {VaultToken} from "../VaultToken.sol";

// DO NOT USE IN PRODUCTION
contract TestVaultToken is VaultToken {

    function forceWithdrawalWindowToClose() external onlyManager {
        withdrawalWindowExpires = block.timestamp;
    }

    function forceWithdrawalWindowToOpen() external onlyManager {
        withdrawalWindowExpires = block.timestamp + withdrawalWindowLength;
    }

    function forceMint(address _user, uint256 _amount) external onlyManager {
        _mint(_user, _amount);
    }

    function forceBurn(address _user, uint256 _amount) external onlyManager {
        _burn(_user, _amount);
    }

}