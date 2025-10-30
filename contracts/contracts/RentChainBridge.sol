// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IERC20.sol";



contract RentChainBridge {
    struct BridgeRequest {
        address user;
        address token;
        uint256 amount;
        uint256 targetChain;
        address targetAddress;
        uint256 timestamp;
        bool completed;
        bytes32 bridgeHash;
    }

    mapping(bytes32 => BridgeRequest) public bridgeRequests;
    mapping(address => uint256) public nonces;
    mapping(uint256 => bool) public supportedChains;
    mapping(address => bool) public supportedTokens;
    mapping(address => bool) public validators;
    
    address public admin;
    uint256 public bridgeFee;
    uint256 public minBridgeAmount;
    uint256 public maxBridgeAmount;

    event BridgeInitiated(
        bytes32 indexed bridgeHash,
        address indexed user,
        address token,
        uint256 amount,
        uint256 targetChain,
        address targetAddress
    );
    event BridgeCompleted(bytes32 indexed bridgeHash, address indexed user, uint256 amount);
    event BridgeReverted(bytes32 indexed bridgeHash, address indexed user, uint256 amount);
    event ValidatorAdded(address validator);
    event ValidatorRemoved(address validator);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyValidator() {
        require(validators[msg.sender], "Not validator");
        _;
    }

    constructor() {
        admin = msg.sender;
        validators[msg.sender] = true;
        bridgeFee = 0.001 ether;
        minBridgeAmount = 0.01 ether;
        maxBridgeAmount = 10000 ether;
        
        // Support mainnet and testnets
        supportedChains[1] = true; // Ethereum Mainnet
        supportedChains[534352] = true; // Scroll Mainnet
        supportedChains[534351] = true; // Scroll Testnet
    }

    function bridgeTokens(
        address token,
        uint256 amount,
        uint256 targetChain,
        address targetAddress
    ) external payable returns (bytes32) {
        require(supportedChains[targetChain], "Unsupported chain");
        require(supportedTokens[token], "Unsupported token");
        require(amount >= minBridgeAmount, "Below minimum");
        require(amount <= maxBridgeAmount, "Above maximum");
        require(msg.value >= bridgeFee, "Insufficient bridge fee");

        uint256 nonce = nonces[msg.sender]++;
        bytes32 bridgeHash = keccak256(abi.encodePacked(
            msg.sender,
            token,
            amount,
            targetChain,
            targetAddress,
            nonce,
            block.chainid,
            block.timestamp
        ));

        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");

        bridgeRequests[bridgeHash] = BridgeRequest({
            user: msg.sender,
            token: token,
            amount: amount,
            targetChain: targetChain,
            targetAddress: targetAddress,
            timestamp: block.timestamp,
            completed: false,
            bridgeHash: bridgeHash
        });

        emit BridgeInitiated(bridgeHash, msg.sender, token, amount, targetChain, targetAddress);
        return bridgeHash;
    }

    function completeBridge(
        bytes32 bridgeHash,
        address user,
        address token,
        uint256 amount,
        uint256 sourceChain,
        address targetAddress
    ) external onlyValidator {
        require(!bridgeRequests[bridgeHash].completed, "Already completed");

        bridgeRequests[bridgeHash].completed = true;

        require(IERC20(token).transfer(targetAddress, amount), "Transfer failed");

        emit BridgeCompleted(bridgeHash, user, amount);
    }

    function revertBridge(bytes32 bridgeHash) external onlyValidator {
        BridgeRequest storage request = bridgeRequests[bridgeHash];
        require(!request.completed, "Already completed");

        request.completed = true;

        require(IERC20(request.token).transfer(request.user, request.amount), "Transfer failed");

        emit BridgeReverted(bridgeHash, request.user, request.amount);
    }

    function addSupportedToken(address token) external onlyAdmin {
        supportedTokens[token] = true;
    }

    function removeSupportedToken(address token) external onlyAdmin {
        supportedTokens[token] = false;
    }

    function addSupportedChain(uint256 chainId) external onlyAdmin {
        supportedChains[chainId] = true;
    }

    function removeSupportedChain(uint256 chainId) external onlyAdmin {
        supportedChains[chainId] = false;
    }

    function addValidator(address validator) external onlyAdmin {
        validators[validator] = true;
        emit ValidatorAdded(validator);
    }

    function removeValidator(address validator) external onlyAdmin {
        validators[validator] = false;
        emit ValidatorRemoved(validator);
    }

    function setBridgeFee(uint256 newFee) external onlyAdmin {
        bridgeFee = newFee;
    }

    function setBridgeLimits(uint256 minAmount, uint256 maxAmount) external onlyAdmin {
        minBridgeAmount = minAmount;
        maxBridgeAmount = maxAmount;
    }

    function getBridgeRequest(bytes32 bridgeHash) external view returns (
        address user,
        address token,
        uint256 amount,
        uint256 targetChain,
        address targetAddress,
        uint256 timestamp,
        bool completed
    ) {
        BridgeRequest storage request = bridgeRequests[bridgeHash];
        return (
            request.user,
            request.token,
            request.amount,
            request.targetChain,
            request.targetAddress,
            request.timestamp,
            request.completed
        );
    }

    function getUserBridges(address user) external view returns (bytes32[] memory) {
        uint256 count = 0;
        bytes32[] memory userBridges = new bytes32[](nonces[user]);
        
        for (uint256 i = 0; i < nonces[user]; i++) {
            bytes32 bridgeHash = keccak256(abi.encodePacked(
                user,
                address(0), // token will vary
                uint256(0), // amount will vary
                uint256(0), // targetChain will vary
                address(0), // targetAddress will vary
                i,
                block.chainid,
                uint256(0) // timestamp will vary
            ));
            
            if (bridgeRequests[bridgeHash].user == user) {
                userBridges[count] = bridgeHash;
                count++;
            }
        }
        
        return userBridges;
    }

    function withdrawFees(address to, uint256 amount) external onlyAdmin {
        payable(to).transfer(amount);
    }

    function withdrawTokenFees(address token, address to, uint256 amount) external onlyAdmin {
        IERC20(token).transfer(to, amount);
    }
}