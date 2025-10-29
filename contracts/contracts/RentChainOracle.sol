// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

contract RentChainOracle {
    struct OracleData {
        uint256 value;
        uint256 timestamp;
        address provider;
        bytes32 dataHash;
    }

    struct DataFeed {
        string key;
        uint256 updateInterval;
        uint256 lastUpdate;
        uint256 minResponses;
        uint256 maxResponses;
        mapping(address => bool) providers;
        mapping(uint256 => OracleData) data;
        uint256 dataCount;
    }

    mapping(string => DataFeed) public dataFeeds;
    mapping(address => bool) public authorizedProviders;
    mapping(address => uint256) public providerStake;
    
    address public admin;
    uint256 public minimumStake;
    uint256 public providerCount;

    event DataFeedCreated(string key, uint256 updateInterval, uint256 minResponses, uint256 maxResponses);
    event DataUpdated(string key, uint256 value, uint256 timestamp, address provider);
    event ProviderAdded(address provider);
    event ProviderRemoved(address provider);
    event ProviderSlashed(address provider, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyProvider() {
        require(authorizedProviders[msg.sender], "Not authorized provider");
        _;
    }

    constructor() {
        admin = msg.sender;
        minimumStake = 1000 * 10**18; // 1000 tokens
    }

    function createDataFeed(
        string memory key,
        uint256 updateInterval,
        uint256 minResponses,
        uint256 maxResponses
    ) external onlyAdmin {
        require(dataFeeds[key].updateInterval == 0, "Data feed already exists");
        
        DataFeed storage feed = dataFeeds[key];
        feed.key = key;
        feed.updateInterval = updateInterval;
        feed.minResponses = minResponses;
        feed.maxResponses = maxResponses;
        feed.lastUpdate = 0;
        feed.dataCount = 0;

        emit DataFeedCreated(key, updateInterval, minResponses, maxResponses);
    }

    function addDataProvider(address provider) external onlyAdmin {
        authorizedProviders[provider] = true;
        providerCount++;
        emit ProviderAdded(provider);
    }

    function removeDataProvider(address provider) external onlyAdmin {
        authorizedProviders[provider] = false;
        providerCount--;
        emit ProviderRemoved(provider);
    }

    function submitData(
        string memory key,
        uint256 value,
        bytes32 dataHash
    ) external onlyProvider {
        DataFeed storage feed = dataFeeds[key];
        require(feed.updateInterval > 0, "Data feed not found");
        require(block.timestamp >= feed.lastUpdate + feed.updateInterval, "Too soon to update");

        uint256 dataId = feed.dataCount++;
        feed.data[dataId] = OracleData({
            value: value,
            timestamp: block.timestamp,
            provider: msg.sender,
            dataHash: dataHash
        });

        feed.lastUpdate = block.timestamp;

        emit DataUpdated(key, value, block.timestamp, msg.sender);
    }

    function getData(string memory key) external view returns (uint256 value, uint256 timestamp) {
        DataFeed storage feed = dataFeeds[key];
        require(feed.dataCount > 0, "No data available");

        // Return the latest data point
        OracleData storage data = feed.data[feed.dataCount - 1];
        return (data.value, data.timestamp);
    }

    function getDataWithAverage(string memory key, uint256 count) external view returns (uint256 average, uint256 timestamp) {
        DataFeed storage feed = dataFeeds[key];
        require(feed.dataCount >= count, "Insufficient data points");

        uint256 sum = 0;
        uint256 validCount = 0;
        
        for (uint256 i = feed.dataCount - count; i < feed.dataCount && validCount < count; i++) {
            OracleData storage data = feed.data[i];
            sum += data.value;
            validCount++;
        }

        average = sum / validCount;
        timestamp = block.timestamp;
        
        return (average, timestamp);
    }

    function getDataHistory(string memory key, uint256 limit) external view returns (uint256[] memory values, uint256[] memory timestamps) {
        DataFeed storage feed = dataFeeds[key];
        uint256 actualLimit = limit > feed.dataCount ? feed.dataCount : limit;
        
        values = new uint256[](actualLimit);
        timestamps = new uint256[](actualLimit);
        
        for (uint256 i = 0; i < actualLimit; i++) {
            OracleData storage data = feed.data[feed.dataCount - 1 - i];
            values[i] = data.value;
            timestamps[i] = data.timestamp;
        }
        
        return (values, timestamps);
    }

    function stakeTokens(address token, uint256 amount) external onlyProvider {
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        providerStake[msg.sender] += amount;
    }

    function unstakeTokens(address token, uint256 amount) external onlyProvider {
        require(providerStake[msg.sender] >= amount, "Insufficient stake");
        require(providerStake[msg.sender] - amount >= minimumStake, "Below minimum stake");

        providerStake[msg.sender] -= amount;
        require(IERC20(token).transfer(msg.sender, amount), "Transfer failed");
    }

    function slashProvider(address provider, uint256 amount, string memory reason) external onlyAdmin {
        require(providerStake[provider] >= amount, "Insufficient stake to slash");
        
        providerStake[provider] -= amount;
        emit ProviderSlashed(provider, amount);
    }

    function setMinimumStake(uint256 newMinimum) external onlyAdmin {
        minimumStake = newMinimum;
    }

    function updateDataFeed(
        string memory key,
        uint256 updateInterval,
        uint256 minResponses,
        uint256 maxResponses
    ) external onlyAdmin {
        DataFeed storage feed = dataFeeds[key];
        require(feed.updateInterval > 0, "Data feed not found");
        
        feed.updateInterval = updateInterval;
        feed.minResponses = minResponses;
        feed.maxResponses = maxResponses;
    }

    function getDataFeedInfo(string memory key) external view returns (
        uint256 updateInterval,
        uint256 lastUpdate,
        uint256 minResponses,
        uint256 maxResponses,
        uint256 dataCount,
        uint256 providerCountForFeed
    ) {
        DataFeed storage feed = dataFeeds[key];
        return (
            feed.updateInterval,
            feed.lastUpdate,
            feed.minResponses,
            feed.maxResponses,
            feed.dataCount,
            providerCount
        );
    }

    function withdrawStuckTokens(address token, uint256 amount) external onlyAdmin {
        IERC20(token).transfer(admin, amount);
    }
}