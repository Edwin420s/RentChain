// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract LiquidityPool {
    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
        mapping(address => uint256) liquidity;
    }

    mapping(uint256 => Pool) public pools;
    uint256 public nextPoolId;
    
    uint256 public constant FEE = 30; // 0.3%
    address public feeCollector;

    event PoolCreated(uint256 indexed poolId, address tokenA, address tokenB);
    event LiquidityAdded(uint256 indexed poolId, address provider, uint256 amountA, uint256 amountB, uint256 liquidity);
    event LiquidityRemoved(uint256 indexed poolId, address provider, uint256 amountA, uint256 amountB, uint256 liquidity);
    event Swap(uint256 indexed poolId, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);

    modifier poolExists(uint256 poolId) {
        require(poolId < nextPoolId, "Pool does not exist");
        _;
    }

    constructor(address _feeCollector) {
        feeCollector = _feeCollector;
    }

    function createPool(address tokenA, address tokenB) external returns (uint256) {
        require(tokenA != tokenB, "Same token");
        require(tokenA != address(0) && tokenB != address(0), "Zero address");
        
        uint256 poolId = nextPoolId++;
        Pool storage pool = pools[poolId];
        pool.tokenA = tokenA;
        pool.tokenB = tokenB;
        pool.reserveA = 0;
        pool.reserveB = 0;
        pool.totalLiquidity = 0;

        emit PoolCreated(poolId, tokenA, tokenB);
        return poolId;
    }

    function addLiquidity(
        uint256 poolId,
        uint256 amountA,
        uint256 amountB
    ) external poolExists(poolId) returns (uint256 liquidity) {
        Pool storage pool = pools[poolId];
        
        if (pool.totalLiquidity == 0) {
            liquidity = sqrt(amountA * amountB);
        } else {
            liquidity = min(
                (amountA * pool.totalLiquidity) / pool.reserveA,
                (amountB * pool.totalLiquidity) / pool.reserveB
            );
        }

        require(liquidity > 0, "Insufficient liquidity");

        require(IERC20(pool.tokenA).transferFrom(msg.sender, address(this), amountA), "Transfer A failed");
        require(IERC20(pool.tokenB).transferFrom(msg.sender, address(this), amountB), "Transfer B failed");

        pool.reserveA += amountA;
        pool.reserveB += amountB;
        pool.totalLiquidity += liquidity;
        pool.liquidity[msg.sender] += liquidity;

        emit LiquidityAdded(poolId, msg.sender, amountA, amountB, liquidity);
    }

    function removeLiquidity(uint256 poolId, uint256 liquidity) external poolExists(poolId) {
        Pool storage pool = pools[poolId];
        require(pool.liquidity[msg.sender] >= liquidity, "Insufficient liquidity");

        uint256 amountA = (liquidity * pool.reserveA) / pool.totalLiquidity;
        uint256 amountB = (liquidity * pool.reserveB) / pool.totalLiquidity;

        pool.liquidity[msg.sender] -= liquidity;
        pool.totalLiquidity -= liquidity;
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;

        require(IERC20(pool.tokenA).transfer(msg.sender, amountA), "Transfer A failed");
        require(IERC20(pool.tokenB).transfer(msg.sender, amountB), "Transfer B failed");

        emit LiquidityRemoved(poolId, msg.sender, amountA, amountB, liquidity);
    }

    function swap(
        uint256 poolId,
        address tokenIn,
        uint256 amountIn
    ) external poolExists(poolId) returns (uint256 amountOut) {
        Pool storage pool = pools[poolId];
        require(tokenIn == pool.tokenA || tokenIn == pool.tokenB, "Invalid token");

        uint256 reserveIn;
        uint256 reserveOut;
        
        if (tokenIn == pool.tokenA) {
            reserveIn = pool.reserveA;
            reserveOut = pool.reserveB;
        } else {
            reserveIn = pool.reserveB;
            reserveOut = pool.reserveA;
        }

        uint256 amountInWithFee = amountIn * (10000 - FEE);
        amountOut = (reserveOut * amountInWithFee) / (reserveIn * 10000 + amountInWithFee);

        require(amountOut > 0, "Insufficient output");

        require(IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn), "Transfer in failed");

        if (tokenIn == pool.tokenA) {
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
        }

        require(IERC20(tokenIn == pool.tokenA ? pool.tokenB : pool.tokenA).transfer(msg.sender, amountOut), "Transfer out failed");

        emit Swap(poolId, tokenIn, tokenIn == pool.tokenA ? pool.tokenB : pool.tokenA, amountIn, amountOut);
    }

    function getPoolReserves(uint256 poolId) external view poolExists(poolId) returns (uint256 reserveA, uint256 reserveB) {
        Pool storage pool = pools[poolId];
        return (pool.reserveA, pool.reserveB);
    }

    function getPoolInfo(uint256 poolId) external view poolExists(poolId) returns (
        address tokenA,
        address tokenB,
        uint256 reserveA,
        uint256 reserveB,
        uint256 totalLiquidity
    ) {
        Pool storage pool = pools[poolId];
        return (
            pool.tokenA,
            pool.tokenB,
            pool.reserveA,
            pool.reserveB,
            pool.totalLiquidity
        );
    }

    function getUserLiquidity(uint256 poolId, address user) external view poolExists(poolId) returns (uint256) {
        return pools[poolId].liquidity[user];
    }

    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function collectFees(address token, uint256 amount) external {
        require(msg.sender == feeCollector, "Not fee collector");
        require(IERC20(token).transfer(feeCollector, amount), "Transfer failed");
    }
}