# 🚀 ZuriRent Deployment Checklist

Use this checklist to deploy and test your ZuriRent platform.

---

## 📋 Pre-Deployment Checklist

### Environment Setup
- [ ] Node.js 18+ installed
- [ ] MetaMask extension installed
- [ ] Git repository cloned
- [ ] Dependencies installed (run `setup-integration.ps1`)

### Get Test Funds
- [ ] Visit [Scroll Sepolia Faucet](https://scroll.io/faucet)
- [ ] Connect wallet to faucet
- [ ] Request test ETH
- [ ] Confirm ETH received in MetaMask
- [ ] Balance: ____ ETH (need at least 0.1 ETH)

### Configuration Files
- [ ] `contracts/.env` exists
- [ ] `contracts/.env` has PRIVATE_KEY set
- [ ] `frontend/.env` exists (will update after deployment)

---

## 🔨 Deployment Checklist

### Step 1: Compile Contracts
```bash
cd contracts
npm run compile
```
- [ ] No compilation errors
- [ ] ABIs generated in `artifacts/`

### Step 2: Extract ABIs
```bash
npm run extract-abis
```
- [ ] ABIs copied to `frontend/src/contracts/`
- [ ] 9 contract JSON files present
- [ ] `contracts.json` combined file present

### Step 3: Deploy to Scroll Sepolia
```bash
npm run deploy:sepolia
```

**Record Deployed Addresses:**
- [ ] RentChainMain: `____________________`
- [ ] PropertyRegistry: `____________________`
- [ ] RentAgreement: `____________________`
- [ ] EscrowManager: `____________________`
- [ ] PaymentProcessor: `____________________`
- [ ] UserRegistry: `____________________`
- [ ] DisputeResolution: `____________________`
- [ ] ReviewSystem: `____________________`
- [ ] RentChainToken: `____________________`

- [ ] Deployment successful (no errors)
- [ ] Addresses saved to `deployments/scrollSepolia.json`
- [ ] Transaction hashes recorded

### Step 4: Update Frontend Configuration
```bash
cd ../frontend
# Edit .env file
```

- [ ] All 9 contract addresses added to `frontend/.env`
- [ ] VITE_NETWORK set to `SCROLL_SEPOLIA`
- [ ] VITE_SCROLL_RPC_URL set
- [ ] File saved

### Step 5: Start Frontend
```bash
npm run dev
```
- [ ] Server starts successfully
- [ ] No errors in terminal
- [ ] Accessible at http://localhost:5173

---

## 🧪 Testing Checklist

### Browser Setup
- [ ] Open http://localhost:5173
- [ ] Page loads without errors
- [ ] Check browser console (F12) - no errors

### Wallet Connection
- [ ] Click "Connect Wallet" button
- [ ] MetaMask popup appears
- [ ] Select account and approve
- [ ] Wallet address displays in navbar
- [ ] Network is Scroll Sepolia (or prompted to switch)
- [ ] Balance shows correctly

### User Registration
- [ ] Navigate to Dashboard or Profile
- [ ] Click "Register" button
- [ ] Select user type (Landlord/Tenant)
- [ ] Fill in registration form:
  - Name: `____________________`
  - Email: `____________________`
  - User Type: `____________________`
- [ ] Submit transaction
- [ ] MetaMask confirmation popup appears
- [ ] Approve transaction
- [ ] Wait for confirmation
- [ ] Success message displayed
- [ ] Transaction hash: `____________________`
- [ ] Verify on [Explorer](https://sepolia.scrollscan.dev)

### Property Registration (Landlords Only)
- [ ] Navigate to Dashboard
- [ ] Click "Add Property" or "List Property"
- [ ] Fill in property details:
  - Title: `____________________`
  - Description: `____________________`
  - Location: `____________________`
  - Price: `____________________` ETH
  - Property Type: `____________________`
- [ ] Upload images (optional)
- [ ] Submit transaction
- [ ] MetaMask confirmation appears
- [ ] Approve transaction
- [ ] Wait for confirmation
- [ ] Property appears in listings
- [ ] Transaction hash: `____________________`
- [ ] Verify on Explorer

### Property Search (Tenants)
- [ ] Navigate to Search/Browse page
- [ ] Properties display correctly
- [ ] Can filter by price/location
- [ ] Click on a property
- [ ] Property details page loads
- [ ] All information displays correctly
- [ ] Images load (if available)

### Rental Agreement Creation
- [ ] From property details, click "Request to Rent"
- [ ] Agreement form appears
- [ ] Fill in details:
  - Rent amount: `____________________` ETH
  - Deposit: `____________________` ETH
  - Duration: `____________________` days
  - Start date: `____________________`
- [ ] Submit transaction
- [ ] MetaMask confirmation
- [ ] Approve transaction
- [ ] Agreement created successfully
- [ ] Agreement ID: `____________________`
- [ ] Transaction hash: `____________________`

### Rent Payment
- [ ] Navigate to Dashboard → My Agreements
- [ ] Select an active agreement
- [ ] Click "Pay Rent"
- [ ] Confirm amount is correct
- [ ] Submit transaction
- [ ] MetaMask confirmation
- [ ] Approve transaction
- [ ] Payment successful
- [ ] Balance updated
- [ ] Transaction hash: `____________________`
- [ ] Verify on Explorer

### Review System
- [ ] Navigate to completed rental
- [ ] Click "Leave Review"
- [ ] Enter rating (1-5 stars): `____`
- [ ] Write review comment
- [ ] Submit transaction
- [ ] MetaMask confirmation
- [ ] Review published successfully
- [ ] Review visible on property/user profile

---

## 🔍 Verification Checklist

### Smart Contracts
For each deployed contract:
1. Copy contract address
2. Visit [Sepolia Explorer](https://sepolia.scrollscan.dev)
3. Paste address
4. Verify:
   - [ ] Contract exists
   - [ ] Deployment transaction successful
   - [ ] Contract verified (optional)

### Transactions
For each test transaction:
- [ ] Transaction hash recorded
- [ ] Visible on Explorer
- [ ] Status: Success ✓
- [ ] Gas used: `____________________`
- [ ] Events emitted correctly

### Frontend Integration
- [ ] All contract methods callable
- [ ] Error messages display properly
- [ ] Loading states work
- [ ] Transaction confirmations show
- [ ] Balance updates after transactions
- [ ] Events trigger UI updates

---

## 🛠️ Troubleshooting Record

### Issues Encountered

**Issue 1:**
- Problem: `____________________`
- Solution: `____________________`
- Status: [ ] Resolved / [ ] Pending

**Issue 2:**
- Problem: `____________________`
- Solution: `____________________`
- Status: [ ] Resolved / [ ] Pending

**Issue 3:**
- Problem: `____________________`
- Solution: `____________________`
- Status: [ ] Resolved / [ ] Pending

---

## ✅ Final Verification

### Core Functionality
- [ ] Wallet connects successfully
- [ ] User registration works
- [ ] Properties can be listed
- [ ] Properties can be browsed
- [ ] Rental agreements can be created
- [ ] Rent payments process correctly
- [ ] Reviews can be submitted
- [ ] All transactions confirm on-chain

### User Experience
- [ ] UI loads without errors
- [ ] Navigation works smoothly
- [ ] Forms validate properly
- [ ] Error messages are clear
- [ ] Loading states display
- [ ] Success messages show
- [ ] Mobile responsive (test on phone)

### Performance
- [ ] Page load time: `____` seconds
- [ ] Transaction confirmation time: `____` seconds
- [ ] Average gas cost: `____` ETH
- [ ] No console errors
- [ ] No memory leaks
- [ ] Smooth animations

---

## 📊 Deployment Summary

### Deployment Information
- **Date:** `____________________`
- **Network:** Scroll Sepolia
- **Chain ID:** 534351
- **Deployer Address:** `____________________`
- **Total Contracts Deployed:** 9
- **Total Gas Used:** `____________________`
- **Total Cost:** `____________________` ETH

### Test Accounts Used
1. **Landlord Account:** `____________________`
2. **Tenant Account:** `____________________`

### Properties Created
1. Property #1: `____________________`
2. Property #2: `____________________`

### Agreements Created
1. Agreement #1: `____________________`
2. Agreement #2: `____________________`

---

## 🎯 Success Criteria

**Deployment is successful when:**
- [x] All contracts deployed without errors
- [x] All contract addresses recorded
- [x] Frontend configured and running
- [x] Wallet connects to application
- [x] User registration works
- [x] Property CRUD operations work
- [x] Rental agreement lifecycle works
- [x] Payment processing works
- [x] All transactions confirmed on-chain
- [x] No critical errors in console

**Status:** [ ] Ready for Production / [ ] Needs Fixes

---

## 📝 Notes

### Additional Observations
```
[Add any notes, observations, or issues encountered during deployment]
```

### Next Steps
- [ ] Security audit (recommended)
- [ ] Load testing
- [ ] Deploy to mainnet (when ready)
- [ ] Set up monitoring
- [ ] Configure analytics
- [ ] Enable backend (optional)

---

## 📚 Reference Links

- **Faucet:** https://scroll.io/faucet
- **Explorer:** https://sepolia.scrollscan.dev
- **RPC URL:** https://sepolia-rpc.scroll.io
- **Docs:** https://docs.scroll.io

---

**Completed By:** `____________________`  
**Date:** `____________________`  
**Signature:** `____________________`

---

**ZuriRent** — Deployment Checklist ✓
