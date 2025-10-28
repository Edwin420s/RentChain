// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PropertyRegistry.sol";
import "./RentAgreement.sol";
import "./EscrowManager.sol";
import "./PaymentProcessor.sol";
import "./UserRegistry.sol";
import "./DisputeResolution.sol";
import "./ReviewSystem.sol";

contract RentChainFactory {
    struct DeployedContracts {
        address propertyRegistry;
        address rentAgreement;
        address escrowManager;
        address paymentProcessor;
        address userRegistry;
        address disputeResolution;
        address reviewSystem;
    }

    mapping(address => DeployedContracts) public userContracts;
    address[] public allDeployers;

    event ContractsDeployed(address indexed deployer, DeployedContracts contracts);

    function deployRentChain() external returns (DeployedContracts memory) {
        require(userContracts[msg.sender].propertyRegistry == address(0), "Already deployed");

        PropertyRegistry propertyRegistry = new PropertyRegistry();
        RentAgreement rentAgreement = new RentAgreement(address(propertyRegistry));
        EscrowManager escrowManager = new EscrowManager(address(rentAgreement));
        PaymentProcessor paymentProcessor = new PaymentProcessor();
        UserRegistry userRegistry = new UserRegistry();
        DisputeResolution disputeResolution = new DisputeResolution();
        ReviewSystem reviewSystem = new ReviewSystem();

        DeployedContracts memory contracts = DeployedContracts({
            propertyRegistry: address(propertyRegistry),
            rentAgreement: address(rentAgreement),
            escrowManager: address(escrowManager),
            paymentProcessor: address(paymentProcessor),
            userRegistry: address(userRegistry),
            disputeResolution: address(disputeResolution),
            reviewSystem: address(reviewSystem)
        });

        userContracts[msg.sender] = contracts;
        allDeployers.push(msg.sender);

        emit ContractsDeployed(msg.sender, contracts);
        return contracts;
    }

    function getUserContracts(address user) external view returns (DeployedContracts memory) {
        return userContracts[user];
    }

    function getAllDeployers() external view returns (address[] memory) {
        return allDeployers;
    }

    function getTotalDeployments() external view returns (uint256) {
        return allDeployers.length;
    }
}