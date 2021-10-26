---
id: gas-cost
name: Gas Costs
---
# Gas Costs

The compiled list of cost to execute transactions with the Venus contracts were done with `hardhat-contract-sizer` with Solidity `0.8.6` with the optimizer enabled at 200 runs. Tested with `npx hardhat test`.

Minimum and maximum will only be declared if there was more than one run.

## Factory

Function | Minimum | Maximum | Average
---------|---------|---------|--------
changeDepositFee | 29,314 | 32,138 | 31,188
changePerformanceFee | Not Measured | Not Measured | Not Measured
changeWithdrawalFee | 29,353 | 32,177 | 31,227
changeCurrentImplementation | Not Measured | Not Measured | 49,506 |
changeAdmin | Not Measured | Not Measured | Not Measured
deployNewVaultToken | 258,063 | 278,095 | 276,248

## Vault Components & Vault Token

Function | Minimum | Maximum | Average
---------|---------|---------|--------
emergency | 30,005 | 51,965 | 40,985
adjustTheMaximumAssets | Not Measured | Not Measured | 47,009
closeVaultPermanently | Not Measured | Not Measured | 69,261
sendWithheldProtocolFees | 55,344 | 72,444 | 63,894
adjustDepositFee | 34,471 | 37,295 | 35,985
adjustWithdrawalFee | 34,427 | 37,251 | 35,194
adjustEarlyWithdrawalPenalty | 37,226 | 37,250 | 37,242
adjustPerformanceFee | Not Measured | Not Measured | Not Measured
adjustWithdrawalReserve | Not Measured | Not Measured | 37,242
adjustWithdrawalWindowLength | Not Measured | Not Measured | Not Measured
adjustWaiver | 43,537 | 103,237 | 75,937
sweepFees | 50,105 | 67,205 | 55,805
sweepUnrelatedTokens | Not Measured | Not Measured | 68,961
disperseFees | Not Measured | Not Measured | Not Measured
initialize | Not Measured | Not Measured | 105,818
deposit | 78,203 | 176,531 | 111,156
discountDeposit | 110,972 | 113,416 | 112,601
withdraw | 80,188 | 151,642 | 90,312
discountWithdraw | 91,066 | 93,551 | 92,723
reactivateWithdrawalWindow | Not Measured | Not Measured | 41,252
burnOptions | 184,637 | 246,935 | 191,167
settleVault | 218,808 | 228,008 | 223,034
writeOptions | 285,584 | 625,552 | 519,510
writeOptions (percentage) | 579,288 | 615,281 | 603,283
sellOptions[^1] | Not Measured | Not Measured | 469,987
writeAndSellOptions | Not Measured | Not Measured | Not Measured
writeAndSellOptions (percentage) | Not Measured | Not Measured | Not Measured

[^1]: Not tested from `npx hardhat test`; pulled from an older [on-chain test](https://kovan.etherscan.io/tx/0x605a78ec938a5af930ec3fe4c6c4809993f2520721e35ef6aeacbfffd2c5b5c8). Results may vary significantly!