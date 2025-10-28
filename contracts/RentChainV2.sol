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

contract RentChainV2 {
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
    
    address public admin;
    uint256 public platformFee;
    bool public initialized;
    
    mapping(address => uint256) public userRewards;
    mapping(address => bool) public premiumUsers;

    event SystemInitialized(address indexed initiator);
    event PremiumUserUpgraded(address indexed user, uint256 feePaid);
    event RewardClaimed(address indexed user, uint256 amount);
    event PlatformFeeDistributed(uint256 totalDistributed);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier whenInitialized() {
        require(initialized, "System not initialized");
        _;
    }

    constructor() {
        admin = msg.sender;
        platformFee = 25; // 0.25%
    }

    function initializeSystem(
        address _propertyRegistry,
        address _rentAgreement,
        address _escrowManager,
        address _paymentProcessor,
        address _userRegistry,
        address _disputeResolution,
        address _reviewSystem,
        address _rentToken
    ) external onlyAdmin {
        require(!initialized, "Already initialized");

        propertyRegistry = PropertyRegistry(_propertyRegistry);
        rentAgreement = RentAgreement(_rentAgreement);
        escrowManager = EscrowManager(_escrowManager);
        paymentProcessor = PaymentProcessor(_paymentProcessor);
        userRegistry = UserRegistry(_userRegistry);
        disputeResolution = DisputeResolution(_disputeResolution);
        reviewSystem = ReviewSystem(_reviewSystem);
        rentToken = RentChainToken(_rentToken);

        stakingRewards = new StakingRewards(_rentToken, _rentToken);
        rentalInsurance = new RentalInsurance(_rentToken);

        initialized = true;
        emit SystemInitialized(msg.sender);
    }

    function upgradeToPremium() external whenInitialized {
        require(!premiumUsers[msg.sender], "Already premium");
        
        uint256 upgradeFee = 100 * 10**18; // 100 RENT tokens
        require(rentToken.transferFrom(msg.sender, address(this), upgradeFee), "Payment failed");
        
        premiumUsers[msg.sender] = true;
        
        emit PremiumUserUpgraded(msg.sender, upgradeFee);
    }

    function registerPropertyWithReward(
        string memory title,
        uint256 price,
        string memory location,
        string memory ipfsHash
    ) external whenInitialized returns (uint256) {
        require(userRegistry.isUserVerified(msg.sender), "User not verified");
        
        uint256 propertyId = propertyRegistry.registerProperty(title, price, location, ipfsHash);
        
        if (premiumUsers[msg.sender]) {
            userRewards[msg.sender] += 10 * 10**18; // 10 RENT tokens reward
        } else {
            userRewards[msg.sender] += 5 * 10**18; // 5 RENT tokens reward
        }
        
        return propertyId;
    }

    function createRentalWithInsurance(
        uint256 propertyId,
        address tenant,
        uint256 rentAmount,
        uint256 securityDeposit,
        uint256 startDate,
        uint256 endDate,
        address paymentToken,
        uint256 insuranceCoverage
    ) external whenInitialized returns (uint256 agreementId, uint256 policyId) {
        require(userRegistry.isUserVerified(tenant), "Tenant not verified");
        
        agreementId = rentAgreement.createAgreement(
            propertyId,
            tenant,
            rentAmount,
            securityDeposit,
            startDate,
            endDate,
            paymentToken
        );

        if (insuranceCoverage > 0) {
            policyId = rentalInsurance.createPolicy(
                agreementId,
                tenant,
                msg.sender,
                insuranceCoverage
            );
            
            userRewards[msg.sender] += 2 * 10**18; // 2 RENT tokens reward
            userRewards[tenant] += 2 * 10**18; // 2 RENT tokens reward
        }
        
        return (agreementId, policyId);
    }

    function stakeTokens(uint256 amount) external whenInitialized {
        require(rentToken.transferFrom(msg.sender, address(stakingRewards), amount), "Transfer failed");
        stakingRewards.stake(amount);
    }

    function claimRewards() external whenInitialized {
        uint256 rewards = userRewards[msg.sender];
        require(rewards > 0, "No rewards to claim");
        
        userRewards[msg.sender] = 0;
        require(rentToken.transfer(msg.sender, rewards), "Transfer failed");
        
        emit RewardClaimed(msg.sender, rewards);
    }

    function distributePlatformFees() external onlyAdmin whenInitialized {
        uint256 balance = rentToken.balanceOf(address(this));
        require(balance > 0, "No fees to distribute");

        uint256 stakingReward = (balance * 40) / 100; // 40% to staking rewards
        uint256 insurancePool = (balance * 30) / 100; // 30% to insurance pool
        uint256 development = (balance * 20) / 100; // 20% to development
        uint256 community = balance - stakingReward - insurancePool - development; // 10% to community

        rentToken.transfer(address(stakingRewards), stakingReward);
        rentToken.transfer(address(rentalInsurance), insurancePool);
        rentToken.transfer(admin, development);
        
        // Community rewards would be distributed through governance
        rentToken.transfer(address(this), community);

        emit PlatformFeeDistributed(balance);
    }

    function getSystemStats() external view whenInitialized returns (
        uint256 totalProperties,
        uint256 totalAgreements,
        uint256 totalUsers,
        uint256 totalStaked,
        uint256 totalInsurancePolicies,
        uint256 totalRewardsDistributed
    ) {
        totalProperties = propertyRegistry.nextPropertyId();
        totalAgreements = rentAgreement.nextAgreementId();
        totalStaked = stakingRewards.totalStaked();
        totalInsurancePolicies = rentalInsurance.nextPolicyId();
        
        // Note: These would need to be tracked separately
        totalUsers = 0;
        totalRewardsDistributed = 0;
    }

    function getUserStats(address user) external view whenInitialized returns (
        uint256 propertyCount,
        uint256 agreementCount,
        uint256 totalStaked,
        uint256 pendingRewards,
        uint256 userRating,
        bool isPremium
    ) {
        propertyCount = propertyRegistry.getOwnerProperties(user).length;
        agreementCount = rentAgreement.getLandlordAgreements(user).length + 
                         rentAgreement.getTenantAgreements(user).length;
        totalStaked = stakingRewards.stakes(user).amount;
        pendingRewards = userRewards[user] + stakingRewards.earned(user);
        userRating = reviewSystem.calculateAverageRating(user);
        isPremium = premiumUsers[user];
    }

    function setPlatformFee(uint256 newFee) external onlyAdmin {
        require(newFee <= 100, "Fee too high"); // Max 1%
        platformFee = newFee;
    }

    function emergencyPause() external onlyAdmin {
        initialized = false;
    }

    function emergencyResume() external onlyAdmin {
        initialized = true;
    }
}