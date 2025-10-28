// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./RentChainBase.sol";
import "./RentChainConstants.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract RentChainRewardsEngine is RentChainBase {
    struct RewardTier {
        string name;
        uint256 minStake;
        uint256 multiplier; // in basis points (10000 = 1x)
        uint256 bonusRate; // additional rewards in basis points
        bool active;
    }

    struct UserRewards {
        uint256 totalEarned;
        uint256 pendingRewards;
        uint256 lastClaim;
        uint256 currentTier;
        uint256 stakeAmount;
        uint256 referralRewards;
        uint256 activityRewards;
        uint256 loyaltyBonus;
    }

    struct RewardActivity {
        string activityType;
        uint256 points;
        uint256 multiplier;
        uint256 cooldown;
    }

    mapping(address => UserRewards) public userRewards;
    mapping(uint256 => RewardTier) public rewardTiers;
    mapping(string => RewardActivity) public rewardActivities;
    mapping(address => mapping(string => uint256)) public lastActivityTime;
    
    address public rewardsToken;
    address public rewardsTreasury;
    uint256 public nextTierId;
    uint256 public totalRewardsDistributed;
    uint256 public constant BASE_REWARD_RATE = 100; // 1% base rate

    event RewardsEarned(address user, string activity, uint256 amount);
    event RewardsClaimed(address user, uint256 amount);
    event TierUpdated(uint256 tierId, string name, uint256 minStake, uint256 multiplier);
    event ActivityRegistered(string activityType, uint256 points, uint256 multiplier);
    event LoyaltyBonusApplied(address user, uint256 bonusAmount);

    modifier onlyRewardsManager() {
        require(msg.sender == admin || msg.sender == rewardsTreasury, "Not rewards manager");
        _;
    }

    constructor(address _emergencySystem, address _rewardsToken) RentChainBase(_emergencySystem) {
        rewardsToken = _rewardsToken;
        rewardsTreasury = msg.sender;
        
        _initializeDefaultTiers();
        _initializeDefaultActivities();
    }

    function _initializeDefaultTiers() internal {
        addRewardTier("Bronze", 0, 10000, 0); // 1x
        addRewardTier("Silver", 1000 * 10**18, 12000, 500); // 1.2x + 0.5%
        addRewardTier("Gold", 5000 * 10**18, 15000, 1000); // 1.5x + 1%
        addRewardTier("Platinum", 10000 * 10**18, 20000, 2000); // 2x + 2%
    }

    function _initializeDefaultActivities() internal {
        registerActivity("property_listing", 100, 10000, 1 days);
        registerActivity("rent_payment", 50, 10000, 1 days);
        registerActivity("agreement_completion", 200, 10000, 7 days);
        registerActivity("review_submission", 25, 10000, 1 days);
        registerActivity("referral_success", 500, 10000, 0);
        registerActivity("dispute_resolution", 100, 10000, 30 days);
    }

    function recordActivity(
        address user,
        string memory activityType,
        uint256 baseAmount
    ) external onlyRewardsManager whenNotPaused whenInitialized {
        RewardActivity storage activity = rewardActivities[activityType];
        require(activity.points > 0, "Activity not registered");

        // Check cooldown
        if (activity.cooldown > 0) {
            require(
                block.timestamp >= lastActivityTime[user][activityType] + activity.cooldown,
                "Activity on cooldown"
            );
        }

        UserRewards storage userReward = userRewards[user];
        RewardTier storage tier = rewardTiers[userReward.currentTier];

        // Calculate rewards
        uint256 activityReward = (baseAmount * activity.points * activity.multiplier) / 10000;
        uint256 tierBonus = (activityReward * tier.multiplier) / 10000;
        uint256 totalReward = activityReward + tierBonus;

        // Apply bonus rate if any
        if (tier.bonusRate > 0) {
            uint256 bonus = (totalReward * tier.bonusRate) / 10000;
            totalReward += bonus;
            userReward.loyaltyBonus += bonus;
            emit LoyaltyBonusApplied(user, bonus);
        }

        // Update user rewards
        userReward.pendingRewards += totalReward;
        userReward.totalEarned += totalReward;
        
        if (stringsEqual(activityType, "referral_success")) {
            userReward.referralRewards += totalReward;
        } else {
            userReward.activityRewards += totalReward;
        }

        lastActivityTime[user][activityType] = block.timestamp;

        emit RewardsEarned(user, activityType, totalReward);
    }

    function claimRewards() external whenNotPaused whenInitialized {
        UserRewards storage userReward = userRewards[msg.sender];
        uint256 pending = userReward.pendingRewards;
        require(pending > 0, "No rewards to claim");

        userReward.pendingRewards = 0;
        userReward.lastClaim = block.timestamp;
        totalRewardsDistributed += pending;

        require(IERC20(rewardsToken).transfer(msg.sender, pending), "Transfer failed");

        emit RewardsClaimed(msg.sender, pending);
    }

    function updateStakeTier(address user, uint256 stakeAmount) external onlyRewardsManager {
        UserRewards storage userReward = userRewards[user];
        userReward.stakeAmount = stakeAmount;

        // Find appropriate tier
        uint256 newTier = 0; // Bronze by default
        for (uint256 i = nextTierId - 1; i > 0; i--) {
            if (stakeAmount >= rewardTiers[i].minStake && rewardTiers[i].active) {
                newTier = i;
                break;
            }
        }

        userReward.currentTier = newTier;
    }

    function addRewardTier(
        string memory name,
        uint256 minStake,
        uint256 multiplier,
        uint256 bonusRate
    ) public onlyRewardsManager returns (uint256) {
        uint256 tierId = nextTierId++;
        rewardTiers[tierId] = RewardTier({
            name: name,
            minStake: minStake,
            multiplier: multiplier,
            bonusRate: bonusRate,
            active: true
        });

        emit TierUpdated(tierId, name, minStake, multiplier);
        return tierId;
    }

    function registerActivity(
        string memory activityType,
        uint256 points,
        uint256 multiplier,
        uint256 cooldown
    ) public onlyRewardsManager {
        rewardActivities[activityType] = RewardActivity({
            activityType: activityType,
            points: points,
            multiplier: multiplier,
            cooldown: cooldown
        });

        emit ActivityRegistered(activityType, points, multiplier);
    }

    function calculateProjectedRewards(
        address user,
        string memory activityType,
        uint256 baseAmount
    ) external view returns (uint256 projectedRewards) {
        UserRewards storage userReward = userRewards[user];
        RewardActivity storage activity = rewardActivities[activityType];
        RewardTier storage tier = rewardTiers[userReward.currentTier];

        if (activity.points == 0) return 0;

        uint256 activityReward = (baseAmount * activity.points * activity.multiplier) / 10000;
        uint256 tierBonus = (activityReward * tier.multiplier) / 10000;
        uint256 totalReward = activityReward + tierBonus;

        if (tier.bonusRate > 0) {
            totalReward += (totalReward * tier.bonusRate) / 10000;
        }

        return totalReward;
    }

    function getUserRewardsInfo(address user) external view returns (
        uint256 totalEarned,
        uint256 pendingRewards,
        uint256 lastClaim,
        uint256 currentTier,
        uint256 stakeAmount,
        uint256 referralRewards,
        uint256 activityRewards,
        uint256 loyaltyBonus,
        string memory tierName
    ) {
        UserRewards storage userReward = userRewards[user];
        RewardTier storage tier = rewardTiers[userReward.currentTier];

        return (
            userReward.totalEarned,
            userReward.pendingRewards,
            userReward.lastClaim,
            userReward.currentTier,
            userReward.stakeAmount,
            userReward.referralRewards,
            userReward.activityRewards,
            userReward.loyaltyBonus,
            tier.name
        );
    }

    function getTierInfo(uint256 tierId) external view returns (
        string memory name,
        uint256 minStake,
        uint256 multiplier,
        uint256 bonusRate,
        bool active
    ) {
        RewardTier storage tier = rewardTiers[tierId];
        return (tier.name, tier.minStake, tier.multiplier, tier.bonusRate, tier.active);
    }

    function getActivityInfo(string memory activityType) external view returns (
        uint256 points,
        uint256 multiplier,
        uint256 cooldown
    ) {
        RewardActivity storage activity = rewardActivities[activityType];
        return (activity.points, activity.multiplier, activity.cooldown);
    }

    function batchRecordActivities(
        address[] calldata users,
        string[] calldata activityTypes,
        uint256[] calldata baseAmounts
    ) external onlyRewardsManager {
        require(users.length == activityTypes.length, "Invalid input");
        require(users.length == baseAmounts.length, "Invalid input");

        for (uint256 i = 0; i < users.length; i++) {
            recordActivity(users[i], activityTypes[i], baseAmounts[i]);
        }
    }

    function setRewardsToken(address newToken) external onlyAdmin {
        rewardsToken = newToken;
    }

    function setRewardsTreasury(address newTreasury) external onlyAdmin {
        rewardsTreasury = newTreasury;
    }

    function toggleTierActive(uint256 tierId, bool active) external onlyRewardsManager {
        rewardTiers[tierId].active = active;
    }

    function updateActivityPoints(
        string memory activityType,
        uint256 newPoints,
        uint256 newMultiplier
    ) external onlyRewardsManager {
        rewardActivities[activityType].points = newPoints;
        rewardActivities[activityType].multiplier = newMultiplier;
    }

    function emergencyRewardDistribution(
        address[] calldata users,
        uint256[] calldata amounts
    ) external onlyAdmin {
        require(isSystemPaused(), "System not paused");
        require(users.length == amounts.length, "Invalid input");

        for (uint256 i = 0; i < users.length; i++) {
            if (amounts[i] > 0) {
                userRewards[users[i]].pendingRewards += amounts[i];
                userRewards[users[i]].totalEarned += amounts[i];
                totalRewardsDistributed += amounts[i];
                emit RewardsEarned(users[i], "emergency_distribution", amounts[i]);
            }
        }
    }

    function getPlatformRewardsStats() external view returns (
        uint256 totalDistributed,
        uint256 activeUsers,
        uint256 totalTiers,
        uint256 totalActivities
    ) {
        uint256 userCount = 0;
        // This would count active users with rewards
        return (totalRewardsDistributed, userCount, nextTierId, _countActivities());
    }

    function _countActivities() internal view returns (uint256) {
        // Count registered activities
        string[6] memory activities = [
            "property_listing",
            "rent_payment", 
            "agreement_completion",
            "review_submission",
            "referral_success",
            "dispute_resolution"
        ];
        
        uint256 count = 0;
        for (uint256 i = 0; i < activities.length; i++) {
            if (rewardActivities[activities[i]].points > 0) {
                count++;
            }
        }
        return count;
    }

    function stringsEqual(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}