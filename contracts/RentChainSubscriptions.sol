// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract RentChainSubscriptions {
    struct SubscriptionPlan {
        string name;
        uint256 price;
        uint256 duration;
        uint256 maxProperties;
        uint256 maxTenants;
        bool isActive;
        uint256 totalSubscribers;
    }

    struct UserSubscription {
        uint256 planId;
        uint256 startDate;
        uint256 endDate;
        bool isActive;
        uint256 propertiesUsed;
        uint256 tenantsManaged;
    }

    mapping(uint256 => SubscriptionPlan) public subscriptionPlans;
    mapping(address => UserSubscription) public userSubscriptions;
    mapping(address => uint256) public userPayments;
    
    address public admin;
    address public paymentToken;
    uint256 public nextPlanId;
    uint256 public totalRevenue;

    event SubscriptionPlanCreated(uint256 planId, string name, uint256 price, uint256 duration);
    event SubscriptionPlanUpdated(uint256 planId, uint256 price, uint256 duration);
    event UserSubscribed(address user, uint256 planId, uint256 startDate, uint256 endDate);
    event UserUnsubscribed(address user);
    event SubscriptionRenewed(address user, uint256 planId, uint256 newEndDate);
    event PaymentProcessed(address user, uint256 amount, uint256 planId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier planExists(uint256 planId) {
        require(planId < nextPlanId, "Plan not found");
        _;
    }

    constructor(address _paymentToken) {
        admin = msg.sender;
        paymentToken = _paymentToken;
        
        _createDefaultPlans();
    }

    function _createDefaultPlans() internal {
        createSubscriptionPlan("Basic", 10 * 10**18, 30 days, 5, 10);
        createSubscriptionPlan("Professional", 50 * 10**18, 30 days, 50, 100);
        createSubscriptionPlan("Enterprise", 200 * 10**18, 30 days, 500, 1000);
    }

    function createSubscriptionPlan(
        string memory name,
        uint256 price,
        uint256 duration,
        uint256 maxProperties,
        uint256 maxTenants
    ) public onlyAdmin returns (uint256) {
        uint256 planId = nextPlanId++;
        
        subscriptionPlans[planId] = SubscriptionPlan({
            name: name,
            price: price,
            duration: duration,
            maxProperties: maxProperties,
            maxTenants: maxTenants,
            isActive: true,
            totalSubscribers: 0
        });

        emit SubscriptionPlanCreated(planId, name, price, duration);
        return planId;
    }

    function subscribe(uint256 planId) external planExists(planId) {
        SubscriptionPlan storage plan = subscriptionPlans[planId];
        require(plan.isActive, "Plan not active");
        
        UserSubscription storage userSub = userSubscriptions[msg.sender];
        require(!userSub.isActive || block.timestamp >= userSub.endDate, "Active subscription exists");

        require(IERC20(paymentToken).transferFrom(msg.sender, address(this), plan.price), "Payment failed");

        userSub.planId = planId;
        userSub.startDate = block.timestamp;
        userSub.endDate = block.timestamp + plan.duration;
        userSub.isActive = true;
        userSub.propertiesUsed = 0;
        userSub.tenantsManaged = 0;

        userPayments[msg.sender] += plan.price;
        totalRevenue += plan.price;
        plan.totalSubscribers++;

        emit UserSubscribed(msg.sender, planId, block.timestamp, userSub.endDate);
        emit PaymentProcessed(msg.sender, plan.price, planId);
    }

    function renewSubscription() external {
        UserSubscription storage userSub = userSubscriptions[msg.sender];
        require(userSub.isActive, "No active subscription");
        require(block.timestamp >= userSub.endDate - 7 days, "Too early to renew");

        SubscriptionPlan storage plan = subscriptionPlans[userSub.planId];
        require(plan.isActive, "Plan not active");

        require(IERC20(paymentToken).transferFrom(msg.sender, address(this), plan.price), "Payment failed");

        userSub.endDate += plan.duration;
        userPayments[msg.sender] += plan.price;
        totalRevenue += plan.price;

        emit SubscriptionRenewed(msg.sender, userSub.planId, userSub.endDate);
        emit PaymentProcessed(msg.sender, plan.price, userSub.planId);
    }

    function unsubscribe() external {
        UserSubscription storage userSub = userSubscriptions[msg.sender];
        require(userSub.isActive, "No active subscription");

        userSub.isActive = false;
        subscriptionPlans[userSub.planId].totalSubscribers--;

        emit UserUnsubscribed(msg.sender);
    }

    function updateSubscriptionPlan(
        uint256 planId,
        uint256 price,
        uint256 duration,
        uint256 maxProperties,
        uint256 maxTenants
    ) external onlyAdmin planExists(planId) {
        SubscriptionPlan storage plan = subscriptionPlans[planId];
        
        plan.price = price;
        plan.duration = duration;
        plan.maxProperties = maxProperties;
        plan.maxTenants = maxTenants;

        emit SubscriptionPlanUpdated(planId, price, duration);
    }

    function togglePlanActive(uint256 planId) external onlyAdmin planExists(planId) {
        subscriptionPlans[planId].isActive = !subscriptionPlans[planId].isActive;
    }

    function recordPropertyUsage(address user) external {
        UserSubscription storage userSub = userSubscriptions[user];
        require(userSub.isActive, "No active subscription");
        require(block.timestamp <= userSub.endDate, "Subscription expired");

        SubscriptionPlan storage plan = subscriptionPlans[userSub.planId];
        require(userSub.propertiesUsed < plan.maxProperties, "Property limit reached");

        userSub.propertiesUsed++;
    }

    function recordTenantUsage(address user) external {
        UserSubscription storage userSub = userSubscriptions[user];
        require(userSub.isActive, "No active subscription");
        require(block.timestamp <= userSub.endDate, "Subscription expired");

        SubscriptionPlan storage plan = subscriptionPlans[userSub.planId];
        require(userSub.tenantsManaged < plan.maxTenants, "Tenant limit reached");

        userSub.tenantsManaged++;
    }

    function getUserSubscriptionStatus(address user) external view returns (
        bool isActive,
        uint256 planId,
        uint256 startDate,
        uint256 endDate,
        uint256 propertiesUsed,
        uint256 tenantsManaged,
        uint256 propertiesRemaining,
        uint256 tenantsRemaining
    ) {
        UserSubscription storage userSub = userSubscriptions[user];
        SubscriptionPlan storage plan = subscriptionPlans[userSub.planId];
        
        uint256 propsRemaining = userSub.isActive ? plan.maxProperties - userSub.propertiesUsed : 0;
        uint256 tenantsRemaining = userSub.isActive ? plan.maxTenants - userSub.tenantsManaged : 0;

        return (
            userSub.isActive && block.timestamp <= userSub.endDate,
            userSub.planId,
            userSub.startDate,
            userSub.endDate,
            userSub.propertiesUsed,
            userSub.tenantsManaged,
            propsRemaining,
            tenantsRemaining
        );
    }

    function getPlanStats(uint256 planId) external view planExists(planId) returns (
        string memory name,
        uint256 price,
        uint256 duration,
        uint256 maxProperties,
        uint256 maxTenants,
        bool isActive,
        uint256 totalSubscribers,
        uint256 totalRevenueFromPlan
    ) {
        SubscriptionPlan storage plan = subscriptionPlans[planId];
        uint256 revenue = plan.price * plan.totalSubscribers;
        
        return (
            plan.name,
            plan.price,
            plan.duration,
            plan.maxProperties,
            plan.maxTenants,
            plan.isActive,
            plan.totalSubscribers,
            revenue
        );
    }

    function getPlatformStats() external view returns (
        uint256 totalPlans,
        uint256 totalSubscribers,
        uint256 activeSubscribers,
        uint256 platformRevenue
    ) {
        uint256 activeCount = 0;
        uint256 totalSubs = 0;
        
        for (uint256 i = 0; i < nextPlanId; i++) {
            totalSubs += subscriptionPlans[i].totalSubscribers;
            // This would need additional tracking for active subscribers
        }

        return (nextPlanId, totalSubs, activeCount, totalRevenue);
    }

    function withdrawRevenue(uint256 amount) external onlyAdmin {
        require(IERC20(paymentToken).transfer(admin, amount), "Transfer failed");
    }

    function setPaymentToken(address newToken) external onlyAdmin {
        paymentToken = newToken;
    }

    function emergencyRefund(address user, uint256 amount) external onlyAdmin {
        require(IERC20(paymentToken).transfer(user, amount), "Refund failed");
    }

    function getUserPaymentHistory(address user) external view returns (uint256 totalPaid) {
        return userPayments[user];
    }
}