// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IERC20.sol";

import "./RentChainBase.sol";
import "./RentChainConstants.sol";



contract RentChainVesting is RentChainBase {
    struct VestingSchedule {
        address beneficiary;
        address token;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 startTime;
        uint256 duration;
        uint256 cliff;
        bool revocable;
        bool revoked;
        uint256 createdAt;
    }

    struct VestingCondition {
        uint256 unlockPercentage;
        uint256 unlockTime;
        bool unlocked;
    }

    mapping(uint256 => VestingSchedule) public vestingSchedules;
    mapping(uint256 => VestingCondition[]) public vestingConditions;
    mapping(address => uint256[]) public beneficiarySchedules;
    mapping(address => uint256) public totalVested;
    mapping(address => uint256) public totalReleased;
    
    address public vestingAdmin;
    uint256 public nextScheduleId;
    uint256 public constant MIN_DURATION = 30 days;
    uint256 public constant MAX_DURATION = 4 * 365 days; // 4 years

    event VestingScheduleCreated(uint256 indexed scheduleId, address beneficiary, address token, uint256 amount);
    event TokensReleased(uint256 indexed scheduleId, address beneficiary, uint256 amount);
    event VestingRevoked(uint256 indexed scheduleId, address revokedBy);
    event VestingConditionAdded(uint256 indexed scheduleId, uint256 percentage, uint256 unlockTime);

    modifier onlyVestingAdmin() {
        require(msg.sender == vestingAdmin || msg.sender == admin, "Not vesting admin");
        _;
    }

    modifier onlyBeneficiary(uint256 scheduleId) {
        require(vestingSchedules[scheduleId].beneficiary == msg.sender, "Not beneficiary");
        _;
    }

    constructor(address _emergencySystem) RentChainBase(_emergencySystem) {
        vestingAdmin = msg.sender;
    }

    function createVestingSchedule(
        address beneficiary,
        address token,
        uint256 amount,
        uint256 startTime,
        uint256 duration,
        uint256 cliff,
        bool revocable,
        VestingCondition[] memory conditions
    ) external onlyVestingAdmin returns (uint256) {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(amount > 0, "Invalid amount");
        require(duration >= MIN_DURATION && duration <= MAX_DURATION, "Invalid duration");
        require(cliff <= duration, "Cliff exceeds duration");

        // Transfer tokens to this contract
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Transfer failed");

        uint256 scheduleId = nextScheduleId++;
        
        vestingSchedules[scheduleId] = VestingSchedule({
            beneficiary: beneficiary,
            token: token,
            totalAmount: amount,
            releasedAmount: 0,
            startTime: startTime,
            duration: duration,
            cliff: cliff,
            revocable: revocable,
            revoked: false,
            createdAt: block.timestamp
        });

        // Add vesting conditions if provided
        for (uint256 i = 0; i < conditions.length; i++) {
            vestingConditions[scheduleId].push(conditions[i]);
        }

        beneficiarySchedules[beneficiary].push(scheduleId);
        totalVested[token] += amount;

        emit VestingScheduleCreated(scheduleId, beneficiary, token, amount);
        return scheduleId;
    }

    function release(uint256 scheduleId) external whenNotPaused whenInitialized {
        VestingSchedule storage schedule = vestingSchedules[scheduleId];
        require(schedule.beneficiary == msg.sender, "Not beneficiary");
        require(!schedule.revoked, "Vesting revoked");
        require(block.timestamp >= schedule.startTime, "Vesting not started");

        uint256 releasable = _computeReleasableAmount(scheduleId);
        require(releasable > 0, "No tokens to release");

        schedule.releasedAmount += releasable;
        totalReleased[schedule.token] += releasable;

        require(IERC20(schedule.token).transfer(msg.sender, releasable), "Transfer failed");

        emit TokensReleased(scheduleId, msg.sender, releasable);
    }

    function releaseMultiple(uint256[] calldata scheduleIds) external whenNotPaused whenInitialized {
        for (uint256 i = 0; i < scheduleIds.length; i++) {
            if (vestingSchedules[scheduleIds[i]].beneficiary == msg.sender) {
                release(scheduleIds[i]);
            }
        }
    }

    function revoke(uint256 scheduleId) external onlyVestingAdmin {
        VestingSchedule storage schedule = vestingSchedules[scheduleId];
        require(schedule.revocable, "Not revocable");
        require(!schedule.revoked, "Already revoked");

        uint256 releasable = _computeReleasableAmount(scheduleId);
        uint256 remaining = schedule.totalAmount - schedule.releasedAmount - releasable;

        schedule.revoked = true;

        // Release any available tokens
        if (releasable > 0) {
            schedule.releasedAmount += releasable;
            require(IERC20(schedule.token).transfer(schedule.beneficiary, releasable), "Transfer failed");
            emit TokensReleased(scheduleId, schedule.beneficiary, releasable);
        }

        // Return remaining tokens to vesting admin
        if (remaining > 0) {
            require(IERC20(schedule.token).transfer(vestingAdmin, remaining), "Transfer failed");
        }

        emit VestingRevoked(scheduleId, msg.sender);
    }

    function _computeReleasableAmount(uint256 scheduleId) internal view returns (uint256) {
        VestingSchedule storage schedule = vestingSchedules[scheduleId];
        
        if (block.timestamp < schedule.startTime + schedule.cliff) {
            return 0;
        }

        // Check custom vesting conditions first
        uint256 fromConditions = _computeReleasableFromConditions(scheduleId);
        if (fromConditions > 0) {
            return fromConditions - schedule.releasedAmount;
        }

        // Linear vesting as fallback
        if (block.timestamp >= schedule.startTime + schedule.duration) {
            return schedule.totalAmount - schedule.releasedAmount;
        } else {
            uint256 timeElapsed = block.timestamp - schedule.startTime;
            uint256 totalVestable = (schedule.totalAmount * timeElapsed) / schedule.duration;
            return totalVestable - schedule.releasedAmount;
        }
    }

    function _computeReleasableFromConditions(uint256 scheduleId) internal view returns (uint256) {
        VestingCondition[] storage conditions = vestingConditions[scheduleId];
        uint256 totalReleasable = 0;

        for (uint256 i = 0; i < conditions.length; i++) {
            if (!conditions[i].unlocked && block.timestamp >= conditions[i].unlockTime) {
                totalReleasable += (vestingSchedules[scheduleId].totalAmount * conditions[i].unlockPercentage) / 10000;
            }
        }

        return totalReleasable;
    }

    function addVestingCondition(
        uint256 scheduleId,
        uint256 unlockPercentage,
        uint256 unlockTime
    ) external onlyVestingAdmin {
        require(unlockPercentage > 0 && unlockPercentage <= 10000, "Invalid percentage");
        require(unlockTime > block.timestamp, "Invalid unlock time");

        vestingConditions[scheduleId].push(VestingCondition({
            unlockPercentage: unlockPercentage,
            unlockTime: unlockTime,
            unlocked: false
        }));

        emit VestingConditionAdded(scheduleId, unlockPercentage, unlockTime);
    }

    function getVestingSchedule(uint256 scheduleId) external view returns (
        address beneficiary,
        address token,
        uint256 totalAmount,
        uint256 releasedAmount,
        uint256 startTime,
        uint256 duration,
        uint256 cliff,
        bool revocable,
        bool revoked,
        uint256 releasableAmount
    ) {
        VestingSchedule storage schedule = vestingSchedules[scheduleId];
        return (
            schedule.beneficiary,
            schedule.token,
            schedule.totalAmount,
            schedule.releasedAmount,
            schedule.startTime,
            schedule.duration,
            schedule.cliff,
            schedule.revocable,
            schedule.revoked,
            _computeReleasableAmount(scheduleId)
        );
    }

    function getBeneficiarySchedules(address beneficiary) external view returns (uint256[] memory) {
        return beneficiarySchedules[beneficiary];
    }

    function getVestingConditions(uint256 scheduleId) external view returns (
        uint256[] memory percentages,
        uint256[] memory unlockTimes,
        bool[] memory unlockedStatus
    ) {
        VestingCondition[] storage conditions = vestingConditions[scheduleId];
        uint256 count = conditions.length;

        percentages = new uint256[](count);
        unlockTimes = new uint256[](count);
        unlockedStatus = new bool[](count);

        for (uint256 i = 0; i < count; i++) {
            percentages[i] = conditions[i].unlockPercentage;
            unlockTimes[i] = conditions[i].unlockTime;
            unlockedStatus[i] = conditions[i].unlocked;
        }

        return (percentages, unlockTimes, unlockedStatus);
    }

    function getVestingStats(address token) external view returns (
        uint256 totalVestedAmount,
        uint256 totalReleasedAmount,
        uint256 activeSchedules,
        uint256 totalBeneficiaries
    ) {
        return (
            totalVested[token],
            totalReleased[token],
            nextScheduleId,
            _countUniqueBeneficiaries()
        );
    }

    function _countUniqueBeneficiaries() internal view returns (uint256) {
        // This would count unique beneficiaries
        // For now, return placeholder
        return nextScheduleId;
    }

    function setVestingAdmin(address newAdmin) external onlyAdmin {
        vestingAdmin = newAdmin;
    }

    function emergencyRelease(uint256 scheduleId) external onlyVestingAdmin {
        require(isSystemPaused(), "System not paused");
        
        VestingSchedule storage schedule = vestingSchedules[scheduleId];
        uint256 releasable = schedule.totalAmount - schedule.releasedAmount;
        
        schedule.releasedAmount = schedule.totalAmount;
        totalReleased[schedule.token] += releasable;

        require(IERC20(schedule.token).transfer(schedule.beneficiary, releasable), "Transfer failed");

        emit TokensReleased(scheduleId, schedule.beneficiary, releasable);
    }

    function batchCreateVestingSchedules(
        address[] calldata beneficiaries,
        address token,
        uint256[] calldata amounts,
        uint256 startTime,
        uint256 duration,
        uint256 cliff,
        bool revocable
    ) external onlyVestingAdmin returns (uint256[] memory) {
        require(beneficiaries.length == amounts.length, "Invalid input");

        uint256[] memory scheduleIds = new uint256[](beneficiaries.length);
        uint256 totalAmount = 0;

        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }

        // Transfer total amount
        require(IERC20(token).transferFrom(msg.sender, address(this), totalAmount), "Transfer failed");

        for (uint256 i = 0; i < beneficiaries.length; i++) {
            scheduleIds[i] = createVestingSchedule(
                beneficiaries[i],
                token,
                amounts[i],
                startTime,
                duration,
                cliff,
                revocable,
                new VestingCondition[](0) // No custom conditions
            );
        }

        return scheduleIds;
    }

    function computeVestingProgress(uint256 scheduleId) external view returns (
        uint256 vestedPercentage,
        uint256 timeElapsed,
        uint256 timeRemaining
    ) {
        VestingSchedule storage schedule = vestingSchedules[scheduleId];
        
        if (block.timestamp < schedule.startTime) {
            return (0, 0, schedule.duration);
        }

        uint256 elapsed = block.timestamp - schedule.startTime;
        uint256 vested = (schedule.releasedAmount * 10000) / schedule.totalAmount;
        uint256 remaining = elapsed < schedule.duration ? schedule.duration - elapsed : 0;

        return (vested, elapsed, remaining);
    }
}