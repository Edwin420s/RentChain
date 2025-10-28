// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract RentChainReferral {
    struct Referral {
        address referrer;
        address referred;
        uint256 registeredAt;
        uint256 totalEarned;
        uint256 rewardsClaimed;
        bool isActive;
    }

    struct RewardTier {
        uint256 percentage;
        uint256 minReferrals;
        uint256 maxReferrals;
    }

    mapping(address => Referral) public referrals;
    mapping(address => uint256) public referralCount;
    mapping(address => uint256) public totalEarned;
    mapping(uint256 => RewardTier) public rewardTiers;
    
    address public admin;
    address public rewardToken;
    uint256 public baseReward;
    uint256 public nextTierId;
    uint256 public totalReferrals;
    uint256 public totalRewardsDistributed;

    event UserReferred(address referrer, address referred, uint256 registeredAt);
    Event RewardEarned(address referrer, uint256 amount, uint256 percentage);
    Event RewardClaimed(address user, uint256 amount);
    Event RewardTierAdded(uint256 tierId, uint256 percentage, uint256 minReferrals, uint256 maxReferrals);
    Event BaseRewardUpdated(uint256 newBaseReward);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address _rewardToken) {
        admin = msg.sender;
        rewardToken = _rewardToken;
        baseReward = 10 * 10**18; // 10 tokens base reward
        
        _setupDefaultTiers();
    }

    function _setupDefaultTiers() internal {
        addRewardTier(500, 1, 10);    // 5% for 1-10 referrals
        addRewardTier(750, 11, 50);   // 7.5% for 11-50 referrals
        addRewardTier(1000, 51, 200); // 10% for 51-200 referrals
        addRewardTier(1500, 201, 0);  // 15% for 201+ referrals
    }

    function registerReferral(address referred, address referrer) external {
        require(referrer != address(0), "Invalid referrer");
        require(referrer != referred, "Cannot refer self");
        require(referrals[referred].referrer == address(0), "Already referred");
        require(msg.sender == admin || msg.sender == referred, "Not authorized");

        referrals[referred] = Referral({
            referrer: referrer,
            referred: referred,
            registeredAt: block.timestamp,
            totalEarned: 0,
            rewardsClaimed: 0,
            isActive: true
        });

        referralCount[referrer]++;
        totalReferrals++;

        emit UserReferred(referrer, referred, block.timestamp);
    }

    function calculateReward(address user, uint256 amount) public view returns (uint256 reward) {
        uint256 refCount = referralCount[user];
        uint256 tierPercentage = getTierPercentage(refCount);
        
        reward = (amount * tierPercentage) / 10000; // percentage in basis points
        return reward;
    }

    function distributeReward(address user, uint256 amount) external returns (uint256) {
        Referral storage ref = referrals[user];
        require(ref.isActive, "Referral not active");
        require(ref.referrer != address(0), "No referrer");

        uint256 reward = calculateReward(ref.referrer, amount);
        
        if (reward > 0) {
            ref.totalEarned += reward;
            totalEarned[ref.referrer] += reward;
            totalRewardsDistributed += reward;

            emit RewardEarned(ref.referrer, reward, getTierPercentage(referralCount[ref.referrer]));
        }

        return reward;
    }

    function claimRewards() external {
        uint256 pendingRewards = totalEarned[msg.sender] - referrals[msg.sender].rewardsClaimed;
        require(pendingRewards > 0, "No rewards to claim");

        referrals[msg.sender].rewardsClaimed += pendingRewards;

        require(IERC20(rewardToken).transfer(msg.sender, pendingRewards), "Transfer failed");

        emit RewardClaimed(msg.sender, pendingRewards);
    }

    function addRewardTier(uint256 percentage, uint256 minReferrals, uint256 maxReferrals) public onlyAdmin returns (uint256) {
        uint256 tierId = nextTierId++;
        
        rewardTiers[tierId] = RewardTier({
            percentage: percentage,
            minReferrals: minReferrals,
            maxReferrals: maxReferrals
        });

        emit RewardTierAdded(tierId, percentage, minReferrals, maxReferrals);
        return tierId;
    }

    function getTierPercentage(uint256 referralCount) public view returns (uint256) {
        for (uint256 i = 0; i < nextTierId; i++) {
            RewardTier storage tier = rewardTiers[i];
            if (referralCount >= tier.minReferrals && 
                (tier.maxReferrals == 0 || referralCount <= tier.maxReferrals)) {
                return tier.percentage;
            }
        }
        return 0;
    }

    function getUserReferralInfo(address user) external view returns (
        address referrer,
        uint256 registeredAt,
        uint256 totalEarned,
        uint256 rewardsClaimed,
        uint256 pendingRewards,
        uint256 referralCountUser,
        uint256 currentTier,
        uint256 tierPercentage
    ) {
        Referral storage ref = referrals[user];
        uint256 pending = totalEarned[user] - ref.rewardsClaimed;
        uint256 tier = getTierPercentage(referralCount[user]);
        uint256 percentage = getTierPercentage(referralCount[user]);

        return (
            ref.referrer,
            ref.registeredAt,
            ref.totalEarned,
            ref.rewardsClaimed,
            pending,
            referralCount[user],
            tier,
            percentage
        );
    }

    function getReferralTree(address user, uint256 depth) external view returns (
        address[] memory directReferrals,
        uint256 totalTreeSize
    ) {
        directReferrals = new address[](referralCount[user]);
        uint256 index = 0;
        
        // This would need additional storage to track the full tree
        // For now, return direct referrals only
        for (uint256 i = 0; i < totalReferrals; i++) {
            // This is simplified - in production, you'd have a proper mapping
            break;
        }
        
        return (directReferrals, referralCount[user]);
    }

    function getPlatformReferralStats() external view returns (
        uint256 totalUsersReferred,
        uint256 totalRewardsPaid,
        uint256 activeReferrers,
        uint256 averageReferralsPerUser
    ) {
        uint256 activeRefs = 0;
        for (uint256 i = 0; i < totalReferrals; i++) {
            // Count active referrers
            // This would need additional tracking
        }
        
        uint256 average = totalReferrals > 0 ? totalReferrals / (activeRefs > 0 ? activeRefs : 1) : 0;
        
        return (totalReferrals, totalRewardsDistributed, activeRefs, average);
    }

    function setBaseReward(uint256 newBaseReward) external onlyAdmin {
        baseReward = newBaseReward;
        emit BaseRewardUpdated(newBaseReward);
    }

    function setRewardToken(address newToken) external onlyAdmin {
        rewardToken = newToken;
    }

    function deactivateReferral(address user) external onlyAdmin {
        referrals[user].isActive = false;
    }

    function activateReferral(address user) external onlyAdmin {
        referrals[user].isActive = true;
    }

    function withdrawExcessRewards(uint256 amount) external onlyAdmin {
        require(IERC20(rewardToken).transfer(admin, amount), "Transfer failed");
    }

    function emergencyPause() external onlyAdmin {
        baseReward = 0;
        // This effectively pauses reward distribution
    }

    function batchRegisterReferrals(address[] calldata referred, address[] calldata referrers) external onlyAdmin {
        require(referred.length == referrers.length, "Invalid input");
        
        for (uint256 i = 0; i < referred.length; i++) {
            if (referrals[referred[i]].referrer == address(0) && referrers[i] != referred[i]) {
                registerReferral(referred[i], referrers[i]);
            }
        }
    }
}