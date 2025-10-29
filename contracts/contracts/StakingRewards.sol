// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract StakingRewards {
    IERC20 public stakingToken;
    IERC20 public rewardsToken;
    
    uint256 public constant REWARD_RATE = 100; // 100 tokens per block
    uint256 public constant LOCK_PERIOD = 30 days;
    
    struct Stake {
        uint256 amount;
        uint256 stakedAt;
        uint256 unlockTime;
        uint256 rewardDebt;
    }
    
    mapping(address => Stake) public stakes;
    mapping(address => uint256) public pendingRewards;
    
    uint256 public totalStaked;
    uint256 public lastUpdateBlock;
    uint256 public rewardPerTokenStored;
    
    address public owner;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event EmergencyWithdraw(address indexed user, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateBlock = block.number;
        if (account != address(0)) {
            pendingRewards[account] = earned(account);
        }
        _;
    }

    constructor(address _stakingToken, address _rewardsToken) {
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
        owner = msg.sender;
        lastUpdateBlock = block.number;
    }

    function stake(uint256 amount) external updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        
        Stake storage userStake = stakes[msg.sender];
        if (userStake.amount > 0) {
            pendingRewards[msg.sender] = earned(msg.sender);
        }

        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        userStake.amount += amount;
        userStake.stakedAt = block.timestamp;
        userStake.unlockTime = block.timestamp + LOCK_PERIOD;
        userStake.rewardDebt = userStake.amount * rewardPerTokenStored;
        
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external updateReward(msg.sender) {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount >= amount, "Insufficient staked");
        require(block.timestamp >= userStake.unlockTime, "Tokens locked");

        userStake.amount -= amount;
        totalStaked -= amount;
        
        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit Withdrawn(msg.sender, amount);
    }

    function getReward() external updateReward(msg.sender) {
        uint256 reward = pendingRewards[msg.sender];
        if (reward > 0) {
            pendingRewards[msg.sender] = 0;
            require(rewardsToken.transfer(msg.sender, reward), "Transfer failed");
            emit RewardPaid(msg.sender, reward);
        }
    }

    function emergencyWithdraw() external {
        Stake storage userStake = stakes[msg.sender];
        uint256 amount = userStake.amount;
        
        require(amount > 0, "No stake");
        
        userStake.amount = 0;
        totalStaked -= amount;
        pendingRewards[msg.sender] = 0;
        
        require(stakingToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit EmergencyWithdraw(msg.sender, amount);
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) {
            return rewardPerTokenStored;
        }
        
        uint256 blocksSinceLastUpdate = block.number - lastUpdateBlock;
        uint256 newRewards = blocksSinceLastUpdate * REWARD_RATE;
        
        return rewardPerTokenStored + (newRewards * 1e18) / totalStaked;
    }

    function earned(address account) public view returns (uint256) {
        Stake memory userStake = stakes[account];
        uint256 currentRewardPerToken = rewardPerToken();
        
        return pendingRewards[account] + 
               (userStake.amount * (currentRewardPerToken - userStake.rewardDebt)) / 1e18;
    }

    function getStakeInfo(address account) external view returns (
        uint256 stakedAmount,
        uint256 stakedAt,
        uint256 unlockTime,
        uint256 pendingReward
    ) {
        Stake memory userStake = stakes[account];
        return (
            userStake.amount,
            userStake.stakedAt,
            userStake.unlockTime,
            earned(account)
        );
    }

    function addRewards(uint256 amount) external onlyOwner {
        require(rewardsToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }

    function setRewardRate(uint256 newRate) external onlyOwner {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateBlock = block.number;
        // Note: In production, you'd update the REWARD_RATE through a setter
        // For now, we keep it constant for simplicity
    }
}