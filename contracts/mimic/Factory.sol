// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.4;

import {VaultToken} from "./VaultToken.sol";
import {Clones} from "../oz/proxy/Clones.sol";
import {ReentrancyGuard} from "../oz/security/ReentrancyGuard.sol";

contract Factory is ReentrancyGuard {

    error Unauthorized();
    error Invalid();
    error TooHighFee();
    error ContractCreationFailed();
    error ZeroAddress();

    /// @notice Protocol-level fees for deposits represented with two decimals of precision up to 50% (5000)
    uint16 public depositFee;
    /// @notice Protocol-level fees for performance (sell calls) with two decimals of precision up to 50% (5000)
    uint16 public performanceFee;
    /// @notice Protocol-level fees for withdrawals represented with two decimals of precision up to 50% (5000)
    uint16 public withdrawalFee;
    /// @notice Current implementation of the VaultToken
    address public currentImplementation;
    /// @notice Address of the Gamma AddressBook
    address public immutable addressBook;
    /// @notice Address of the admin
    address public admin;
    /// @notice Address of the airswap exchange
    address public immutable airswapExchange;

    event NewVaultToken(address indexed manager, address indexed asset, address indexed vaultToken);
    event DepositFeeModified(uint16 newFee);
    event PerformanceFeeModified(uint16 newFee);
    event WithdrawalFeeModified(uint16 newFee);
    event ImplementationChanged(address newImplementation);
    event AdminChanged(address newAdmin);

    constructor(
        address _exchange,
        address _addressBook,
        address _currentImplementation,
        address _admin,
        uint16 _depositFee,
        uint16 _performanceFee,
        uint16 _withdrawalFee
    ) {
        require(_exchange != address(0) || _addressBook != address(0) || _admin != address(0), "0 address");
        require(_depositFee <= 5000 && _performanceFee <= 5000 && _withdrawalFee <= 5000, "too high fee");

        currentImplementation = _currentImplementation;
        airswapExchange = _exchange;
        addressBook = _addressBook;
        admin = _admin;
        
        depositFee = _depositFee;
        performanceFee = _performanceFee;
        withdrawalFee = _withdrawalFee;
    }

    modifier onlyAdmin {
        _onlyAdmin();
        _;
    }

    function changeDepositFee(uint16 _newFee) external nonReentrant() onlyAdmin {
        if(_newFee > 5000)
            revert TooHighFee();

        depositFee = _newFee;

        emit DepositFeeModified(_newFee);
    }

    function changePerformanceFee(uint16 _newFee) external nonReentrant() onlyAdmin {
        if(_newFee > 5000)
            revert TooHighFee();

        performanceFee = _newFee;

        emit PerformanceFeeModified(_newFee);
    }
    
    function changeWithdrawalFee(uint16 _newFee) external nonReentrant() onlyAdmin {
        if(_newFee > 5000)
            revert TooHighFee();

        withdrawalFee = _newFee;

        emit WithdrawalFeeModified(_newFee);
    }
    
    function changeCurrentImplementation(address _newImplementation) external nonReentrant() onlyAdmin {
        if(_newImplementation == address(0))
            revert ZeroAddress();
            
        currentImplementation = _newImplementation;

        emit ImplementationChanged(_newImplementation);
    }

    function changeAdmin(address _newAdmin) external nonReentrant() onlyAdmin {
        if(_newAdmin == address(0))
            revert ZeroAddress();

        admin = _newAdmin;

        emit AdminChanged(_newAdmin);
    }

    /// @notice Deploys a new vault token
    /// @dev Deploys a new vault token under the given parameters for the caller
    /// @param _name name of the vault token
    /// @param _symbol symbol of the vault token
    /// @param _asset address of the asset token (what the vault is denominated in)
    /// @param _withdrawalWindowLength length of the withdrawal window
    /// @param _maximumAssets max AUM denominated in the asset token
    function deployNewVaultToken(
        string memory _name,
        string memory _symbol,
        address _asset,
        uint256 _withdrawalWindowLength,
        uint256 _maximumAssets
    ) external nonReentrant() {
        if(_asset == address(0) || currentImplementation == address(0))
            revert ZeroAddress();
        
        VaultToken vToken = VaultToken(Clones.clone(currentImplementation));

        vToken.initialize(
            _name,
            _symbol,
            _asset,
            msg.sender,
            addressBook,
            address(this),
            _withdrawalWindowLength,
            _maximumAssets
        );

        emit NewVaultToken(msg.sender, _asset, address(vToken));
    }

    function _onlyAdmin() internal view {
        if(msg.sender != admin)
            revert Unauthorized();
    }
}