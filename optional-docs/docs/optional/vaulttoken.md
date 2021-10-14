---
id: vaulttoken
title: Vault Token
---
# Vault Token

The **Vault Token** (also called 'Social Token') is an ERC20 token that both the social trader and followers use. Followers can deposit the social token's collateral asset which the social trader can then use to write either covered calls or puts.

When a social trader deploys a new vault token, they are deploying a minimal proxy (EIP1167) of what the factory's ```currentImplementation``` is set to. The Vault Token has 18 decimals of precision, mimicking that of ETH's. The name and symbol are determined by the social trader deploying it.

The smart contract is split into two parts - ```VaultComponents``` and ```VaultToken``` - due to gas constraints.

## VaultComponents

### Inherits

- `PausableUpgradeable`
- `ReentrancyGuardUpgradeable`

### Custom Errors

- `ClosedPermanently()`
- `WithdrawalWindowNotActive()`
- `WithdrawalWindowActive()`
- `oTokenNotCleared()`
- `Unauthorized()`
- `Invalid()`
- `Invalid_StrikeTooDeepITM()`
- `NotEnoughFunds()`
- `NotEnoughFunds_ReserveViolation()`
- `NotEnoughFunds_ObligatedFees()`
- `MaximumFundsReached()`
- `SettlementNotReady()`

### Enum & Structs

```
enum WaiverType {
    ERC20,
    ERC721,
    ERC1155
}
```

```
struct Waiver {
    mapping(uint256 => bool) isValidID;
    uint256 minimumAmount;
    WaiverType standard;
    uint16 depositDeduction;
    uint16 withdrawalDeduction;
}
```

### State Variables

- `mapping(address => Waiver) public waiverTokens`
- `uint256 public withdrawalWindowExpires`
- `uint256 public withdrawalWindowLength`
- `uint256 public collateralAmount`
- `uint256 public maximumAssets`
- `uint256 public premiumsWithheld`
- `uint256 internal currentVauldId`
- `uint256 public obligatedFees`
- `uint256 public currentReserves`
- `uint256 public withheldProtocolFees`
- `IAddressBook internal addressBook`
- `IFactory public factory`
- `address public manager`
- `address public oToken`
- `address public asset`
- `uint16 public depositFee`
- `uint16 public withdrawalFee`
- `uint16 public performanceFee`
- `uint16 public withdrawalReserve`
- `bool public closedPermanently`

### Events

- `OptionsMinted(uint256 collateralDeposited, address indexed newOtoken, uint256 vaultId)`
- `OptionsBurned(uint256 oTokensBurned)`
- `OptionsSold(uint256 amountSold, uint256 premiumReceived)`
- `Deposit(uint256 assetDeposited, uint256 vaultTokensMinted)`
- `Withdrawal(uint256 assetWithdrew, uint256 vaultTokensBurned)`
- `WithdrawalWindowActivated(uint256 closesAfter)`
- `ReservesEstablished(uint256 allocatedReserves)`
- `MaximumAssetsModified(uint256 newAUM)`
- `DepositFeeModified(uint16 newFee)`
- `WithdrawalFeeModified(uint16 newFee)`
- `PerformanceFeeModified(uint16 newFee)`
- `WithdrawalReserveModified(uint16 newReserve)`
- `WaiverTokenModified(address token, uint16 depositDeduction, uint16 withdrawawlDeduction)`
- `VaultClosedPermanently()`

### Modifiers

```
modifier onlyManager {
    _onlyManager();
    _;
}
```

```
modifier ifNotClosed {
    _ifNotClosed();
    _;
}
```

### Functions

*Modifiers are not shown in the following list*

- `function emergency(bool _val) external`
    - For emergency use (pauses or unpauses the contract)
- `function adjustTheMaximumAssets(uint256 _newValue) external `
    - Changes the maximum allowed deposits under management
- `function closeVaultPermanently() external`
    - Closes the vault permanently (cannot be reversed!)
- `function sendWithheldProtocolFees() external`
    - Send withheld protocol fees to the factory's admin
- `function adjustDepositFee(uint16 _newValue) external)`
    - Changes the deposit fee of the vault token
- `function adjustWithdrawalFee(uint16 _newValue) external`
    - Changes the withdrawal fee of the vault token
- `function adjustPerformanceFee(uint16 _newValue) external`
    - Changes the performance fee of the vault token
- `function adjustWithdrawalReserve(uint16 _newValue) external`
    - Changes the withdrawal reserve percentage
- `function adjustWithdrawalWindowLength(uint256 _newValue) external`
    - Changes the withdrawal window length
- `function adjustWaiver(address _token, uint256 _minimumAmount, uint256 _idERC1155, uint16 _depositDeduction, uint16 _withdrawalDeduction, WaiverType _standard) external`
    - Adjusts the waiver for a specific token (ERC20/721/1155)
- `function sweepFees() external`
    - Allows the manager to collect fees earned
- `function sweepUnrelatedTokens(address _token) external`
    - Allows the manager to collect random tokens sent to the contract
- `function disperseFees(uint256 _amount) external`
    - Allows the manager to disperse `obligatedFees` to the depositors
- `function _sellOptions(Types.Order memory _order) internal`
    - Sells options via AirSwap
- `function _ifNotClosed() internal view`
    - Checks if the vault is NOT closed permanently
- `function _onlyManager() internal view`
    - Checks if the `msg.sender` is the manager of the vault
- `function _calculatePenalty(uint256 _assetAmount) internal view returns(uint256 adjustedBal)`
    - Calculates the ITM (in-the-money) penalty for withdrawing early IF the vault is ITM
- `function _normalize(uint256 _valueToNormalize, uint256 _valueDecimal, uint256 _normalDecimals) internal pure returns(uint256)`
    - Normalizes a value to the requested decimals
- `function _withdrawalWindowCheck() internal view returns(bool isActive)`
    - Checks if the withdrawal window is active
- `function _percentMultiply(uint256 _val, uint16 _percent) internal pure returns(uint256)`
    - Multiplies a value by a percentage
- `function _calculateFees(uint256 _amount, uint16 _protocolFee, uint16 _vaultFee, address _waiver, uint256 _idERC1155, bool _isDeposit) internal view returns(uint256 protocolFees, uint256 vaultFees)`
    - Calculates the fees with a waiver
## VaultToken