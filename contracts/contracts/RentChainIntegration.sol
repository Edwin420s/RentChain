// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./RentChainBase.sol";
import "./RentChainConstants.sol";
import "./RentChainUtils.sol";

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IAggregatorV3 {
    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80);
}

contract RentChainIntegration is RentChainBase {
    using RentChainUtils for address;
    using RentChainUtils for uint256;

    struct Integration {
        string name;
        address contractAddress;
        bool active;
        uint256 integrationType;
        string version;
        uint256 addedAt;
    }

    struct PriceFeed {
        address token;
        address feedAddress;
        uint8 decimals;
        bool active;
    }

    struct BridgeConfig {
        uint256 chainId;
        address bridgeContract;
        bool enabled;
        uint256 gasLimit;
    }

    mapping(string => Integration) public integrations;
    mapping(address => PriceFeed) public priceFeeds;
    mapping(uint256 => BridgeConfig) public bridgeConfigs;
    mapping(address => bool) public integratedTokens;
    
    address public integrationManager;
    uint256 public nextIntegrationId;
    uint256 public nextBridgeConfigId;

    event IntegrationAdded(string name, address contractAddress, uint256 integrationType);
    event IntegrationRemoved(string name);
    event PriceFeedUpdated(address token, address feed);
    event BridgeConfigured(uint256 chainId, address bridgeContract);
    event TokenIntegrated(address token, bool enabled);
    event OraclePriceUpdated(address token, uint256 price);

    modifier onlyIntegrationManager() {
        require(msg.sender == integrationManager || msg.sender == admin, "Not integration manager");
        _;
    }

    constructor(address _emergencySystem) RentChainBase(_emergencySystem) {
        integrationManager = msg.sender;
        
        _initializeDefaultIntegrations();
    }

    function _initializeDefaultIntegrations() internal {
        // Initialize with common DeFi integrations
        addIntegration("UNISWAP_V3", address(0), 1, "v3");
        addIntegration("AAVE_V3", address(0), 2, "v3");
        addIntegration("CHAINLINK", address(0), 3, "v1");
        addIntegration("THE_GRAPH", address(0), 4, "v1");
    }

    function addIntegration(
        string memory name,
        address contractAddress,
        uint256 integrationType,
        string memory version
    ) public onlyIntegrationManager {
        require(bytes(integrations[name].name).length == 0, "Integration already exists");

        integrations[name] = Integration({
            name: name,
            contractAddress: contractAddress,
            active: true,
            integrationType: integrationType,
            version: version,
            addedAt: block.timestamp
        });

        emit IntegrationAdded(name, contractAddress, integrationType);
    }

    function removeIntegration(string memory name) external onlyIntegrationManager {
        require(bytes(integrations[name].name).length > 0, "Integration not found");
        integrations[name].active = false;
        emit IntegrationRemoved(name);
    }

    function updateIntegrationAddress(
        string memory name,
        address newAddress
    ) external onlyIntegrationManager validAddress(newAddress) {
        require(bytes(integrations[name].name).length > 0, "Integration not found");
        integrations[name].contractAddress = newAddress;
    }

    function setPriceFeed(
        address token,
        address feedAddress,
        uint8 decimals
    ) external onlyIntegrationManager {
        priceFeeds[token] = PriceFeed({
            token: token,
            feedAddress: feedAddress,
            decimals: decimals,
            active: true
        });

        emit PriceFeedUpdated(token, feedAddress);
    }

    function getPrice(address token) external view returns (uint256) {
        PriceFeed storage feed = priceFeeds[token];
        require(feed.active, "Price feed not active");

        (, int256 price, , , ) = IAggregatorV3(feed.feedAddress).latestRoundData();
        require(price > 0, "Invalid price");

        return uint256(price);
    }

    function convertPrice(
        address fromToken,
        address toToken,
        uint256 amount
    ) external view returns (uint256) {
        uint256 fromPrice = getPrice(fromToken);
        uint256 toPrice = getPrice(toToken);
        
        return (amount * fromPrice) / toPrice;
    }

    function configureBridge(
        uint256 chainId,
        address bridgeContract,
        uint256 gasLimit
    ) external onlyIntegrationManager {
        bridgeConfigs[chainId] = BridgeConfig({
            chainId: chainId,
            bridgeContract: bridgeContract,
            enabled: true,
            gasLimit: gasLimit
        });

        emit BridgeConfigured(chainId, bridgeContract);
    }

    function integrateToken(
        address token,
        bool enabled
    ) external onlyIntegrationManager {
        integratedTokens[token] = enabled;
        emit TokenIntegrated(token, enabled);
    }

    function swapTokens(
        address fromToken,
        address toToken,
        uint256 amountIn,
        uint256 minAmountOut
    ) external whenNotPaused whenInitialized returns (uint256 amountOut) {
        require(integratedTokens[fromToken], "From token not integrated");
        require(integratedTokens[toToken], "To token not integrated");

        // This would interact with a DEX like Uniswap
        // For now, return a simulated amount
        amountOut = _simulateSwap(fromToken, toToken, amountIn);
        require(amountOut >= minAmountOut, "Insufficient output");

        // Transfer tokens from user
        require(IERC20(fromToken).transferFrom(msg.sender, address(this), amountIn), "Transfer failed");

        // In production, this would call the actual swap contract
        // For now, just transfer equivalent amount
        require(IERC20(toToken).transfer(msg.sender, amountOut), "Output transfer failed");

        return amountOut;
    }

    function _simulateSwap(
        address fromToken,
        address toToken,
        uint256 amountIn
    ) internal view returns (uint256) {
        // Simple simulation - in production would use actual pricing
        uint256 fromPrice = getPrice(fromToken);
        uint256 toPrice = getPrice(toToken);
        
        return (amountIn * fromPrice) / toPrice;
    }

    function bridgeTokens(
        uint256 targetChain,
        address token,
        uint256 amount,
        address recipient
    ) external whenNotPaused whenInitialized returns (bytes32) {
        BridgeConfig storage config = bridgeConfigs[targetChain];
        require(config.enabled, "Bridge not configured");
        require(integratedTokens[token], "Token not integrated");

        // Transfer tokens from user
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");

        // This would interact with the bridge contract
        // For now, return a mock transaction hash
        bytes32 bridgeHash = keccak256(abi.encodePacked(
            msg.sender,
            token,
            amount,
            targetChain,
            recipient,
            block.timestamp
        ));

        return bridgeHash;
    }

    function getIntegrationStatus(string memory name) external view returns (
        address contractAddress,
        bool active,
        uint256 integrationType,
        string memory version,
        uint256 addedAt
    ) {
        Integration storage integration = integrations[name];
        return (
            integration.contractAddress,
            integration.active,
            integration.integrationType,
            integration.version,
            integration.addedAt
        );
    }

    function getActiveIntegrations() external view returns (
        string[] memory names,
        address[] memory addresses,
        bool[] memory activeStatus
    ) {
        uint256 count = 0;
        string[] memory integrationNames = new string[](nextIntegrationId);
        address[] memory integrationAddresses = new address[](nextIntegrationId);
        bool[] memory activeIntegrations = new bool[](nextIntegrationId);

        // This would iterate through all integrations
        // For now, return fixed set
        string[4] memory defaultIntegrations = ["UNISWAP_V3", "AAVE_V3", "CHAINLINK", "THE_GRAPH"];
        
        for (uint256 i = 0; i < defaultIntegrations.length; i++) {
            Integration storage integration = integrations[defaultIntegrations[i]];
            if (bytes(integration.name).length > 0) {
                integrationNames[count] = integration.name;
                integrationAddresses[count] = integration.contractAddress;
                activeIntegrations[count] = integration.active;
                count++;
            }
        }

        return (integrationNames, integrationAddresses, activeIntegrations);
    }

    function getBridgeConfig(uint256 chainId) external view returns (
        address bridgeContract,
        bool enabled,
        uint256 gasLimit
    ) {
        BridgeConfig storage config = bridgeConfigs[chainId];
        return (config.bridgeContract, config.enabled, config.gasLimit);
    }

    function isTokenIntegrated(address token) external view returns (bool) {
        return integratedTokens[token];
    }

    function setIntegrationManager(address newManager) external onlyAdmin {
        integrationManager = newManager;
    }

    function emergencyWithdrawToken(
        address token,
        uint256 amount,
        address recipient
    ) external onlyAdmin {
        require(isSystemPaused(), "System must be paused");
        require(IERC20(token).transfer(recipient, amount), "Transfer failed");
    }

    function updateOraclePrice(
        address token,
        uint256 price
    ) external onlyIntegrationManager {
        emit OraclePriceUpdated(token, price);
    }

    function batchIntegrateTokens(
        address[] calldata tokens,
        bool[] calldata enabled
    ) external onlyIntegrationManager {
        require(tokens.length == enabled.length, "Invalid input");

        for (uint256 i = 0; i < tokens.length; i++) {
            integratedTokens[tokens[i]] = enabled[i];
            emit TokenIntegrated(tokens[i], enabled[i]);
        }
    }
}