// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UserRegistry {
    struct UserProfile {
        string name;
        string email;
        string phone;
        string ipfsHash;
        bool isVerified;
        uint256 reputation;
        uint256 joinDate;
        uint256 totalTransactions;
    }

    mapping(address => UserProfile) public users;
    mapping(address => bool) public moderators;
    address public admin;

    event UserRegistered(address indexed user, string name);
    event UserVerified(address indexed user, address verifiedBy);
    event ProfileUpdated(address indexed user);
    event ReputationUpdated(address indexed user, uint256 newReputation);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyModerator() {
        require(moderators[msg.sender] || msg.sender == admin, "Not moderator");
        _;
    }

    constructor() {
        admin = msg.sender;
        moderators[msg.sender] = true;
    }

    function registerUser(
        string memory name,
        string memory email,
        string memory phone,
        string memory ipfsHash
    ) external {
        require(bytes(users[msg.sender].name).length == 0, "Already registered");
        
        users[msg.sender] = UserProfile({
            name: name,
            email: email,
            phone: phone,
            ipfsHash: ipfsHash,
            isVerified: false,
            reputation: 50,
            joinDate: block.timestamp,
            totalTransactions: 0
        });

        emit UserRegistered(msg.sender, name);
    }

    function updateProfile(
        string memory name,
        string memory email,
        string memory phone,
        string memory ipfsHash
    ) external {
        require(bytes(users[msg.sender].name).length > 0, "Not registered");
        
        users[msg.sender].name = name;
        users[msg.sender].email = email;
        users[msg.sender].phone = phone;
        users[msg.sender].ipfsHash = ipfsHash;

        emit ProfileUpdated(msg.sender);
    }

    function verifyUser(address user) external onlyModerator {
        require(bytes(users[user].name).length > 0, "User not registered");
        users[user].isVerified = true;
        emit UserVerified(user, msg.sender);
    }

    function updateReputation(address user, int256 change) external onlyModerator {
        require(bytes(users[user].name).length > 0, "User not registered");
        
        if (change > 0) {
            users[user].reputation += uint256(change);
        } else {
            if (users[user].reputation > uint256(-change)) {
                users[user].reputation -= uint256(-change);
            } else {
                users[user].reputation = 0;
            }
        }

        users[user].totalTransactions++;
        emit ReputationUpdated(user, users[user].reputation);
    }

    function addModerator(address moderator) external onlyAdmin {
        moderators[moderator] = true;
    }

    function removeModerator(address moderator) external onlyAdmin {
        moderators[moderator] = false;
    }

    function getUserReputation(address user) external view returns (uint256) {
        return users[user].reputation;
    }

    function isUserVerified(address user) external view returns (bool) {
        return users[user].isVerified;
    }

    function getVerifiedUsers(uint256 start, uint256 count) external view returns (address[] memory, UserProfile[] memory) {
        address[] memory verifiedAddresses = new address[](count);
        UserProfile[] memory verifiedProfiles = new UserProfile[](count);
        
        uint256 found = 0;
        uint256 current = start;
        
        while (found < count && current < type(uint160).max) {
            address user = address(uint160(current));
            if (bytes(users[user].name).length > 0 && users[user].isVerified) {
                verifiedAddresses[found] = user;
                verifiedProfiles[found] = users[user];
                found++;
            }
            current++;
        }
        
        return (verifiedAddresses, verifiedProfiles);
    }
}