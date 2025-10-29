// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IERC20.sol";



contract RentChainDAO {
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
        uint256 value;
    }

    struct Vote {
        bool hasVoted;
        uint8 support;
        uint256 votes;
    }

    IERC20 public governanceToken;
    address public admin;
    uint256 public proposalThreshold;
    uint256 public votingDelay;
    uint256 public votingPeriod;
    uint256 public quorum;

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(address => uint256) public votingPower;
    uint256 public nextProposalId;

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer);
    event VoteCast(uint256 indexed proposalId, address indexed voter, uint8 support, uint256 votes);
    event ProposalExecuted(uint256 indexed proposalId);
    event VotingPowerUpdated(address indexed voter, uint256 votingPower);
    event DAOParametersUpdated(uint256 threshold, uint256 delay, uint256 period, uint256 quorum);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address _governanceToken) {
        governanceToken = IERC20(_governanceToken);
        admin = msg.sender;
        proposalThreshold = 10000 * 10**18;
        votingDelay = 1 days;
        votingPeriod = 3 days;
        quorum = 400000 * 10**18;
    }

    function propose(
        string memory title,
        string memory description,
        string memory ipfsHash,
        address target,
        bytes memory data,
        uint256 value
    ) external returns (uint256) {
        require(votingPower[msg.sender] >= proposalThreshold, "Below proposal threshold");

        uint256 proposalId = nextProposalId++;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            title: title,
            description: description,
            ipfsHash: ipfsHash,
            voteStart: block.timestamp + votingDelay,
            voteEnd: block.timestamp + votingDelay + votingPeriod,
            forVotes: 0,
            againstVotes: 0,
            abstainVotes: 0,
            executed: false,
            target: target,
            data: data,
            value: value
        });

        emit ProposalCreated(proposalId, msg.sender);
        return proposalId;
    }

    function castVote(uint256 proposalId, uint8 support) external {
        require(support >= 1 && support <= 3, "Invalid vote type");
        
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.voteStart, "Voting not started");
        require(block.timestamp <= proposal.voteEnd, "Voting ended");
        require(!votes[proposalId][msg.sender].hasVoted, "Already voted");

        uint256 power = votingPower[msg.sender];
        require(power > 0, "No voting power");

        votes[proposalId][msg.sender] = Vote({
            hasVoted: true,
            support: support,
            votes: power
        });

        if (support == 1) {
            proposal.forVotes += power;
        } else if (support == 2) {
            proposal.againstVotes += power;
        } else if (support == 3) {
            proposal.abstainVotes += power;
        }

        emit VoteCast(proposalId, msg.sender, support, power);
    }

    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.voteEnd, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(proposal.forVotes > proposal.againstVotes, "Proposal failed");
        require(proposal.forVotes + proposal.againstVotes >= quorum, "Quorum not reached");

        proposal.executed = true;
        
        (bool success, ) = proposal.target.call{value: proposal.value}(proposal.data);
        require(success, "Execution failed");

        emit ProposalExecuted(proposalId);
    }

    function updateVotingPower(address voter) external {
        uint256 balance = governanceToken.balanceOf(voter);
        votingPower[voter] = balance;
        emit VotingPowerUpdated(voter, balance);
    }

    function batchUpdateVotingPower(address[] calldata voters) external {
        for (uint256 i = 0; i < voters.length; i++) {
            uint256 balance = governanceToken.balanceOf(voters[i]);
            votingPower[voters[i]] = balance;
            emit VotingPowerUpdated(voters[i], balance);
        }
    }

    function setProposalThreshold(uint256 threshold) external onlyAdmin {
        proposalThreshold = threshold;
        emit DAOParametersUpdated(threshold, votingDelay, votingPeriod, quorum);
    }

    function setVotingDelay(uint256 delay) external onlyAdmin {
        votingDelay = delay;
        emit DAOParametersUpdated(proposalThreshold, delay, votingPeriod, quorum);
    }

    function setVotingPeriod(uint256 period) external onlyAdmin {
        votingPeriod = period;
        emit DAOParametersUpdated(proposalThreshold, votingDelay, period, quorum);
    }

    function setQuorum(uint256 newQuorum) external onlyAdmin {
        quorum = newQuorum;
        emit DAOParametersUpdated(proposalThreshold, votingDelay, votingPeriod, newQuorum);
    }

    function getProposalVotes(uint256 proposalId) external view returns (
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (proposal.forVotes, proposal.againstVotes, proposal.abstainVotes);
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

    function getVoterInfo(address voter, uint256 proposalId) external view returns (bool hasVoted, uint8 support, uint256 votesCast) {
        Vote memory voterVote = votes[proposalId][voter];
        return (voterVote.hasVoted, voterVote.support, voterVote.votes);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }

    receive() external payable {}
}