// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { ReentrancyGuardUpgradeable } from "../oz/security/ReentrancyGuardUpgradeable.sol";
import { OwnableUpgradeable } from "../oz/access/OwnableUpgradeable.sol";

contract SocialTokenComponents is OwnableUpgradeable, ReentrancyGuardUpgradeable {

    /// -- CONSTANTS --
    bytes public OA_TAG = "0x4f5054494f4e41444150544552"; // bytes("OPTIONADAPTER")
    bytes public EA_TAG = "0x45584348414e474541444150544552"; // bytes("EXCHANGEADAPTER")

    /// -- MODIFIERS & FUNCTIONS --

}