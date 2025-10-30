require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    // Local development network
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
    },
    
    // Scroll Sepolia Testnet
    scrollSepolia: {
      url: process.env.SCROLL_RPC_URL || "https://sepolia-rpc.scroll.io",
      chainId: 534351,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
    },
    
    // Scroll Mainnet
    scroll: {
      url: process.env.SCROLL_MAINNET_RPC || "https://rpc.scroll.io",
      chainId: 534352,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
  },
  etherscan: {
    apiKey: {
      scrollSepolia: process.env.SCROLLSCAN_API_KEY || "",
      scroll: process.env.SCROLLSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "scrollSepolia",
        chainId: 534351,
        urls: {
          apiURL: "https://api-sepolia.scrollscan.com/api",
          browserURL: "https://sepolia.scrollscan.com/",
        },
      },
      {
        network: "scroll",
        chainId: 534352,
        urls: {
          apiURL: "https://api.scrollscan.com/api",
          browserURL: "https://scrollscan.com/",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
  },
};
