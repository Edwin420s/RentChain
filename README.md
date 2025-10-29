# RentChain

A decentralized rental marketplace built on Scroll zkEVM that connects landlords and tenants through transparent, trustless smart contracts.

## Overview

RentChain eliminates fraud, fake listings, and rental disputes by automating rental agreements, payments, and escrow deposits on the blockchain. The platform provides verified property listings, automated rent payments, and transparent on-chain records of every transaction.

## Features

### For Tenants
- Browse verified property listings with location-based search
- Secure escrow deposit protection
- Automated rent payments with crypto or stablecoins
- On-chain rental history and reputation
- Dispute resolution system
- Review landlords transparently

### For Landlords
- List properties with IPFS storage
- Automated rental agreement creation
- Instant rent collection on-chain
- Tenant verification and background checks
- Property management dashboard
- Revenue tracking and analytics

### Platform Features
- Smart contract rental agreements
- Multi-currency support (ETH, USDC, USDT, DAI)
- Escrow management with automated refunds
- Decentralized dispute resolution
- Review and rating system
- Real-time notifications
- Mobile-responsive PWA

## Tech Stack

### Blockchain
- **Network**: Scroll zkEVM (Layer 2)
- **Smart Contracts**: Solidity ^0.8.19
- **Web3 Library**: Ethers.js 6.8.0
- **Storage**: IPFS for decentralized data

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: TailwindCSS 3.3
- **State Management**: Context API
- **Testing**: Jest + React Testing Library
- **Build Tool**: Vite 4.4

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Real-time**: Socket.io
- **Job Scheduling**: Node-cron

## Project Structure

```
RentChain/
├── contracts/          # Smart contracts (Solidity)
│   ├── PropertyRegistry.sol
│   ├── RentAgreement.sol
│   ├── EscrowManager.sol
│   ├── RentChainToken.sol
│   └── ...
├── frontend/          # React web application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── utils/
│   └── package.json
├── backend/           # Node.js API server
│   ├── controllers/
│   ├── services/
│   ├── models/
│   └── server.js
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask browser extension
- PostgreSQL 15+ (for backend)
- Redis (optional, for caching)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rentchain.git
cd rentchain
```

2. Install dependencies:
```bash
# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Configure environment:
```bash
# Frontend
cd frontend
cp .env.example .env
# Edit .env with your configuration

# Backend
cd ../backend
cp .env.example .env
# Edit .env with your configuration
```

4. Deploy contracts (Scroll Sepolia testnet):
```bash
cd contracts
npx hardhat run scripts/deploy.js --network scroll-sepolia
```

5. Start services:
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm start
```

Access the application at `http://localhost:5173`

## Smart Contracts

### Core Contracts
- **PropertyRegistry**: Property listing management
- **RentAgreement**: Rental agreement logic
- **EscrowManager**: Deposit escrow handling
- **PaymentProcessor**: Payment processing
- **UserRegistry**: User verification and reputation
- **DisputeResolution**: Dispute arbitration
- **ReviewSystem**: Rating and reviews

### Token Contracts
- **RentChainToken (RENT)**: Platform utility token
- **RentChainGovernanceToken (RENTG)**: Governance token
- **StakingRewards**: Token staking mechanism

### Deployment Addresses (Scroll Sepolia)
```
PropertyRegistry: 0x...
RentAgreement: 0x...
EscrowManager: 0x...
RentChainToken: 0x...
```

## Development

### Running Tests

```bash
# Contract tests
cd contracts
npx hardhat test

# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

### Code Quality

```bash
# Lint contracts
cd contracts
npm run lint

# Lint frontend
cd frontend
npm run lint

# Lint backend
cd backend
npm run lint
```

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build
```

## Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

1. Deploy smart contracts to Scroll mainnet
2. Build frontend: `npm run build`
3. Deploy frontend to hosting (Vercel, Netlify, etc.)
4. Deploy backend to server (AWS, DigitalOcean, etc.)
5. Configure domain and SSL certificates

## Security

- All smart contracts follow OpenZeppelin standards
- Multi-signature wallet for admin operations
- Emergency pause mechanisms
- Rate limiting and DDoS protection
- Input sanitization and validation
- Regular security audits recommended

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](frontend/CONTRIBUTING.md) for details on the code of conduct and submission process.

## Testing Networks

### Scroll Sepolia Testnet
- **RPC URL**: https://sepolia-rpc.scroll.io
- **Chain ID**: 534351
- **Block Explorer**: https://sepolia.scrollscan.dev
- **Faucet**: https://scroll.io/faucet

### Get Test Tokens
1. Visit the Scroll faucet
2. Connect your wallet
3. Request test ETH
4. Use test ETH for transactions

## Documentation

- [Smart Contracts](contracts/README.md) - Contract documentation
- [Frontend Guide](frontend/README.md) - Frontend setup
- [API Documentation](backend/docs/API.md) - Backend API reference

## Roadmap

- [x] Core rental agreement system
- [x] Escrow and payment processing
- [x] User verification and reviews
- [x] Admin dashboard
- [ ] Mobile application (iOS/Android)
- [ ] Multi-chain support (Polygon, Arbitrum)
- [ ] DAO governance implementation
- [ ] NFT rental certificates
- [ ] Integration with traditional payment systems

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: https://docs.rentchain.xyz
- **Discord**: https://discord.gg/rentchain
- **Twitter**: https://twitter.com/rentchain
- **Email**: support@rentchain.xyz

## Acknowledgments

- Built on Scroll zkEVM for low-cost transactions
- Inspired by the Web3 community
- Thanks to all contributors

---

**Status**: Production Ready  
**Version**: 1.0.0  
**Network**: Scroll zkEVM  
**License**: MIT
