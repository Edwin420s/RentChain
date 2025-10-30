# ZuriRent Integration Setup Script (PowerShell)
# This script helps set up the integration between smart contracts and frontend

$ErrorActionPreference = "Stop"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🚀 ZuriRent Integration Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "contracts") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Error: Please run this script from the RentChain root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

# Install contract dependencies
Write-Host "Installing contract dependencies..." -ForegroundColor Gray
Set-Location contracts
npm install
Set-Location ..

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Gray
Set-Location frontend
npm install
Set-Location ..

Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Step 2: Checking environment files..." -ForegroundColor Yellow
Write-Host ""

# Check contracts .env
if (-not (Test-Path "contracts\.env")) {
    Write-Host "⚠️  No contracts\.env found. Creating from example..." -ForegroundColor Yellow
    Copy-Item "contracts\.env.example" "contracts\.env"
    Write-Host "⚠️  Please edit contracts\.env and add your PRIVATE_KEY before deploying!" -ForegroundColor Yellow
} else {
    Write-Host "✅ contracts\.env exists" -ForegroundColor Green
}

# Check frontend .env
if (-not (Test-Path "frontend\.env")) {
    Write-Host "⚠️  No frontend\.env found. Creating from example..." -ForegroundColor Yellow
    Copy-Item "frontend\.env.example" "frontend\.env"
    Write-Host "⚠️  You'll need to update frontend\.env with contract addresses after deployment" -ForegroundColor Yellow
} else {
    Write-Host "✅ frontend\.env exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔨 Step 3: Compiling smart contracts..." -ForegroundColor Yellow
Write-Host ""

Set-Location contracts
npm run compile

Write-Host ""
Write-Host "📋 Step 4: Extracting ABIs..." -ForegroundColor Yellow
Write-Host ""

node scripts/extract-abis.js

Set-Location ..

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ Integration setup complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Add your private key to contracts\.env:" -ForegroundColor White
Write-Host "   cd contracts" -ForegroundColor Gray
Write-Host "   notepad .env  # Add PRIVATE_KEY=your_key_here" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Get Scroll Sepolia test ETH:" -ForegroundColor White
Write-Host "   https://scroll.io/faucet" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Deploy contracts to Scroll Sepolia:" -ForegroundColor White
Write-Host "   cd contracts" -ForegroundColor Gray
Write-Host "   npm run deploy:sepolia" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Update frontend\.env with deployed contract addresses:" -ForegroundColor White
Write-Host "   Copy from contracts\deployments\scrollSepolia.json" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Start the frontend:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 For detailed instructions, see INTEGRATION_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
