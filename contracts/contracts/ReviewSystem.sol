// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ReviewSystem {
    struct Review {
        address reviewer;
        address reviewed;
        uint256 agreementId;
        uint8 rating;
        string comment;
        string ipfsHash;
        uint256 timestamp;
        bool isVerified;
    }

    mapping(uint256 => Review) public reviews;
    mapping(address => uint256[]) public userReviews;
    mapping(uint256 => bool) public agreementReviewed;
    uint256 public nextReviewId;

    event ReviewSubmitted(uint256 indexed reviewId, address indexed reviewer, address indexed reviewed);
    event ReviewVerified(uint256 indexed reviewId);

    function submitReview(
        address reviewed,
        uint256 agreementId,
        uint8 rating,
        string memory comment,
        string memory ipfsHash
    ) external returns (uint256) {
        require(rating >= 1 && rating <= 5, "Invalid rating");
        require(!agreementReviewed[agreementId], "Agreement already reviewed");

        uint256 reviewId = nextReviewId++;
        
        reviews[reviewId] = Review({
            reviewer: msg.sender,
            reviewed: reviewed,
            agreementId: agreementId,
            rating: rating,
            comment: comment,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            isVerified: false
        });

        userReviews[msg.sender].push(reviewId);
        userReviews[reviewed].push(reviewId);
        agreementReviewed[agreementId] = true;

        emit ReviewSubmitted(reviewId, msg.sender, reviewed);
        return reviewId;
    }

    function verifyReview(uint256 reviewId) external {
        require(reviews[reviewId].reviewer != address(0), "Review not found");
        reviews[reviewId].isVerified = true;
        emit ReviewVerified(reviewId);
    }

    function getUserReviews(address user) external view returns (uint256[] memory) {
        return userReviews[user];
    }

    function getAgreementReview(uint256 agreementId) external view returns (uint256) {
        for (uint256 i = 0; i < nextReviewId; i++) {
            if (reviews[i].agreementId == agreementId) {
                return i;
            }
        }
        return type(uint256).max;
    }

    function calculateAverageRating(address user) external view returns (uint256) {
        uint256 total = 0;
        uint256 count = 0;
        
        for (uint256 i = 0; i < nextReviewId; i++) {
            if (reviews[i].reviewed == user && reviews[i].isVerified) {
                total += reviews[i].rating;
                count++;
            }
        }
        
        return count > 0 ? total / count : 0;
    }

    function getRecentReviews(uint256 count) external view returns (uint256[] memory, Review[] memory) {
        uint256 actualCount = count > nextReviewId ? nextReviewId : count;
        uint256[] memory reviewIds = new uint256[](actualCount);
        Review[] memory recentReviews = new Review[](actualCount);
        
        for (uint256 i = 0; i < actualCount; i++) {
            uint256 reviewId = nextReviewId - 1 - i;
            reviewIds[i] = reviewId;
            recentReviews[i] = reviews[reviewId];
        }
        
        return (reviewIds, recentReviews);
    }
}