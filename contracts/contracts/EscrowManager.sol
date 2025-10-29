// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IERC20.sol";

contract EscrowManager {
    struct Escrow {
        address landlord;
        address tenant;
        uint256 amount;
        address token;
        uint256 releaseTime;
        bool released;
        bool disputed;
    }

    mapping(uint256 => Escrow) public escrows;
    uint256 public nextEscrowId;
    
    address public rentAgreement;

    event EscrowCreated(uint256 indexed escrowId, address indexed landlord, address indexed tenant, uint256 amount);
    event EscrowReleased(uint256 indexed escrowId, address indexed to, uint256 amount);
    event EscrowDisputed(uint256 indexed escrowId);
    event EscrowResolved(uint256 indexed escrowId, address indexed winner, uint256 amount);

    constructor(address _rentAgreement) {
        rentAgreement = _rentAgreement;
    }

    function createEscrow(
        address landlord,
        address tenant,
        uint256 amount,
        address token,
        uint256 duration
    ) external returns (uint256) {
        require(amount > 0, "Invalid amount");
        
        IERC20 paymentToken = IERC20(token);
        require(paymentToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        uint256 escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow({
            landlord: landlord,
            tenant: tenant,
            amount: amount,
            token: token,
            releaseTime: block.timestamp + duration,
            released: false,
            disputed: false
        });

        emit EscrowCreated(escrowId, landlord, tenant, amount);
        return escrowId;
    }

    function releaseEscrow(uint256 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(!escrow.released, "Already released");
        require(!escrow.disputed, "Escrow disputed");
        require(block.timestamp >= escrow.releaseTime, "Too early to release");
        require(msg.sender == escrow.landlord, "Only landlord can release");

        IERC20 token = IERC20(escrow.token);
        require(token.transfer(escrow.landlord, escrow.amount), "Transfer failed");

        escrow.released = true;
        emit EscrowReleased(escrowId, escrow.landlord, escrow.amount);
    }

    function refundTenant(uint256 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(!escrow.released, "Already released");
        require(!escrow.disputed, "Escrow disputed");
        require(msg.sender == escrow.landlord, "Only landlord can refund");

        IERC20 token = IERC20(escrow.token);
        require(token.transfer(escrow.tenant, escrow.amount), "Transfer failed");

        escrow.released = true;
        emit EscrowReleased(escrowId, escrow.tenant, escrow.amount);
    }

    function raiseDispute(uint256 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(!escrow.released, "Already released");
        require(msg.sender == escrow.landlord || msg.sender == escrow.tenant, "Not party to escrow");
        
        escrow.disputed = true;
        emit EscrowDisputed(escrowId);
    }

    function resolveDispute(uint256 escrowId, address winner, uint256 amount) external {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.disputed, "No dispute raised");
        require(!escrow.released, "Already released");
        require(amount <= escrow.amount, "Amount too high");

        IERC20 token = IERC20(escrow.token);
        require(token.transfer(winner, amount), "Transfer failed");

        escrow.released = true;
        emit EscrowResolved(escrowId, winner, amount);
    }

    function getEscrowBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}