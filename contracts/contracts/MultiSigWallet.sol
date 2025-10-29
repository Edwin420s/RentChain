// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IERC20.sol";



contract MultiSigWallet {
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
    }

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public required;

    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmations;

    event Deposit(address indexed sender, uint256 amount);
    event Submission(uint256 indexed transactionId);
    event Confirmation(address indexed sender, uint256 indexed transactionId);
    event Execution(uint256 indexed transactionId);
    event ExecutionFailure(uint256 indexed transactionId);
    event OwnerAddition(address indexed owner);
    event OwnerRemoval(address indexed owner);
    event RequirementChange(uint256 required);

    modifier onlyWallet() {
        require(msg.sender == address(this), "Only wallet can call");
        _;
    }

    modifier ownerDoesNotExist(address owner) {
        require(!isOwner[owner], "Owner exists");
        _;
    }

    modifier ownerExists(address owner) {
        require(isOwner[owner], "Owner does not exist");
        _;
    }

    modifier transactionExists(uint256 transactionId) {
        require(transactionId < transactions.length, "Transaction does not exist");
        _;
    }

    modifier confirmed(uint256 transactionId, address owner) {
        require(confirmations[transactionId][owner], "Not confirmed");
        _;
    }

    modifier notConfirmed(uint256 transactionId, address owner) {
        require(!confirmations[transactionId][owner], "Already confirmed");
        _;
    }

    modifier notExecuted(uint256 transactionId) {
        require(!transactions[transactionId].executed, "Already executed");
        _;
    }

    constructor(address[] memory _owners, uint256 _required) {
        require(_owners.length > 0, "Owners required");
        require(_required > 0 && _required <= _owners.length, "Invalid required number");

        for (uint256 i = 0; i < _owners.length; i++) {
            require(_owners[i] != address(0), "Invalid owner");
            require(!isOwner[_owners[i]], "Duplicate owner");

            isOwner[_owners[i]] = true;
            owners.push(_owners[i]);
        }
        required = _required;
    }

    receive() external payable {
        if (msg.value > 0) {
            emit Deposit(msg.sender, msg.value);
        }
    }

    function submitTransaction(address to, uint256 value, bytes memory data) external ownerExists(msg.sender) returns (uint256) {
        uint256 transactionId = transactions.length;
        
        transactions.push(Transaction({
            to: to,
            value: value,
            data: data,
            executed: false,
            confirmations: 0
        }));

        emit Submission(transactionId);
        confirmTransaction(transactionId);
        return transactionId;
    }

    function confirmTransaction(uint256 transactionId) 
        public 
        ownerExists(msg.sender)
        transactionExists(transactionId)
        notConfirmed(transactionId, msg.sender)
    {
        confirmations[transactionId][msg.sender] = true;
        transactions[transactionId].confirmations++;
        
        emit Confirmation(msg.sender, transactionId);
        
        if (transactions[transactionId].confirmations >= required) {
            executeTransaction(transactionId);
        }
    }

    function executeTransaction(uint256 transactionId) 
        public 
        ownerExists(msg.sender)
        transactionExists(transactionId)
        notExecuted(transactionId)
    {
        Transaction storage txn = transactions[transactionId];
        require(txn.confirmations >= required, "Insufficient confirmations");

        txn.executed = true;
        
        (bool success, ) = txn.to.call{value: txn.value}(txn.data);
        if (success) {
            emit Execution(transactionId);
        } else {
            emit ExecutionFailure(transactionId);
            txn.executed = false;
        }
    }

    function revokeConfirmation(uint256 transactionId)
        external
        ownerExists(msg.sender)
        confirmed(transactionId, msg.sender)
        notExecuted(transactionId)
    {
        confirmations[transactionId][msg.sender] = false;
        transactions[transactionId].confirmations--;
    }

    function addOwner(address owner)
        external
        onlyWallet
        ownerDoesNotExist(owner)
    {
        isOwner[owner] = true;
        owners.push(owner);
        emit OwnerAddition(owner);
    }

    function removeOwner(address owner)
        external
        onlyWallet
        ownerExists(owner)
    {
        isOwner[owner] = false;
        
        for (uint256 i = 0; i < owners.length - 1; i++) {
            if (owners[i] == owner) {
                owners[i] = owners[owners.length - 1];
                break;
            }
        }
        owners.pop();
        
        if (required > owners.length) {
            changeRequirement(owners.length);
        }
        
        emit OwnerRemoval(owner);
    }

    function changeRequirement(uint256 _required) public onlyWallet {
        require(_required > 0 && _required <= owners.length, "Invalid required number");
        required = _required;
        emit RequirementChange(_required);
    }

    function getOwners() external view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount() external view returns (uint256) {
        return transactions.length;
    }

    function getTransaction(uint256 transactionId) external view returns (
        address to,
        uint256 value,
        bytes memory data,
        bool executed,
        uint256 confirmations
    ) {
        Transaction storage txn = transactions[transactionId];
        return (
            txn.to,
            txn.value,
            txn.data,
            txn.executed,
            txn.confirmations
        );
    }

    function isConfirmed(uint256 transactionId) external view returns (bool) {
        Transaction storage txn = transactions[transactionId];
        return txn.confirmations >= required;
    }

    function getConfirmationCount(uint256 transactionId) external view returns (uint256) {
        return transactions[transactionId].confirmations;
    }

    function withdrawERC20(address token, uint256 amount) external onlyWallet {
        IERC20(token).transfer(msg.sender, amount);
    }
}