// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./RentChainBase.sol";
import "./RentChainConstants.sol";
import "./RentChainUtils.sol";

contract RentChainCompliance is RentChainBase {
    using RentChainUtils for address;
    using RentChainUtils for uint256;

    struct ComplianceCheck {
        address user;
        uint256 timestamp;
        string checkType;
        bool passed;
        string details;
        address verifiedBy;
    }

    struct RegulatoryRule {
        string jurisdiction;
        string ruleId;
        string description;
        bool active;
        uint256 minAmount;
        uint256 maxAmount;
        uint256 createdAt;
    }

    struct UserCompliance {
        bool kycVerified;
        bool amlVerified;
        uint256 verificationLevel;
        uint256 lastVerified;
        string jurisdiction;
        uint256 transactionLimit;
        uint256 dailyVolume;
        uint256 lastReset;
    }

    mapping(address => UserCompliance) public userCompliance;
    mapping(address => ComplianceCheck[]) public complianceHistory;
    mapping(string => RegulatoryRule) public regulatoryRules;
    mapping(address => bool) public complianceOfficers;
    mapping(string => mapping(address => bool)) public jurisdictionApprovals;
    
    address public complianceAdmin;
    uint256 public nextRuleId;
    uint256 public constant DAILY_RESET_TIME = 24 hours;

    event UserVerified(address user, string checkType, bool passed, address verifiedBy);
    event ComplianceRuleAdded(string ruleId, string jurisdiction, string description);
    event ComplianceRuleUpdated(string ruleId, bool active);
    event ComplianceOfficerAdded(address officer);
    event ComplianceOfficerRemoved(address officer);
    event TransactionFlagged(address user, uint256 amount, string reason);
    event JurisdictionUpdated(address user, string newJurisdiction);

    modifier onlyComplianceOfficer() {
        require(complianceOfficers[msg.sender] || msg.sender == complianceAdmin, "Not compliance officer");
        _;
    }

    constructor(address _emergencySystem) RentChainBase(_emergencySystem) {
        complianceAdmin = msg.sender;
        complianceOfficers[msg.sender] = true;
        
        _initializeDefaultRules();
    }

    function _initializeDefaultRules() internal {
        addRegulatoryRule("US", "US_KYC_001", "Basic KYC verification required", 0, type(uint256).max);
        addRegulatoryRule("US", "US_AML_001", "AML screening required", 1000 * 10**18, type(uint256).max);
        addRegulatoryRule("EU", "EU_KYC_001", "EU KYC standards", 0, type(uint256).max);
        addRegulatoryRule("EU", "EU_AML_001", "EU AML directive", 10000 * 10**18, type(uint256).max);
        addRegulatoryRule("GLOBAL", "GLOBAL_SANCTIONS", "Global sanctions screening", 0, type(uint256).max);
    }

    function verifyUserKYC(
        address user,
        bool passed,
        string memory details
    ) external onlyComplianceOfficer {
        UserCompliance storage compliance = userCompliance[user];
        
        compliance.kycVerified = passed;
        if (passed) {
            compliance.verificationLevel = 1;
            compliance.lastVerified = block.timestamp;
        }

        _recordComplianceCheck(user, "KYC", passed, details);

        emit UserVerified(user, "KYC", passed, msg.sender);
    }

    function verifyUserAML(
        address user,
        bool passed,
        string memory details
    ) external onlyComplianceOfficer {
        UserCompliance storage compliance = userCompliance[user];
        
        compliance.amlVerified = passed;
        if (passed && compliance.kycVerified) {
            compliance.verificationLevel = 2;
            compliance.lastVerified = block.timestamp;
        }

        _recordComplianceCheck(user, "AML", passed, details);

        emit UserVerified(user, "AML", passed, msg.sender);
    }

    function checkTransactionCompliance(
        address user,
        uint256 amount,
        string memory transactionType
    ) external view returns (bool compliant, string memory reason) {
        UserCompliance storage compliance = userCompliance[user];
        
        // Check KYC requirement
        if (!compliance.kycVerified && amount > 1000 * 10**18) {
            return (false, "KYC required for large transactions");
        }

        // Check AML requirement
        if (!compliance.amlVerified && amount > 10000 * 10**18) {
            return (false, "AML verification required");
        }

        // Check daily limits
        if (compliance.dailyVolume + amount > compliance.transactionLimit) {
            return (false, "Daily transaction limit exceeded");
        }

        // Check jurisdiction rules
        if (!_checkJurisdictionRules(compliance.jurisdiction, amount)) {
            return (false, "Jurisdictional limits exceeded");
        }

        return (true, "Compliant");
    }

    function recordTransaction(
        address user,
        uint256 amount
    ) external onlyComplianceOfficer {
        UserCompliance storage compliance = userCompliance[user];
        
        // Reset daily volume if new day
        if (block.timestamp >= compliance.lastReset + DAILY_RESET_TIME) {
            compliance.dailyVolume = 0;
            compliance.lastReset = block.timestamp;
        }

        compliance.dailyVolume += amount;
    }

    function addRegulatoryRule(
        string memory jurisdiction,
        string memory ruleId,
        string memory description,
        uint256 minAmount,
        uint256 maxAmount
    ) public onlyComplianceOfficer {
        regulatoryRules[ruleId] = RegulatoryRule({
            jurisdiction: jurisdiction,
            ruleId: ruleId,
            description: description,
            active: true,
            minAmount: minAmount,
            maxAmount: maxAmount,
            createdAt: block.timestamp
        });

        emit ComplianceRuleAdded(ruleId, jurisdiction, description);
    }

    function updateUserJurisdiction(
        address user,
        string memory jurisdiction
    ) external onlyComplianceOfficer {
        UserCompliance storage compliance = userCompliance[user];
        compliance.jurisdiction = jurisdiction;

        emit JurisdictionUpdated(user, jurisdiction);
    }

    function setUserTransactionLimit(
        address user,
        uint256 limit
    ) external onlyComplianceOfficer {
        UserCompliance storage compliance = userCompliance[user];
        compliance.transactionLimit = limit;
    }

    function addComplianceOfficer(address officer) external onlyAdmin {
        complianceOfficers[officer] = true;
        emit ComplianceOfficerAdded(officer);
    }

    function removeComplianceOfficer(address officer) external onlyAdmin {
        complianceOfficers[officer] = false;
        emit ComplianceOfficerRemoved(officer);
    }

    function _recordComplianceCheck(
        address user,
        string memory checkType,
        bool passed,
        string memory details
    ) internal {
        complianceHistory[user].push(ComplianceCheck({
            user: user,
            timestamp: block.timestamp,
            checkType: checkType,
            passed: passed,
            details: details,
            verifiedBy: msg.sender
        }));
    }

    function _checkJurisdictionRules(
        string memory jurisdiction,
        uint256 amount
    ) internal view returns (bool) {
        // Check all active rules for the jurisdiction
        for (uint256 i = 0; i < nextRuleId; i++) {
            string memory ruleId = _getRuleId(i);
            RegulatoryRule storage rule = regulatoryRules[ruleId];
            
            if (rule.active && 
                stringsEqual(rule.jurisdiction, jurisdiction) && 
                (amount < rule.minAmount || amount > rule.maxAmount)) {
                return false;
            }
        }
        return true;
    }

    function _getRuleId(uint256 index) internal pure returns (string memory) {
        // This would need to be implemented based on how rules are stored
        // For now, return placeholder
        if (index == 0) return "US_KYC_001";
        if (index == 1) return "US_AML_001";
        if (index == 2) return "EU_KYC_001";
        if (index == 3) return "EU_AML_001";
        if (index == 4) return "GLOBAL_SANCTIONS";
        return "";
    }

    function getUserComplianceStatus(address user) external view returns (
        bool kycVerified,
        bool amlVerified,
        uint256 verificationLevel,
        uint256 lastVerified,
        string memory jurisdiction,
        uint256 transactionLimit,
        uint256 dailyVolume,
        uint256 checksCount
    ) {
        UserCompliance storage compliance = userCompliance[user];
        return (
            compliance.kycVerified,
            compliance.amlVerified,
            compliance.verificationLevel,
            compliance.lastVerified,
            compliance.jurisdiction,
            compliance.transactionLimit,
            compliance.dailyVolume,
            complianceHistory[user].length
        );
    }

    function getComplianceHistory(
        address user,
        uint256 start,
        uint256 count
    ) external view returns (ComplianceCheck[] memory) {
        ComplianceCheck[] storage history = complianceHistory[user];
        uint256 actualCount = count > history.length - start ? history.length - start : count;
        ComplianceCheck[] memory result = new ComplianceCheck[](actualCount);

        for (uint256 i = 0; i < actualCount; i++) {
            result[i] = history[start + i];
        }

        return result;
    }

    function getRegulatoryRules() external view returns (
        string[] memory ruleIds,
        string[] memory jurisdictions,
        string[] memory descriptions,
        bool[] memory activeStatus
    ) {
        uint256 ruleCount = 5; // Fixed for now
        ruleIds = new string[](ruleCount);
        jurisdictions = new string[](ruleCount);
        descriptions = new string[](ruleCount);
        activeStatus = new bool[](ruleCount);

        for (uint256 i = 0; i < ruleCount; i++) {
            string memory ruleId = _getRuleId(i);
            RegulatoryRule storage rule = regulatoryRules[ruleId];
            ruleIds[i] = rule.ruleId;
            jurisdictions[i] = rule.jurisdiction;
            descriptions[i] = rule.description;
            activeStatus[i] = rule.active;
        }

        return (ruleIds, jurisdictions, descriptions, activeStatus);
    }

    function toggleRegulatoryRule(string memory ruleId, bool active) external onlyComplianceOfficer {
        require(bytes(regulatoryRules[ruleId].ruleId).length > 0, "Rule not found");
        regulatoryRules[ruleId].active = active;
        emit ComplianceRuleUpdated(ruleId, active);
    }

    function stringsEqual(string memory a, string memory b) internal pure returns (bool) {
        return RentChainUtils.stringsEqual(a, b);
    }

    function flagSuspiciousActivity(
        address user,
        uint256 amount,
        string memory reason
    ) external onlyComplianceOfficer {
        emit TransactionFlagged(user, amount, reason);
    }

    function emergencyFreezeUser(address user) external onlyComplianceOfficer {
        UserCompliance storage compliance = userCompliance[user];
        compliance.kycVerified = false;
        compliance.amlVerified = false;
        compliance.verificationLevel = 0;
        compliance.transactionLimit = 0;
    }
}