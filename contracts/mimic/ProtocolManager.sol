// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { ReentrancyGuard } from "../oz/security/ReentrancyGuard.sol";

contract ProtocolManager is ReentrancyGuard {

    error Unauthorized();

    /// @notice Mapping of whitelisted addresses for each specific tag
    mapping(bytes32 => mapping(address => bool)) internal whitelist;
    /// @notice Protocol-level fees for deposits represented with two decimals of precision up to 50% (5000)
    uint16 public depositFee;
    /// @notice Protocol-level fees for withdrawals represented with two decimals of precision up to 50% (5000)
    uint16 public withdrawalFee;
    /// @notice Protocol-level fees for performance fee (fee taken if position is profitable) with two decimals of precision up to 50% (5000)
    uint16 public performanceFee;
    /// @notice Protocol-level fees for management fee (fees taken regardless if position was profitable) with two decimals of precision up to 50% (5000)
    uint16 public managementFee;
    /// @notice Address of the admin
    address public admin;

    constructor(
        address _admin,
        uint16 _depositFee,
        uint16 _withdrawalFee,
        uint16 _performanceFee,
        uint16 _managementFee
    ) {
        admin = _admin;
        depositFee = _depositFee;
        withdrawalFee = _withdrawalFee;
        performanceFee = _performanceFee;
        managementFee = _managementFee;
    }

    modifier onlyAdmin {
        _onlyAdmin();
        _;
    }

    function isWhitelisted(bytes32 _tag, address _check) external view returns(bool) {
        return whitelist[_tag][_check];
    }

    function _onlyAdmin() internal view {
        if(msg.sender != admin)
            revert Unauthorized();
    }

}