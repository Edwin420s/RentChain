/**
 * Contract Configuration
 * 
 * This file manages contract addresses and network configurations.
 * Update the addresses after deploying contracts to the network.
 */

// Scroll Network Configurations
export const NETWORKS = {
  SCROLL_SEPOLIA: {
    chainId: 534351,
    chainIdHex: '0x8274F',
    name: 'Scroll Sepolia',
    rpcUrl: 'https://sepolia-rpc.scroll.io',
    blockExplorer: 'https://sepolia.scrollscan.dev',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  SCROLL_MAINNET: {
    chainId: 534352,
    chainIdHex: '0x82750',
    name: 'Scroll',
    rpcUrl: 'https://rpc.scroll.io',
    blockExplorer: 'https://scrollscan.com',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  LOCALHOST: {
    chainId: 31337,
    chainIdHex: '0x7A69',
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: '',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

// Default network (can be overridden by environment variable)
const DEFAULT_NETWORK = import.meta.env.VITE_NETWORK || 'SCROLL_SEPOLIA';

// Contract Addresses by Network
export const CONTRACT_ADDRESSES = {
  SCROLL_SEPOLIA: {
    RentChainMain: import.meta.env.VITE_CONTRACT_ADDRESS_MAIN || '',
    PropertyRegistry: import.meta.env.VITE_CONTRACT_ADDRESS_PROPERTY_REGISTRY || '',
    RentAgreement: import.meta.env.VITE_CONTRACT_ADDRESS_RENT_AGREEMENT || '',
    EscrowManager: import.meta.env.VITE_CONTRACT_ADDRESS_ESCROW || '',
    PaymentProcessor: import.meta.env.VITE_CONTRACT_ADDRESS_PAYMENT || '',
    UserRegistry: import.meta.env.VITE_CONTRACT_ADDRESS_USER_REGISTRY || '',
    DisputeResolution: import.meta.env.VITE_CONTRACT_ADDRESS_DISPUTE || '',
    ReviewSystem: import.meta.env.VITE_CONTRACT_ADDRESS_REVIEW || '',
    RentChainToken: import.meta.env.VITE_CONTRACT_ADDRESS_TOKEN || ''
  },
  SCROLL_MAINNET: {
    RentChainMain: '',
    PropertyRegistry: '',
    RentAgreement: '',
    EscrowManager: '',
    PaymentProcessor: '',
    UserRegistry: '',
    DisputeResolution: '',
    ReviewSystem: '',
    RentChainToken: ''
  },
  LOCALHOST: {
    RentChainMain: '',
    PropertyRegistry: '',
    RentAgreement: '',
    EscrowManager: '',
    PaymentProcessor: '',
    UserRegistry: '',
    DisputeResolution: '',
    ReviewSystem: '',
    RentChainToken: ''
  }
};

/**
 * Get the current network configuration
 */
export function getCurrentNetwork() {
  return NETWORKS[DEFAULT_NETWORK];
}

/**
 * Get contract addresses for the current network
 */
export function getContractAddresses(network = DEFAULT_NETWORK) {
  return CONTRACT_ADDRESSES[network] || CONTRACT_ADDRESSES.SCROLL_SEPOLIA;
}

/**
 * Get a specific contract address
 */
export function getContractAddress(contractName, network = DEFAULT_NETWORK) {
  const addresses = getContractAddresses(network);
  return addresses[contractName] || '';
}

/**
 * Check if contracts are deployed (have addresses)
 */
export function areContractsDeployed(network = DEFAULT_NETWORK) {
  const addresses = getContractAddresses(network);
  return Object.values(addresses).some(addr => addr && addr !== '');
}

/**
 * Get network by chain ID
 */
export function getNetworkByChainId(chainId) {
  return Object.values(NETWORKS).find(network => network.chainId === chainId);
}

/**
 * Check if current chain ID is supported
 */
export function isSupportedNetwork(chainId) {
  return !!getNetworkByChainId(chainId);
}

/**
 * Get RPC URL for current network
 */
export function getRpcUrl(network = DEFAULT_NETWORK) {
  return NETWORKS[network]?.rpcUrl || NETWORKS.SCROLL_SEPOLIA.rpcUrl;
}

/**
 * Get block explorer URL for current network
 */
export function getBlockExplorerUrl(network = DEFAULT_NETWORK) {
  return NETWORKS[network]?.blockExplorer || NETWORKS.SCROLL_SEPOLIA.blockExplorer;
}

/**
 * Format address for display (0x1234...5678)
 */
export function formatAddress(address) {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Get transaction URL on block explorer
 */
export function getTxUrl(txHash, network = DEFAULT_NETWORK) {
  const explorerUrl = getBlockExplorerUrl(network);
  return explorerUrl ? `${explorerUrl}/tx/${txHash}` : '';
}

/**
 * Get address URL on block explorer
 */
export function getAddressUrl(address, network = DEFAULT_NETWORK) {
  const explorerUrl = getBlockExplorerUrl(network);
  return explorerUrl ? `${explorerUrl}/address/${address}` : '';
}
