// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {ReentrancyGuard} from "../oz/security/ReentrancyGuard.sol";

import {IERC20} from "../oz/token/ERC20/ERC20.sol";
import {SafeERC20} from "../oz/token/ERC20/utils/SafeERC20.sol";

/**
 @notice Non-upgradeable protocol manager contract that contains the protocol-level fees and trusted list
 */
contract ProtocolManager is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// -- CUSTOM ERRORS --

    error Unauthorized();
    error Invalid_FeeTooHigh();

    /// -- STATE VARIABLES --

    /// @notice Mapping of trusted addresses for each specific tag
    mapping(bytes => mapping(address => bool)) internal trustedList;
    /// @notice Determines if the trustedList is in active use or not
    bool public useTrustedList;
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

    /// -- EVENTS --

    event UseTrustedList(bool status);
    event TrustedListModified(bytes tag, address addr, bool status);
    event DepositFeeModified(uint16 fee);
    event WithdrawalFeeModified(uint16 fee);
    event PerformanceFeeModified(uint16 fee);
    event ManagementFeeModified(uint16 fee);
    event AdminModified(address newAdmin);

    /// -- MODIFIER & FUNCTIONS --

    modifier onlyAdmin() {
        _onlyAdmin();
        _;
    }

    /// @notice Sweeps tokens sent to the protocol manager and sends it to the admin
    /// @dev Sends a list of tokens to the admin from the protocol manager contract
    /// @param _tokens is an array of addresses representing the tokens sent to the protocol manager
    function sweepTokens(address[] memory _tokens) external nonReentrant {
        for (uint256 i; i < _tokens.length; i++) {
            IERC20 token = IERC20(_tokens[i]);

            token.safeTransfer(admin, token.balanceOf(address(this)));
        }
    }

    /// @notice Sets whether or not the protocol uses the 'trusted list'
    /// @dev Set the protocol to use the 'trusted list'
    /// @param _status is the boolean value to set the status of the trusted list
    function modifyUseTrustedList(bool _status)
        external
        onlyAdmin
        nonReentrant
    {
        useTrustedList = _status;

        emit UseTrustedList(_status);
    }

    /// @notice Adds an address to the trustedList
    /// @dev Address added to the trustedList under the provider tag
    /// @param _tag is a bytes(string) representing the purpose of the address
    /// @param _add is an address being trusted
    function addToTrustedList(bytes memory _tag, address _add)
        external
        onlyAdmin
        nonReentrant
    {
        trustedList[_tag][_add] = true;

        emit TrustedListModified(_tag, _add, true);
    }

    /// @notice Removes an address from the trustedList
    /// @dev Address removed from the trustedList under the provided tag
    /// @param _tag is a bytes(string) representing the purpose of the address
    /// @param _remove is an address being removed from the trustedList
    function removeFromTrustedList(bytes memory _tag, address _remove)
        external
        onlyAdmin
        nonReentrant
    {
        trustedList[_tag][_remove] = false;

        emit TrustedListModified(_tag, _remove, false);
    }

    /// @notice Modifies the protocol-level deposit fee
    /// @dev Modifies the protocol-level deposit fee up to 5000 (50%)
    /// @param _fee uint16 value representing a % with two decimals of precision
    function modifyDepositFee(uint16 _fee) external onlyAdmin nonReentrant {
        if (_fee > 5000) revert Invalid_FeeTooHigh();

        depositFee = _fee;

        emit DepositFeeModified(_fee);
    }

    /// @notice Modifies the protocol-level withdrawal fee
    /// @dev Modifies the protocol-level withdrawal fee up to 5000 (50%)
    /// @param _fee uint16 value representing a % with two decimals of precision
    function modifyWithdrawalFee(uint16 _fee) external onlyAdmin nonReentrant {
        if (_fee > 5000) revert Invalid_FeeTooHigh();

        withdrawalFee = _fee;

        emit WithdrawalFeeModified(_fee);
    }

    /// @notice Modifies the protocol-level performance fee
    /// @dev Modifies the protocol-level performance fee up to 5000 (50%)
    /// @param _fee uint16 value representing a % with two decimals of precision
    function modifyPerformanceFee(uint16 _fee) external onlyAdmin nonReentrant {
        if (_fee > 5000) revert Invalid_FeeTooHigh();

        performanceFee = _fee;

        emit PerformanceFeeModified(_fee);
    }

    /// @notice Modifies the protocol-level management fee
    /// @dev Modifies the protocol-level management fee up to 5000 (50%)
    /// @param _fee uint16 value representing a % with two decimals of precision
    function modifyManagementFee(uint16 _fee) external onlyAdmin nonReentrant {
        if (_fee > 5000) revert Invalid_FeeTooHigh();

        managementFee = _fee;

        emit ManagementFeeModified(_fee);
    }

    /// @notice Checks if an address is trusted under a tag
    /// @dev Returns the trusted status of an address under provided tag
    /// @param _tag is a bytes(string) value that specifies what the address is for
    /// @param _check is an address to check if it is trusted under the tag
    function isTrusted(bytes memory _tag, address _check)
        external
        view
        returns (bool)
    {
        return trustedList[_tag][_check] || !useTrustedList;
    }

    function _onlyAdmin() internal view {
        if (msg.sender != admin) revert Unauthorized();
    }
}
