// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PropertyRegistry.sol";
import "./RentAgreement.sol";
import "./EscrowManager.sol";
import "./PaymentProcessor.sol";
import "./UserRegistry.sol";
import "./DisputeResolution.sol";
import "./ReviewSystem.sol";
import "./RentChainToken.sol";
import "./StakingRewards.sol";
import "./RentalInsurance.sol";
import "./RentChainMarketplace.sol";
import "./RentChainSubscriptions.sol";
import "./RentChainReferral.sol";
import "./RentChainMultiChain.sol";
import "./RentChainAnalytics.sol";
import "./RentChainEmergency.sol";
import "./RentChainBase.sol";
import "./RentChainConstants.sol";
import "./RentChainUtils.sol";

contract RentChainMain is RentChainBase {
    using RentChainUtils for address;
    using RentChainUtils for uint256;

    // Core System Contracts
    PropertyRegistry public propertyRegistry;
    RentAgreement public rentAgreement;
    EscrowManager public escrowManager;
    PaymentProcessor public paymentProcessor;
    UserRegistry public userRegistry;
    DisputeResolution public disputeResolution;
    ReviewSystem public reviewSystem;
    RentChainToken public rentToken;
    StakingRewards public stakingRewards;
    RentalInsurance public rentalInsurance;
    RentChainMarketplace public marketplace;
    RentChainSubscriptions public subscriptions;
    RentChainReferral public referralSystem;
    RentChainMultiChain public multiChain;
    RentChainAnalytics public analytics;

    // System State
    bool public systemActive;
    uint256 public totalProperties;
    uint256 public totalAgreements;
    uint256 public totalUsers;
    uint256 public totalVolume;
    uint256 public systemLaunchTime;

    // Feature Flags
    RentChainConstants.FeatureFlags public featureFlags;

    // Events
    event SystemInitialized(address indexed initializer, uint256 timestamp);
    event FeatureToggled(string feature, bool enabled);
    event SystemUpgraded(uint256 newVersion, string description);
    event EmergencyTriggered(string reason, address triggeredBy);
    event RevenueDistributed(uint256 amount, address treasury);

    constructor(
        address _rentToken,
        address _userRegistry,
        address _propertyRegistry,
        address _rentAgreement,
        address _escrowManager,
        address _paymentProcessor,
        address _disputeResolution,
        address _reviewSystem
    ) RentChainBase(address(0)) {
        require(_rentToken != address(0), "Invalid token address");
        require(_userRegistry != address(0), "Invalid user registry");
        require(_propertyRegistry != address(0), "Invalid property registry");
        require(_rentAgreement != address(0), "Invalid rent agreement");
        require(_escrowManager != address(0), "Invalid escrow manager");
        require(_paymentProcessor != address(0), "Invalid payment processor");
        require(_disputeResolution != address(0), "Invalid dispute resolution");
        require(_reviewSystem != address(0), "Invalid review system");

        // Set core contract addresses
        rentToken = RentChainToken(_rentToken);
        userRegistry = UserRegistry(_userRegistry);
        propertyRegistry = PropertyRegistry(_propertyRegistry);
        rentAgreement = RentAgreement(_rentAgreement);
        escrowManager = EscrowManager(_escrowManager);
        paymentProcessor = PaymentProcessor(_paymentProcessor);
        disputeResolution = DisputeResolution(_disputeResolution);
        reviewSystem = ReviewSystem(_reviewSystem);
        
        // Initialize feature flags with conservative defaults
        featureFlags = RentChainConstants.getDefaultFeatureFlags();
        
        // Set system state
        systemActive = true;
        systemLaunchTime = block.timestamp;
    }

    function initializeOptionalContracts(
        address _stakingRewards,
        address _rentalInsurance,
        address _marketplace,
        address _subscriptions,
        address _referralSystem,
        address _multiChain,
        address _analytics
    ) external onlyAdmin {
        require(!initialized, "Already initialized");
        
        if (_stakingRewards != address(0)) stakingRewards = StakingRewards(_stakingRewards);
        if (_rentalInsurance != address(0)) rentalInsurance = RentalInsurance(_rentalInsurance);
        if (_marketplace != address(0)) marketplace = RentChainMarketplace(_marketplace);
        if (_subscriptions != address(0)) subscriptions = RentChainSubscriptions(_subscriptions);
        if (_referralSystem != address(0)) referralSystem = RentChainReferral(_referralSystem);
        if (_multiChain != address(0)) multiChain = RentChainMultiChain(_multiChain);
        if (_analytics != address(0)) analytics = RentChainAnalytics(_analytics);
        
        initialized = true;
        emit SystemInitialized(msg.sender, block.timestamp);
    }

    // Main User Functions
    function registerUser(
        string memory name,
        string memory email,
        string memory phone,
        string memory ipfsHash
    ) external whenNotPaused whenInitialized returns (bool) {
        require(systemActive, "System not active");
        
        userRegistry.registerUser(name, email, phone, ipfsHash);
        
        if (featureFlags.referralsEnabled) {
            // Check for referral code in the future
        }
        
        totalUsers++;
        return true;
    }

    function registerProperty(
        string memory title,
        uint256 price,
        string memory location,
        string memory ipfsHash
    ) external whenNotPaused whenInitialized returns (uint256) {
        require(systemActive, "System not active");
        require(userRegistry.isUserVerified(msg.sender), "User not verified");

        uint256 propertyId = propertyRegistry.registerProperty(title, price, location, ipfsHash);
        
        if (featureFlags.subscriptionsEnabled) {
            subscriptions.recordPropertyUsage(msg.sender);
        }
        
        if (featureFlags.referralsEnabled) {
            uint256 reward = referralSystem.calculateReward(msg.sender, price);
            if (reward > 0) {
                referralSystem.distributeReward(msg.sender, reward);
            }
        }

        totalProperties++;
        analytics.updatePropertyStats(msg.sender, location, price);
        
        return propertyId;
    }

    function createRentalAgreement(
        uint256 propertyId,
        address tenant,
        uint256 rentAmount,
        uint256 securityDeposit,
        uint256 startDate,
        uint256 endDate,
        address paymentToken,
        uint256 insuranceCoverage
    ) external whenNotPaused whenInitialized returns (uint256 agreementId) {
        require(systemActive, "System not active");
        require(userRegistry.isUserVerified(tenant), "Tenant not verified");

        // Validate rental parameters
        validateRentalParameters(rentAmount, securityDeposit, endDate - startDate);

        agreementId = rentAgreement.createAgreement(
            propertyId,
            tenant,
            rentAmount,
            securityDeposit,
            startDate,
            endDate,
            paymentToken
        );

        // Create insurance if requested
        if (featureFlags.insuranceEnabled && insuranceCoverage > 0) {
            rentalInsurance.createPolicy(agreementId, tenant, msg.sender, insuranceCoverage);
        }

        // Create escrow for deposit
        if (securityDeposit > 0) {
            escrowManager.createEscrow(
                msg.sender,
                tenant,
                securityDeposit,
                paymentToken,
                endDate - startDate
            );
        }

        totalAgreements++;
        totalVolume += rentAmount + securityDeposit;

        analytics.updateUserStats(msg.sender, true, rentAmount, false, false);
        analytics.updateUserStats(tenant, false, rentAmount, false, false);

        return agreementId;
    }

    function payRent(uint256 agreementId, uint256 amount) external whenNotPaused whenInitialized {
        require(systemActive, "System not active");

        rentAgreement.payRent(agreementId, amount);
        
        // Process platform fee
        uint256 platformFee = calculatePlatformFee(amount);
        if (platformFee > 0) {
            // Distribute fee to treasury
            _distributeRevenue(platformFee);
        }

        analytics.updateUserStats(msg.sender, false, amount, true, false);
    }

    // System Management Functions
    function toggleFeature(string memory feature, bool enabled) external onlyAdmin {
        if (stringsEqual(feature, "marketplace")) {
            featureFlags.marketplaceEnabled = enabled;
        } else if (stringsEqual(feature, "subscriptions")) {
            featureFlags.subscriptionsEnabled = enabled;
        } else if (stringsEqual(feature, "insurance")) {
            featureFlags.insuranceEnabled = enabled;
        } else if (stringsEqual(feature, "staking")) {
            featureFlags.stakingEnabled = enabled;
        } else if (stringsEqual(feature, "referrals")) {
            featureFlags.referralsEnabled = enabled;
        } else if (stringsEqual(feature, "crosschain")) {
            featureFlags.crossChainEnabled = enabled;
        }

        emit FeatureToggled(feature, enabled);
    }

    function upgradeSystem(uint256 newVersion, string memory description) external onlyAdmin {
        require(newVersion > version, "Version must increase");
        
        version = newVersion;
        emit SystemUpgraded(newVersion, description);
    }

    function emergencyShutdown(string memory reason) external onlyAdmin {
        systemActive = false;
        emergencySystem.emergencyPauseAll();
        
        emit EmergencyTriggered(reason, msg.sender);
    }

    function resumeSystem() external onlyAdmin {
        systemActive = true;
        emergencySystem.resumeSystem();
    }

    // Revenue Distribution
    function _distributeRevenue(uint256 amount) internal {
        uint256 treasuryShare = (amount * 40) / 100;
        uint256 developmentShare = (amount * 30) / 100;
        uint256 marketingShare = (amount * 20) / 100;
        uint256 stakingShare = amount - treasuryShare - developmentShare - marketingShare;

        rentToken.transfer(RentChainConstants.TREASURY_ADDRESS, treasuryShare);
        rentToken.transfer(RentChainConstants.DEVELOPMENT_ADDRESS, developmentShare);
        rentToken.transfer(RentChainConstants.MARKETING_ADDRESS, marketingShare);
        
        if (featureFlags.stakingEnabled && stakingShare > 0) {
            rentToken.transfer(address(stakingRewards), stakingShare);
        }

        emit RevenueDistributed(amount, RentChainConstants.TREASURY_ADDRESS);
    }

    // Analytics and Reporting
    function getSystemStats() external view returns (
        uint256 properties,
        uint256 agreements,
        uint256 users,
        uint256 volume,
        uint256 activeUsers,
        uint256 platformRevenue,
        uint256 averageRent
    ) {
        properties = totalProperties;
        agreements = totalAgreements;
        users = totalUsers;
        volume = totalVolume;
        
        // These would be calculated from analytics contract
        activeUsers = 0;
        platformRevenue = 0;
        averageRent = 0;

        return (properties, agreements, users, volume, activeUsers, platformRevenue, averageRent);
    }

    function getUserDashboard(address user) external view returns (
        bool isVerified,
        uint256 propertiesListed,
        uint256 activeAgreements,
        uint256 totalEarned,
        uint256 totalSpent,
        uint256 reputationScore,
        bool hasActiveSubscription,
        uint256 pendingRewards
    ) {
        isVerified = userRegistry.isUserVerified(user);
        propertiesListed = propertyRegistry.getOwnerProperties(user).length;
        
        // These would be calculated from various contracts
        activeAgreements = 0;
        totalEarned = 0;
        totalSpent = 0;
        reputationScore = reviewSystem.calculateAverageRating(user);
        hasActiveSubscription = false;
        pendingRewards = 0;

        return (
            isVerified,
            propertiesListed,
            activeAgreements,
            totalEarned,
            totalSpent,
            reputationScore,
            hasActiveSubscription,
            pendingRewards
        );
    }

    // Multi-chain Support
    function syncUserCrossChain(
        uint256 targetChain,
        address user
    ) external whenNotPaused whenInitialized returns (bytes32) {
        require(featureFlags.crossChainEnabled, "Cross-chain disabled");
        require(systemActive, "System not active");

        // Prepare user data for cross-chain sync
        (, , , , , uint256 reputation, , uint256 totalTransactions) = userRegistry.users(user);
        bytes memory userData = abi.encode(
            user,
            totalTransactions,
            rentAgreement.getLandlordAgreements(user).length + rentAgreement.getTenantAgreements(user).length,
            reputation
        );

        return multiChain.createCrossChainRequest(targetChain, userData);
    }

    // Subscription Management
    function upgradeToPremium(uint256 planId) external whenNotPaused whenInitialized {
        require(featureFlags.subscriptionsEnabled, "Subscriptions disabled");
        require(systemActive, "System not active");

        subscriptions.subscribe(planId);
        
        // Grant premium benefits
        userRegistry.updateUserReputation(msg.sender, 100); // Bonus reputation
    }

    // Staking Functions
    function stakeTokens(uint256 amount) external whenNotPaused whenInitialized {
        require(featureFlags.stakingEnabled, "Staking disabled");
        require(systemActive, "System not active");

        rentToken.transferFrom(msg.sender, address(stakingRewards), amount);
        stakingRewards.stake(amount);
    }

    // Utility Functions
    function stringsEqual(string memory a, string memory b) internal pure returns (bool) {
        return RentChainUtils.stringsEqual(a, b);
    }

    function validateRentalParameters(
        uint256 rentAmount,
        uint256 securityDeposit,
        uint256 duration
    ) internal pure override {
        require(rentAmount > 0, "Rent amount must be positive");
        require(securityDeposit <= rentAmount * RentChainConstants.MAX_SECURITY_DEPOSIT_MULTIPLIER, "Deposit too high");
        require(duration >= RentChainConstants.MIN_RENTAL_DURATION, "Duration too short");
        require(duration <= RentChainConstants.MAX_RENTAL_DURATION, "Duration too long");
    }

    function calculatePlatformFee(uint256 amount) internal pure override returns (uint256) {
        return RentChainConstants.calculatePlatformFee(amount);
    }

    // Emergency Overrides
    function emergencyWithdraw(address token, uint256 amount) external onlyAdmin {
        require(!systemActive, "System must be paused");
        emergencySystem.recoverEmergencyFunds(token, amount, admin);
    }

    // System Information
    function getSystemInfo() external view returns (
        address systemAdmin,
        uint256 systemVersion,
        bool isSystemActive,
        uint256 launchTime,
        uint256 uptime,
        RentChainConstants.FeatureFlags memory features
    ) {
        uint256 currentUptime = systemActive ? block.timestamp - systemLaunchTime : 0;
        
        return (
            admin,
            version,
            systemActive,
            systemLaunchTime,
            currentUptime,
            featureFlags
        );
    }

    // Contract Address Getters
    function getContractAddresses() external view returns (
        address propertyRegistryAddress,
        address rentAgreementAddress,
        address escrowManagerAddress,
        address paymentProcessorAddress,
        address userRegistryAddress,
        address tokenAddress,
        address stakingAddress,
        address insuranceAddress,
        address marketplaceAddress,
        address analyticsAddress
    ) {
        return (
            address(propertyRegistry),
            address(rentAgreement),
            address(escrowManager),
            address(paymentProcessor),
            address(userRegistry),
            address(rentToken),
            address(stakingRewards),
            address(rentalInsurance),
            address(marketplace),
            address(analytics)
        );
    }

    // Fallback with comprehensive system check
    receive() external payable override {
        require(systemActive, "System not active");
        require(msg.value > 0, "No value sent");
        
        // Convert to tokens or process as payment
        if (featureFlags.stakingEnabled) {
            // Auto-stake or convert
        }
    }
}