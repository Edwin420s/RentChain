// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract RentChainMultiChain {
    struct CrossChainRequest {
        address user;
        uint256 sourceChain;
        uint256 targetChain;
        bytes data;
        uint256 timestamp;
        bool executed;
        bytes32 requestHash;
    }

    struct ChainConfig {
        bool isActive;
        address gateway;
        uint256 gasLimit;
        uint256 fee;
    }

    mapping(uint256 => ChainConfig) public chainConfigs;
    mapping(bytes32 => CrossChainRequest) public crossChainRequests;
    mapping(address => uint256) public userNonces;
    mapping(uint256 => bool) public supportedChains;
    
    address public admin;
    uint256 public nextRequestId;
    uint256 public baseCrossChainFee;

    event CrossChainRequestCreated(
        bytes32 indexed requestHash,
        address indexed user,
        uint256 sourceChain,
        uint256 targetChain,
        bytes data
    );
    event CrossChainRequestExecuted(bytes32 indexed requestHash, address indexed user, bool success);
    event ChainConfigured(uint256 chainId, address gateway, uint256 gasLimit, uint256 fee);
    event ChainStatusUpdated(uint256 chainId, bool isActive);
    event CrossChainFeeUpdated(uint256 newFee);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyGateway(uint256 chainId) {
        require(msg.sender == chainConfigs[chainId].gateway, "Not gateway");
        _;
    }

    constructor() {
        admin = msg.sender;
        baseCrossChainFee = 0.001 ether;
        
        // Initialize with some default chains
        _initializeDefaultChains();
    }

    function _initializeDefaultChains() internal {
        addChainConfig(1, address(0), 1000000, 0.01 ether); // Ethereum Mainnet
        addChainConfig(534352, address(this), 1000000, 0.001 ether); // Scroll Mainnet
        addChainConfig(534351, address(this), 1000000, 0.0001 ether); // Scroll Testnet
        addChainConfig(137, address(0), 1000000, 0.005 ether); // Polygon
        addChainConfig(42161, address(0), 1000000, 0.003 ether); // Arbitrum
    }

    function createCrossChainRequest(
        uint256 targetChain,
        bytes calldata data
    ) external payable returns (bytes32) {
        require(supportedChains[targetChain], "Unsupported target chain");
        require(chainConfigs[targetChain].isActive, "Target chain inactive");
        require(msg.value >= baseCrossChainFee + chainConfigs[targetChain].fee, "Insufficient fee");

        uint256 nonce = userNonces[msg.sender]++;
        bytes32 requestHash = keccak256(abi.encodePacked(
            msg.sender,
            targetChain,
            data,
            nonce,
            block.chainid,
            block.timestamp
        ));

        crossChainRequests[requestHash] = CrossChainRequest({
            user: msg.sender,
            sourceChain: block.chainid,
            targetChain: targetChain,
            data: data,
            timestamp: block.timestamp,
            executed: false,
            requestHash: requestHash
        });

        emit CrossChainRequestCreated(requestHash, msg.sender, block.chainid, targetChain, data);
        return requestHash;
    }

    function executeCrossChainRequest(
        bytes32 requestHash,
        address user,
        uint256 sourceChain,
        bytes calldata data
    ) external onlyGateway(sourceChain) returns (bool) {
        require(!crossChainRequests[requestHash].executed, "Already executed");

        crossChainRequests[requestHash].executed = true;

        (bool success, ) = address(this).call(data);
        
        emit CrossChainRequestExecuted(requestHash, user, success);
        return success;
    }

    function syncUserData(
        address user,
        uint256 propertiesCount,
        uint256 agreementsCount,
        uint256 reputationScore
    ) external onlyGateway(block.chainid) {
        // This would update user data from another chain
        // In production, this would call the appropriate contracts
        emit CrossChainRequestExecuted(keccak256(abi.encodePacked(user)), user, true);
    }

    function syncPropertyData(
        uint256 propertyId,
        address owner,
        uint256 price,
        string memory location,
        string memory ipfsHash
    ) external onlyGateway(block.chainid) {
        // This would sync property data from another chain
        emit CrossChainRequestExecuted(keccak256(abi.encodePacked(propertyId)), owner, true);
    }

    function addChainConfig(
        uint256 chainId,
        address gateway,
        uint256 gasLimit,
        uint256 fee
    ) public onlyAdmin {
        chainConfigs[chainId] = ChainConfig({
            isActive: true,
            gateway: gateway,
            gasLimit: gasLimit,
            fee: fee
        });
        
        supportedChains[chainId] = true;
        
        emit ChainConfigured(chainId, gateway, gasLimit, fee);
    }

    function updateChainStatus(uint256 chainId, bool isActive) external onlyAdmin {
        require(supportedChains[chainId], "Chain not configured");
        chainConfigs[chainId].isActive = isActive;
        emit ChainStatusUpdated(chainId, isActive);
    }

    function updateChainGateway(uint256 chainId, address newGateway) external onlyAdmin {
        require(supportedChains[chainId], "Chain not configured");
        chainConfigs[chainId].gateway = newGateway;
        emit ChainConfigured(chainId, newGateway, chainConfigs[chainId].gasLimit, chainConfigs[chainId].fee);
    }

    function setCrossChainFee(uint256 newFee) external onlyAdmin {
        baseCrossChainFee = newFee;
        emit CrossChainFeeUpdated(newFee);
    }

    function getChainConfig(uint256 chainId) external view returns (
        bool isActive,
        address gateway,
        uint256 gasLimit,
        uint256 fee
    ) {
        ChainConfig storage config = chainConfigs[chainId];
        return (config.isActive, config.gateway, config.gasLimit, config.fee);
    }

    function getSupportedChains() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < 1000; i++) { // Practical limit
            if (supportedChains[i]) {
                count++;
            }
        }
        
        uint256[] memory chains = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < 1000; i++) {
            if (supportedChains[i]) {
                chains[index] = i;
                index++;
            }
        }
        
        return chains;
    }

    function estimateCrossChainFee(uint256 targetChain) external view returns (uint256 totalFee) {
        require(supportedChains[targetChain], "Unsupported chain");
        return baseCrossChainFee + chainConfigs[targetChain].fee;
    }

    function getUserCrossChainRequests(address user) external view returns (bytes32[] memory) {
        bytes32[] memory userRequests = new bytes32[](userNonces[user]);
        uint256 index = 0;
        
        for (uint256 i = 0; i < userNonces[user]; i++) {
            bytes32 requestHash = keccak256(abi.encodePacked(
                user,
                0, // targetChain varies
                "", // data varies
                i,
                block.chainid,
                0 // timestamp varies
            ));
            
            if (crossChainRequests[requestHash].user == user) {
                userRequests[index] = requestHash;
                index++;
            }
        }
        
        return userRequests;
    }

    function withdrawFees(address to, uint256 amount) external onlyAdmin {
        payable(to).transfer(amount);
    }

    function emergencyPauseChain(uint256 chainId) external onlyAdmin {
        chainConfigs[chainId].isActive = false;
        emit ChainStatusUpdated(chainId, false);
    }

    function batchAddChains(
        uint256[] calldata chainIds,
        address[] calldata gateways,
        uint256[] calldata gasLimits,
        uint256[] calldata fees
    ) external onlyAdmin {
        require(chainIds.length == gateways.length, "Invalid input");
        require(chainIds.length == gasLimits.length, "Invalid input");
        require(chainIds.length == fees.length, "Invalid input");

        for (uint256 i = 0; i < chainIds.length; i++) {
            addChainConfig(chainIds[i], gateways[i], gasLimits[i], fees[i]);
        }
    }
}