---
id: vaulttoken
title: Vault Token
---
# Vault Token

The **Vault Token** (also called 'Social Token') is an ERC20 token that both the social trader and followers use. Followers can deposit the social token's collateral asset which the social trader can then use to write either covered calls or puts.

When a social trader deploys a new vault token, they are deploying a minimal proxy (EIP1167) of what the factory's ```currentImplementation``` is set to. The Vault Token has 18 decimals of precision, mimicking that of ETH's. The name and symbol are determined by the social trader deploying it.

The smart contract is split into two parts - ```VaultComponents``` and ```VaultToken``` - due to gas constraints.

## VaultComponents

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



### Functions



## VaultToken