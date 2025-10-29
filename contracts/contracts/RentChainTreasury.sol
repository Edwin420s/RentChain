// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract RentChainTreasury {
    struct Budget {
        uint256 allocated;
        uint256 spent;
        uint256 startDate;
        uint256 endDate;
        bool active;
    }

    struct Grant {
        address recipient;
        uint256 amount;
        string purpose;
        uint256 grantDate;
        bool distributed;
    }

    mapping(string => Budget) public budgets;
    mapping(uint256 => Grant) public grants;
    
    address public admin;
    address public dao;
    uint256 public nextGrantId;
    
    uint256 public totalFunds;
    uint256 public totalAllocated;
    uint256 public totalDistributed;

    event BudgetCreated(string category, uint256 allocated, uint256 startDate, uint256 endDate);
    event BudgetSpent(string category, uint256 amount, string description);
    event GrantProposed(uint256 grantId, address recipient, uint256 amount, string purpose);
    event GrantDistributed(uint256 grantId, address recipient, uint256 amount);
    event FundsReceived(address from, uint256 amount, string source);
    event FundsWithdrawn(address to, uint256 amount, string purpose);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyDAO() {
        require(msg.sender == dao, "Not DAO");
        _;
    }

    constructor(address _dao) {
        admin = msg.sender;
        dao = _dao;
    }

    function createBudget(
        string memory category,
        uint256 allocated,
        uint256 duration
    ) external onlyDAO {
        require(budgets[category].allocated == 0, "Budget already exists");
        
        budgets[category] = Budget({
            allocated: allocated,
            spent: 0,
            startDate: block.timestamp,
            endDate: block.timestamp + duration,
            active: true
        });

        totalAllocated += allocated;
        
        emit BudgetCreated(category, allocated, block.timestamp, block.timestamp + duration);
    }

    function spendFromBudget(
        string memory category,
        uint256 amount,
        address recipient,
        string memory description
    ) external onlyAdmin {
        Budget storage budget = budgets[category];
        require(budget.active, "Budget not active");
        require(block.timestamp <= budget.endDate, "Budget expired");
        require(budget.spent + amount <= budget.allocated, "Budget exceeded");

        budget.spent += amount;
        totalDistributed += amount;

        payable(recipient).transfer(amount);
        
        emit BudgetSpent(category, amount, description);
    }

    function proposeGrant(
        address recipient,
        uint256 amount,
        string memory purpose
    ) external onlyAdmin returns (uint256) {
        uint256 grantId = nextGrantId++;
        
        grants[grantId] = Grant({
            recipient: recipient,
            amount: amount,
            purpose: purpose,
            grantDate: block.timestamp,
            distributed: false
        });

        emit GrantProposed(grantId, recipient, amount, purpose);
        return grantId;
    }

    function distributeGrant(uint256 grantId) external onlyDAO {
        Grant storage grant = grants[grantId];
        require(!grant.distributed, "Already distributed");
        require(address(this).balance >= grant.amount, "Insufficient funds");

        grant.distributed = true;
        totalDistributed += grant.amount;

        payable(grant.recipient).transfer(grant.amount);
        
        emit GrantDistributed(grantId, grant.recipient, grant.amount);
    }

    function receiveFunds(string memory source) external payable {
        totalFunds += msg.value;
        emit FundsReceived(msg.sender, msg.value, source);
    }

    function withdrawFunds(
        address to,
        uint256 amount,
        string memory purpose
    ) external onlyDAO {
        require(address(this).balance >= amount, "Insufficient funds");
        
        totalFunds -= amount;
        payable(to).transfer(amount);
        
        emit FundsWithdrawn(to, amount, purpose);
    }

    function withdrawERC20(
        address token,
        address to,
        uint256 amount
    ) external onlyDAO {
        IERC20(token).transfer(to, amount);
    }

    function getBudgetInfo(string memory category) external view returns (
        uint256 allocated,
        uint256 spent,
        uint256 remaining,
        uint256 startDate,
        uint256 endDate,
        bool active
    ) {
        Budget storage budget = budgets[category];
        return (
            budget.allocated,
            budget.spent,
            budget.allocated - budget.spent,
            budget.startDate,
            budget.endDate,
            budget.active
        );
    }

    function getGrantInfo(uint256 grantId) external view returns (
        address recipient,
        uint256 amount,
        string memory purpose,
        uint256 grantDate,
        bool distributed
    ) {
        Grant storage grant = grants[grantId];
        return (
            grant.recipient,
            grant.amount,
            grant.purpose,
            grant.grantDate,
            grant.distributed
        );
    }

    function getTreasuryStats() external view returns (
        uint256 totalBalance,
        uint256 totalAllocations,
        uint256 totalDistributions,
        uint256 availableBalance
    ) {
        return (
            address(this).balance,
            totalAllocated,
            totalDistributed,
            address(this).balance
        );
    }

    function setDAO(address newDAO) external onlyDAO {
        dao = newDAO;
    }

    function emergencyPause() external onlyAdmin {
        // In production, this would pause all distributions
        // For now, we just emit an event
        emit FundsWithdrawn(admin, 0, "EMERGENCY_PAUSE");
    }

    receive() external payable {
        totalFunds += msg.value;
        emit FundsReceived(msg.sender, msg.value, "Direct transfer");
    }
}