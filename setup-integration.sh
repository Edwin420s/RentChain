#!/bin/bash

# ZuriRent Integration Setup Script
# This script helps set up the integration between smart contracts and frontend

set -e  # Exit on error

echo "======================================"
echo "🚀 ZuriRent Integration Setup"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -d "contracts" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the RentChain root directory"
    exit 1
fi

echo "📦 Step 1: Installing dependencies..."
echo ""

# Install contract dependencies
echo "Installing contract dependencies..."
cd contracts
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Dependencies installed"
echo ""

echo "📝 Step 2: Checking environment files..."
echo ""

# Check contracts .env
if [ ! -f "contracts/.env" ]; then
    echo "⚠️  No contracts/.env found. Creating from example..."
    cp contracts/.env.example contracts/.env
    echo "⚠️  Please edit contracts/.env and add your PRIVATE_KEY before deploying!"
else
    echo "✅ contracts/.env exists"
fi

# Check frontend .env
if [ ! -f "frontend/.env" ]; then
    echo "⚠️  No frontend/.env found. Creating from example..."
    cp frontend/.env.example frontend/.env
    echo "⚠️  You'll need to update frontend/.env with contract addresses after deployment"
else
    echo "✅ frontend/.env exists"
fi

echo ""
echo "🔨 Step 3: Compiling smart contracts..."
echo ""

cd contracts
npm run compile

echo ""
echo "📋 Step 4: Extracting ABIs..."
echo ""

node scripts/extract-abis.js

echo ""
echo "======================================"
echo "✅ Integration setup complete!"
echo "======================================"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Add your private key to contracts/.env:"
echo "   cd contracts"
echo "   nano .env  # Add PRIVATE_KEY=your_key_here"
echo ""
echo "2. Get Scroll Sepolia test ETH:"
echo "   https://scroll.io/faucet"
echo ""
echo "3. Deploy contracts to Scroll Sepolia:"
echo "   cd contracts"
echo "   npm run deploy:sepolia"
echo ""
echo "4. Update frontend/.env with deployed contract addresses:"
echo "   Copy from contracts/deployments/scrollSepolia.json"
echo ""
echo "5. Start the frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "📚 For detailed instructions, see INTEGRATION_GUIDE.md"
echo ""
