// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IERC20.sol";

import "./RentChainBase.sol";
import "./RentChainConstants.sol";
import "./RentChainUtils.sol";



contract RentChainTreasuryManager is RentChainBase {
    using RentChainUtils for address;
    using RentChainUtils for uint256;

    struct TreasuryAllocation {
        uint256 treasury;
        uint256 development;
        uint256 marketing;
        uint256 staking;
        uint256 insurance;
        uint256 community;
    }

    struct RevenueStream {
        string name;
        uint256 totalCollected;
        uint256 currentBalance;
        bool active;
    }

    mapping(string => RevenueStream) public revenueStreams;
    mapping(address => uint256) public tokenBalances;
    mapping(uint256 => TreasuryAllocation) public allocationHistory;
    
    address public treasuryWallet;
    address public developmentWallet;
    address public marketingWallet;
    address public communityWallet;
    
    uint256 public totalRevenue;
    uint256 public totalDistributed;
    uint256 public nextAllocationId;
    uint256 public lastDistribution;

    TreasuryAllocation public currentAllocation;

    event RevenueReceived(string stream, uint256 amount, address token);
    event FundsDistributed(uint256 allocationId, uint256 totalAmount);
    event AllocationUpdated(TreasuryAllocation newAllocation);
    event WalletUpdated(string walletType, address newAddress);
    event EmergencyWithdrawal(address token, uint256 amount, address recipient);

    modifier onlyTreasuryAdmin() {
        require(msg.sender == admin || msg.sender == treasuryWallet, "Not authorized");
        _;
    }

    constructor(address _emergencySystem) RentChainBase(_emergencySystem) {
        // Initialize with default allocation
        currentAllocation = TreasuryAllocation({
            treasury: 4000,    // 40%
            development: 3000, // 30%
            marketing: 2000,   // 20%
            staking: 500,      // 5%
            insurance: 300,    // 3%
            community: 200     // 2%
        });

        // Set initial wallets (would be multisig in production)
        treasuryWallet = msg.sender;
        developmentWallet = msg.sender;
        marketingWallet = msg.sender;
        communityWallet = msg.sender;
    }

    function initializeTreasury(
        address _treasury,
        address _development,
        address _marketing,
        address _community
    ) external onlyAdmin {
        treasuryWallet = _treasury;
        developmentWallet = _development;
        marketingWallet = _marketing;
        communityWallet = _community;

        _createRevenueStreams();
    }

    function _createRevenueStreams() internal {
        revenueStreams["platform_fees"] = RevenueStream("Platform Fees", 0, 0, true);
        revenueStreams["subscription_fees"] = RevenueStream("Subscription Fees", 0, 0, true);
        revenueStreams["insurance_premiums"] = RevenueStream("Insurance Premiums", 0, 0, true);
        revenueStreams["marketplace_fees"] = RevenueStream("Marketplace Fees", 0, 0, true);
        revenueStreams["staking_rewards"] = RevenueStream("Staking Rewards", 0, 0, true);
    }

    function receiveRevenue(
        string memory stream,
        uint256 amount,
        address token
    ) public whenNotPaused whenInitialized {
        require(revenueStreams[stream].active, "Invalid revenue stream");
        require(amount > 0, "Invalid amount");

        RevenueStream storage streamData = revenueStreams[stream];
        streamData.totalCollected += amount;
        streamData.currentBalance += amount;
        tokenBalances[token] += amount;
        totalRevenue += amount;

        emit RevenueReceived(stream, amount, token);
    }

    function distributeFunds(address token) external onlyTreasuryAdmin whenNotPaused {
        uint256 totalAmount = tokenBalances[token];
        require(totalAmount > 0, "No funds to distribute");

        TreasuryAllocation memory allocation = currentAllocation;
        uint256 allocationId = nextAllocationId++;

        // Calculate amounts for each category
        uint256 treasuryAmount = (totalAmount * allocation.treasury) / 10000;
        uint256 developmentAmount = (totalAmount * allocation.development) / 10000;
        uint256 marketingAmount = (totalAmount * allocation.marketing) / 10000;
        uint256 stakingAmount = (totalAmount * allocation.staking) / 10000;
        uint256 insuranceAmount = (totalAmount * allocation.insurance) / 10000;
        uint256 communityAmount = (totalAmount * allocation.community) / 10000;

        // Verify total matches
        uint256 calculatedTotal = treasuryAmount + developmentAmount + marketingAmount + 
                                 stakingAmount + insuranceAmount + communityAmount;
        require(calculatedTotal <= totalAmount, "Allocation exceeds total");

        // Distribute funds
        _transferToken(token, treasuryWallet, treasuryAmount);
        _transferToken(token, developmentWallet, developmentAmount);
        _transferToken(token, marketingWallet, marketingAmount);
        _transferToken(token, communityWallet, communityAmount);

        // Staking and insurance would go to their respective contracts
        // For now, send to treasury for later distribution
        _transferToken(token, treasuryWallet, stakingAmount + insuranceAmount);

        // Update state
        tokenBalances[token] = 0;
        totalDistributed += totalAmount;
        lastDistribution = block.timestamp;

        // Reset revenue stream balances
        for (uint256 i = 0; i < 5; i++) {
            string memory stream = _getStreamName(i);
            revenueStreams[stream].currentBalance = 0;
        }

        allocationHistory[allocationId] = allocation;

        emit FundsDistributed(allocationId, totalAmount);
    }

    function _transferToken(address token, address to, uint256 amount) internal {
        if (amount == 0) return;
        
        if (token == address(0)) {
            payable(to).transfer(amount);
        } else {
            require(IERC20(token).transfer(to, amount), "Transfer failed");
        }
    }

    function updateAllocation(
        uint256 treasury,
        uint256 development,
        uint256 marketing,
        uint256 staking,
        uint256 insurance,
        uint256 community
    ) external onlyAdmin {
        require(
            treasury + development + marketing + staking + insurance + community == 10000,
            "Allocation must total 100%"
        );

        currentAllocation = TreasuryAllocation({
            treasury: treasury,
            development: development,
            marketing: marketing,
            staking: staking,
            insurance: insurance,
            community: community
        });

        emit AllocationUpdated(currentAllocation);
    }

    function updateWallet(
        string memory walletType,
        address newWallet
    ) external onlyAdmin validAddress(newWallet) {
        if (stringsEqual(walletType, "treasury")) {
            treasuryWallet = newWallet;
        } else if (stringsEqual(walletType, "development")) {
            developmentWallet = newWallet;
        } else if (stringsEqual(walletType, "marketing")) {
            marketingWallet = newWallet;
        } else if (stringsEqual(walletType, "community")) {
            communityWallet = newWallet;
        } else {
            revert("Invalid wallet type");
        }

        emit WalletUpdated(walletType, newWallet);
    }

    function addRevenueStream(string memory name) external onlyAdmin {
        require(bytes(revenueStreams[name].name).length == 0, "Stream already exists");
        
        revenueStreams[name] = RevenueStream(name, 0, 0, true);
    }

    function toggleRevenueStream(string memory stream, bool active) external onlyAdmin {
        require(bytes(revenueStreams[stream].name).length > 0, "Stream not found");
        revenueStreams[stream].active = active;
    }

    function getTreasuryStats() external view returns (
        uint256 totalRevenueCollected,
        uint256 totalFundsDistributed,
        uint256 currentBalance,
        uint256 lastDistributionTime,
        uint256 allocationCount
    ) {
        return (
            totalRevenue,
            totalDistributed,
            tokenBalances[address(0)], // ETH balance
            lastDistribution,
            nextAllocationId
        );
    }

    function getRevenueStreams() external view returns (
        string[] memory names,
        uint256[] memory totals,
        uint256[] memory balances,
        bool[] memory activeStatus
    ) {
        uint256 streamCount = 5; // Fixed number of streams for now
        names = new string[](streamCount);
        totals = new uint256[](streamCount);
        balances = new uint256[](streamCount);
        activeStatus = new bool[](streamCount);

        for (uint256 i = 0; i < streamCount; i++) {
            string memory streamName = _getStreamName(i);
            RevenueStream storage stream = revenueStreams[streamName];
            names[i] = stream.name;
            totals[i] = stream.totalCollected;
            balances[i] = stream.currentBalance;
            activeStatus[i] = stream.active;
        }

        return (names, totals, balances, activeStatus);
    }

    function getAllocationHistory(uint256 start, uint256 count) external view returns (
        uint256[] memory allocationIds,
        TreasuryAllocation[] memory allocations
    ) {
        uint256 actualCount = count > nextAllocationId - start ? nextAllocationId - start : count;
        allocationIds = new uint256[](actualCount);
        allocations = new TreasuryAllocation[](actualCount);

        for (uint256 i = 0; i < actualCount; i++) {
            allocationIds[i] = start + i;
            allocations[i] = allocationHistory[start + i];
        }

        return (allocationIds, allocations);
    }

    function _getStreamName(uint256 index) internal pure returns (string memory) {
        if (index == 0) return "platform_fees";
        if (index == 1) return "subscription_fees";
        if (index == 2) return "insurance_premiums";
        if (index == 3) return "marketplace_fees";
        if (index == 4) return "staking_rewards";
        return "unknown";
    }

    function stringsEqual(string memory a, string memory b) internal pure returns (bool) {
        return RentChainUtils.stringsEqual(a, b);
    }

    function emergencyWithdraw(
        address token,
        uint256 amount,
        address recipient
    ) external onlyAdmin {
        require(isSystemPaused(), "System must be paused");
        
        if (token == address(0)) {
            payable(recipient).transfer(amount);
        } else {
            require(IERC20(token).transfer(recipient, amount), "Transfer failed");
        }

        emit EmergencyWithdrawal(token, amount, recipient);
    }

    function getTokenBalance(address token) external view returns (uint256) {
        return tokenBalances[token];
    }

    receive() external payable {
        receiveRevenue("direct_deposit", msg.value, address(0));
    }
}