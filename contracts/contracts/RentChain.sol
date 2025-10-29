// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PropertyRegistry.sol";
import "./RentAgreement.sol";
import "./EscrowManager.sol";
import "./PaymentProcessor.sol";

contract RentChain {
    PropertyRegistry public propertyRegistry;
    RentAgreement public rentAgreement;
    EscrowManager public escrowManager;
    PaymentProcessor public paymentProcessor;
    
    address public owner;
    uint256 public platformFee;
    
    mapping(address => bool) public verifiedLandlords;
    mapping(address => bool) public verifiedTenants;
    
    event UserVerified(address user, bool isLandlord);
    event PlatformFeeUpdated(uint256 newFee);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(uint256 _platformFee) {
        owner = msg.sender;
        platformFee = _platformFee;
        
        propertyRegistry = new PropertyRegistry();
        rentAgreement = new RentAgreement(address(propertyRegistry));
        escrowManager = new EscrowManager(address(rentAgreement));
        paymentProcessor = new PaymentProcessor();
    }

    function verifyUser(address user, bool isLandlord) external onlyOwner {
        if (isLandlord) {
            verifiedLandlords[user] = true;
        } else {
            verifiedTenants[user] = true;
        }
        emit UserVerified(user, isLandlord);
    }

    function setPlatformFee(uint256 newFee) external onlyOwner {
        platformFee = newFee;
        emit PlatformFeeUpdated(newFee);
    }

    function registerProperty(
        string memory title,
        uint256 price,
        string memory location,
        string memory ipfsHash
    ) external returns (uint256) {
        require(verifiedLandlords[msg.sender], "Not verified landlord");
        return propertyRegistry.registerProperty(title, price, location, ipfsHash);
    }

    function createRentalAgreement(
        uint256 propertyId,
        address tenant,
        uint256 rentAmount,
        uint256 securityDeposit,
        uint256 startDate,
        uint256 endDate,
        address paymentToken
    ) external returns (uint256) {
        require(verifiedTenants[tenant], "Tenant not verified");
        return rentAgreement.createAgreement(
            propertyId,
            tenant,
            rentAmount,
            securityDeposit,
            startDate,
            endDate,
            paymentToken
        );
    }

    function createEscrow(
        address landlord,
        address tenant,
        uint256 amount,
        address token,
        uint256 duration
    ) external returns (uint256) {
        return escrowManager.createEscrow(landlord, tenant, amount, token, duration);
    }

    function processPayment(
        address to,
        uint256 amount,
        address token,
        string memory description
    ) external returns (uint256) {
        return paymentProcessor.processPayment(to, amount, token, description);
    }

    function getSystemInfo() external view returns (
        uint256 totalProperties,
        uint256 totalAgreements,
        uint256 totalEscrows,
        uint256 totalPayments
    ) {
        totalProperties = propertyRegistry.nextPropertyId();
        totalAgreements = rentAgreement.nextAgreementId();
        totalEscrows = escrowManager.nextEscrowId();
        totalPayments = paymentProcessor.nextPaymentId();
    }

    function withdrawFees(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner, amount);
    }
}