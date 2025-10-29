// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract RentChainAnalytics {
    struct PlatformStats {
        uint256 totalProperties;
        uint256 totalRentals;
        uint256 totalVolume;
        uint256 activeUsers;
        uint256 totalRevenue;
        uint256 averageRent;
        uint256 disputeRate;
        uint256 completionRate;
    }

    struct UserStats {
        uint256 propertiesListed;
        uint256 rentalsCompleted;
        uint256 totalSpent;
        uint256 totalEarned;
        uint256 avgRating;
        uint256 disputeCount;
        uint256 successfulRentals;
    }

    struct MarketStats {
        uint256[] rentPrices;
        uint256[] propertyCounts;
        uint256[] locationDistribution;
        uint256 timestamp;
    }

    mapping(address => UserStats) public userStats;
    mapping(uint256 => MarketStats) public marketSnapshots;
    mapping(string => uint256) public locationStats;
    mapping(uint256 => uint256) public rentDistribution;
    
    address public propertyRegistry;
    address public rentAgreement;
    address public admin;
    
    uint256 public nextSnapshotId;
    uint256 public snapshotInterval;
    uint256 public lastSnapshot;

    event UserStatsUpdated(address user, uint256 propertiesListed, uint256 rentalsCompleted);
    event PlatformStatsUpdated(uint256 totalProperties, uint256 totalRentals, uint256 totalVolume);
    event MarketSnapshotTaken(uint256 snapshotId, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address _propertyRegistry, address _rentAgreement) {
        admin = msg.sender;
        propertyRegistry = _propertyRegistry;
        rentAgreement = _rentAgreement;
        snapshotInterval = 1 days;
        lastSnapshot = block.timestamp;
    }

    function updateUserStats(
        address user,
        bool isLandlord,
        uint256 amount,
        bool successful,
        bool hadDispute
    ) external {
        UserStats storage stats = userStats[user];
        
        if (isLandlord) {
            stats.totalEarned += amount;
            if (successful) {
                stats.successfulRentals++;
            }
        } else {
            stats.totalSpent += amount;
        }

        if (hadDispute) {
            stats.disputeCount++;
        }

        stats.rentalsCompleted++;

        emit UserStatsUpdated(user, stats.propertiesListed, stats.rentalsCompleted);
    }

    function updatePropertyStats(address user, string memory location, uint256 rentPrice) external {
        UserStats storage stats = userStats[user];
        stats.propertiesListed++;
        
        locationStats[location]++;
        rentDistribution[rentPrice / 1000]++; // Group by 1000 units

        updatePlatformStats();
    }

    function takeMarketSnapshot() external {
        require(block.timestamp >= lastSnapshot + snapshotInterval, "Too soon");
        
        uint256 snapshotId = nextSnapshotId++;
        MarketStats storage snapshot = marketSnapshots[snapshotId];
        
        snapshot.timestamp = block.timestamp;
        
        // This would be populated with actual data from contracts
        // For now, we use placeholder arrays
        snapshot.rentPrices = new uint256[](10);
        snapshot.propertyCounts = new uint256[](10);
        snapshot.locationDistribution = new uint256[](10);
        
        lastSnapshot = block.timestamp;
        
        emit MarketSnapshotTaken(snapshotId, block.timestamp);
    }

    function updatePlatformStats() internal {
        // This would aggregate stats from all contracts
        // For now, we emit an event with placeholder values
        emit PlatformStatsUpdated(
            getTotalProperties(),
            getTotalRentals(),
            getTotalVolume()
        );
    }

    function getUserAnalytics(address user) external view returns (
        uint256 propertiesListed,
        uint256 rentalsCompleted,
        uint256 totalSpent,
        uint256 totalEarned,
        uint256 disputeRate,
        uint256 successRate,
        uint256 avgTransactionSize
    ) {
        UserStats storage stats = userStats[user];
        
        disputeRate = stats.rentalsCompleted > 0 ? (stats.disputeCount * 10000) / stats.rentalsCompleted : 0;
        successRate = stats.rentalsCompleted > 0 ? (stats.successfulRentals * 10000) / stats.rentalsCompleted : 0;
        avgTransactionSize = stats.rentalsCompleted > 0 ? (stats.totalEarned + stats.totalSpent) / stats.rentalsCompleted : 0;
        
        return (
            stats.propertiesListed,
            stats.rentalsCompleted,
            stats.totalSpent,
            stats.totalEarned,
            disputeRate,
            successRate,
            avgTransactionSize
        );
    }

    function getPlatformAnalytics() external view returns (
        uint256 totalProperties,
        uint256 totalRentals,
        uint256 totalVolume,
        uint256 activeUsers,
        uint256 averageRent,
        uint256 platformDisputeRate
    ) {
        totalProperties = getTotalProperties();
        totalRentals = getTotalRentals();
        totalVolume = getTotalVolume();
        activeUsers = getActiveUsers();
        averageRent = getAverageRent();
        platformDisputeRate = getPlatformDisputeRate();
        
        return (
            totalProperties,
            totalRentals,
            totalVolume,
            activeUsers,
            averageRent,
            platformDisputeRate
        );
    }

    function getMarketInsights() external view returns (
        uint256[] memory popularPriceRanges,
        string[] memory topLocations,
        uint256 marketGrowthRate,
        uint256 userRetentionRate
    ) {
        // This would provide actual market insights
        // For now, return placeholder data
        popularPriceRanges = new uint256[](5);
        topLocations = new string[](5);
        
        return (popularPriceRanges, topLocations, 7500, 8500); // 75% growth, 85% retention
    }

    function getRentDistribution() external view returns (uint256[] memory ranges, uint256[] memory counts) {
        ranges = new uint256[](10);
        counts = new uint256[](10);
        
        for (uint256 i = 0; i < 10; i++) {
            ranges[i] = i * 1000;
            counts[i] = rentDistribution[i];
        }
        
        return (ranges, counts);
    }

    function getLocationDistribution() external view returns (string[] memory locations, uint256[] memory counts) {
        // This would return actual location data
        // For now, return placeholder
        locations = new string[](5);
        counts = new uint256[](5);
        
        return (locations, counts);
    }

    // Placeholder functions - these would interact with actual contracts
    function getTotalProperties() internal view returns (uint256) {
        // This would call PropertyRegistry
        return 0;
    }

    function getTotalRentals() internal view returns (uint256) {
        // This would call RentAgreement
        return 0;
    }

    function getTotalVolume() internal view returns (uint256) {
        // This would aggregate from PaymentProcessor
        return 0;
    }

    function getActiveUsers() internal view returns (uint256) {
        // This would count unique active users
        return 0;
    }

    function getAverageRent() internal view returns (uint256) {
        // This would calculate average rent from properties
        return 0;
    }

    function getPlatformDisputeRate() internal view returns (uint256) {
        // This would calculate dispute rate from DisputeResolution
        return 0;
    }

    function setSnapshotInterval(uint256 interval) external onlyAdmin {
        snapshotInterval = interval;
    }

    function setContractAddresses(address _propertyRegistry, address _rentAgreement) external onlyAdmin {
        propertyRegistry = _propertyRegistry;
        rentAgreement = _rentAgreement;
    }

    function emergencyPause() external onlyAdmin {
        // Emergency pause functionality
        snapshotInterval = type(uint256).max;
    }
}