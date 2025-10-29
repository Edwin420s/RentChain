// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IERC20.sol";

import "./RentChainBase.sol";
import "./RentChainConstants.sol";



contract RentChainGasStation is RentChainBase {
    struct GasSponsorship {
        address sponsor;
        uint256 totalSponsored;
        uint256 remainingBalance;
        uint256 maxPerUser;
        uint256 usersSponsored;
        bool active;
    }

    struct UserGasUsage {
        uint256 totalUsed;
        uint256 lastUsed;
        uint256 sponsoredCount;
    }

    mapping(address => GasSponsorship) public sponsorships;
    mapping(address => UserGasUsage) public userGasUsage;
    mapping(address => mapping(address => bool)) public userSponsorships;
    
    address public gasToken;
    uint256 public baseGasPrice;
    uint256 public maxSponsorshipAmount;
    uint256 public totalGasSponsored;

    event GasSponsored(address indexed sponsor, address indexed user, uint256 amount);
    event SponsorshipCreated(address indexed sponsor, uint256 amount, uint256 maxPerUser);
    event SponsorshipToppedUp(address indexed sponsor, uint256 additionalAmount);
    event GasPriceUpdated(uint256 newGasPrice);

    modifier onlySponsor(address sponsor) {
        require(sponsorships[sponsor].sponsor == msg.sender, "Not sponsor");
        _;
    }

    constructor(address _emergencySystem, address _gasToken) RentChainBase(_emergencySystem) {
        gasToken = _gasToken;
        baseGasPrice = 1 gwei;
        maxSponsorshipAmount = 1 ether;
    }

    function createSponsorship(
        uint256 totalAmount,
        uint256 _maxPerUser
    ) external whenNotPaused whenInitialized {
        require(totalAmount > 0, "Invalid amount");
        require(totalAmount <= maxSponsorshipAmount, "Amount too high");
        require(_maxPerUser > 0, "Invalid max per user");

        require(IERC20(gasToken).transferFrom(msg.sender, address(this), totalAmount), "Transfer failed");

        sponsorships[msg.sender] = GasSponsorship({
            sponsor: msg.sender,
            totalSponsored: totalAmount,
            remainingBalance: totalAmount,
            maxPerUser: _maxPerUser,
            usersSponsored: 0,
            active: true
        });

        emit SponsorshipCreated(msg.sender, totalAmount, _maxPerUser);
    }

    function sponsorGas(address user, uint256 amount) external whenNotPaused whenInitialized {
        GasSponsorship storage sponsorship = sponsorships[msg.sender];
        require(sponsorship.active, "Sponsorship not active");
        require(sponsorship.remainingBalance >= amount, "Insufficient balance");
        require(amount <= sponsorship.maxPerUser, "Exceeds max per user");
        require(!userSponsorships[msg.sender][user], "Already sponsored");

        sponsorship.remainingBalance -= amount;
        sponsorship.usersSponsored++;
        userGasUsage[user].totalUsed += amount;
        userGasUsage[user].lastUsed = block.timestamp;
        userGasUsage[user].sponsoredCount++;
        userSponsorships[msg.sender][user] = true;

        totalGasSponsored += amount;

        // Transfer gas tokens to user
        require(IERC20(gasToken).transfer(user, amount), "Transfer failed");

        emit GasSponsored(msg.sender, user, amount);
    }

    function topUpSponsorship(uint256 additionalAmount) external whenNotPaused whenInitialized {
        GasSponsorship storage sponsorship = sponsorships[msg.sender];
        require(sponsorship.active, "Sponsorship not active");
        require(additionalAmount > 0, "Invalid amount");

        require(IERC20(gasToken).transferFrom(msg.sender, address(this), additionalAmount), "Transfer failed");

        sponsorship.totalSponsored += additionalAmount;
        sponsorship.remainingBalance += additionalAmount;

        emit SponsorshipToppedUp(msg.sender, additionalAmount);
    }

    function estimateGasCost(uint256 gasAmount) public view returns (uint256 cost) {
        return gasAmount * baseGasPrice;
    }

    function batchSponsorGas(
        address[] calldata users,
        uint256[] calldata amounts
    ) external whenNotPaused whenInitialized {
        require(users.length == amounts.length, "Invalid input");

        GasSponsorship storage sponsorship = sponsorships[msg.sender];
        require(sponsorship.active, "Sponsorship not active");

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }

        require(sponsorship.remainingBalance >= totalAmount, "Insufficient balance");

        for (uint256 i = 0; i < users.length; i++) {
            if (!userSponsorships[msg.sender][users[i]] && amounts[i] <= sponsorship.maxPerUser) {
                sponsorship.remainingBalance -= amounts[i];
                sponsorship.usersSponsored++;
                userGasUsage[users[i]].totalUsed += amounts[i];
                userGasUsage[users[i]].lastUsed = block.timestamp;
                userGasUsage[users[i]].sponsoredCount++;
                userSponsorships[msg.sender][users[i]] = true;
                totalGasSponsored += amounts[i];

                require(IERC20(gasToken).transfer(users[i], amounts[i]), "Transfer failed");

                emit GasSponsored(msg.sender, users[i], amounts[i]);
            }
        }
    }

    function setBaseGasPrice(uint256 newGasPrice) external onlyAdmin {
        baseGasPrice = newGasPrice;
        emit GasPriceUpdated(newGasPrice);
    }

    function setMaxSponsorshipAmount(uint256 newMax) external onlyAdmin {
        maxSponsorshipAmount = newMax;
    }

    function setGasToken(address newGasToken) external onlyAdmin {
        gasToken = newGasToken;
    }

    function getUserGasStats(address user) external view returns (
        uint256 totalUsed,
        uint256 lastUsed,
        uint256 sponsoredCount,
        uint256 eligibleAmount
    ) {
        UserGasUsage storage usage = userGasUsage[user];
        return (
            usage.totalUsed,
            usage.lastUsed,
            usage.sponsoredCount,
            _calculateEligibleAmount(user)
        );
    }

    function getSponsorshipStats(address sponsor) external view returns (
        uint256 totalSponsored,
        uint256 remainingBalance,
        uint256 maxPerUser,
        uint256 usersSponsored,
        bool active
    ) {
        GasSponsorship storage sponsorship = sponsorships[sponsor];
        return (
            sponsorship.totalSponsored,
            sponsorship.remainingBalance,
            sponsorship.maxPerUser,
            sponsorship.usersSponsored,
            sponsorship.active
        );
    }

    function _calculateEligibleAmount(address user) internal view returns (uint256) {
        // Users who haven't used sponsorship recently are more eligible
        UserGasUsage storage usage = userGasUsage[user];
        if (usage.lastUsed == 0) {
            return maxSponsorshipAmount;
        }
        
        uint256 timeSinceLastUse = block.timestamp - usage.lastUsed;
        if (timeSinceLastUse > 30 days) {
            return maxSponsorshipAmount;
        } else if (timeSinceLastUse > 7 days) {
            return maxSponsorshipAmount / 2;
        } else {
            return maxSponsorshipAmount / 4;
        }
    }

    function deactivateSponsorship() external {
        GasSponsorship storage sponsorship = sponsorships[msg.sender];
        sponsorship.active = false;
    }

    function reactivateSponsorship() external {
        GasSponsorship storage sponsorship = sponsorships[msg.sender];
        require(sponsorship.remainingBalance > 0, "No balance");
        sponsorship.active = true;
    }

    function withdrawRemainingSponsorship() external {
        GasSponsorship storage sponsorship = sponsorships[msg.sender];
        require(!sponsorship.active, "Deactivate first");
        require(sponsorship.remainingBalance > 0, "No balance");

        uint256 amount = sponsorship.remainingBalance;
        sponsorship.remainingBalance = 0;

        require(IERC20(gasToken).transfer(msg.sender, amount), "Transfer failed");
    }

    function emergencyGasRefund(address user, uint256 amount) external onlyAdmin {
        require(IERC20(gasToken).transfer(user, amount), "Transfer failed");
    }

    function getPlatformGasStats() external view returns (
        uint256 totalSponsoredGas,
        uint256 activeSponsorships,
        uint256 totalUsersSponsored,
        uint256 currentBaseGasPrice
    ) {
        uint256 activeCount = 0;
        uint256 userCount = 0;
        
        // These would be calculated from storage in production
        // For now, return basic stats
        return (
            totalGasSponsored,
            activeCount,
            userCount,
            baseGasPrice
        );
    }
}