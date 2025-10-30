// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IERC20.sol";

import "./RentChainBase.sol";
import "./RentChainConstants.sol";



interface IUniswapV2Router {
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
    
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB);
}

contract RentChainLiquidityManager is RentChainBase {
    struct LiquidityPosition {
        address provider;
        address tokenA;
        address tokenB;
        uint256 liquidity;
        uint256 addedAt;
        uint256 lastHarvest;
        uint256 totalFeesEarned;
    }

    struct PoolConfig {
        address tokenA;
        address tokenB;
        address poolAddress;
        uint24 feeTier;
        bool active;
        uint256 totalLiquidity;
        uint256 totalFees;
    }

    mapping(uint256 => LiquidityPosition) public liquidityPositions;
    mapping(address => uint256[]) public providerPositions;
    mapping(address => PoolConfig) public poolConfigs;
    mapping(address => bool) public supportedTokens;
    
    address public liquidityRouter;
    address public feeCollector;
    uint256 public nextPositionId;
    uint256 public totalLiquidityProvided;
    uint256 public totalFeesDistributed;
    uint256 public constant PROTOCOL_FEE = 500; // 5%

    event LiquidityAdded(uint256 indexed positionId, address provider, address tokenA, address tokenB, uint256 liquidity);
    event LiquidityRemoved(uint256 indexed positionId, address provider, uint256 amountA, uint256 amountB, uint256 fees);
    event FeesHarvested(uint256 indexed positionId, address provider, uint256 fees);
    event PoolConfigured(address tokenA, address tokenB, address poolAddress);
    event TokenSupported(address token, bool supported);

    modifier onlyLiquidityManager() {
        require(msg.sender == admin || msg.sender == feeCollector, "Not liquidity manager");
        _;
    }

    constructor(address _emergencySystem, address _router) RentChainBase(_emergencySystem) {
        liquidityRouter = _router;
        feeCollector = msg.sender;
        
        _initializeSupportedTokens();
    }

    function _initializeSupportedTokens() internal {
        supportedTokens[RentChainConstants.USDC_ADDRESS] = true;
        supportedTokens[RentChainConstants.USDT_ADDRESS] = true;
        supportedTokens[RentChainConstants.DAI_ADDRESS] = true;
        supportedTokens[address(0)] = true; // Native token
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB,
        uint256 amountAMin,
        uint256 amountBMin
    ) public whenNotPaused whenInitialized returns (uint256) {
        require(supportedTokens[tokenA] && supportedTokens[tokenB], "Tokens not supported");
        require(amountA > 0 && amountB > 0, "Invalid amounts");

        // Transfer tokens from user
        if (tokenA != address(0)) {
            require(IERC20(tokenA).transferFrom(msg.sender, address(this), amountA), "Transfer A failed");
            IERC20(tokenA).approve(liquidityRouter, amountA);
        }
        
        if (tokenB != address(0)) {
            require(IERC20(tokenB).transferFrom(msg.sender, address(this), amountB), "Transfer B failed");
            IERC20(tokenB).approve(liquidityRouter, amountB);
        }

        // Add liquidity via router
        (uint256 usedA, uint256 usedB, uint256 liquidity) = IUniswapV2Router(liquidityRouter).addLiquidity(
            tokenA,
            tokenB,
            amountA,
            amountB,
            amountAMin,
            amountBMin,
            address(this),
            block.timestamp + 1 hours
        );

        // Create position record
        uint256 positionId = nextPositionId++;
        liquidityPositions[positionId] = LiquidityPosition({
            provider: msg.sender,
            tokenA: tokenA,
            tokenB: tokenB,
            liquidity: liquidity,
            addedAt: block.timestamp,
            lastHarvest: block.timestamp,
            totalFeesEarned: 0
        });

        providerPositions[msg.sender].push(positionId);
        totalLiquidityProvided += liquidity;

        // Update pool config
        _updatePoolConfig(tokenA, tokenB, liquidity);

        // Refund any unused tokens
        if (amountA > usedA && tokenA != address(0)) {
            IERC20(tokenA).transfer(msg.sender, amountA - usedA);
        }
        if (amountB > usedB && tokenB != address(0)) {
            IERC20(tokenB).transfer(msg.sender, amountB - usedB);
        }

        emit LiquidityAdded(positionId, msg.sender, tokenA, tokenB, liquidity);
        return positionId;
    }

    function removeLiquidity(
        uint256 positionId,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin
    ) external whenNotPaused whenInitialized returns (uint256 amountA, uint256 amountB) {
        LiquidityPosition storage position = liquidityPositions[positionId];
        require(position.provider == msg.sender, "Not position owner");
        require(position.liquidity >= liquidity, "Insufficient liquidity");

        // Remove liquidity via router
        (amountA, amountB) = IUniswapV2Router(liquidityRouter).removeLiquidity(
            position.tokenA,
            position.tokenB,
            liquidity,
            amountAMin,
            amountBMin,
            address(this),
            block.timestamp + 1 hours
        );

        // Calculate and distribute fees
        uint256 fees = _calculateFees(positionId);
        if (fees > 0) {
            _distributeFees(positionId, fees);
        }

        // Update position
        position.liquidity -= liquidity;
        totalLiquidityProvided -= liquidity;

        // Transfer tokens back to user
        if (position.tokenA != address(0)) {
            IERC20(position.tokenA).transfer(msg.sender, amountA);
        } else {
            payable(msg.sender).transfer(amountA);
        }
        
        if (position.tokenB != address(0)) {
            IERC20(position.tokenB).transfer(msg.sender, amountB);
        } else {
            payable(msg.sender).transfer(amountB);
        }

        emit LiquidityRemoved(positionId, msg.sender, amountA, amountB, fees);
    }

    function harvestFees(uint256 positionId) external whenNotPaused whenInitialized {
        LiquidityPosition storage position = liquidityPositions[positionId];
        require(position.provider == msg.sender, "Not position owner");

        uint256 fees = _calculateFees(positionId);
        require(fees > 0, "No fees to harvest");

        _distributeFees(positionId, fees);

        position.lastHarvest = block.timestamp;
        position.totalFeesEarned += fees;

        emit FeesHarvested(positionId, msg.sender, fees);
    }

    function _calculateFees(uint256 positionId) internal view returns (uint256) {
        LiquidityPosition storage position = liquidityPositions[positionId];
        
        // Simplified fee calculation
        // In production, this would query the actual pool for accrued fees
        uint256 timeSinceHarvest = block.timestamp - position.lastHarvest;
        uint256 baseFeeRate = 1000; // 10% APR
        
        return (position.liquidity * baseFeeRate * timeSinceHarvest) / (365 days * 10000);
    }

    function _distributeFees(uint256 positionId, uint256 totalFees) internal {
        LiquidityPosition storage position = liquidityPositions[positionId];
        
        uint256 protocolFee = (totalFees * PROTOCOL_FEE) / 10000;
        uint256 providerFee = totalFees - protocolFee;

        // Distribute to provider (simplified - would be in actual tokens)
        totalFeesDistributed += providerFee;

        // Collect protocol fee
        totalFeesDistributed += protocolFee;
    }

    function _updatePoolConfig(address tokenA, address tokenB, uint256 liquidity) internal {
        bytes32 poolKey = keccak256(abi.encodePacked(tokenA, tokenB));
        
        // Update or create pool config
        PoolConfig storage config = poolConfigs[address(uint160(uint256(poolKey)))];
        if (config.poolAddress == address(0)) {
            config.tokenA = tokenA;
            config.tokenB = tokenB;
            config.poolAddress = address(uint160(uint256(poolKey))); // Mock address
            config.feeTier = 3000; // 0.3%
            config.active = true;
            emit PoolConfigured(tokenA, tokenB, config.poolAddress);
        }
        
        config.totalLiquidity += liquidity;
    }

    function configurePool(
        address tokenA,
        address tokenB,
        address poolAddress,
        uint24 feeTier
    ) external onlyLiquidityManager {
        bytes32 poolKey = keccak256(abi.encodePacked(tokenA, tokenB));
        poolConfigs[address(uint160(uint256(poolKey)))] = PoolConfig({
            tokenA: tokenA,
            tokenB: tokenB,
            poolAddress: poolAddress,
            feeTier: feeTier,
            active: true,
            totalLiquidity: 0,
            totalFees: 0
        });

        emit PoolConfigured(tokenA, tokenB, poolAddress);
    }

    function supportToken(address token, bool supported) external onlyLiquidityManager {
        supportedTokens[token] = supported;
        emit TokenSupported(token, supported);
    }

    function getPositionInfo(uint256 positionId) external view returns (
        address provider,
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 addedAt,
        uint256 lastHarvest,
        uint256 totalFeesEarned,
        uint256 pendingFees
    ) {
        LiquidityPosition storage position = liquidityPositions[positionId];
        return (
            position.provider,
            position.tokenA,
            position.tokenB,
            position.liquidity,
            position.addedAt,
            position.lastHarvest,
            position.totalFeesEarned,
            _calculateFees(positionId)
        );
    }

    function getProviderPositions(address provider) external view returns (uint256[] memory) {
        return providerPositions[provider];
    }

    function getPoolInfo(address tokenA, address tokenB) external view returns (
        address poolAddress,
        uint24 feeTier,
        bool active,
        uint256 totalLiquidity,
        uint256 totalFees
    ) {
        bytes32 poolKey = keccak256(abi.encodePacked(tokenA, tokenB));
        PoolConfig storage config = poolConfigs[address(uint160(uint256(poolKey)))];
        return (
            config.poolAddress,
            config.feeTier,
            config.active,
            config.totalLiquidity,
            config.totalFees
        );
    }

    function getLiquidityStats() external view returns (
        uint256 totalPositions,
        uint256 totalLiquidity,
        uint256 totalFees,
        uint256 activeProviders
    ) {
        uint256 providerCount = 0;
        // This would count unique providers
        return (nextPositionId, totalLiquidityProvided, totalFeesDistributed, providerCount);
    }

    function setLiquidityRouter(address newRouter) external onlyAdmin {
        liquidityRouter = newRouter;
    }

    function setFeeCollector(address newCollector) external onlyAdmin {
        feeCollector = newCollector;
    }

    function emergencyWithdrawLiquidity(uint256 positionId) external onlyAdmin {
        require(isSystemPaused(), "System not paused");
        
        LiquidityPosition storage position = liquidityPositions[positionId];
        require(position.liquidity > 0, "No liquidity");

        // Force remove all liquidity
        // This would call the actual removal function
        position.liquidity = 0;
    }

    function batchAddLiquidity(
        address[] calldata tokensA,
        address[] calldata tokensB,
        uint256[] calldata amountsA,
        uint256[] calldata amountsB
    ) external onlyLiquidityManager {
        require(tokensA.length == tokensB.length, "Invalid input");
        require(tokensA.length == amountsA.length, "Invalid input");
        require(tokensA.length == amountsB.length, "Invalid input");

        for (uint256 i = 0; i < tokensA.length; i++) {
            if (supportedTokens[tokensA[i]] && supportedTokens[tokensB[i]]) {
                addLiquidity(
                    tokensA[i],
                    tokensB[i],
                    amountsA[i],
                    amountsB[i],
                    0, // No minimums for batch
                    0
                );
            }
        }
    }

    receive() external payable override {
        // Accept native token for liquidity
    }
}