// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IERC20.sol";

import "./RentChainBase.sol";
import "./RentChainConstants.sol";
import "./RentChainUtils.sol";



contract RentChainBatchManager is RentChainBase {
    using RentChainUtils for address;
    using RentChainUtils for uint256;

    struct BatchOperation {
        address user;
        string operationType;
        bytes data;
        uint256 submittedAt;
        bool executed;
        uint256 gasUsed;
        string result;
    }

    struct BatchConfig {
        uint256 maxOperations;
        uint256 maxGasPerBatch;
        uint256 operationTimeout;
        bool enabled;
    }

    mapping(uint256 => BatchOperation[]) public batchOperations;
    mapping(address => uint256[]) public userBatches;
    mapping(string => BatchConfig) public batchConfigs;
    
    uint256 public nextBatchId;
    uint256 public totalOperationsProcessed;
    uint256 public totalGasSaved;
    address public batchExecutor;

    event BatchCreated(uint256 indexed batchId, address user, uint256 operationCount);
    event BatchExecuted(uint256 indexed batchId, uint256 successfulOperations, uint256 totalGasUsed);
    event BatchConfigUpdated(string operationType, uint256 maxOperations, uint256 maxGas);
    event OperationAdded(uint256 indexed batchId, string operationType, bytes data);
    event BatchExecutorUpdated(address newExecutor);

    modifier onlyBatchExecutor() {
        require(msg.sender == batchExecutor || msg.sender == admin, "Not batch executor");
        _;
    }

    constructor(address _emergencySystem) RentChainBase(_emergencySystem) {
        batchExecutor = msg.sender;
        
        _initializeDefaultConfigs();
    }

    function _initializeDefaultConfigs() internal {
        batchConfigs["property_registration"] = BatchConfig(50, 5000000, 1 hours, true);
        batchConfigs["rent_payment"] = BatchConfig(100, 3000000, 1 hours, true);
        batchConfigs["user_verification"] = BatchConfig(200, 2000000, 1 hours, true);
        batchConfigs["agreement_creation"] = BatchConfig(30, 7000000, 1 hours, true);
    }

    function createBatch(string memory operationType) external whenNotPaused whenInitialized returns (uint256) {
        BatchConfig storage config = batchConfigs[operationType];
        require(config.enabled, "Batch type disabled");

        uint256 batchId = nextBatchId++;
        userBatches[msg.sender].push(batchId);

        emit BatchCreated(batchId, msg.sender, 0);
        return batchId;
    }

    function addPropertyRegistrations(
        uint256 batchId,
        string[] memory titles,
        uint256[] memory prices,
        string[] memory locations,
        string[] memory ipfsHashes
    ) external whenNotPaused whenInitialized {
        require(titles.length == prices.length, "Invalid input");
        require(titles.length == locations.length, "Invalid input");
        require(titles.length == ipfsHashes.length, "Invalid input");

        BatchConfig storage config = batchConfigs["property_registration"];
        require(batchOperations[batchId].length + titles.length <= config.maxOperations, "Batch full");

        for (uint256 i = 0; i < titles.length; i++) {
            bytes memory data = abi.encodeWithSignature(
                "registerProperty(string,uint256,string,string)",
                titles[i],
                prices[i],
                locations[i],
                ipfsHashes[i]
            );

            batchOperations[batchId].push(BatchOperation({
                user: msg.sender,
                operationType: "property_registration",
                data: data,
                submittedAt: block.timestamp,
                executed: false,
                gasUsed: 0,
                result: ""
            }));

            emit OperationAdded(batchId, "property_registration", data);
        }
    }

    function addRentPayments(
        uint256 batchId,
        uint256[] memory agreementIds,
        uint256[] memory amounts
    ) external whenNotPaused whenInitialized {
        require(agreementIds.length == amounts.length, "Invalid input");

        BatchConfig storage config = batchConfigs["rent_payment"];
        require(batchOperations[batchId].length + agreementIds.length <= config.maxOperations, "Batch full");

        for (uint256 i = 0; i < agreementIds.length; i++) {
            bytes memory data = abi.encodeWithSignature(
                "payRent(uint256,uint256)",
                agreementIds[i],
                amounts[i]
            );

            batchOperations[batchId].push(BatchOperation({
                user: msg.sender,
                operationType: "rent_payment",
                data: data,
                submittedAt: block.timestamp,
                executed: false,
                gasUsed: 0,
                result: ""
            }));

            emit OperationAdded(batchId, "rent_payment", data);
        }
    }

    function executeBatch(uint256 batchId, address targetContract) external onlyBatchExecutor whenNotPaused whenInitialized {
        BatchOperation[] storage operations = batchOperations[batchId];
        require(operations.length > 0, "Empty batch");
        
        uint256 successfulOperations = 0;
        uint256 totalGasUsed = 0;
        uint256 gasBefore = gasleft();

        for (uint256 i = 0; i < operations.length; i++) {
            if (!operations[i].executed) {
                uint256 operationGasBefore = gasleft();
                
                (bool success, bytes memory result) = targetContract.delegatecall(operations[i].data);
                
                uint256 gasUsed = operationGasBefore - gasleft();
                operations[i].executed = success;
                operations[i].gasUsed = gasUsed;
                operations[i].result = success ? "success" : "failed";

                if (success) {
                    successfulOperations++;
                }

                totalGasUsed += gasUsed;
            }
        }

        totalOperationsProcessed += operations.length;
        totalGasSaved += (gasBefore - gasleft()); // Estimate gas savings

        emit BatchExecuted(batchId, successfulOperations, totalGasUsed);
    }

    function estimateGasSavings(uint256 batchId) external view returns (uint256 estimatedSavings) {
        BatchOperation[] storage operations = batchOperations[batchId];
        uint256 singleTxGas = 21000; // Base gas per transaction
        uint256 batchGas = 100000; // Estimated gas for batch execution
        
        return (operations.length * singleTxGas) - batchGas;
    }

    function updateBatchConfig(
        string memory operationType,
        uint256 maxOperations,
        uint256 maxGas,
        uint256 timeout,
        bool enabled
    ) external onlyAdmin {
        batchConfigs[operationType] = BatchConfig({
            maxOperations: maxOperations,
            maxGasPerBatch: maxGas,
            operationTimeout: timeout,
            enabled: enabled
        });

        emit BatchConfigUpdated(operationType, maxOperations, maxGas);
    }

    function setBatchExecutor(address newExecutor) external onlyAdmin {
        batchExecutor = newExecutor;
        emit BatchExecutorUpdated(newExecutor);
    }

    function getUserBatches(address user) external view returns (uint256[] memory) {
        return userBatches[user];
    }

    function getBatchOperations(uint256 batchId) external view returns (
        address[] memory users,
        string[] memory operationTypes,
        bool[] memory executedStatus,
        uint256[] memory gasUsed
    ) {
        BatchOperation[] storage operations = batchOperations[batchId];
        uint256 count = operations.length;

        users = new address[](count);
        operationTypes = new string[](count);
        executedStatus = new bool[](count);
        gasUsed = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            users[i] = operations[i].user;
            operationTypes[i] = operations[i].operationType;
            executedStatus[i] = operations[i].executed;
            gasUsed[i] = operations[i].gasUsed;
        }

        return (users, operationTypes, executedStatus, gasUsed);
    }

    function getBatchStats(uint256 batchId) external view returns (
        uint256 totalOperations,
        uint256 executedOperations,
        uint256 totalGasUsed,
        uint256 successRate
    ) {
        BatchOperation[] storage operations = batchOperations[batchId];
        uint256 executed = 0;
        uint256 gasTotal = 0;

        for (uint256 i = 0; i < operations.length; i++) {
            if (operations[i].executed) {
                executed++;
                gasTotal += operations[i].gasUsed;
            }
        }

        uint256 rate = operations.length > 0 ? (executed * 10000) / operations.length : 0;

        return (operations.length, executed, gasTotal, rate);
    }

    function getPlatformBatchStats() external view returns (
        uint256 totalBatches,
        uint256 totalOperations,
        uint256 totalGasSaved,
        uint256 averageBatchSize
    ) {
        uint256 avgSize = nextBatchId > 0 ? totalOperationsProcessed / nextBatchId : 0;
        return (nextBatchId, totalOperationsProcessed, totalGasSaved, avgSize);
    }

    function cancelBatch(uint256 batchId) external {
        BatchOperation[] storage operations = batchOperations[batchId];
        require(operations.length > 0, "Batch not found");
        require(operations[0].user == msg.sender, "Not batch owner");

        // Mark all operations as cancelled
        for (uint256 i = 0; i < operations.length; i++) {
            if (!operations[i].executed) {
                operations[i].executed = true;
                operations[i].result = "cancelled";
            }
        }
    }

    function emergencyExecuteBatch(
        uint256 batchId,
        address targetContract
    ) external onlyAdmin {
        require(isSystemPaused(), "System not paused");
        
        BatchOperation[] storage operations = batchOperations[batchId];
        for (uint256 i = 0; i < operations.length; i++) {
            if (!operations[i].executed) {
                (bool success, ) = targetContract.delegatecall(operations[i].data);
                operations[i].executed = success;
                operations[i].result = success ? "emergency_executed" : "emergency_failed";
            }
        }
    }

    function batchTransferTokens(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external whenNotPaused whenInitialized {
        require(recipients.length == amounts.length, "Invalid input");
        require(recipients.length <= 100, "Too many recipients");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }

        require(IERC20(token).transferFrom(msg.sender, address(this), totalAmount), "Transfer failed");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(IERC20(token).transfer(recipients[i], amounts[i]), "Transfer to recipient failed");
        }
    }

    function createMultiOperationBatch(
        string[] memory operationTypes,
        bytes[] memory operationData
    ) external whenNotPaused whenInitialized returns (uint256) {
        require(operationTypes.length == operationData.length, "Invalid input");
        require(operationTypes.length <= 50, "Too many operations");

        uint256 batchId = nextBatchId++;
        userBatches[msg.sender].push(batchId);

        for (uint256 i = 0; i < operationTypes.length; i++) {
            BatchConfig storage config = batchConfigs[operationTypes[i]];
            require(config.enabled, "Operation type disabled");

            batchOperations[batchId].push(BatchOperation({
                user: msg.sender,
                operationType: operationTypes[i],
                data: operationData[i],
                submittedAt: block.timestamp,
                executed: false,
                gasUsed: 0,
                result: ""
            }));

            emit OperationAdded(batchId, operationTypes[i], operationData[i]);
        }

        emit BatchCreated(batchId, msg.sender, operationTypes.length);
        return batchId;
    }
}