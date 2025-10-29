// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IERC20.sol";



contract RentChainGovernance {
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        string ipfsHash;
        uint256 voteStart;
        uint256 voteEnd;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool executed;
        address target;
        bytes data;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => uint256)) public votes;
    mapping(address => uint256) public votingPower;
    
    IERC20 public governanceToken;
    uint256 public nextProposalId;
    uint256 public proposalThreshold;
    uint256 public votingPeriod;
    address public admin;

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer);
    event VoteCast(uint256 indexed proposalId, address indexed voter, uint256 support, uint256 votes);
    event ProposalExecuted(uint256 indexed proposalId);
    event VotingPowerUpdated(address indexed user, uint256 newPower);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address _governanceToken) {
        governanceToken = IERC20(_governanceToken);
        admin = msg.sender;
        proposalThreshold = 1000 * 10**18;
        votingPeriod = 3 days;
    }

    function createProposal(
        string memory title,
        string memory description,
        string memory ipfsHash,
        address target,
        bytes memory data
    ) external returns (uint256) {
        uint256 power = votingPower[msg.sender];
        require(power >= proposalThreshold, "Insufficient voting power");

        uint256 proposalId = nextProposalId++;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            ipfsHash: ipfsHash,
            voteStart: block.timestamp,
            voteEnd: block.timestamp + votingPeriod,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            executed: false,
            target: target,
            data: data
        });

        emit ProposalCreated(proposalId, msg.sender);
        return proposalId;
    }

    function castVote(uint256 proposalId, uint256 support) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.voteStart, "Voting not started");
        require(block.timestamp <= proposal.voteEnd, "Voting ended");
        require(votes[proposalId][msg.sender] == 0, "Already voted");

        uint256 power = votingPower[msg.sender];
        require(power > 0, "No voting power");

        if (support == 1) {
            proposal.forVotes += power;
        } else if (support == 2) {
            proposal.againstVotes += power;
        } else if (support == 3) {
            proposal.abstainVotes += power;
        } else {
            revert("Invalid support value");
        }

        votes[proposalId][msg.sender] = power;
        emit VoteCast(proposalId, msg.sender, support, power);
    }

    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.voteEnd, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(proposal.forVotes > proposal.againstVotes, "Proposal failed");

        (bool success, ) = proposal.target.call(proposal.data);
        require(success, "Execution failed");

        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }

    function updateVotingPower(address user) external {
        uint256 balance = governanceToken.balanceOf(user);
        votingPower[user] = balance;
        emit VotingPowerUpdated(user, balance);
    }

    function setProposalThreshold(uint256 threshold) external onlyAdmin {
        proposalThreshold = threshold;
    }

    function setVotingPeriod(uint256 period) external onlyAdmin {
        votingPeriod = period;
    }

    function getActiveProposals() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextProposalId; i++) {
            if (block.timestamp <= proposals[i].voteEnd && !proposals[i].executed) {
                count++;
            }
        }
        
        uint256[] memory activeProposals = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nextProposalId; i++) {
            if (block.timestamp <= proposals[i].voteEnd && !proposals[i].executed) {
                activeProposals[index] = i;
                index++;
            }
        }
        
        return activeProposals;
    }
}