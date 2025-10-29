// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library RentChainConstants {
    // Platform Fees (in basis points)
    uint256 public constant PLATFORM_FEE_BP = 250; // 2.5%
    uint256 public constant PREMIUM_FEE_BP = 500; // 5%
    uint256 public constant INSURANCE_FEE_BP = 300; // 3%
    uint256 public constant STAKING_FEE_BP = 100; // 1%

    // Time Constants
    uint256 public constant SECONDS_PER_DAY = 86400;
    uint256 public constant SECONDS_PER_WEEK = 604800;
    uint256 public constant SECONDS_PER_MONTH = 2592000;
    uint256 public constant SECONDS_PER_YEAR = 31536000;

    // Security Constants
    uint256 public constant MAX_PAUSE_DURATION = 30 days;
    uint256 public constant WITHDRAWAL_COOLDOWN = 1 days;
    uint256 public constant DISPUTE_TIMEOUT = 7 days;
    uint256 public constant AGREEMENT_GRACE_PERIOD = 3 days;

    // Limits
    uint256 public constant MAX_PROPERTIES_PER_USER = 1000;
    uint256 public constant MAX_ACTIVE_AGREEMENTS = 100;
    uint256 public constant MAX_SECURITY_DEPOSIT_MULTIPLIER = 3; // 3x monthly rent
    uint256 public constant MIN_RENTAL_DURATION = 1 days;
    uint256 public constant MAX_RENTAL_DURATION = 365 days;

    // Tokenomics
    uint256 public constant TOKEN_DECIMALS = 18;
    uint256 public constant MAX_TOKEN_SUPPLY = 1000000000 * 10**18; // 1 billion
    uint256 public constant INITIAL_SUPPLY = 100000000 * 10**18; // 100 million
    uint256 public constant STAKING_REWARD_RATE = 100; // 100 tokens per block
    uint256 public constant REFERRAL_REWARD_BP = 500; // 5%

    // Role Constants
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    // Chain IDs
    uint256 public constant CHAIN_ETH_MAINNET = 1;
    uint256 public constant CHAIN_ETH_GOERLI = 5;
    uint256 public constant CHAIN_SCROLL_MAINNET = 534352;
    uint256 public constant CHAIN_SCROLL_TESTNET = 534351;
    uint256 public constant CHAIN_POLYGON_MAINNET = 137;
    uint256 public constant CHAIN_ARBITRUM_MAINNET = 42161;

    // IPFS Constants
    string public constant IPFS_GATEWAY = "https://ipfs.io/ipfs/";
    string public constant IPFS_PROPERTY_PREFIX = "rentchain-property-";
    string public constant IPFS_AGREEMENT_PREFIX = "rentchain-agreement-";

    // Error Messages
    string public constant ERROR_NOT_ADMIN = "Not admin";
    string public constant ERROR_NOT_OWNER = "Not owner";
    string public constant ERROR_INSUFFICIENT_BALANCE = "Insufficient balance";
    string public constant ERROR_TRANSFER_FAILED = "Transfer failed";
    string public constant ERROR_INVALID_AMOUNT = "Invalid amount";
    string public constant ERROR_INVALID_ADDRESS = "Invalid address";
    string public constant ERROR_SYSTEM_PAUSED = "System paused";
    string public constant ERROR_BLACKLISTED = "User blacklisted";

    // Success Messages
    string public constant SUCCESS_OPERATION = "Operation successful";
    string public constant SUCCESS_PAYMENT = "Payment processed";
    string public constant SUCCESS_AGREEMENT = "Agreement created";
    string public constant SUCCESS_VERIFICATION = "User verified";

    // Status Constants
    enum AgreementStatus {
        Created,
        Active,
        Completed,
        Cancelled,
        Disputed
    }

    enum DisputeStatus {
        Open,
        InProgress,
        Resolved,
        Cancelled
    }

    enum UserType {
        Tenant,
        Landlord,
        Both
    }

    enum PaymentMethod {
        Crypto,
        Mpesa,
        Airtel,
        Bank
    }

    // Feature Flags
    struct FeatureFlags {
        bool marketplaceEnabled;
        bool subscriptionsEnabled;
        bool insuranceEnabled;
        bool stakingEnabled;
        bool referralsEnabled;
        bool crossChainEnabled;
    }

    // Default Feature Flags
    function getDefaultFeatureFlags() internal pure returns (FeatureFlags memory) {
        return FeatureFlags({
            marketplaceEnabled: true,
            subscriptionsEnabled: true,
            insuranceEnabled: true,
            stakingEnabled: true,
            referralsEnabled: true,
            crossChainEnabled: false // Disabled by default for security
        });
    }

    // Platform Addresses (would be set in deployment)
    address public constant TREASURY_ADDRESS = 0x742d35Cc6634C0532925a3b8Dc9F5A6f6E8c6f5e;
    address public constant DEVELOPMENT_ADDRESS = 0x742d35Cc6634C0532925a3b8Dc9F5A6f6E8c6f5e;
    address public constant MARKETING_ADDRESS = 0x742d35Cc6634C0532925a3b8Dc9F5A6f6E8c6f5e;

    // Supported Tokens
    address public constant NATIVE_TOKEN = address(0);
    address public constant USDC_ADDRESS = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address public constant USDT_ADDRESS = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address public constant DAI_ADDRESS = 0x6B175474E89094C44Da98b954EedeAC495271d0F;

    // Price Feed Addresses (Mainnet)
    address public constant ETH_USD_FEED = 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419;
    address public constant USDC_USD_FEED = 0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6;
    address public constant USDT_USD_FEED = 0x3E7d1eAB13ad0104d2750B8863b489D65364e32D;

    // Utility Functions
    function calculatePlatformFee(uint256 amount) internal pure returns (uint256) {
        return (amount * PLATFORM_FEE_BP) / 10000;
    }

    function calculateInsuranceFee(uint256 amount) internal pure returns (uint256) {
        return (amount * INSURANCE_FEE_BP) / 10000;
    }

    function calculateReferralReward(uint256 amount) internal pure returns (uint256) {
        return (amount * REFERRAL_REWARD_BP) / 10000;
    }

    function isValidChain(uint256 chainId) internal pure returns (bool) {
        return chainId == CHAIN_ETH_MAINNET ||
               chainId == CHAIN_SCROLL_MAINNET ||
               chainId == CHAIN_SCROLL_TESTNET ||
               chainId == CHAIN_POLYGON_MAINNET ||
               chainId == CHAIN_ARBITRUM_MAINNET;
    }

    function isSupportedToken(address token) internal pure returns (bool) {
        return token == NATIVE_TOKEN ||
               token == USDC_ADDRESS ||
               token == USDT_ADDRESS ||
               token == DAI_ADDRESS;
    }

    function getTokenDecimals(address token) internal pure returns (uint8) {
        if (token == NATIVE_TOKEN) return 18;
        if (token == USDC_ADDRESS) return 6;
        if (token == USDT_ADDRESS) return 6;
        if (token == DAI_ADDRESS) return 18;
        return 18;
    }
}