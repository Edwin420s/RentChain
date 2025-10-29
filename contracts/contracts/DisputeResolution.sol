// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DisputeResolution {
    enum DisputeStatus { Open, InProgress, Resolved, Cancelled }
    enum Resolution { TenantWins, LandlordWins, Split }
    
    struct Dispute {
        uint256 agreementId;
        address raisedBy;
        address against;
        string reason;
        string evidenceIpfs;
        DisputeStatus status;
        Resolution resolution;
        uint256 raisedAt;
        uint256 resolvedAt;
        address resolver;
        uint256 tenantAmount;
        uint256 landlordAmount;
    }

    mapping(uint256 => Dispute) public disputes;
    mapping(address => bool) public arbitrators;
    uint256 public nextDisputeId;
    address public admin;

    event DisputeRaised(uint256 indexed disputeId, uint256 indexed agreementId, address raisedBy);
    event DisputeResolved(uint256 indexed disputeId, Resolution resolution, address resolver);
    event ArbitratorAdded(address arbitrator);
    event ArbitratorRemoved(address arbitrator);

    modifier onlyArbitrator() {
        require(arbitrators[msg.sender] || msg.sender == admin, "Not arbitrator");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
        arbitrators[msg.sender] = true;
    }

    function raiseDispute(
        uint256 agreementId,
        address against,
        string memory reason,
        string memory evidenceIpfs
    ) external returns (uint256) {
        uint256 disputeId = nextDisputeId++;
        
        disputes[disputeId] = Dispute({
            agreementId: agreementId,
            raisedBy: msg.sender,
            against: against,
            reason: reason,
            evidenceIpfs: evidenceIpfs,
            status: DisputeStatus.Open,
            resolution: Resolution.Split,
            raisedAt: block.timestamp,
            resolvedAt: 0,
            resolver: address(0),
            tenantAmount: 0,
            landlordAmount: 0
        });

        emit DisputeRaised(disputeId, agreementId, msg.sender);
        return disputeId;
    }

    function assignDispute(uint256 disputeId) external onlyArbitrator {
        require(disputes[disputeId].status == DisputeStatus.Open, "Dispute not open");
        disputes[disputeId].status = DisputeStatus.InProgress;
    }

    function resolveDispute(
        uint256 disputeId,
        Resolution resolution,
        uint256 tenantAmount,
        uint256 landlordAmount
    ) external onlyArbitrator {
        require(disputes[disputeId].status == DisputeStatus.InProgress, "Dispute not in progress");
        
        disputes[disputeId].status = DisputeStatus.Resolved;
        disputes[disputeId].resolution = resolution;
        disputes[disputeId].resolvedAt = block.timestamp;
        disputes[disputeId].resolver = msg.sender;
        disputes[disputeId].tenantAmount = tenantAmount;
        disputes[disputeId].landlordAmount = landlordAmount;

        emit DisputeResolved(disputeId, resolution, msg.sender);
    }

    function cancelDispute(uint256 disputeId) external {
        require(disputes[disputeId].raisedBy == msg.sender, "Not dispute raiser");
        require(disputes[disputeId].status == DisputeStatus.Open, "Cannot cancel");
        
        disputes[disputeId].status = DisputeStatus.Cancelled;
    }

    function addArbitrator(address arbitrator) external onlyAdmin {
        arbitrators[arbitrator] = true;
        emit ArbitratorAdded(arbitrator);
    }

    function removeArbitrator(address arbitrator) external onlyAdmin {
        arbitrators[arbitrator] = false;
        emit ArbitratorRemoved(arbitrator);
    }

    function getActiveDisputes() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextDisputeId; i++) {
            if (disputes[i].status == DisputeStatus.Open || disputes[i].status == DisputeStatus.InProgress) {
                count++;
            }
        }
        
        uint256[] memory activeDisputes = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextDisputeId; i++) {
            if (disputes[i].status == DisputeStatus.Open || disputes[i].status == DisputeStatus.InProgress) {
                activeDisputes[index] = i;
                index++;
            }
        }
        
        return activeDisputes;
    }

    function getUserDisputes(address user) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextDisputeId; i++) {
            if (disputes[i].raisedBy == user || disputes[i].against == user) {
                count++;
            }
        }
        
        uint256[] memory userDisputes = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextDisputeId; i++) {
            if (disputes[i].raisedBy == user || disputes[i].against == user) {
                userDisputes[index] = i;
                index++;
            }
        }
        
        return userDisputes;
    }
}