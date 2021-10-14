---
id: factory
title: Factory
---
# Factory

The `Factory` is where `VaultToken`s get created. The factory utilizes minimal proxies (EIP1167) to enable cheap deployments. The factory has the ability to change the implementation it is pointing at, but cannot affect currently deployed proxies.

## Factory

### Inherits

- `ReentrancyGuard`

### Custom Errors

- `Unauthorized()`
- `Invalid()`
- `TooHighFee()`
- `ZeroAddress()`

### State Variables

- `uint16 public depositFee`
- `uint16 public performanceFee`
- `uint16 public withdrawalFee`
- `address public currentImplementation`
- `address public immutable addressBook`
- `address public admin`
- `address public immutable airswapExchange`

### Events

- `NewVaultToken(address indexed manager, address indexed asset, address indexed vaultToken)`
- `DepositFeeModified(uint16 newFee)`
- `PerformanceFeeModified(uint16 newFee)`
- `WithdrawalFeeModified(uint16 newFee)`
- `ImplementationChanged(address newImplementation)`
- `AdminChanged(address newAdmin)`

### Modifiers

```
modifier onlyAdmin {
    _onlyAdmin();
    _;
}
```
### Functions

- `function changeDepositFee(uint16 _newFee) external`
    - Changes the protocol-level deposit fee
- `function changePerformanceFee(uint16 _newFee) external`
    - Changes the protocol-level performance fee
- `function changeWithdrawalFee(uint16 _newFee) external`
    - Changes the protocol-level withdrawal fee
- `function changeCurrentImplementation(address _newImplementation) external`
    - Changes the address of the implementation for future vault tokens
- `function changeAdmin(address _newAdmin) external`
    - Changes the address of the admin
- `function deployNewVaultToken(string memory _name, string memory _symbol, address _asset, uint256 _withdrawalWindowLength, uint256 _maximumAssets) external`
    - Deploys a new vault token (social token)
- `function _onlyAdmin() internal view`
    - Only admin check