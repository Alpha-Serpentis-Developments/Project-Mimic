// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { GeneralActions } from "./interfaces/mimic/GeneralActions.sol";
import { OptionAdapter, IOptionAdapter } from "./adapters/OptionAdapter.sol";
import { IExchangeAdapter } from "./adapters/IExchangeAdapter.sol";

import { ReentrancyGuardUpgradeable } from "../oz/security/ReentrancyGuardUpgradeable.sol";
import { OwnableUpgradeable } from "../oz/access/OwnableUpgradeable.sol";

contract SocialTokenComponents is OwnableUpgradeable, ReentrancyGuardUpgradeable {

    /// -- USER-DEFINED TYPES --
    type PositionSize is uint256;

    /// -- CUSTOM ERRORS --
    error Position_AlreadyOpen();

    /// -- STRUCTS --

    /**
     @notice The position represents what the social trader has decided to execute
     - option represents the option the position references
     - size represents the size of the position
     - isLong represents whether or not the position is long; if it is NOT long, size is assumed to be "negative"
     */
    struct Position {
        IOptionAdapter.Option option;
        PositionSize size;
        bool isLong;
    }

    /// -- CONSTANTS --

    bytes public OA_TAG = "0x4f5054494f4e41444150544552"; // bytes("OPTIONADAPTER")
    bytes public EA_TAG = "0x45584348414e474541444150544552"; // bytes("EXCHANGEADAPTER")
    bytes public L_TAG = "0x4c454e44494e4741444150544552"; // bytes("LENDINGADAPTER")

    /// -- STATE VARIABLES --

    /// @notice Storage of all positions
    mapping(bytes => Position) public positions;
    /// @notice Currently active positions
    bytes[] public activePositions;
    /// @notice The token's denomination
    address public denominationAsset;
    /// @notice The option adapter
    address public optionAdapter;
    /// @notice The exchange adapter
    address public exchangeAdapter;
    /// @notice The token's maximum allowed assets in the denomination asset
    uint256 public maximumAssets;
    /// @notice The token-level deposit fee
    uint16 depositFee;
    /// @notice The token-level withdrawal fee
    uint16 withdrawalFee;
    /// @notice The token-level management fee
    uint16 managementFee;
    /// @notice The token-level performance fee
    uint16 performanceFee;

    /// -- MODIFIERS & FUNCTIONS --

    function openPosition(
        GeneralActions.Action[] memory _optionActions,
        Position memory _position,
        bytes[] memory _args
    ) external onlyOwner() nonReentrant {
        bytes memory posId = abi.encode(_position);

        if(PositionSize.unwrap(positions[posId].size) != 0)
            revert Position_AlreadyOpen();
        
        activePositions.push(posId);
        positions[posId] = _position;
    }

    function closePosition(bytes memory _position) external onlyOwner() nonReentrant {

    }

    function modifyPosition(bytes memory _position) external onlyOwner() nonReentrant {

    }

}