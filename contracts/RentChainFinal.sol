// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./RentChainMain.sol";
import "./RentChainTreasuryManager.sol";
import "./RentChainCompliance.sol";
import "./RentChainIntegration.sol";
import "./RentChainConstants.sol";
import "./RentChainUtils.sol";

contract RentChainFinal {
    using RentChainUtils for address;
    using RentChainUtils for uint256;

    // Complete System Contracts
    RentChainMain public mainSystem;
    RentChainTreasuryManager public treasuryManager;
    RentChainCompliance public complianceSystem;
    RentChainIntegration public integrationSystem;

    // System Configuration
    address public systemOwner;
    bool public systemFullyDeployed;
    uint256 public deploymentTimestamp;
    string public systemVersion;

    // Events
    event SystemFullyDeployed(address main, address treasury, address compliance, address integration);
    event SystemUpgraded(string component, address newAddress);
    event EmergencyTriggered(string reason);
    event SystemRecovered();

    modifier onlySystemOwner() {
        require(msg.sender == systemOwner, "Not system owner");
        _;
    }

    modifier whenFullyDeployed() {
        require(systemFullyDeployed, "System not fully deployed");
        _;
    }

    constructor() {
        systemOwner = msg.sender;
        deploymentTimestamp = block.timestamp;
        systemVersion = "1.0.0";
    }

    function deployCompleteSystem() external onlySystemOwner {
        require(!systemFullyDeployed, "System already deployed");

        // Deploy emergency system first
        RentChainEmergency emergencySystem = new RentChainEmergency();

        // Deploy main system
        mainSystem = new RentChainMain();
        
        // Deploy supporting systems
        treasuryManager = new RentChainTreasuryManager(address(emergencySystem));
        complianceSystem = new RentChainCompliance(address(emergencySystem));
        integrationSystem = new RentChainIntegration(address(emergencySystem));

        // Initialize main system
        mainSystem.initializeSystem(
            address(emergencySystem),
            address(treasuryManager),
            systemOwner,
            systemOwner
        );

        // Initialize supporting systems
        treasuryManager.initializeTreasury(systemOwner, systemOwner, systemOwner, systemOwner);
        
        // Set up emergency admins
        emergencySystem.addEmergencyAdmin(address(mainSystem));
        emergencySystem.addEmergencyAdmin(address(treasuryManager));
        emergencySystem.addEmergencyAdmin(address(complianceSystem));
        emergencySystem.addEmergencyAdmin(address(integrationSystem));
        emergencySystem.addEmergencyAdmin(systemOwner);

        systemFullyDeployed = true;

        emit SystemFullyDeployed(
            address(mainSystem),
            address(treasuryManager),
            address(complianceSystem),
            address(integrationSystem)
        );
    }

    function getSystemStatus() external view returns (
        bool fullyDeployed,
        uint256 deployTime,
        string memory version,
        address mainContract,
        address treasuryContract,
        address complianceContract,
        address integrationContract,
        bool mainActive,
        bool treasuryActive,
        bool complianceActive,
        bool integrationActive
    ) {
        return (
            systemFullyDeployed,
            deploymentTimestamp,
            systemVersion,
            address(mainSystem),
            address(treasuryManager),
            address(complianceSystem),
            address(integrationSystem),
            mainSystem.systemActive(),
            true, // These would check actual status
            true,
            true
        );
    }

    function upgradeComponent(
        string memory component,
        address newContract
    ) external onlySystemOwner whenFullyDeployed {
        require(newContract != address(0), "Invalid contract address");
        require(RentChainUtils.isContract(newContract), "Not a contract");

        if (stringsEqual(component, "main")) {
            mainSystem = RentChainMain(newContract);
        } else if (stringsEqual(component, "treasury")) {
            treasuryManager = RentChainTreasuryManager(newContract);
        } else if (stringsEqual(component, "compliance")) {
            complianceSystem = RentChainCompliance(newContract);
        } else if (stringsEqual(component, "integration")) {
            integrationSystem = RentChainIntegration(newContract);
        } else {
            revert("Invalid component");
        }

        emit SystemUpgraded(component, newContract);
    }

    function emergencyShutdown(string memory reason) external onlySystemOwner {
        mainSystem.emergencyShutdown(reason);
        emit EmergencyTriggered(reason);
    }

    function resumeSystem() external onlySystemOwner {
        mainSystem.resumeSystem();
        emit SystemRecovered();
    }

    function transferOwnership(address newOwner) external onlySystemOwner {
        require(newOwner != address(0), "Invalid owner");
        systemOwner = newOwner;
    }

    function getCompleteSystemInfo() external view whenFullyDeployed returns (
        address systemOwnerAddress,
        uint256 deploymentTime,
        string memory currentVersion,
        bool systemActive,
        uint256 totalProperties,
        uint256 totalAgreements,
        uint256 totalUsers,
        uint256 totalVolume,
        address emergencySystemAddress
    ) {
        (
            uint256 properties,
            uint256 agreements,
            uint256 users,
            uint256 volume,
            uint256 activeUsers,
            uint256 platformRevenue,
            uint256 averageRent
        ) = mainSystem.getSystemStats();

        return (
            systemOwner,
            deploymentTimestamp,
            systemVersion,
            mainSystem.systemActive(),
            properties,
            agreements,
            users,
            volume,
            address(mainSystem.emergencySystem())
        );
    }

    function batchOperations(
        address[] calldata users,
        uint256[] calldata operations
    ) external onlySystemOwner {
        require(users.length == operations.length, "Invalid input");
        
        // This would perform batch operations on the system
        // For now, just emit an event
        emit SystemUpgraded("batch_operations", address(0));
    }

    function stringsEqual(string memory a, string memory b) internal pure returns (bool) {
        return RentChainUtils.stringsEqual(a, b);
    }

    function systemHealthCheck() external view whenFullyDeployed returns (
        bool healthy,
        string memory issues
    ) {
        bool mainHealthy = mainSystem.systemActive();
        bool treasuryHealthy = address(treasuryManager) != address(0);
        bool complianceHealthy = address(complianceSystem) != address(0);
        bool integrationHealthy = address(integrationSystem) != address(0);

        if (!mainHealthy) {
            return (false, "Main system not active");
        }
        if (!treasuryHealthy) {
            return (false, "Treasury system not deployed");
        }
        if (!complianceHealthy) {
            return (false, "Compliance system not deployed");
        }
        if (!integrationHealthy) {
            return (false, "Integration system not deployed");
        }

        return (true, "All systems operational");
    }

    receive() external payable {
        // Forward any ETH to treasury
        if (systemFullyDeployed && address(treasuryManager) != address(0)) {
            (bool success, ) = address(treasuryManager).call{value: msg.value}("");
            require(success, "Transfer to treasury failed");
        }
    }
}