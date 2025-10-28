// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract PaymentProcessor {
    struct Payment {
        address from;
        address to;
        uint256 amount;
        address token;
        uint256 timestamp;
        string description;
        bool completed;
    }

    mapping(uint256 => Payment) public payments;
    uint256 public nextPaymentId;
    
    mapping(address => bool) public supportedTokens;
    address public owner;

    event PaymentProcessed(uint256 indexed paymentId, address indexed from, address indexed to, uint256 amount);
    event TokenSupported(address token, bool supported);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setSupportedToken(address token, bool supported) external onlyOwner {
        supportedTokens[token] = supported;
        emit TokenSupported(token, supported);
    }

    function processPayment(
        address to,
        uint256 amount,
        address token,
        string memory description
    ) external returns (uint256) {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Invalid amount");
        require(to != address(0), "Invalid recipient");

        IERC20 paymentToken = IERC20(token);
        require(paymentToken.transferFrom(msg.sender, address(this), amount), "Payment failed");

        uint256 paymentId = nextPaymentId++;
        payments[paymentId] = Payment({
            from: msg.sender,
            to: to,
            amount: amount,
            token: token,
            timestamp: block.timestamp,
            description: description,
            completed: false
        });

        require(paymentToken.transfer(to, amount), "Transfer to recipient failed");
        
        payments[paymentId].completed = true;
        emit PaymentProcessed(paymentId, msg.sender, to, amount);
        
        return paymentId;
    }

    function batchPayments(
        address[] calldata recipients,
        uint256[] calldata amounts,
        address token,
        string memory description
    ) external returns (uint256[] memory) {
        require(recipients.length == amounts.length, "Invalid input");
        require(supportedTokens[token], "Token not supported");

        IERC20 paymentToken = IERC20(token);
        uint256 totalAmount = 0;
        
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }

        require(paymentToken.transferFrom(msg.sender, address(this), totalAmount), "Batch payment failed");

        uint256[] memory paymentIds = new uint256[](recipients.length);
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(amounts[i] > 0, "Invalid amount");
            require(recipients[i] != address(0), "Invalid recipient");

            uint256 paymentId = nextPaymentId++;
            payments[paymentId] = Payment({
                from: msg.sender,
                to: recipients[i],
                amount: amounts[i],
                token: token,
                timestamp: block.timestamp,
                description: description,
                completed: false
            });

            require(paymentToken.transfer(recipients[i], amounts[i]), "Transfer failed");
            
            payments[paymentId].completed = true;
            paymentIds[i] = paymentId;
            
            emit PaymentProcessed(paymentId, msg.sender, recipients[i], amounts[i]);
        }
        
        return paymentIds;
    }

    function getUserPayments(address user) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextPaymentId; i++) {
            if (payments[i].from == user || payments[i].to == user) {
                count++;
            }
        }
        
        uint256[] memory userPayments = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextPaymentId; i++) {
            if (payments[i].from == user || payments[i].to == user) {
                userPayments[index] = i;
                index++;
            }
        }
        
        return userPayments;
    }

    function withdrawStuckTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner, amount);
    }
}