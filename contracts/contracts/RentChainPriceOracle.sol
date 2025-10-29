// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./RentChainBase.sol";
import "./RentChainConstants.sol";

interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

contract RentChainPriceOracle is RentChainBase {
    struct TokenConfig {
        address feedAddress;
        uint8 decimals;
        string description;
        bool active;
        uint256 heartbeat;
        uint256 lastUpdate;
    }

    struct PriceData {
        uint256 price;
        uint256 timestamp;
        uint80 roundId;
        uint8 decimals;
    }

    mapping(address => TokenConfig) public tokenConfigs;
    mapping(address => PriceData) public latestPrices;
    mapping(address => bool) public authorizedOracles;
    
    address public priceAdmin;
    uint256 public constant MAX_HEARTBEAT = 24 hours;
    uint256 public constant MIN_HEARTBEAT = 5 minutes;

    event PriceUpdated(address indexed token, uint256 price, uint256 timestamp);
    event TokenConfigUpdated(address indexed token, address feedAddress, uint8 decimals);
    event OracleAuthorized(address oracle, bool authorized);
    event HeartbeatViolated(address token, uint256 timeSinceUpdate);

    modifier onlyPriceAdmin() {
        require(msg.sender == priceAdmin || msg.sender == admin, "Not price admin");
        _;
    }

    modifier onlyAuthorizedOracle() {
        require(authorizedOracles[msg.sender], "Not authorized oracle");
        _;
    }

    constructor(address _emergencySystem) RentChainBase(_emergencySystem) {
        priceAdmin = msg.sender;
        authorizedOracles[msg.sender] = true;
        
        _initializeDefaultFeeds();
    }

    function _initializeDefaultFeeds() internal {
        // Mainnet price feeds (would be set based on deployment network)
        _setTokenConfig(
            RentChainConstants.USDC_ADDRESS,
            RentChainConstants.USDC_USD_FEED,
            8,
            "USDC / USD"
        );
        
        _setTokenConfig(
            RentChainConstants.USDT_ADDRESS,
            RentChainConstants.USDT_USD_FEED,
            8,
            "USDT / USD"
        );
        
        _setTokenConfig(
            address(0), // Native token
            RentChainConstants.ETH_USD_FEED,
            8,
            "ETH / USD"
        );
    }

    function getPrice(address token) external view returns (uint256) {
        TokenConfig storage config = tokenConfigs[token];
        require(config.active, "Token not configured");
        require(config.lastUpdate > 0, "No price data");

        // Check heartbeat
        require(
            block.timestamp - config.lastUpdate <= config.heartbeat,
            "Price data stale"
        );

        return latestPrices[token].price;
    }

    function getPriceWithTimestamp(address token) external view returns (uint256 price, uint256 timestamp) {
        PriceData storage data = latestPrices[token];
        return (data.price, data.timestamp);
    }

    function updatePrice(address token) external onlyAuthorizedOracle {
        TokenConfig storage config = tokenConfigs[token];
        require(config.active, "Token not configured");

        (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = AggregatorV3Interface(config.feedAddress).latestRoundData();

        require(answer > 0, "Invalid price");
        require(updatedAt > config.lastUpdate, "Stale data");

        uint8 decimals = config.decimals;
        uint256 price = uint256(answer);

        // Store price data
        latestPrices[token] = PriceData({
            price: price,
            timestamp: updatedAt,
            roundId: roundId,
            decimals: decimals
        });

        config.lastUpdate = updatedAt;

        emit PriceUpdated(token, price, updatedAt);
    }

    function updateMultiplePrices(address[] calldata tokens) external onlyAuthorizedOracle {
        for (uint256 i = 0; i < tokens.length; i++) {
            if (tokenConfigs[tokens[i]].active) {
                updatePrice(tokens[i]);
            }
        }
    }

    function setTokenConfig(
        address token,
        address feedAddress,
        uint8 decimals,
        string memory description
    ) external onlyPriceAdmin {
        _setTokenConfig(token, feedAddress, decimals, description);
    }

    function _setTokenConfig(
        address token,
        address feedAddress,
        uint8 decimals,
        string memory description
    ) internal {
        tokenConfigs[token] = TokenConfig({
            feedAddress: feedAddress,
            decimals: decimals,
            description: description,
            active: true,
            heartbeat: 1 hours,
            lastUpdate: 0
        });

        emit TokenConfigUpdated(token, feedAddress, decimals);
    }

    function setHeartbeat(address token, uint256 heartbeat) external onlyPriceAdmin {
        require(heartbeat >= MIN_HEARTBEAT && heartbeat <= MAX_HEARTBEAT, "Invalid heartbeat");
        tokenConfigs[token].heartbeat = heartbeat;
    }

    function toggleTokenActive(address token, bool active) external onlyPriceAdmin {
        tokenConfigs[token].active = active;
    }

    function authorizeOracle(address oracle, bool authorized) external onlyPriceAdmin {
        authorizedOracles[oracle] = authorized;
        emit OracleAuthorized(oracle, authorized);
    }

    function convertValue(
        address fromToken,
        address toToken,
        uint256 amount
    ) external view returns (uint256) {
        uint256 fromPrice = getPrice(fromToken);
        uint256 toPrice = getPrice(toToken);
        
        uint8 fromDecimals = latestPrices[fromToken].decimals;
        uint8 toDecimals = latestPrices[toToken].decimals;

        // Normalize to 18 decimals for calculation
        uint256 normalizedFrom = _normalizeAmount(amount, fromDecimals, 18);
        uint256 normalizedToPrice = _normalizeAmount(toPrice, toDecimals, 18);

        return (normalizedFrom * fromPrice) / normalizedToPrice;
    }

    function getPriceInUSD(address token, uint256 amount) external view returns (uint256) {
        uint256 tokenPrice = getPrice(token);
        uint8 tokenDecimals = latestPrices[token].decimals;
        
        // Normalize to USD (8 decimals)
        uint256 normalizedAmount = _normalizeAmount(amount, tokenDecimals, 8);
        return (normalizedAmount * tokenPrice) / (10 ** 8);
    }

    function _normalizeAmount(
        uint256 amount,
        uint8 fromDecimals,
        uint8 toDecimals
    ) internal pure returns (uint256) {
        if (fromDecimals == toDecimals) return amount;
        if (fromDecimals > toDecimals) {
            return amount / (10 ** (fromDecimals - toDecimals));
        } else {
            return amount * (10 ** (toDecimals - fromDecimals));
        }
    }

    function checkHeartbeats() external view returns (address[] memory staleTokens) {
        uint256 staleCount = 0;
        address[] memory allTokens = _getAllConfiguredTokens();
        address[] memory stale = new address[](allTokens.length);

        for (uint256 i = 0; i < allTokens.length; i++) {
            TokenConfig storage config = tokenConfigs[allTokens[i]];
            if (config.active && block.timestamp - config.lastUpdate > config.heartbeat) {
                stale[staleCount] = allTokens[i];
                staleCount++;
            }
        }

        // Resize array
        address[] memory result = new address[](staleCount);
        for (uint256 i = 0; i < staleCount; i++) {
            result[i] = stale[i];
        }

        return result;
    }

    function _getAllConfiguredTokens() internal view returns (address[] memory) {
        // This would return all configured tokens
        // For now, return known tokens
        address[] memory tokens = new address[](3);
        tokens[0] = RentChainConstants.USDC_ADDRESS;
        tokens[1] = RentChainConstants.USDT_ADDRESS;
        tokens[2] = address(0); // Native token
        return tokens;
    }

    function getTokenInfo(address token) external view returns (
        address feedAddress,
        uint8 decimals,
        string memory description,
        bool active,
        uint256 heartbeat,
        uint256 lastUpdate,
        uint256 currentPrice
    ) {
        TokenConfig storage config = tokenConfigs[token];
        PriceData storage price = latestPrices[token];
        
        return (
            config.feedAddress,
            config.decimals,
            config.description,
            config.active,
            config.heartbeat,
            config.lastUpdate,
            price.price
        );
    }

    function setPriceAdmin(address newAdmin) external onlyAdmin {
        priceAdmin = newAdmin;
    }

    function emergencyPriceUpdate(
        address token,
        uint256 price,
        uint256 timestamp
    ) external onlyPriceAdmin {
        require(isSystemPaused(), "System not paused");
        
        latestPrices[token] = PriceData({
            price: price,
            timestamp: timestamp,
            roundId: 0,
            decimals: tokenConfigs[token].decimals
        });

        tokenConfigs[token].lastUpdate = timestamp;

        emit PriceUpdated(token, price, timestamp);
    }

    function batchUpdateConfigs(
        address[] calldata tokens,
        address[] calldata feeds,
        uint8[] calldata decimalsArray,
        string[] calldata descriptions
    ) external onlyPriceAdmin {
        require(tokens.length == feeds.length, "Invalid input");
        require(tokens.length == decimalsArray.length, "Invalid input");
        require(tokens.length == descriptions.length, "Invalid input");

        for (uint256 i = 0; i < tokens.length; i++) {
            _setTokenConfig(tokens[i], feeds[i], decimalsArray[i], descriptions[i]);
        }
    }
}