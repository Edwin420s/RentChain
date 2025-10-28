# RentChain Frontend

A decentralized rental marketplace built on Scroll zkEVM that connects landlords and tenants through transparent, trustless smart contracts.

## Overview

RentChain allows landlords to post and manage verified property listings while enabling tenants to find, apply for, and rent houses securely online. The platform uses smart contracts to automate rent payments, handle escrow deposits, and record every transaction on-chain, eliminating fraud, fake listings, and disputes.

## Features

- **Property Listings** - Browse and search verified rental properties
- **Smart Contracts** - Automated rental agreements on Scroll zkEVM
- **Escrow System** - Secure deposit management with automated refunds
- **Wallet Integration** - MetaMask and WalletConnect support
- **Real-time Updates** - Live notifications and property status
- **Map Integration** - Location-based property search
- **Review System** - On-chain tenant and landlord ratings
- **Multi-currency** - Support for crypto and stablecoin payments

## Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS
- **Blockchain**: Scroll zkEVM, Solidity, Ethers.js
- **Storage**: IPFS for decentralized data
- **State Management**: Context API
- **Testing**: Jest, React Testing Library
- **Deployment**: Docker, Nginx

## Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask browser extension
- Git

## Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/rentchain-frontend.git
cd rentchain-frontend
```

### Install dependencies

```bash
npm install
```

### Environment setup

Create a `.env` file in the root directory:

```env
VITE_SCROLL_RPC_URL=https://scroll-testnet.rpc.url
VITE_CONTRACT_ADDRESS=your_contract_address
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/
VITE_ANALYTICS_ID=your_analytics_id
```

### Start development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting errors
- `npm run format` - Format code with Prettier

## Project Structure

```
rentchain-frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── styles/          # CSS and animations
│   ├── utils/           # Utility functions
│   └── App.jsx          # Main app component
├── .env.example         # Environment variables template
├── Dockerfile           # Docker configuration
├── package.json         # Dependencies
└── vite.config.js       # Vite configuration
```

## Building for Production

### Standard build

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Docker build

```bash
docker build -t rentchain-frontend .
docker run -p 3000:80 rentchain-frontend
```

### Using docker-compose

```bash
docker-compose up -d
```

## Testing

### Run all tests

```bash
npm test
```

### Run tests in watch mode

```bash
npm run test:watch
```

### Generate coverage report

```bash
npm run test:coverage
```

## Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

### Manual deployment

1. Build the project: `npm run build`
2. Upload the `dist/` directory to your hosting provider
3. Configure your server to serve `index.html` for all routes

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SCROLL_RPC_URL` | Scroll network RPC endpoint | Yes |
| `VITE_CONTRACT_ADDRESS` | RentChain smart contract address | Yes |
| `VITE_IPFS_GATEWAY` | IPFS gateway URL | No |
| `VITE_ANALYTICS_ID` | Analytics tracking ID | No |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Documentation: [docs.rentchain.xyz](https://docs.rentchain.xyz)
- Discord: [discord.gg/rentchain](https://discord.gg/rentchain)
- Email: support@rentchain.xyz

## Acknowledgments

- Built for the Scroll zkEVM ecosystem
- Powered by Web3 technology
- Community-driven development

---

Built by the RentChain Team
