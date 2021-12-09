// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import { SocialToken } from "../socialtoken/SocialToken.sol";
import { IController } from "../interfaces/gamma/IController.sol";

// lightly an opyn social token
contract TestSocialToken is SocialToken {
    function allowOpynAdapter(address _controller) external onlyOwner() {
        IController(_controller).setOperator(optionAdapter, true);
    }
}