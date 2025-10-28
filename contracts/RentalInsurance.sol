// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract RentalInsurance {
    struct InsurancePolicy {
        uint256 agreementId;
        address tenant;
        address landlord;
        uint256 premium;
        uint256 coverageAmount;
        uint256 startDate;
        uint256 endDate;
        bool isActive;
        bool claimSubmitted;
        bool claimApproved;
        uint256 claimAmount;
    }

    mapping(uint256 => InsurancePolicy) public policies;
    mapping(address => uint256[]) public userPolicies;
    
    uint256 public nextPolicyId;
    uint256 public constant PREMIUM_RATE = 5; // 5% of coverage amount
    uint256 public constant MAX_COVERAGE = 10000 * 10**18;
    
    IERC20 public paymentToken;
    address public insurer;
    address public admin;

    event PolicyCreated(uint256 indexed policyId, uint256 indexed agreementId, address tenant, uint256 coverage);
    event PremiumPaid(uint256 indexed policyId, uint256 amount);
    event ClaimSubmitted(uint256 indexed policyId, uint256 amount);
    event ClaimApproved(uint256 indexed policyId, uint256 payout);
    event ClaimDenied(uint256 indexed policyId);
    event PolicyCancelled(uint256 indexed policyId);

    modifier onlyInsurer() {
        require(msg.sender == insurer, "Not insurer");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address _paymentToken) {
        paymentToken = IERC20(_paymentToken);
        admin = msg.sender;
        insurer = msg.sender;
    }

    function createPolicy(
        uint256 agreementId,
        address tenant,
        address landlord,
        uint256 coverageAmount
    ) external returns (uint256) {
        require(coverageAmount <= MAX_COVERAGE, "Coverage too high");
        
        uint256 premium = (coverageAmount * PREMIUM_RATE) / 100;
        
        uint256 policyId = nextPolicyId++;
        policies[policyId] = InsurancePolicy({
            agreementId: agreementId,
            tenant: tenant,
            landlord: landlord,
            premium: premium,
            coverageAmount: coverageAmount,
            startDate: block.timestamp,
            endDate: block.timestamp + 365 days, // 1 year policy
            isActive: false,
            claimSubmitted: false,
            claimApproved: false,
            claimAmount: 0
        });

        userPolicies[tenant].push(policyId);
        userPolicies[landlord].push(policyId);

        emit PolicyCreated(policyId, agreementId, tenant, coverageAmount);
        return policyId;
    }

    function payPremium(uint256 policyId) external {
        InsurancePolicy storage policy = policies[policyId];
        require(msg.sender == policy.tenant, "Only tenant can pay premium");
        require(!policy.isActive, "Policy already active");
        require(block.timestamp < policy.endDate, "Policy expired");

        require(paymentToken.transferFrom(msg.sender, address(this), policy.premium), "Payment failed");
        
        policy.isActive = true;
        policy.startDate = block.timestamp;
        policy.endDate = block.timestamp + 365 days;

        emit PremiumPaid(policyId, policy.premium);
    }

    function submitClaim(uint256 policyId, uint256 claimAmount, string memory reason) external {
        InsurancePolicy storage policy = policies[policyId];
        require(policy.isActive, "Policy not active");
        require(msg.sender == policy.tenant || msg.sender == policy.landlord, "Not policy holder");
        require(!policy.claimSubmitted, "Claim already submitted");
        require(claimAmount <= policy.coverageAmount, "Claim exceeds coverage");
        require(block.timestamp <= policy.endDate, "Policy expired");

        policy.claimSubmitted = true;
        policy.claimAmount = claimAmount;

        emit ClaimSubmitted(policyId, claimAmount);
    }

    function approveClaim(uint256 policyId) external onlyInsurer {
        InsurancePolicy storage policy = policies[policyId];
        require(policy.claimSubmitted, "No claim submitted");
        require(!policy.claimApproved, "Claim already approved");

        policy.claimApproved = true;
        policy.isActive = false;

        uint256 payout = policy.claimAmount;
        require(paymentToken.transfer(policy.tenant, payout), "Payout failed");

        emit ClaimApproved(policyId, payout);
    }

    function denyClaim(uint256 policyId) external onlyInsurer {
        InsurancePolicy storage policy = policies[policyId];
        require(policy.claimSubmitted, "No claim submitted");
        require(!policy.claimApproved, "Claim already approved");

        policy.claimSubmitted = false;
        policy.claimAmount = 0;

        emit ClaimDenied(policyId);
    }

    function cancelPolicy(uint256 policyId) external {
        InsurancePolicy storage policy = policies[policyId];
        require(msg.sender == policy.tenant, "Only tenant can cancel");
        require(policy.isActive, "Policy not active");
        require(!policy.claimSubmitted, "Claim pending");

        policy.isActive = false;

        // Refund unused premium (pro-rated)
        uint256 daysUsed = (block.timestamp - policy.startDate) / 1 days;
        uint256 refundAmount = (policy.premium * (365 - daysUsed)) / 365;
        
        if (refundAmount > 0) {
            require(paymentToken.transfer(policy.tenant, refundAmount), "Refund failed");
        }

        emit PolicyCancelled(policyId);
    }

    function getUserPolicies(address user) external view returns (uint256[] memory) {
        return userPolicies[user];
    }

    function getActivePolicies() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextPolicyId; i++) {
            if (policies[i].isActive) {
                count++;
            }
        }
        
        uint256[] memory activePolicies = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextPolicyId; i++) {
            if (policies[i].isActive) {
                activePolicies[index] = i;
                index++;
            }
        }
        
        return activePolicies;
    }

    function setInsurer(address newInsurer) external onlyAdmin {
        insurer = newInsurer;
    }

    function withdrawFees(uint256 amount) external onlyAdmin {
        require(paymentToken.transfer(admin, amount), "Transfer failed");
    }
}