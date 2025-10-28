// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract RentAgreement {
    enum AgreementStatus { Created, Active, Completed, Cancelled, Disputed }
    
    struct Agreement {
        uint256 propertyId;
        address landlord;
        address tenant;
        uint256 rentAmount;
        uint256 securityDeposit;
        uint256 totalPaid;
        uint256 startDate;
        uint256 endDate;
        AgreementStatus status;
        bool landlordConfirmed;
        bool tenantConfirmed;
        address paymentToken;
    }

    mapping(uint256 => Agreement) public agreements;
    mapping(uint256 => mapping(uint256 => bool)) public rentPayments;
    uint256 public nextAgreementId;
    
    PropertyRegistry public propertyRegistry;
    
    event AgreementCreated(uint256 indexed agreementId, uint256 indexed propertyId, address landlord, address tenant);
    event RentPaid(uint256 indexed agreementId, address indexed tenant, uint256 amount);
    event DepositRefunded(uint256 indexed agreementId, address indexed tenant, uint256 amount);
    event AgreementCompleted(uint256 indexed agreementId);
    event DisputeRaised(uint256 indexed agreementId, address raisedBy);
    event AgreementCancelled(uint256 indexed agreementId);

    constructor(address _propertyRegistry) {
        propertyRegistry = PropertyRegistry(_propertyRegistry);
    }

    function createAgreement(
        uint256 propertyId,
        address tenant,
        uint256 rentAmount,
        uint256 securityDeposit,
        uint256 startDate,
        uint256 endDate,
        address paymentToken
    ) external returns (uint256) {
        (address owner, , , , , bool isActive, ) = propertyRegistry.properties(propertyId);
        require(owner == msg.sender, "Not property owner");
        require(isActive, "Property not active");
        require(tenant != address(0), "Invalid tenant");
        require(startDate < endDate, "Invalid dates");

        uint256 agreementId = nextAgreementId++;
        
        agreements[agreementId] = Agreement({
            propertyId: propertyId,
            landlord: msg.sender,
            tenant: tenant,
            rentAmount: rentAmount,
            securityDeposit: securityDeposit,
            totalPaid: 0,
            startDate: startDate,
            endDate: endDate,
            status: AgreementStatus.Created,
            landlordConfirmed: false,
            tenantConfirmed: false,
            paymentToken: paymentToken
        });

        emit AgreementCreated(agreementId, propertyId, msg.sender, tenant);
        return agreementId;
    }

    function confirmAgreement(uint256 agreementId) external {
        Agreement storage agreement = agreements[agreementId];
        require(agreement.status == AgreementStatus.Created, "Invalid status");
        
        if (msg.sender == agreement.landlord) {
            agreement.landlordConfirmed = true;
        } else if (msg.sender == agreement.tenant) {
            agreement.tenantConfirmed = true;
        } else {
            revert("Not party to agreement");
        }
        
        if (agreement.landlordConfirmed && agreement.tenantConfirmed) {
            agreement.status = AgreementStatus.Active;
        }
    }

    function payRent(uint256 agreementId, uint256 amount) external {
        Agreement storage agreement = agreements[agreementId];
        require(agreement.status == AgreementStatus.Active, "Agreement not active");
        require(msg.sender == agreement.tenant, "Only tenant can pay");
        require(amount == agreement.rentAmount, "Incorrect rent amount");

        IERC20 token = IERC20(agreement.paymentToken);
        require(token.transferFrom(msg.sender, address(this), amount), "Payment failed");

        agreement.totalPaid += amount;
        uint256 paymentMonth = (block.timestamp - agreement.startDate) / 30 days;
        rentPayments[agreementId][paymentMonth] = true;

        emit RentPaid(agreementId, msg.sender, amount);
    }

    function releaseDeposit(uint256 agreementId) external {
        Agreement storage agreement = agreements[agreementId];
        require(agreement.status == AgreementStatus.Active, "Agreement not active");
        require(block.timestamp >= agreement.endDate, "Agreement not ended");
        require(msg.sender == agreement.landlord, "Only landlord can release");

        IERC20 token = IERC20(agreement.paymentToken);
        
        uint256 landlordAmount = agreement.totalPaid;
        uint256 tenantAmount = agreement.securityDeposit;

        if (tenantAmount > 0) {
            require(token.transfer(agreement.tenant, tenantAmount), "Refund failed");
            emit DepositRefunded(agreementId, agreement.tenant, tenantAmount);
        }

        if (landlordAmount > 0) {
            require(token.transfer(agreement.landlord, landlordAmount), "Transfer failed");
        }

        agreement.status = AgreementStatus.Completed;
        emit AgreementCompleted(agreementId);
    }

    function raiseDispute(uint256 agreementId) external {
        Agreement storage agreement = agreements[agreementId];
        require(msg.sender == agreement.landlord || msg.sender == agreement.tenant, "Not party to agreement");
        require(agreement.status == AgreementStatus.Active, "Agreement not active");
        
        agreement.status = AgreementStatus.Disputed;
        emit DisputeRaised(agreementId, msg.sender);
    }

    function cancelAgreement(uint256 agreementId) external {
        Agreement storage agreement = agreements[agreementId];
        require(msg.sender == agreement.landlord || msg.sender == agreement.tenant, "Not party to agreement");
        require(agreement.status == AgreementStatus.Created, "Cannot cancel");
        
        agreement.status = AgreementStatus.Cancelled;
        emit AgreementCancelled(agreementId);
    }

    function getTenantAgreements(address tenant) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextAgreementId; i++) {
            if (agreements[i].tenant == tenant) {
                count++;
            }
        }
        
        uint256[] memory tenantAgreements = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextAgreementId; i++) {
            if (agreements[i].tenant == tenant) {
                tenantAgreements[index] = i;
                index++;
            }
        }
        
        return tenantAgreements;
    }

    function getLandlordAgreements(address landlord) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextAgreementId; i++) {
            if (agreements[i].landlord == landlord) {
                count++;
            }
        }
        
        uint256[] memory landlordAgreements = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextAgreementId; i++) {
            if (agreements[i].landlord == landlord) {
                landlordAgreements[index] = i;
                index++;
            }
        }
        
        return landlordAgreements;
    }
}