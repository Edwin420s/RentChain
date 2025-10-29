// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IERC20.sol";

import "./RentChainBase.sol";
import "./RentChainConstants.sol";



contract RentChainMigrationManager is RentChainBase {
    struct MigrationPool {
        address fromToken;
        address toToken;
        uint256 exchangeRate;
        uint256 totalMigrated;
        uint256 startTime;
        uint256 endTime;
        bool active;
        uint256 cap;
    }

    struct UserMigration {
        address user;
        uint256 fromAmount;
        uint256 toAmount;
        uint256 migratedAt;
        uint256 poolId;
    }

    mapping(uint256 => MigrationPool) public migrationPools;
    mapping(address => UserMigration[]) public userMigrations;
    mapping(address => uint256) public totalUserMigrated;
    mapping(address => bool) public authorizedMigrators;
    
    uint256 public nextPoolId;
    uint256 public totalMigrationVolume;
    address public migrationTreasury;

    event MigrationPoolCreated(uint256 poolId, address fromToken, address toToken, uint256 rate);
    event TokensMigrated(uint256 poolId, address user, uint256 fromAmount, uint256 toAmount);
    event PoolStatusUpdated(uint256 poolId, bool active);
    event MigrationCapUpdated(uint256 poolId, uint256 newCap);
    event EmergencyMigrationExecuted(address user, uint256 amount);

    modifier onlyAuthorizedMigrator() {
        require(authorizedMigrators[msg.sender] || msg.sender == admin, "Not authorized migrator");
        _;
    }

    constructor(address _emergencySystem) RentChainBase(_emergencySystem) {
        migrationTreasury = msg.sender;
        authorizedMigrators[msg.sender] = true;
    }

    function createMigrationPool(
        address fromToken,
        address toToken,
        uint256 exchangeRate,
        uint256 startTime,
        uint256 duration,
        uint256 cap
    ) public onlyAuthorizedMigrator returns (uint256) {
        require(fromToken != toToken, "Same tokens");
        require(exchangeRate > 0, "Invalid exchange rate");
        require(startTime >= block.timestamp, "Invalid start time");
        require(duration > 0, "Invalid duration");

        uint256 poolId = nextPoolId++;
        migrationPools[poolId] = MigrationPool({
            fromToken: fromToken,
            toToken: toToken,
            exchangeRate: exchangeRate,
            totalMigrated: 0,
            startTime: startTime,
            endTime: startTime + duration,
            active: true,
            cap: cap
        });

        emit MigrationPoolCreated(poolId, fromToken, toToken, exchangeRate);
        return poolId;
    }

    function migrateTokens(uint256 poolId, uint256 amount) public whenNotPaused whenInitialized {
        MigrationPool storage pool = migrationPools[poolId];
        require(pool.active, "Pool not active");
        require(block.timestamp >= pool.startTime, "Migration not started");
        require(block.timestamp <= pool.endTime, "Migration ended");
        require(amount > 0, "Invalid amount");
        require(pool.totalMigrated + amount <= pool.cap, "Migration cap exceeded");

        // Calculate tokens to receive
        uint256 toAmount = (amount * pool.exchangeRate) / 10**18;

        // Transfer from user
        require(IERC20(pool.fromToken).transferFrom(msg.sender, migrationTreasury, amount), "Transfer failed");

        // Transfer to user
        require(IERC20(pool.toToken).transfer(msg.sender, toAmount), "Migration transfer failed");

        // Update records
        pool.totalMigrated += amount;
        totalMigrationVolume += amount;
        totalUserMigrated[msg.sender] += amount;

        userMigrations[msg.sender].push(UserMigration({
            user: msg.sender,
            fromAmount: amount,
            toAmount: toAmount,
            migratedAt: block.timestamp,
            poolId: poolId
        }));

        emit TokensMigrated(poolId, msg.sender, amount, toAmount);
    }

    function batchMigrateTokens(
        uint256[] calldata poolIds,
        uint256[] calldata amounts
    ) external whenNotPaused whenInitialized {
        require(poolIds.length == amounts.length, "Invalid input");

        for (uint256 i = 0; i < poolIds.length; i++) {
            if (amounts[i] > 0) {
                migrateTokens(poolIds[i], amounts[i]);
            }
        }
    }

    function calculateMigrationAmount(
        uint256 poolId,
        uint256 amount
    ) external view returns (uint256) {
        MigrationPool storage pool = migrationPools[poolId];
        require(pool.active, "Pool not active");
        
        return (amount * pool.exchangeRate) / 10**18;
    }

    function updatePoolStatus(uint256 poolId, bool active) external onlyAuthorizedMigrator {
        migrationPools[poolId].active = active;
        emit PoolStatusUpdated(poolId, active);
    }

    function updateMigrationCap(uint256 poolId, uint256 newCap) external onlyAuthorizedMigrator {
        require(newCap >= migrationPools[poolId].totalMigrated, "Cap below migrated amount");
        migrationPools[poolId].cap = newCap;
        emit MigrationCapUpdated(poolId, newCap);
    }

    function extendMigrationPeriod(uint256 poolId, uint256 additionalTime) external onlyAuthorizedMigrator {
        migrationPools[poolId].endTime += additionalTime;
    }

    function authorizeMigrator(address migrator, bool authorized) external onlyAdmin {
        authorizedMigrators[migrator] = authorized;
    }

    function setMigrationTreasury(address newTreasury) external onlyAdmin {
        migrationTreasury = newTreasury;
    }

    function getUserMigrationHistory(
        address user,
        uint256 start,
        uint256 count
    ) external view returns (UserMigration[] memory) {
        UserMigration[] storage history = userMigrations[user];
        uint256 actualCount = count > history.length - start ? history.length - start : count;
        UserMigration[] memory result = new UserMigration[](actualCount);

        for (uint256 i = 0; i < actualCount; i++) {
            result[i] = history[start + i];
        }

        return result;
    }

    function getPoolStats(uint256 poolId) external view returns (
        address fromToken,
        address toToken,
        uint256 exchangeRate,
        uint256 totalMigrated,
        uint256 startTime,
        uint256 endTime,
        bool active,
        uint256 cap,
        uint256 remaining
    ) {
        MigrationPool storage pool = migrationPools[poolId];
        return (
            pool.fromToken,
            pool.toToken,
            pool.exchangeRate,
            pool.totalMigrated,
            pool.startTime,
            pool.endTime,
            pool.active,
            pool.cap,
            pool.cap - pool.totalMigrated
        );
    }

    function getActivePools() external view returns (uint256[] memory) {
        uint256 count = 0;
        uint256[] memory activePools = new uint256[](nextPoolId);

        for (uint256 i = 0; i < nextPoolId; i++) {
            if (migrationPools[i].active && 
                block.timestamp >= migrationPools[i].startTime && 
                block.timestamp <= migrationPools[i].endTime) {
                activePools[count] = i;
                count++;
            }
        }

        // Resize array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activePools[i];
        }

        return result;
    }

    function emergencyMigration(
        address user,
        uint256 poolId,
        uint256 amount
    ) external onlyAdmin {
        require(isSystemPaused(), "System not paused");
        
        MigrationPool storage pool = migrationPools[poolId];
        uint256 toAmount = (amount * pool.exchangeRate) / 10**18;

        // Direct transfer (bypass normal checks)
        require(IERC20(pool.toToken).transfer(user, toAmount), "Emergency transfer failed");

        emit EmergencyMigrationExecuted(user, amount);
    }

    function withdrawExcessTokens(
        address token,
        uint256 amount,
        address recipient
    ) external onlyAdmin {
        require(IERC20(token).transfer(recipient, amount), "Transfer failed");
    }

    function getMigrationStats() external view returns (
        uint256 totalPools,
        uint256 totalVolume,
        uint256 activePoolsCount,
        uint256 uniqueMigrators
    ) {
        uint256 activeCount = 0;
        uint256 migratorCount = 0;
        
        // These would be calculated in production
        return (nextPoolId, totalMigrationVolume, activeCount, migratorCount);
    }

    function createVestingMigrationPool(
        address fromToken,
        address toToken,
        uint256 exchangeRate,
        uint256 startTime,
        uint256 duration,
        uint256 cap,
        uint256 vestingDuration
    ) external onlyAuthorizedMigrator returns (uint256) {
        // This would create a migration pool with vesting
        // For now, create normal pool
        return createMigrationPool(fromToken, toToken, exchangeRate, startTime, duration, cap);
    }

    function estimateMigrationCompletion(uint256 poolId) external view returns (
        uint256 daysRemaining,
        uint256 migrationRate,
        bool willComplete
    ) {
        MigrationPool storage pool = migrationPools[poolId];
        if (!pool.active || block.timestamp > pool.endTime) {
            return (0, 0, false);
        }

        uint256 timeRemaining = pool.endTime - block.timestamp;
        uint256 migrationPerDay = pool.totalMigrated / ((block.timestamp - pool.startTime) / 1 days + 1);
        
        daysRemaining = timeRemaining / 1 days;
        migrationRate = migrationPerDay;
        willComplete = migrationPerDay * daysRemaining >= (pool.cap - pool.totalMigrated);

        return (daysRemaining, migrationRate, willComplete);
    }
}