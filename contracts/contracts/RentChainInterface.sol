// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./RentChainConstants.sol";

interface IRentChain {
    // Core System Functions
    function registerUser(
        string memory name,
        string memory email,
        string memory phone,
        string memory ipfsHash
    ) external returns (bool);

    function registerProperty(
        string memory title,
        uint256 price,
        string memory location,
        string memory ipfsHash
    ) external returns (uint256);

    function createRentalAgreement(
        uint256 propertyId,
        address tenant,
        uint256 rentAmount,
        uint256 securityDeposit,
        uint256 startDate,
        uint256 endDate,
        address paymentToken,
        uint256 insuranceCoverage
    ) external returns (uint256);

    function payRent(uint256 agreementId, uint256 amount) external;

    // System Management
    function toggleFeature(string memory feature, bool enabled) external;
    function upgradeSystem(uint256 newVersion, string memory description) external;
    function emergencyShutdown(string memory reason) external;
    function resumeSystem() external;

    // User Functions
    function upgradeToPremium(uint256 planId) external;
    function stakeTokens(uint256 amount) external;
    function syncUserCrossChain(uint256 targetChain, address user) external returns (bytes32);

    // View Functions
    function getSystemStats() external view returns (
        uint256 properties,
        uint256 agreements,
        uint256 users,
        uint256 volume,
        uint256 activeUsers,
        uint256 platformRevenue,
        uint256 averageRent
    );

    function getUserDashboard(address user) external view returns (
        bool isVerified,
        uint256 propertiesListed,
        uint256 activeAgreements,
        uint256 totalEarned,
        uint256 totalSpent,
        uint256 reputationScore,
        bool hasActiveSubscription,
        uint256 pendingRewards
    );

    function getSystemInfo() external view returns (
        address systemAdmin,
        uint256 systemVersion,
        bool isSystemActive,
        uint256 launchTime,
        uint256 uptime,
        RentChainConstants.FeatureFlags memory features
    );

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
    );
}

interface IRentChainEmergency {
    function pauseSystem(
        bool pauseWithdrawals,
        bool pauseRegistrations,
        bool pausePayments,
        uint256 duration,
        string memory reason
    ) external;

    function resumeSystem() external;
    function emergencyPauseAll() external;
    function requestEmergencyWithdrawal(address token, uint256 amount) external returns (bytes32);
    function getEmergencyStatus() external view returns (
        bool systemPaused,
        bool withdrawalsPaused,
        bool registrationsPaused,
        bool paymentsPaused,
        uint256 pauseStartTime,
        uint256 pauseDuration,
        string memory pauseReason,
        uint256 timeUntilResume
    );
}

interface IRentChainDeployer {
    function deployRentChainSystem() external;
    function upgradeSystem(address newMainContract) external;
    function verifySystem() external view returns (bool systemHealthy, string memory issues);
    function getDeploymentInfo() external view returns (
        address deployerAddress,
        uint256 deployTime,
        bool isDeployed,
        address mainContract,
        address emergencySystem,
        address treasuryWallet,
        address developmentWallet,
        address marketingWallet
    );
}