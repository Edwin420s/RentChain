# ZuriRent - Quick Start Guide

Get your ZuriRent platform up and running in 10 minutes!

## 🎯 What You'll Do

1. Install dependencies
2. Deploy smart contracts
3. Connect frontend to contracts
4. Test the application

---

## 📋 Prerequisites

- [x] Node.js 18+ installed
- [x] MetaMask browser extension installed
- [x] Git installed

---

## 🚀 Quick Setup (Windows)

### Step 1: Run the Setup Script

Open PowerShell in the project root and run:

```powershell
.\setup-integration.ps1
```

This will:
- Install all dependencies
- Compile smart contracts
- Extract ABIs to frontend
- Create environment files

### Step 2: Get Test ETH

1. Visit [Scroll Sepolia Faucet](https://scroll.io/faucet)
2. Connect your MetaMask wallet
3. Request test ETH
4. Wait for the transaction to complete

### Step 3: Configure Deployment

Edit `contracts\.env`:

```powershell
cd contracts
notepad .env
```

Add your private key (from MetaMask):

```env
PRIVATE_KEY=your_private_key_here
```

**⚠️ IMPORTANT:** Never commit this file or share your private key!

### Step 4: Deploy Contracts

```powershell
npm run deploy:sepolia
```

**Save the contract addresses** from the output!

### Step 5: Configure Frontend

Edit `frontend\.env`:

```powershell
cd ..\frontend
notepad .env
```

Paste the contract addresses from deployment:

```env
VITE_CONTRACT_ADDRESS_MAIN=0x...
VITE_CONTRACT_ADDRESS_PROPERTY_REGISTRY=0x...
VITE_CONTRACT_ADDRESS_RENT_AGREEMENT=0x...
# ... etc
```

Or copy from: `contracts\deployments\scrollSepolia.json`

### Step 6: Start the Frontend

```powershell
npm run dev
```

Open your browser to: **http://localhost:5173**

---

## 🚀 Quick Setup (Mac/Linux)

### Step 1: Run the Setup Script

```bash
chmod +x setup-integration.sh
./setup-integration.sh
```

### Step 2-6: Same as Windows

Follow steps 2-6 above, but use:
- `nano .env` instead of `notepad .env`
- Forward slashes `/` instead of backslashes `\`

---

## ✅ Testing Your Setup

### 1. Connect Wallet

1. Open http://localhost:5173
2. Click "Connect Wallet"
3. Select MetaMask
4. Approve connection
5. Switch to Scroll Sepolia when prompted

### 2. Register as User

1. Click your account icon
2. Select "Register"
3. Choose "Landlord" or "Tenant"
4. Fill in details
5. Approve transaction in MetaMask

### 3. List a Property (Landlords)

1. Go to Dashboard
2. Click "Add Property"
3. Fill in property details
4. Submit transaction
5. Wait for confirmation

### 4. Browse Properties (Tenants)

1. Go to "Search"
2. Browse available properties
3. Click on a property to view details
4. Click "Request to Rent"

---

## 🔍 Verify on Block Explorer

After each transaction:

1. Copy the transaction hash
2. Visit [Scroll Sepolia Explorer](https://sepolia.scrollscan.dev)
3. Paste the hash to view details

---

## 🛠️ Troubleshooting

### "Contracts not deployed" error

```powershell
# Check frontend/.env has all contract addresses
cd frontend
cat .env  # or 'type .env' on Windows

# Restart dev server
npm run dev
```

### MetaMask not connecting

1. Refresh the page
2. Unlock MetaMask
3. Try disconnecting and reconnecting
4. Check you're on Scroll Sepolia

### Transaction failing

1. Check you have enough test ETH
2. Verify contract addresses are correct
3. Try increasing gas limit in MetaMask

### Need to redeploy contracts

```powershell
cd contracts
npx hardhat clean
npm run compile
npm run deploy:sepolia
# Then update frontend/.env with new addresses
```

---

## 📊 Network Details

**Scroll Sepolia Testnet**
- Chain ID: 534351
- RPC: https://sepolia-rpc.scroll.io
- Explorer: https://sepolia.scrollscan.dev
- Faucet: https://scroll.io/faucet

---

## 🎉 Success Checklist

- [ ] Setup script completed
- [ ] Got test ETH from faucet
- [ ] Deployed contracts successfully
- [ ] Frontend .env configured
- [ ] Frontend started successfully
- [ ] MetaMask connected
- [ ] Registered as user
- [ ] Created/viewed properties
- [ ] Transaction visible on explorer

---

## 📚 Next Steps

### Learn More
- Read [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed info
- Check [README.md](./README.md) for full documentation
- Review contract ABIs in `frontend/src/contracts/`

### Deploy to Production
When ready for mainnet:
```powershell
cd contracts
npm run deploy:mainnet
```

---

## 🆘 Need Help?

1. Check browser console (F12) for errors
2. Review [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
3. Check GitHub issues
4. Review transaction on block explorer

---

**Status**: Ready to Deploy  
**Network**: Scroll Sepolia Testnet  
**Time to Complete**: ~10 minutes

**ZuriRent** — Making renting beautiful! 🏠✨
