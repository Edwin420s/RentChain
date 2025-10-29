// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract RentChainEmergency {
    struct EmergencyState {
        bool systemPaused;
        bool withdrawalsPaused;
        bool newRegistrationsPaused;
        bool paymentsPaused;
        uint256 pauseStartTime;
        uint256 pauseDuration;
        string pauseReason;
    }

    struct EmergencyWithdrawal {
        address user;
        address token;
        uint256 amount;
        uint256 requestedAt;
        bool processed;
        bool approved;
    }

    mapping(address => bool) public emergencyAdmins;
    mapping(address => uint256) public userWithdrawalRequests;
    mapping(bytes32 => EmergencyWithdrawal) public emergencyWithdrawals;
    
    address public superAdmin;
    EmergencyState public emergencyState;
    uint256 public nextWithdrawalId;
    uint256 public constant MAX_PAUSE_DURATION = 30 days;

    event SystemPaused(string reason, uint256 duration);
    event SystemResumed();
    event EmergencyAdminAdded(address admin);
    event EmergencyAdminRemoved(address admin);
    event EmergencyWithdrawalRequested(bytes32 requestId, address user, address token, uint256 amount);
    event EmergencyWithdrawalProcessed(bytes32 requestId, address user, address token, uint256 amount, bool approved);
    event EmergencyFundsRecovered(address token, uint256 amount, address recipient);

    modifier onlySuperAdmin() {
        require(msg.sender == superAdmin, "Not super admin");
        _;
    }

    modifier onlyEmergencyAdmin() {
        require(emergencyAdmins[msg.sender] || msg.sender == superAdmin, "Not emergency admin");
        _;
    }

    modifier whenNotPaused() {
        require(!emergencyState.systemPaused, "System paused");
        _;
    }

    modifier whenWithdrawalsNotPaused() {
        require(!emergencyState.withdrawalsPaused, "Withdrawals paused");
        _;
    }

    constructor() {
        superAdmin = msg.sender;
        emergencyAdmins[msg.sender] = true;
    }

    function pauseSystem(
        bool pauseWithdrawals,
        bool pauseRegistrations,
        bool pausePayments,
        uint256 duration,
        string memory reason
    ) external onlyEmergencyAdmin {
        require(duration <= MAX_PAUSE_DURATION, "Pause duration too long");
        require(!emergencyState.systemPaused, "System already paused");

        emergencyState.systemPaused = true;
        emergencyState.withdrawalsPaused = pauseWithdrawals;
        emergencyState.newRegistrationsPaused = pauseRegistrations;
        emergencyState.paymentsPaused = pausePayments;
        emergencyState.pauseStartTime = block.timestamp;
        emergencyState.pauseDuration = duration;
        emergencyState.pauseReason = reason;

        emit SystemPaused(reason, duration);
    }

    function resumeSystem() external onlyEmergencyAdmin {
        require(emergencyState.systemPaused, "System not paused");
        require(block.timestamp >= emergencyState.pauseStartTime + emergencyState.pauseDuration, "Pause not expired");

        emergencyState.systemPaused = false;
        emergencyState.withdrawalsPaused = false;
        emergencyState.newRegistrationsPaused = false;
        emergencyState.paymentsPaused = false;
        emergencyState.pauseDuration = 0;
        emergencyState.pauseReason = "";

        emit SystemResumed();
    }

    function emergencyPauseAll() external onlyEmergencyAdmin {
        emergencyState.systemPaused = true;
        emergencyState.withdrawalsPaused = true;
        emergencyState.newRegistrationsPaused = true;
        emergencyState.paymentsPaused = true;
        emergencyState.pauseStartTime = block.timestamp;
        emergencyState.pauseDuration = MAX_PAUSE_DURATION;
        emergencyState.pauseReason = "EMERGENCY_PAUSE_ALL";

        emit SystemPaused("EMERGENCY_PAUSE_ALL", MAX_PAUSE_DURATION);
    }

    function requestEmergencyWithdrawal(
        address token,
        uint256 amount
    ) external whenWithdrawalsNotPaused returns (bytes32) {
        require(amount > 0, "Invalid amount");
        require(userWithdrawalRequests[msg.sender] == 0, "Pending withdrawal exists");

        bytes32 requestId = keccak256(abi.encodePacked(
            msg.sender,
            token,
            amount,
            block.timestamp,
            userWithdrawalRequests[msg.sender]
        ));

        emergencyWithdrawals[requestId] = EmergencyWithdrawal({
            user: msg.sender,
            token: token,
            amount: amount,
            requestedAt: block.timestamp,
            processed: false,
            approved: false
        });

        userWithdrawalRequests[msg.sender] = block.timestamp;

        emit EmergencyWithdrawalRequested(requestId, msg.sender, token, amount);
        return requestId;
    }

    function processEmergencyWithdrawal(
        bytes32 requestId,
        bool approve
    ) external onlyEmergencyAdmin {
        EmergencyWithdrawal storage withdrawal = emergencyWithdrawals[requestId];
        require(!withdrawal.processed, "Already processed");
        require(block.timestamp >= withdrawal.requestedAt + 1 days, "Cooldown period");

        withdrawal.processed = true;
        withdrawal.approved = approve;

        if (approve) {
            IERC20 token = IERC20(withdrawal.token);
            require(token.transfer(withdrawal.user, withdrawal.amount), "Transfer failed");
            userWithdrawalRequests[withdrawal.user] = 0;
        }

        emit EmergencyWithdrawalProcessed(requestId, withdrawal.user, withdrawal.token, withdrawal.amount, approve);
    }

    function recoverEmergencyFunds(
        address token,
        uint256 amount,
        address recipient
    ) external onlyEmergencyAdmin {
        require(emergencyState.systemPaused, "System not paused");

        IERC20 tokenContract = IERC20(token);
        require(tokenContract.transfer(recipient, amount), "Transfer failed");

        emit EmergencyFundsRecovered(token, amount, recipient);
    }

    function addEmergencyAdmin(address admin) external onlySuperAdmin {
        emergencyAdmins[admin] = true;
        emit EmergencyAdminAdded(admin);
    }

    function removeEmergencyAdmin(address admin) external onlySuperAdmin {
        emergencyAdmins[admin] = false;
        emit EmergencyAdminRemoved(admin);
    }

    function transferSuperAdmin(address newSuperAdmin) external onlySuperAdmin {
        require(newSuperAdmin != address(0), "Invalid address");
        superAdmin = newSuperAdmin;
    }

    function getEmergencyStatus() external view returns (
        bool systemPaused,
        bool withdrawalsPaused,
        bool registrationsPaused,
        bool paymentsPaused,
        uint256 pauseStartTime,
        uint256 pauseDuration,
        string memory pauseReason,
        uint256 timeUntilResume
    ) {
        EmergencyState memory state = emergencyState;
        uint256 resumeTime = state.pauseStartTime + state.pauseDuration;
        uint256 timeLeft = block.timestamp < resumeTime ? resumeTime - block.timestamp : 0;

        return (
            state.systemPaused,
            state.withdrawalsPaused,
            state.newRegistrationsPaused,
            state.paymentsPaused,
            state.pauseStartTime,
            state.pauseDuration,
            state.pauseReason,
            timeLeft
        );
    }

    function getUserWithdrawalStatus(address user) external view returns (
        bool hasPendingRequest,
        uint256 requestTime,
        uint256 cooldownRemaining
    ) {
        uint256 requestTimestamp = userWithdrawalRequests[user];
        bool pending = requestTimestamp > 0;
        uint256 cooldown = 0;

        if (pending && block.timestamp < requestTimestamp + 1 days) {
            cooldown = (requestTimestamp + 1 days) - block.timestamp;
        }

        return (pending, requestTimestamp, cooldown);
    }

    function getPendingWithdrawals() external view returns (bytes32[] memory) {
        uint256 count = 0;
        bytes32[] memory pendingRequests = new bytes32[](nextWithdrawalId);
        
        for (uint256 i = 0; i < nextWithdrawalId; i++) {
            bytes32 requestId = bytes32(i);
            if (!emergencyWithdrawals[requestId].processed) {
                pendingRequests[count] = requestId;
                count++;
            }
        }

        return pendingRequests;
    }

    function emergencyTransferOwnership(address newOwner) external onlySuperAdmin {
        require(emergencyState.systemPaused, "System not paused");
        superAdmin = newOwner;
    }

    function batchProcessWithdrawals(
        bytes32[] calldata requestIds,
        bool[] calldata approvals
    ) external onlyEmergencyAdmin {
        require(requestIds.length == approvals.length, "Invalid input");

        for (uint256 i = 0; i < requestIds.length; i++) {
            processEmergencyWithdrawal(requestIds[i], approvals[i]);
        }
    }
}