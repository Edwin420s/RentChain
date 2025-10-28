// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract RentChainSecurity {
    struct SecurityCheck {
        address user;
        uint256 timestamp;
        bool passedKYC;
        bool passedAML;
        bool hasStake;
        uint256 riskScore;
        string checkType;
    }

    struct TransactionLimit {
        uint256 dailyLimit;
        uint256 weeklyLimit;
        uint256 monthlyLimit;
        uint256 dailyUsed;
        uint256 weeklyUsed;
        uint256 monthlyUsed;
        uint256 lastUpdate;
    }

    mapping(address => SecurityCheck[]) public securityChecks;
    mapping(address => TransactionLimit) public transactionLimits;
    mapping(address => uint256) public userRiskScores;
    mapping(address => bool) public blacklisted;
    mapping(address => uint256) public lastActivity;
    
    address public admin;
    address public securityManager;
    uint256 public maxDailyLimit;
    uint256 public maxWeeklyLimit;
    uint256 public maxMonthlyLimit;
    uint256 public minStakeAmount;
    uint256 public cooldownPeriod;

    event SecurityCheckPerformed(address user, bool passed, uint256 riskScore, string checkType);
    Event UserBlacklisted(address user, string reason);
    Event UserWhitelisted(address user);
    Event TransactionLimitUpdated(address user, uint256 daily, uint256 weekly, uint256 monthly);
    Event SuspiciousActivityDetected(address user, string activity, uint256 riskScore);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlySecurityManager() {
        require(msg.sender == securityManager || msg.sender == admin, "Not security manager");
        _;
    }

    modifier notBlacklisted(address user) {
        require(!blacklisted[user], "User blacklisted");
        _;
    }

    constructor() {
        admin = msg.sender;
        securityManager = msg.sender;
        maxDailyLimit = 10000 ether;
        maxWeeklyLimit = 50000 ether;
        maxMonthlyLimit = 200000 ether;
        minStakeAmount = 1000 ether;
        cooldownPeriod = 24 hours;
    }

    function performSecurityCheck(
        address user,
        bool kycPassed,
        bool amlPassed,
        bool hasStake,
        string memory checkType
    ) external onlySecurityManager returns (uint256 riskScore) {
        riskScore = calculateRiskScore(user, kycPassed, amlPassed, hasStake);
        
        securityChecks[user].push(SecurityCheck({
            user: user,
            timestamp: block.timestamp,
            passedKYC: kycPassed,
            passedAML: amlPassed,
            hasStake: hasStake,
            riskScore: riskScore,
            checkType: checkType
        }));

        userRiskScores[user] = riskScore;
        lastActivity[user] = block.timestamp;

        emit SecurityCheckPerformed(user, riskScore < 700, riskScore, checkType);
        return riskScore;
    }

    function calculateRiskScore(
        address user,
        bool kycPassed,
        bool amlPassed,
        bool hasStake
    ) internal view returns (uint256) {
        uint256 score = 500; // Base score

        if (kycPassed) score += 200;
        if (amlPassed) score += 200;
        if (hasStake) score += 100;

        // Reduce score for recent activity (potential fatigue)
        if (lastActivity[user] > block.timestamp - cooldownPeriod) {
            score -= 50;
        }

        // Adjust based on transaction history
        TransactionLimit storage limits = transactionLimits[user];
        uint256 usageRatio = (limits.dailyUsed * 10000) / limits.dailyLimit;
        if (usageRatio > 8000) { // 80% usage
            score -= 100;
        }

        return score > 1000 ? 1000 : score;
    }

    function checkTransactionLimit(
        address user,
        uint256 amount
    ) external view notBlacklisted(user) returns (bool) {
        TransactionLimit storage limits = transactionLimits[user];
        
        // Reset limits if new period
        if (block.timestamp >= limits.lastUpdate + 1 days) {
            return amount <= maxDailyLimit;
        }

        return amount <= limits.dailyLimit - limits.dailyUsed &&
               amount <= limits.weeklyLimit - limits.weeklyUsed &&
               amount <= limits.monthlyLimit - limits.monthlyUsed;
    }

    function updateTransactionUsage(address user, uint256 amount) external {
        TransactionLimit storage limits = transactionLimits[user];
        
        // Reset daily limit if new day
        if (block.timestamp >= limits.lastUpdate + 1 days) {
            limits.dailyUsed = 0;
        }
        // Reset weekly limit if new week
        if (block.timestamp >= limits.lastUpdate + 7 days) {
            limits.weeklyUsed = 0;
        }
        // Reset monthly limit if new month
        if (block.timestamp >= limits.lastUpdate + 30 days) {
            limits.monthlyUsed = 0;
        }

        limits.dailyUsed += amount;
        limits.weeklyUsed += amount;
        limits.monthlyUsed += amount;
        limits.lastUpdate = block.timestamp;
    }

    function setTransactionLimits(
        address user,
        uint256 daily,
        uint256 weekly,
        uint256 monthly
    ) external onlySecurityManager {
        require(daily <= maxDailyLimit, "Daily limit too high");
        require(weekly <= maxWeeklyLimit, "Weekly limit too high");
        require(monthly <= maxMonthlyLimit, "Monthly limit too high");

        transactionLimits[user] = TransactionLimit({
            dailyLimit: daily,
            weeklyLimit: weekly,
            monthlyLimit: monthly,
            dailyUsed: 0,
            weeklyUsed: 0,
            monthlyUsed: 0,
            lastUpdate: block.timestamp
        });

        emit TransactionLimitUpdated(user, daily, weekly, monthly);
    }

    function blacklistUser(address user, string memory reason) external onlySecurityManager {
        blacklisted[user] = true;
        emit UserBlacklisted(user, reason);
    }

    function whitelistUser(address user) external onlySecurityManager {
        blacklisted[user] = false;
        emit UserWhitelisted(user);
    }

    function reportSuspiciousActivity(address user, string memory activity) external {
        uint256 riskScore = userRiskScores[user];
        
        // Increase risk score for reported activity
        userRiskScores[user] = riskScore + 100 > 1000 ? 1000 : riskScore + 100;
        
        emit SuspiciousActivityDetected(user, activity, userRiskScores[user]);
    }

    function getUserSecurityStatus(address user) external view returns (
        uint256 riskScore,
        bool isBlacklisted,
        uint256 lastCheck,
        uint256 transactionCount,
        bool needsRecheck
    ) {
        SecurityCheck[] storage checks = securityChecks[user];
        uint256 lastCheckTime = checks.length > 0 ? checks[checks.length - 1].timestamp : 0;
        bool recheckNeeded = block.timestamp >= lastCheckTime + 90 days; // Recheck every 90 days

        return (
            userRiskScores[user],
            blacklisted[user],
            lastCheckTime,
            checks.length,
            recheckNeeded
        );
    }

    function getTransactionLimits(address user) external view returns (
        uint256 dailyLimit,
        uint256 dailyUsed,
        uint256 weeklyLimit,
        uint256 weeklyUsed,
        uint256 monthlyLimit,
        uint256 monthlyUsed
    ) {
        TransactionLimit storage limits = transactionLimits[user];
        return (
            limits.dailyLimit,
            limits.dailyUsed,
            limits.weeklyLimit,
            limits.weeklyUsed,
            limits.monthlyLimit,
            limits.monthlyUsed
        );
    }

    function setSecurityManager(address newManager) external onlyAdmin {
        securityManager = newManager;
    }

    function setGlobalLimits(
        uint256 daily,
        uint256 weekly,
        uint256 monthly
    ) external onlyAdmin {
        maxDailyLimit = daily;
        maxWeeklyLimit = weekly;
        maxMonthlyLimit = monthly;
    }

    function setCooldownPeriod(uint256 cooldown) external onlyAdmin {
        cooldownPeriod = cooldown;
    }

    function emergencyPauseUser(address user) external onlySecurityManager {
        blacklisted[user] = true;
        userRiskScores[user] = 1000; // Maximum risk
    }

    function withdrawStuckTokens(address token, uint256 amount) external onlyAdmin {
        IERC20(token).transfer(admin, amount);
    }
}