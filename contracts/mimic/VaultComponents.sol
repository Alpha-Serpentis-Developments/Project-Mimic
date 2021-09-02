// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {IOracle} from "./gamma/interfaces/IOracle.sol";
import {IAddressBook} from "./gamma/interfaces/IAddressBook.sol";
import {OtokenInterface} from "./gamma/interfaces/OtokenInterface.sol";
import {ISwap, Types} from "./airswap/interfaces/ISwap.sol";
import {IFactory} from "./interfaces/IFactory.sol";


import {ERC20, IERC20} from "../oz/token/ERC20/ERC20.sol";
import {SafeERC20} from "../oz/token/ERC20/utils/SafeERC20.sol";
import {PausableUpgradeable} from "../oz/security/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "../oz/security/ReentrancyGuardUpgradeable.sol";

contract VaultComponents is PausableUpgradeable, ReentrancyGuardUpgradeable {
    using SafeERC20 for IERC20;

    error ClosedPermanently();
    error WithdrawalWindowNotActive();
    error WithdrawalWindowActive();
    error oTokenNotCleared();
    error Unauthorized();
    error Invalid();
    error Invalid_StrikeTooDeepITM();
    error NotEnoughFunds();
    error NotEnoughFunds_ReserveViolation();
    error NotEnoughFunds_ObligatedFees();
    error MaximumFundsReached();
    error SettlementNotReady();

    struct Waiver {
        uint256 idERC1155;
        uint16 depositDeduction;
        uint16 withdrawalDeduction;
        bool isERC1155;
    }

    /// @notice Tokens the manager can set to have fees reduced/waived
    mapping(address => Waiver) public waiverTokens;
    /// @notice Time in which the withdrawal window expires
    uint256 public withdrawalWindowExpires;
    /// @notice Length of time where the withdrawal window is active
    uint256 public withdrawalWindowLength;
    /// @notice Amount of collateral for the address already used for collateral
    uint256 public collateralAmount;
    /// @notice Maximum funds
    uint256 public maximumAssets;
    /// @notice Amount temporarily withheld for the round by premiums
    uint256 public premiumsWithheld;
    /// @notice Current active vault
    uint256 internal currentVaultId;
    /// @notice Obligated fees to the manager
    uint256 public obligatedFees;
    /// @notice Current reserves
    uint256 public currentReserves;
    /// @notice Fees to the protocol
    uint256 public withheldProtocolFees;
    /// @notice Address of Opyn's Gamma AddressBook contract
    IAddressBook internal addressBook;
    /// @notice Address of the factory
    IFactory public factory;
    /// @notice Address of the manager (admin)
    address public manager;
    /// @notice Address of the current oToken
    address public oToken;
    /// @notice Address of the underlying asset to trade
    address public asset;
    /// @notice Deposit fee
    uint16 public depositFee;
    /// @notice Take profit fee
    uint16 public withdrawalFee;
    /// @notice Performance fee (taken when options are sold)
    uint16 public performanceFee;
    /// @notice Withdrawal reserve percentage
    uint16 public withdrawalReserve;
    /// @notice Determines if the vault is closed permanently
    bool public closedPermanently;

    event OptionsMinted(uint256 collateralDeposited, address indexed newOtoken, uint256 vaultId);
    event OptionsBurned(uint256 oTokensBurned);
    event OptionsSold(uint256 amountSold, uint256 premiumReceived);
    event Deposit(uint256 assetDeposited, uint256 vaultTokensMinted);
    event Withdrawal(uint256 assetWithdrew, uint256 vaultTokensBurned);
    event WithdrawalWindowActivated(uint256 closesAfter);
    event ReservesEstablished(uint256 allocatedReserves);
    event MaximumAssetsModified(uint256 newAUM);
    event DepositFeeModified(uint16 newFee);
    event WithdrawalFeeModified(uint16 newFee);
    event PerformanceFeeModified(uint16 newFee);
    event WithdrawalReserveModified(uint16 newReserve);
    event WaiverTokenModified(address token, uint16 depositDeduction, uint16 withdrawawlDeduction, bool isERC1155);
    event VaultClosedPermanently();

    modifier onlyManager {
        _onlyManager();
        _;
    }
    modifier ifNotClosed {
        _ifNotClosed();
        _;
    }
    // modifier whenNotPaused() override {
    //     _ifPaused();
    //     _;
    // }

    /// @notice Changes the maximum allowed deposits under management
    /// @dev Changes the maximumAssets to the new amount
    /// @param _newValue new maximumAssets value
    function adjustTheMaximumAssets(uint256 _newValue) external ifNotClosed onlyManager nonReentrant() whenNotPaused() {
        if(_newValue < collateralAmount + IERC20(asset).balanceOf(address(this)))
            revert Invalid();

        maximumAssets = _newValue;

        emit MaximumAssetsModified(_newValue);
    }

    function closeVaultPermanently() external ifNotClosed onlyManager nonReentrant() whenNotPaused() {
        if(oToken != address(0))
            revert oTokenNotCleared();

        closedPermanently = true;
        currentReserves = IERC20(asset).balanceOf(address(this));

        emit VaultClosedPermanently();
    }

    function sendWithheldProtocolFees() external nonReentrant() whenNotPaused() {
        IERC20(asset).safeTransfer(factory.admin(), withheldProtocolFees);
        withheldProtocolFees = 0;
    }

    /// @notice Changes the deposit fee
    /// @dev Changes the depositFee with two decimals of precision up to 50.00% (5000)
    /// @param _newValue new depositFee with two decimals of precision
    function adjustDepositFee(uint16 _newValue) external ifNotClosed onlyManager nonReentrant() whenNotPaused() {
        if(_newValue > 5000)
            revert Invalid();

        depositFee = _newValue;

        emit DepositFeeModified(_newValue);
    }

    /// @notice Changes the withdrawal fee
    /// @dev Changes the withdrawalFee with two decimals of precision up to 50.00% (5000)
    /// @param _newValue new withdrawalFee with two decimals of precision
    function adjustWithdrawalFee(uint16 _newValue) external ifNotClosed onlyManager nonReentrant() whenNotPaused() {
        if(_newValue > 5000)
            revert Invalid();

        withdrawalFee = _newValue;

        emit WithdrawalFeeModified(_newValue);
    }
    
    /// @notice Changes the performance fee
    /// @dev Changes the performanceFee with two decimals of precision up to 50.00% (5000)
    /// @param _newValue new performanceFee with two decimals of precision
    function adjustPerformanceFee(uint16 _newValue) external ifNotClosed onlyManager nonReentrant() whenNotPaused() {
        if(_newValue > 5000)
            revert Invalid();
            
        performanceFee = _newValue;
        
        emit PerformanceFeeModified(_newValue);
    }

    /// @notice Changes the withdrawal reserve percentage
    /// @dev Changes the withdrawalReserve with two decimals of precision up to 50.00% (5000)
    /// @param _newValue new withdrawalReserve with two decimals of precision
    function adjustWithdrawalReserve(uint16 _newValue) external ifNotClosed onlyManager nonReentrant() whenNotPaused() {
        if(_newValue > 5000)
            revert Invalid();

        withdrawalReserve = _newValue;

        emit WithdrawalReserveModified(_newValue);
    }

    /// @notice Changes the withdrawal window length
    /// @dev Changes the withdrawalWindowLength in UNIX time
    /// @param _newValue new withdrawalWindowLength period
    function adjustWithdrawalWindowLength(uint256 _newValue) external ifNotClosed onlyManager nonReentrant() whenNotPaused() {
        withdrawalWindowLength = _newValue;
    }

    /// @notice Adjusts the waiver for a specific token
    /// @dev Replaces the waiver settings for a specific token with the specific parameters
    /// @param _token Token address of the ERC20/ERC1155 eligible for waiver
    /// @param _depositDeduction Fee deduction against the deposit represented in % form with two decimals of precision (100.00% = 10000)
    /// @param _withdrawalDeduction Fee deduction against the withdrawal represented in % form with two decimals of precision (100.00% = 10000)
    /// @param _isERC1155 Boolean to determine if the token provided for the waiver is an ERC1155 or not (IMPORTANT)
    function adjustWaiver(
        address _token,
        uint16 _depositDeduction,
        uint16 _withdrawalDeduction,
        bool _isERC1155
    ) external ifNotClosed onlyManager nonReentrant() whenNotPaused() {
        Waiver storage waiver = waiverTokens[_token];

        waiver.depositDeduction = _depositDeduction;
        waiver.withdrawalDeduction = _withdrawalDeduction;
        waiver.isERC1155 = _isERC1155;

        emit WaiverTokenModified(_token, _depositDeduction, _withdrawalDeduction, _isERC1155);
    }

    /// @notice Allows the manager to collect fees
    /// @dev Transfers all of the obligatedFees to the manager and sets it to zero
    function sweepFees() external ifNotClosed onlyManager nonReentrant() whenNotPaused() {
        IERC20(asset).safeTransfer(msg.sender, obligatedFees);
        obligatedFees = 0;
    }

    /// @notice Allows the manager to collect random tokens sent to the contract
    /// @dev Transfers all of the unrelated tokens to the manager
    /// @param _token Address of the unrelated token that is not the oToken or the asset token
    function sweepUnrelatedTokens(address _token) external ifNotClosed onlyManager nonReentrant() whenNotPaused() {
        if(_token == oToken || _token == asset)
            revert Invalid();

        IERC20 unrelated = IERC20(_token);

        unrelated.safeTransfer(msg.sender, unrelated.balanceOf(address(this)));
    }

    /// @notice Allows the manager to disperse obligatedFees to the depositors
    /// @dev Transfers _amount to the vault and deducts against obligatedFees
    function disperseFees(uint256 _amount) external onlyManager nonReentrant() whenNotPaused() {
        if(_amount > obligatedFees)
            revert NotEnoughFunds_ObligatedFees();

        obligatedFees -= _amount;
    }

    function _sellOptions(Types.Order memory _order) internal {
        if(!_withdrawalWindowCheck(false))
            revert WithdrawalWindowActive();
        if(_order.sender.amount > IERC20(oToken).balanceOf(address(this)) || oToken == address(0))
            revert Invalid();

        address airswap = factory.airswapExchange();

        // Approve
        IERC20(oToken).approve(airswap, _order.sender.amount);

        // Submit the order
        ISwap(airswap).swap(_order);

        // Fee calculation + withheldProtocolFees 
        obligatedFees += _percentMultiply(_order.signer.amount, performanceFee);
        IERC20(asset).transfer(address(factory), _percentMultiply(_order.signer.amount + withheldProtocolFees, factory.performanceFee()));
        withheldProtocolFees = 0;

        // Withhold premiums temporarily
        premiumsWithheld = _order.signer.amount;

        emit OptionsSold(_order.sender.amount, _order.signer.amount);
    }

    function _ifNotClosed() internal view {
        if(closedPermanently)
            revert ClosedPermanently();
    }

    function _ifPaused() internal view {
        if(paused())
            revert ContractPaused();
    }

    function _onlyManager() internal view {
        if(msg.sender != manager)
            revert Unauthorized();
    }

    function _calculatePenalty(uint256 _assetAmount) internal view returns(uint256 adjustedBal) {
        if(oToken == address(0))
            return _assetAmount;
        
        uint256 strikePrice = OtokenInterface(oToken).strikePrice();
        uint256 oraclePrice = IOracle(addressBook.getOracle()).getPrice(OtokenInterface(oToken).underlyingAsset());
        uint16 percentageForUser;

        if(OtokenInterface(oToken).isPut() && strikePrice > oraclePrice) {
            percentageForUser = uint16(
                (10e22 * oraclePrice / strikePrice)/10e18
            );
            adjustedBal = _percentMultiply(_assetAmount, percentageForUser);
        } else if(oraclePrice > strikePrice) {
            percentageForUser = uint16(
                (10e22 * strikePrice / oraclePrice)/10e18
            );
            adjustedBal = _percentMultiply(_assetAmount, percentageForUser);
        } else {
            adjustedBal = _assetAmount;
        }
    }
    
    function _normalize(
        uint256 _valueToNormalize,
        uint256 _valueDecimal,
        uint256 _normalDecimals
    ) internal pure returns (uint256) {
        int256 decimalDiff = int256(_valueDecimal) - int256(_normalDecimals);

        if(decimalDiff > 0) {
            return _valueToNormalize / (10**uint256(decimalDiff));
        } else if(decimalDiff < 0) {
            return _valueToNormalize * 10**uint256(-decimalDiff);
        } else {
            return _valueToNormalize;
        }
    }

    function _withdrawalWindowCheck(bool _revertIfClosed) internal view returns(bool isActive) {
        if(block.timestamp > withdrawalWindowExpires && _revertIfClosed)
            revert WithdrawalWindowNotActive();
        
        return block.timestamp > withdrawalWindowExpires;
    }

    function _percentMultiply(uint256 _val, uint16 _percent) internal pure returns(uint256) {
        return _val * _percent / 10000;
    }

    function _calculateFees(
        uint256 _amount,
        uint16 _protocolFee,
        uint16 _vaultFee,
        address _waiver,
        bool _isDeposit
    ) internal view returns(uint256 protocolFees, uint256 vaultFees) {
        if(_waiver != address(0)) {
            Waiver memory waiver = waiverTokens[_waiver];

            uint16 whichDeduction;
            if(_isDeposit)
                whichDeduction = waiver.depositDeduction;
            else
                whichDeduction = waiver.withdrawalDeduction;

            if(waiver.isERC1155) { // applies to ERC1155

            } else { // applies to ERC20/721
                try ERC20(_waiver).decimals() {
                    if(IERC20(_waiver).balanceOf(msg.sender) >= 10**ERC20(_waiver).decimals()) {
                        _vaultFee -= whichDeduction;
                    }
                } catch {
                    if(IERC20(_waiver).balanceOf(msg.sender) >= 1) {
                        _vaultFee -= whichDeduction;
                    }
                }
            }
        }

        protocolFees = _percentMultiply(_amount, _protocolFee);
        vaultFees = _percentMultiply(_amount, _vaultFee);
        
    }

}