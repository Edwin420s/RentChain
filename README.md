# ZuriRent — Beautiful, Smart, and Secure Renting

**Transforming rental housing with blockchain transparency, zk-powered identity, and automated escrow on Scroll zkEVM**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Scroll zkEVM](https://img.shields.io/badge/Scroll-zkEVM-purple)](https://scroll.io)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-orange)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)

---

## 🌟 What is ZuriRent?

ZuriRent is a decentralized rental and housing discovery platform that connects landlords and tenants through transparent, trustless smart contracts. Built on Scroll zkEVM, it eliminates fraud, fake listings, and rental disputes while providing seamless payment integration for both crypto and local currencies (M-Pesa, Airtel Money, banks).

**"Zuri"** means *beautiful* in Swahili — and that's exactly what we're building: a beautiful renting experience for everyone.

### The Problem We Solve

In many African cities and beyond, finding rental housing is:
- **Fraudulent** — Fake listings, scam deposits, dishonest agents
- **Opaque** — Hidden prices, no verified landlords, unclear contracts
- **Insecure** — Deposits withheld, no payment records, disputes with no resolution
- **Inefficient** — Manual processes, no centralized marketplace, middlemen exploitation

### Our Solution

ZuriRent provides:
- ✅ **Verified Property Listings** — IPFS-backed, on-chain property registry
- ✅ **Smart Contract Agreements** — Automated rent collection and deposit escrow
- ✅ **Privacy-Preserving Identity** — zkLogin for secure, wallet-less authentication
- ✅ **Transparent Payment Tracking** — All payments recorded immutably on-chain
- ✅ **Local Payment Integration** — Pay rent via M-Pesa, Airtel Money, or crypto
- ✅ **Automated Refunds** — Smart contracts release deposits automatically
- ✅ **On-Chain Reputation** — Verifiable ratings for landlords and tenants
- ✅ **Short-Term Rentals** — Find verified stays for nights, weeks, or months
- ✅ **Location Discovery** — Map-based search with real-time availability

---

## 🎯 Key Features

### For Tenants
- **Browse Verified Properties** — Search by location, price, type, and amenities
- **Secure Deposits** — Your deposit is locked in smart contract escrow
- **Transparent History** — See landlord ratings and property reviews
- **Flexible Payments** — Pay with ETH, USDC, USDT, DAI, M-Pesa, Airtel Money
- **Instant Bookings** — Sign agreements digitally via zkLogin
- **Dispute Protection** — Fair on-chain dispute resolution

### For Landlords
- **List Properties Easily** — Upload photos, set prices, manage availability
- **Instant Rent Collection** — Payments settle automatically on-chain
- **Verified Tenants** — View tenant reputation and payment history
- **Zero Intermediaries** — No agents, no commissions, direct interaction
- **Auto Dashboard Updates** — Real-time payment notifications
- **Refund Automation** — Deposits released automatically when lease ends

### Platform Features
- **Scroll zkEVM** — Low gas fees, fast transactions, Ethereum compatibility
- **zkLogin Authentication** — Privacy-preserving login via Google, Email, or wallet
- **IPFS Storage** — Decentralized property images and documents
- **Real-Time Sync** — WebSocket updates for payments and agreements
- **Mobile Responsive** — Works perfectly on phones and tablets
- **PWA Support** — Install as an app, works offline
- **Multi-Language** — English and Swahili (more coming soon)

---

## 🏗️ Architecture Overview

### Blockchain Layer
- **Network**: Scroll zkEVM (Sepolia Testnet / Mainnet)
- **Smart Contracts**: 50 Solidity contracts covering all platform logic
- **Storage**: IPFS for property images and documents
- **Identity**: zkLogin for privacy-preserving authentication
- **Payments**: Native crypto + M-Pesa/Airtel Money bridge

### Frontend Layer
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS (clean, modern, no AI gradients)
- **Web3**: Ethers.js for blockchain interaction
- **State**: Context API + React Query
- **Components**: 32 reusable components
- **Pages**: 7 main pages (Home, Search, Property Details, Dashboards)

### Backend Layer (Optional Event Indexer)
- **Runtime**: Node.js 18+ with Express
- **Database**: PostgreSQL for event caching
- **WebSockets**: Socket.io for real-time updates
- **Services**: Blockchain listener, payment sync, notifications
- **APIs**: REST endpoints for analytics and fiat payment bridge

### Integration Layer
- **Blockchain Events** → Backend Listener → Frontend Updates
- **M-Pesa Payments** → API Webhook → Smart Contract Update
- **IPFS Upload** → Hash Storage → On-Chain Reference
- **zkProofs** → On-Chain Verification → User Authentication

---

## 📦 Project Structure

```
ZuriRent/
├── contracts/              # 50 Smart Contracts (Solidity 0.8.19)
│   ├── RentChainMain.sol         # Main orchestrator
│   ├── PropertyRegistry.sol      # Property listings
│   ├── RentAgreement.sol         # Rental agreements
│   ├── EscrowManager.sol         # Deposit escrow
│   ├── PaymentProcessor.sol      # Payment handling
│   ├── UserRegistry.sol          # User management
│   ├── DisputeResolution.sol     # Dispute arbitration
│   ├── ReviewSystem.sol          # Ratings and reviews
│   └── ... (42 more contracts)
│
├── frontend/               # React Web Application
│   ├── src/
│   │   ├── components/     # 32 React components
│   │   ├── pages/          # 7 page components
│   │   ├── hooks/          # 13 custom hooks
│   │   ├── context/        # State management
│   │   ├── utils/          # Helper functions
│   │   └── App.jsx         # Main app component
│   ├── public/             # Static assets
│   ├── package.json
│   └── vite.config.js
│
├── backend/                # Node.js API Server
│   ├── controllers/        # 4 controllers
│   ├── services/           # 5 services
│   ├── routes/             # 5 route modules
│   ├── middleware/         # Security and validation
│   ├── config/             # Configuration files
│   ├── models/             # Database models
│   ├── server.js           # Main server file
│   └── package.json
│
├── docs/                   # Documentation (for judges)
├── scripts/                # Deployment and setup scripts
├── README.md               # This file
└── .env.example            # Environment template
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- **Node.js** 18+ and npm/yarn
- **Git** for version control
- **MetaMask** browser extension
- **PostgreSQL** 15+ (for backend)
- **Scroll Sepolia ETH** (get from faucet)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Edwin420s/ZuriRent.git
cd ZuriRent
```

#### 2. Install Contract Dependencies
```bash
cd contracts
npm install
```

#### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

#### 4. Install Backend Dependencies
```bash
cd ../backend
npm install
```

#### 5. Configure Environment Variables

**Frontend** (`frontend/.env`):
```env
VITE_APP_NAME=ZuriRent
VITE_SCROLL_RPC_URL=https://sepolia-rpc.scroll.io
VITE_CONTRACT_ADDRESS=0x... # Add after deployment
VITE_BACKEND_URL=http://localhost:3001
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

**Backend** (`backend/.env`):
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/zurirent
WEB3_RPC_URL=https://sepolia-rpc.scroll.io
CONTRACT_ADDRESS=0x... # Add after deployment
MPESA_CONSUMER_KEY=your_key_here
JWT_SECRET=your_secret_here
```

#### 6. Initialize Database
```bash
cd backend
npm run init-db
```

#### 7. Deploy Smart Contracts (Scroll Sepolia)
```bash
cd contracts
npx hardhat run scripts/deploy.js --network scrollSepolia
# Copy the deployed contract addresses to your .env files
```

#### 8. Start Development Servers

**Terminal 1 - Frontend**:
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2 - Backend**:
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

#### 9. Access the Application
Open your browser and navigate to: **http://localhost:5173**

---

## 🔗 Smart Contracts

### Core Contracts

| Contract | Purpose | Key Functions |
|----------|---------|---------------|
| `RentChainMain.sol` | Main orchestrator | System initialization, contract coordination |
| `PropertyRegistry.sol` | Property management | Register, update, search properties |
| `RentAgreement.sol` | Rental agreements | Create, sign, manage agreements |
| `EscrowManager.sol` | Deposit handling | Lock, release, refund deposits |
| `PaymentProcessor.sol` | Payment processing | Rent payments, fee distribution |
| `UserRegistry.sol` | User management | Register, verify, reputation tracking |
| `DisputeResolution.sol` | Dispute handling | Raise, vote, resolve disputes |
| `ReviewSystem.sol` | Ratings | Submit, view reviews |

### Additional Contracts

The platform includes 42+ additional contracts for:
- Token economics (RentChainToken, StakingRewards, Vesting)
- Governance (DAO, Voting, Treasury)
- Security (Emergency pause, Multi-sig, Compliance)
- Advanced features (NFTs, Subscriptions, Referrals, Analytics)
- Cross-chain (Bridge, Multi-chain support)

### Deployment Addresses (Scroll Sepolia Testnet)

*To be updated after deployment*

```
RentChainMain: 0x...
PropertyRegistry: 0x...
EscrowManager: 0x...
```

---

## 💻 Development Workflow

### Running Tests

**Smart Contracts**:
```bash
cd contracts
npx hardhat test
npx hardhat coverage
```

**Frontend**:
```bash
cd frontend
npm test
npm run test:coverage
```

**Backend**:
```bash
cd backend
npm test
```

### Code Quality

**Linting**:
```bash
# Frontend
cd frontend && npm run lint

# Backend
cd backend && npm run lint
```

**Formatting**:
```bash
cd frontend && npm run format
```

### Building for Production

**Frontend**:
```bash
cd frontend
npm run build
# Output in dist/ folder
```

**Contracts**:
```bash
cd contracts
npx hardhat compile
```

---

## 🔐 Security Features

### Smart Contract Security
- ✅ Access control modifiers on all admin functions
- ✅ Reentrancy guards (OpenZeppelin)
- ✅ Input validation and bounds checking
- ✅ Emergency pause mechanism
- ✅ Multi-signature wallet for critical operations
- ✅ Time-locked upgrades

### Application Security
- ✅ Helmet.js security headers
- ✅ Rate limiting on all endpoints
- ✅ CORS configuration
- ✅ XSS protection
- ✅ SQL injection prevention
- ✅ JWT authentication
- ✅ Input sanitization (Joi validation)

### Data Privacy
- ✅ zkLogin for privacy-preserving authentication
- ✅ No sensitive data stored on-chain
- ✅ Encrypted database connections
- ✅ HTTPS/WSS enforcement in production

---

## 🌍 Deployment

### Testnet Deployment (Scroll Sepolia)

1. Get Sepolia ETH from [Scroll Faucet](https://scroll.io/faucet)
2. Deploy contracts: `npx hardhat run scripts/deploy.js --network scrollSepolia`
3. Update contract addresses in `.env` files
4. Deploy frontend to Vercel/Netlify
5. Deploy backend to AWS/DigitalOcean/Render
6. Test end-to-end functionality

### Mainnet Deployment (Production)

**⚠️ Before mainnet:**
- ✅ Complete professional security audit
- ✅ Fix all audit findings
- ✅ Conduct extensive load testing
- ✅ Set up monitoring and alerts
- ✅ Prepare incident response plan
- ✅ Legal and compliance review

---

## 📊 Network Information

### Scroll Sepolia Testnet
- **RPC URL**: `https://sepolia-rpc.scroll.io`
- **Chain ID**: `534351`
- **Explorer**: https://sepolia.scrollscan.dev
- **Faucet**: https://scroll.io/faucet

### Scroll Mainnet (for production)
- **RPC URL**: `https://rpc.scroll.io`
- **Chain ID**: `534352`
- **Explorer**: https://scrollscan.com

---

## 🎨 Design Philosophy

### User Interface
- **Clean and Minimal** — No unnecessary elements or AI-generated gradients
- **Real-World Colors** — Navy blue, slate gray, white, emerald green
- **Typography** — Clear, readable fonts (Inter, System UI)
- **Accessibility** — WCAG 2.1 AA compliant
- **Mobile-First** — Responsive design for all screen sizes

### User Experience
- **Instant Feedback** — Real-time updates via WebSocket
- **One-Click Actions** — Rent payment in a single click
- **Progressive Disclosure** — Show complexity only when needed
- **Error Recovery** — Clear error messages and recovery paths
- **Offline Support** — PWA with offline capabilities

---

## 📈 Roadmap

### ✅ Phase 1 — MVP (Current)
- Core rental agreement system
- Property listing and search
- Escrow and payment processing
- User verification and reviews
- Basic admin dashboard

### 🚧 Phase 2 — Enhancement (Q2 2025)
- Mobile native apps (iOS/Android)
- Advanced analytics dashboard
- AI-powered property recommendations
- Multi-language support (French, Portuguese)
- Enhanced dispute resolution

### 🔮 Phase 3 — Expansion (Q3-Q4 2025)
- Multi-chain support (Polygon, Arbitrum, Base)
- NFT rental certificates
- DAO governance implementation
- Property tokenization
- Insurance integration

### 🌟 Phase 4 — Scale (2026)
- Enterprise solutions for agencies
- Government partnerships
- Regional expansion across Africa
- Traditional real estate integrations
- Credit scoring system

---

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](frontend/CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support & Community

- **Documentation**: Full docs coming soon
- **Discord**: Join our community (link TBA)
- **Twitter**: [@ZuriRent](https://twitter.com/ZuriRent)
- **Email**: support@zurirent.xyz
- **GitHub Issues**: Report bugs and request features

---

## 🏆 Built For

**Vibe Code Bootcamp | Kenya Scroll Local Node**
- Hosted by Web3Clubs Kenya
- Built on Scroll zkEVM
- October 2025

---

## 🙏 Acknowledgments

- **Scroll** — For providing the zkEVM infrastructure
- **Web3Clubs Kenya** — For organizing the bootcamp
- **OpenZeppelin** — For secure smart contract libraries
- **The Web3 Community** — For inspiration and support

---

## ⚡ Quick Links

- [Smart Contracts](./contracts/) — View all Solidity contracts
- [Frontend App](./frontend/) — React application source
- [Backend API](./backend/) — Node.js backend service
- [Documentation for Judges](./JUDGES_GUIDE.md) — Comprehensive guide for hackathon judges

---

**Status**: Production Ready (Pending Security Audit)  
**Version**: 1.0.0  
**Network**: Scroll zkEVM  
**License**: MIT

**ZuriRent** — Making renting beautiful, one smart contract at a time. 🏠✨
