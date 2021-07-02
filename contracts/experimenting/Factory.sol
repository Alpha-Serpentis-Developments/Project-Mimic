// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;

import {VaultToken} from "./VaultToken.sol";

contract Factory {
    error Unauthorized();
    error Invalid();
    error ContractCreationFailed();
    error ZeroAddress();

    /// @notice Protocol-level fees for deposits represented with two decimals of precision up to 50% (5000)
    uint16 public depositFee;
    /// @notice Protocol-level fees for withdrawals represented with two decimals of precision up to 50% (5000)
    uint16 public withdrawalFee;
    /// @notice Address of the admin
    address public immutable admin;
    /// @notice Address of the airswap exchange
    address public immutable AIRSWAP_EXCHANGE;

    event NewVaultToken(address indexed manager, address indexed asset, address indexed vaultToken);
    event DepositFeeModified(uint16 newFee);
    event WithdrawalFeeModified(uint16 newFee);

    constructor(address _exchange, address _admin) {
        require(_exchange != address(0) || _admin != address(0), "0 address");
        AIRSWAP_EXCHANGE = _exchange;
        admin = _admin;
    }

    modifier onlyAdmin {
        _onlyAdmin();
        _;
    }

    function changeDepositFee(uint16 _newFee) external onlyAdmin {
        if(_newFee > 5000)
            revert Invalid();

        depositFee = _newFee;

        emit DepositFeeModified(_newFee);
    }
    
    function changeWithdrawalFee(uint16 _newFee) external onlyAdmin {
        if(_newFee > 5000)
            revert Invalid();

        withdrawalFee = _newFee;

        emit WithdrawalFeeModified(_newFee);
    }

    /// @notice Deploys a new vault token
    /// @dev Deploys a new vault token under the given parameters for the caller
    /// @param _name name of the vault token
    /// @param _symbol symbol of the vault token
    /// @param _addressBook address of the Gamma AddressBook
    /// @param _asset address of the asset token (what the vault is denominated in)
    function deployNewVaultToken(
        string memory _name,
        string memory _symbol,
        address _addressBook,
        address _asset,
        uint256 _withdrawalWindowLength,
        uint256 _maximumAssets
    ) external {
        if(_addressBook == address(0) || _asset == address(0))
            revert ZeroAddress();
        if(_withdrawalWindowLength == 0)
            revert Invalid();
        VaultToken vToken = new VaultToken(
            _name,
            _symbol,
            AIRSWAP_EXCHANGE,
            _addressBook,
            _asset,
            msg.sender,
            _withdrawalWindowLength,
            _maximumAssets
        );

        if(address(vToken) == address(0))
            revert ContractCreationFailed();
        
        emit NewVaultToken(msg.sender, _asset, address(vToken));
    }

    function _onlyAdmin() internal view {
        if(msg.sender != admin)
            revert Unauthorized();
    }
}