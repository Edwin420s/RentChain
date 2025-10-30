# ZuriRent - Smart Contract & Frontend Integration Guide

This guide explains how to connect the smart contracts with the frontend and get a fully working ZuriRent application.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Smart Contract Deployment](#smart-contract-deployment)
3. [Frontend Configuration](#frontend-configuration)
4. [Testing the Integration](#testing-the-integration)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **MetaMask** browser extension
- **Scroll Sepolia ETH** (get from [Scroll Faucet](https://scroll.io/faucet))
- Git for version control

---

## 🚀 Smart Contract Deployment

### Step 1: Install Contract Dependencies

```bash
cd contracts
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `contracts` folder:

```bash
cp .env.example .env
```

Edit `.env` and add your private key:

```env
# Deployment Configuration
PRIVATE_KEY=your_private_key_here  # DO NOT COMMIT THIS!

# Scroll Sepolia Testnet
SCROLL_RPC_URL=https://sepolia-rpc.scroll.io

# Block Explorer API Key (optional, for verification)
SCROLLSCAN_API_KEY=your_scrollscan_api_key_here
```

⚠️ **Security Warning**: Never commit your private key or push `.env` file to git!

### Step 3: Compile Contracts

```bash
npm run compile
```

This will:
- Compile all Solidity contracts
- Generate ABIs in `artifacts/` folder
- Check for compilation errors

### Step 4: Deploy to Scroll Sepolia

```bash
npm run deploy:sepolia
```

This will:
- Deploy all core contracts to Scroll Sepolia
- Save deployment addresses to `deployments/scrollSepolia.json`
- Create an `.env` template for the frontend

**Expected output:**
```
🚀 Starting ZuriRent deployment to Scroll zkEVM...

📍 Network: scrollSepolia
👤 Deployer address: 0x...
💰 Deployer balance: X.XX ETH

✅ RentChainToken deployed to: 0x...
✅ UserRegistry deployed to: 0x...
✅ PropertyRegistry deployed to: 0x...
✅ EscrowManager deployed to: 0x...
✅ PaymentProcessor deployed to: 0x...
✅ DisputeResolution deployed to: 0x...
✅ ReviewSystem deployed to: 0x...
✅ RentAgreement deployed to: 0x...
✅ RentChainMain deployed to: 0x...

🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!
```

### Step 5: Extract ABIs for Frontend

```bash
node scripts/extract-abis.js
```

This will:
- Extract ABIs from compiled contracts
- Copy ABIs to `frontend/src/contracts/`
- Create a combined `contracts.json` file

---

## 🎨 Frontend Configuration

### Step 1: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `frontend` folder:

```bash
cp .env.example .env
```

Edit `.env` and add the contract addresses from deployment:

```env
# App Configuration
VITE_APP_NAME="ZuriRent"
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# Network Configuration
VITE_NETWORK=SCROLL_SEPOLIA
VITE_SCROLL_RPC_URL=https://sepolia-rpc.scroll.io

# Contract Addresses (from deployment)
VITE_CONTRACT_ADDRESS_MAIN=0x...
VITE_CONTRACT_ADDRESS_PROPERTY_REGISTRY=0x...
VITE_CONTRACT_ADDRESS_RENT_AGREEMENT=0x...
VITE_CONTRACT_ADDRESS_ESCROW=0x...
VITE_CONTRACT_ADDRESS_PAYMENT=0x...
VITE_CONTRACT_ADDRESS_USER_REGISTRY=0x...
VITE_CONTRACT_ADDRESS_DISPUTE=0x...
VITE_CONTRACT_ADDRESS_REVIEW=0x...
VITE_CONTRACT_ADDRESS_TOKEN=0x...

# API Configuration (Backend optional for now)
VITE_API_BASE_URL=http://localhost:3001
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PWA=true
```

**Important:** Copy the contract addresses from `contracts/deployments/scrollSepolia.json`

### Step 3: Verify Contract ABIs are in Place

Check that the ABIs were copied correctly:

```bash
ls src/contracts/
```

You should see:
- `RentChainMain.json`
- `PropertyRegistry.json`
- `RentAgreement.json`
- `EscrowManager.json`
- `PaymentProcessor.json`
- `UserRegistry.json`
- `DisputeResolution.json`
- `ReviewSystem.json`
- `RentChainToken.json`
- `contracts.json`
- `config.js`
- `index.js`

### Step 4: Start the Frontend

```bash
npm run dev
```

The app will start on `http://localhost:5173`

---

## 🧪 Testing the Integration

### 1. Connect MetaMask

1. Open the app at `http://localhost:5173`
2. Click "Connect Wallet" in the navbar
3. Select MetaMask
4. Approve the connection
5. Ensure you're on Scroll Sepolia network

### 2. Switch to Scroll Sepolia (if needed)

If MetaMask is on the wrong network:
- The app will automatically prompt you to switch
- Click "Switch Network" when prompted
- Approve in MetaMask

### 3. Test User Registration

1. Navigate to the Dashboard
2. Click "Register as Landlord" or "Register as Tenant"
3. Fill in your details
4. Submit the transaction
5. Approve in MetaMask
6. Wait for confirmation

### 4. Test Property Registration (Landlords)

1. Go to Dashboard → "Add Property"
2. Fill in property details:
   - Title
   - Description
   - Location
   - Price (in ETH)
   - Property Type
3. Upload images (they will be stored via IPFS)
4. Submit the transaction
5. Approve in MetaMask

### 5. Test Property Search (Tenants)

1. Go to "Search Properties"
2. Browse available properties
3. Click on a property to view details
4. Click "Request to Rent" to create an agreement

### 6. Test Rent Payment

1. Go to Dashboard → "My Agreements"
2. Find an active agreement
3. Click "Pay Rent"
4. Confirm the transaction
5. Payment will be processed through the smart contract

---

## 🔍 Verifying Transactions

After each transaction:

1. Copy the transaction hash from MetaMask or the app notification
2. Visit [Scroll Sepolia Explorer](https://sepolia.scrollscan.dev)
3. Paste the transaction hash to view details
4. Check:
   - Transaction status (Success/Failed)
   - Gas used
   - Events emitted
   - State changes

---

## 🛠️ Troubleshooting

### Issue: "Contracts not deployed" error

**Solution:**
- Check that `.env` file has all contract addresses
- Restart the dev server: `npm run dev`
- Clear browser cache and reload

### Issue: MetaMask not connecting

**Solution:**
- Refresh the page
- Unlock MetaMask
- Check that you're on Scroll Sepolia network
- Try disconnecting and reconnecting

### Issue: Transaction failing

**Solution:**
- Check you have enough ETH for gas
- Verify contract addresses are correct
- Check MetaMask console for detailed error
- Try increasing gas limit

### Issue: "Network mismatch" warning

**Solution:**
- Switch MetaMask to Scroll Sepolia
- Click the "Switch Network" button in the app
- Reload the page

### Issue: ABIs not found

**Solution:**
```bash
# Re-run the ABI extraction script
cd contracts
node scripts/extract-abis.js

# Restart frontend
cd ../frontend
npm run dev
```

### Issue: Contract calls failing

**Solution:**
- Open browser console (F12)
- Look for contract errors
- Check that contract addresses match deployment
- Verify you're using the correct network

---

## 📊 Network Information

### Scroll Sepolia Testnet

- **Chain ID**: 534351 (0x8274F)
- **RPC URL**: https://sepolia-rpc.scroll.io
- **Explorer**: https://sepolia.scrollscan.dev
- **Faucet**: https://scroll.io/faucet

### Getting Test ETH

1. Visit [Scroll Faucet](https://scroll.io/faucet)
2. Connect your wallet
3. Request test ETH
4. Wait for transaction to complete

---

## 🔄 Re-deploying Contracts

If you need to redeploy contracts:

```bash
# 1. Clean previous deployment
cd contracts
npx hardhat clean

# 2. Recompile
npm run compile

# 3. Deploy again
npm run deploy:sepolia

# 4. Extract ABIs
node scripts/extract-abis.js

# 5. Update frontend .env with new addresses
# Copy from contracts/deployments/scrollSepolia.json

# 6. Restart frontend
cd ../frontend
npm run dev
```

---

## 🚀 Next Steps

### Optional: Run Backend (for off-chain features)

The backend is **optional** and provides:
- Event indexing
- Analytics
- Real-time notifications
- Fiat payment bridge

To start the backend:

```bash
cd backend
npm install
npm run dev
```

Configure backend `.env` with the same contract addresses.

### Deploy to Production

When ready for mainnet:

1. Deploy to Scroll Mainnet:
   ```bash
   cd contracts
   npm run deploy:mainnet
   ```

2. Update frontend `.env`:
   ```env
   VITE_NETWORK=SCROLL_MAINNET
   VITE_CONTRACT_ADDRESS_MAIN=0x...  # Use mainnet addresses
   ```

3. Build frontend:
   ```bash
   cd frontend
   npm run build
   ```

4. Deploy `dist/` folder to hosting (Vercel, Netlify, etc.)

---

## ✅ Integration Checklist

- [ ] Contracts compiled successfully
- [ ] Contracts deployed to Scroll Sepolia
- [ ] Deployment addresses saved
- [ ] ABIs extracted to frontend
- [ ] Frontend `.env` configured with addresses
- [ ] MetaMask connected to Scroll Sepolia
- [ ] Test ETH obtained from faucet
- [ ] Wallet connected in the app
- [ ] User registration working
- [ ] Property registration working
- [ ] Property search working
- [ ] Rent agreement creation working
- [ ] Rent payment working
- [ ] All transactions visible on explorer

---

## 📚 Additional Resources

- [Scroll Documentation](https://docs.scroll.io)
- [Ethers.js Docs](https://docs.ethers.org)
- [React Documentation](https://react.dev)
- [Hardhat Documentation](https://hardhat.org/docs)

---

## 🆘 Support

If you encounter issues:

1. Check browser console for errors
2. Review the troubleshooting section above
3. Check contract deployment logs
4. Verify all environment variables are set
5. Review transaction on block explorer

---

**Status**: Ready for Integration Testing  
**Network**: Scroll Sepolia Testnet  
**Version**: 1.0.0

**ZuriRent** — Making renting beautiful, one smart contract at a time. 🏠✨
