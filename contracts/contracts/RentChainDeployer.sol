// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./RentChainMain.sol";
import "./RentChainEmergency.sol";
import "./RentChainConstants.sol";
import "./RentChainUtils.sol";
import "./TreasuryMock.sol";
import "./DevelopmentMock.sol";
import "./MarketingMock.sol";

contract RentChainDeployer {
    using RentChainUtils for address;

    struct DeployedContracts {
        RentChainMain main;
        RentChainEmergency emergency;
        address treasury;
        address development;
        address marketing;
    }

    address public deployer;
    uint256 public deploymentTime;
    bool public deployed;
    
    DeployedContracts public contracts;

    event SystemDeployed(address mainContract, address emergencySystem, uint256 timestamp);
    event DeploymentFailed(string reason);
    event ContractsUpgraded(address newMainContract);

    modifier onlyDeployer() {
        require(msg.sender == deployer, "Not deployer");
        _;
    }

    constructor() {
        deployer = msg.sender;
        deploymentTime = block.timestamp;
    }

    function deployRentChainSystem() external onlyDeployer {
        require(!deployed, "Already deployed");

        try this._deploySystem() {
            deployed = true;
            emit SystemDeployed(
                address(contracts.main),
                address(contracts.emergency),
                block.timestamp
            );
        } catch Error(string memory reason) {
            emit DeploymentFailed(reason);
            revert(reason);
        } catch {
            emit DeploymentFailed("Unknown deployment error");
            revert("Deployment failed");
        }
    }

    function _deploySystem() internal {
        // Deploy emergency system first
        contracts.emergency = new RentChainEmergency();
        
        // Deploy main contract
        contracts.main = new RentChainMain();
        
        // Set up treasury addresses (would be actual multisigs in production)
        contracts.treasury = address(new TreasuryMock());
        contracts.development = address(new DevelopmentMock());
        contracts.marketing = address(new MarketingMock());

        // Initialize the main system
        contracts.main.initializeSystem(
            address(contracts.emergency),
            contracts.treasury,
            contracts.development,
            contracts.marketing
        );

        // Set up emergency admins
        contracts.emergency.addEmergencyAdmin(address(contracts.main));
        contracts.emergency.addEmergencyAdmin(deployer);
    }

    function upgradeSystem(address newMainContract) external onlyDeployer {
        require(deployed, "System not deployed");
        require(newMainContract != address(0), "Invalid contract");
        require(RentChainUtils.isContract(newMainContract), "Not a contract");

        // Transfer emergency admin rights
        contracts.emergency.removeEmergencyAdmin(address(contracts.main));
        contracts.emergency.addEmergencyAdmin(newMainContract);

        // Update main contract reference
        contracts.main = RentChainMain(newMainContract);
        
        emit ContractsUpgraded(newMainContract);
    }

    function getDeploymentInfo() external view returns (
        address deployerAddress,
        uint256 deployTime,
        bool isDeployed,
        address mainContract,
        address emergencySystem,
        address treasuryWallet,
        address developmentWallet,
        address marketingWallet
    ) {
        return (
            deployer,
            deploymentTime,
            deployed,
            address(contracts.main),
            address(contracts.emergency),
            contracts.treasury,
            contracts.development,
            contracts.marketing
        );
    }

    function verifySystem() external view returns (bool systemHealthy, string memory issues) {
        if (!deployed) {
            return (false, "System not deployed");
        }

        // Check contract addresses
        if (address(contracts.main) == address(0)) {
            return (false, "Main contract not set");
        }
        if (address(contracts.emergency) == address(0)) {
            return (false, "Emergency system not set");
        }

        // Check system initialization
        try contracts.main.initialized() returns (bool init) {
            if (!init) {
                return (false, "Main contract not initialized");
            }
        } catch {
            return (false, "Cannot check initialization");
        }

        // Check emergency system setup
        try contracts.emergency.getEmergencyStatus() returns (
            bool paused,
            bool withdrawalsPaused,
            bool registrationsPaused,
            bool paymentsPaused,
            uint256 pauseStartTime,
            uint256 pauseDuration,
            string memory pauseReason,
            uint256 timeUntilResume
        ) {
            if (paused && pauseDuration == type(uint256).max) {
                return (false, "Emergency system in permanent pause");
            }
        } catch {
            return (false, "Cannot check emergency status");
        }

        return (true, "System healthy");
    }

    function emergencyRecovery() external onlyDeployer {
        require(deployed, "System not deployed");
        
        // Trigger emergency pause
        contracts.emergency.emergencyPauseAll();
        
        // Allow fund recovery
        contracts.emergency.addEmergencyAdmin(address(this));
    }

    function transferDeployer(address newDeployer) external onlyDeployer {
        require(newDeployer != address(0), "Invalid deployer");
        deployer = newDeployer;
    }
}