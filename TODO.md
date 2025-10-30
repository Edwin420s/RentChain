# TODO: Fix Solidity Compilation Errors

## Critical Errors
- [ ] Fix `_deploySystem` function visibility in `RentChainDeployer.sol` (change from external to internal)

## Variable Shadowing Warnings
- [ ] Fix `confirmations` variable shadowing in `MultiSigWallet.sol`
- [ ] Fix variable shadowing in `RentChainBase.sol` destructuring assignment
- [ ] Fix `totalGasSaved` variable shadowing in `RentChainBatchManager.sol`
- [ ] Fix `tenantsRemaining` variable shadowing in `RentChainSubscriptions.sol`
- [ ] Fix `referralCount` and `totalEarned` variable shadowing in `RentChainReferral.sol`
- [ ] Fix `tokenURI` variable shadowing in `RentChainNFT.sol`

## Testing
- [ ] Run `npm run compile` to verify all errors are fixed
