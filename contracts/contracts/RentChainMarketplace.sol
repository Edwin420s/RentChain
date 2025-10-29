// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IERC20.sol";



interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
}

contract RentChainMarketplace {
    struct Listing {
        address seller;
        address token;
        uint256 tokenId;
        uint256 price;
        uint256 expiresAt;
        bool isActive;
        bool isAuction;
        uint256 highestBid;
        address highestBidder;
        uint256 auctionEnd;
    }

    struct Offer {
        address buyer;
        uint256 amount;
        uint256 expiresAt;
        bool accepted;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => mapping(address => Offer)) public offers;
    mapping(address => uint256) public userListings;
    mapping(address => uint256) public userOffers;
    
    address public admin;
    uint256 public listingFee;
    uint256 public nextListingId;
    uint256 public constant MIN_AUCTION_DURATION = 1 hours;
    uint256 public constant MAX_AUCTION_DURATION = 30 days;

    event ListingCreated(uint256 indexed listingId, address seller, address token, uint256 tokenId, uint256 price, bool isAuction);
    event ListingUpdated(uint256 indexed listingId, uint256 newPrice);
    event ListingCancelled(uint256 indexed listingId);
    event ListingSold(uint256 indexed listingId, address buyer, uint256 price);
    event BidPlaced(uint256 indexed listingId, address bidder, uint256 amount);
    event BidWithdrawn(uint256 indexed listingId, address bidder);
    event OfferMade(uint256 indexed listingId, address buyer, uint256 amount);
    event OfferAccepted(uint256 indexed listingId, address buyer, uint256 amount);
    event OfferCancelled(uint256 indexed listingId, address buyer);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlySeller(uint256 listingId) {
        require(listings[listingId].seller == msg.sender, "Not seller");
        _;
    }

    modifier listingExists(uint256 listingId) {
        require(listings[listingId].seller != address(0), "Listing not found");
        _;
    }

    modifier isActive(uint256 listingId) {
        require(listings[listingId].isActive, "Listing not active");
        _;
    }

    constructor() {
        admin = msg.sender;
        listingFee = 0.001 ether;
    }

    function createListing(
        address token,
        uint256 tokenId,
        uint256 price,
        uint256 duration,
        bool isAuction
    ) external payable returns (uint256) {
        require(msg.value >= listingFee, "Insufficient listing fee");
        require(IERC721(token).ownerOf(tokenId) == msg.sender, "Not token owner");
        require(duration > 0, "Invalid duration");

        uint256 listingId = nextListingId++;
        
        listings[listingId] = Listing({
            seller: msg.sender,
            token: token,
            tokenId: tokenId,
            price: price,
            expiresAt: block.timestamp + duration,
            isActive: true,
            isAuction: isAuction,
            highestBid: 0,
            highestBidder: address(0),
            auctionEnd: isAuction ? block.timestamp + duration : 0
        });

        userListings[msg.sender]++;

        emit ListingCreated(listingId, msg.sender, token, tokenId, price, isAuction);
        return listingId;
    }

    function buyListing(uint256 listingId) external payable listingExists(listingId) isActive(listingId) {
        Listing storage listing = listings[listingId];
        require(!listing.isAuction, "Listing is auction");
        require(block.timestamp <= listing.expiresAt, "Listing expired");
        require(msg.value >= listing.price, "Insufficient payment");

        listing.isActive = false;

        IERC721(listing.token).transferFrom(listing.seller, msg.sender, listing.tokenId);

        uint256 fee = (listing.price * 250) / 10000; // 2.5% fee
        uint256 sellerAmount = listing.price - fee;

        payable(listing.seller).transfer(sellerAmount);
        payable(admin).transfer(fee);

        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }

        emit ListingSold(listingId, msg.sender, listing.price);
    }

    function placeBid(uint256 listingId) external payable listingExists(listingId) isActive(listingId) {
        Listing storage listing = listings[listingId];
        require(listing.isAuction, "Not an auction");
        require(block.timestamp <= listing.auctionEnd, "Auction ended");
        require(msg.value > listing.highestBid, "Bid too low");
        require(msg.value >= listing.price, "Bid below reserve");

        if (listing.highestBidder != address(0)) {
            payable(listing.highestBidder).transfer(listing.highestBid);
        }

        listing.highestBid = msg.value;
        listing.highestBidder = msg.sender;

        emit BidPlaced(listingId, msg.sender, msg.value);
    }

    function finalizeAuction(uint256 listingId) external listingExists(listingId) isActive(listingId) {
        Listing storage listing = listings[listingId];
        require(listing.isAuction, "Not an auction");
        require(block.timestamp > listing.auctionEnd, "Auction not ended");
        require(listing.highestBidder != address(0), "No bids");

        listing.isActive = false;

        IERC721(listing.token).transferFrom(listing.seller, listing.highestBidder, listing.tokenId);

        uint256 fee = (listing.highestBid * 250) / 10000; // 2.5% fee
        uint256 sellerAmount = listing.highestBid - fee;

        payable(listing.seller).transfer(sellerAmount);
        payable(admin).transfer(fee);

        emit ListingSold(listingId, listing.highestBidder, listing.highestBid);
    }

    function makeOffer(uint256 listingId, uint256 amount, uint256 duration) external listingExists(listingId) isActive(listingId) {
        Listing storage listing = listings[listingId];
        require(!listing.isAuction, "Cannot offer on auction");
        require(block.timestamp <= listing.expiresAt, "Listing expired");
        require(offers[listingId][msg.sender].amount == 0, "Offer already exists");

        offers[listingId][msg.sender] = Offer({
            buyer: msg.sender,
            amount: amount,
            expiresAt: block.timestamp + duration,
            accepted: false
        });

        userOffers[msg.sender]++;

        emit OfferMade(listingId, msg.sender, amount);
    }

    function acceptOffer(uint256 listingId, address buyer) external onlySeller(listingId) listingExists(listingId) isActive(listingId) {
        Offer storage offer = offers[listingId][buyer];
        require(offer.amount > 0, "No offer found");
        require(block.timestamp <= offer.expiresAt, "Offer expired");
        require(!offer.accepted, "Offer already accepted");

        offer.accepted = true;
        listings[listingId].isActive = false;

        IERC721(listings[listingId].token).transferFrom(msg.sender, buyer, listings[listingId].tokenId);

        uint256 fee = (offer.amount * 250) / 10000; // 2.5% fee
        uint256 sellerAmount = offer.amount - fee;

        payable(msg.sender).transfer(sellerAmount);
        payable(admin).transfer(fee);

        emit OfferAccepted(listingId, buyer, offer.amount);
        emit ListingSold(listingId, buyer, offer.amount);
    }

    function cancelListing(uint256 listingId) external onlySeller(listingId) listingExists(listingId) isActive(listingId) {
        Listing storage listing = listings[listingId];
        
        if (listing.isAuction && listing.highestBidder != address(0)) {
            payable(listing.highestBidder).transfer(listing.highestBid);
        }

        listing.isActive = false;
        userListings[msg.sender]--;

        emit ListingCancelled(listingId);
    }

    function withdrawBid(uint256 listingId) external listingExists(listingId) {
        Listing storage listing = listings[listingId];
        require(listing.isAuction, "Not an auction");
        require(listing.highestBidder == msg.sender, "Not highest bidder");
        require(block.timestamp > listing.auctionEnd, "Auction not ended");

        uint256 bidAmount = listing.highestBid;
        listing.highestBid = 0;
        listing.highestBidder = address(0);

        payable(msg.sender).transfer(bidAmount);

        emit BidWithdrawn(listingId, msg.sender);
    }

    function cancelOffer(uint256 listingId) external listingExists(listingId) {
        Offer storage offer = offers[listingId][msg.sender];
        require(offer.amount > 0, "No offer found");
        require(!offer.accepted, "Offer already accepted");
        require(block.timestamp <= offer.expiresAt, "Offer expired");

        delete offers[listingId][msg.sender];
        userOffers[msg.sender]--;

        emit OfferCancelled(listingId, msg.sender);
    }

    function updateListingPrice(uint256 listingId, uint256 newPrice) external onlySeller(listingId) listingExists(listingId) isActive(listingId) {
        require(newPrice > 0, "Invalid price");
        
        listings[listingId].price = newPrice;

        emit ListingUpdated(listingId, newPrice);
    }

    function getActiveListings(uint256 start, uint256 count) external view returns (uint256[] memory, Listing[] memory) {
        uint256[] memory activeIds = new uint256[](count);
        Listing[] memory activeListings = new Listing[](count);
        
        uint256 found = 0;
        for (uint256 i = start; i < nextListingId && found < count; i++) {
            if (listings[i].isActive && block.timestamp <= listings[i].expiresAt) {
                activeIds[found] = i;
                activeListings[found] = listings[i];
                found++;
            }
        }
        
        return (activeIds, activeListings);
    }

    function getUserListings(address user) external view returns (uint256[] memory) {
        uint256[] memory userListingIds = new uint256[](userListings[user]);
        uint256 index = 0;
        
        for (uint256 i = 0; i < nextListingId; i++) {
            if (listings[i].seller == user) {
                userListingIds[index] = i;
                index++;
            }
        }
        
        return userListingIds;
    }

    function getUserOffers(address user) external view returns (uint256[] memory, address[] memory) {
        uint256[] memory offerListingIds = new uint256[](userOffers[user]);
        address[] memory offerSellers = new address[](userOffers[user]);
        uint256 index = 0;
        
        for (uint256 i = 0; i < nextListingId; i++) {
            if (offers[i][user].amount > 0) {
                offerListingIds[index] = i;
                offerSellers[index] = listings[i].seller;
                index++;
            }
        }
        
        return (offerListingIds, offerSellers);
    }

    function setListingFee(uint256 newFee) external onlyAdmin {
        listingFee = newFee;
    }

    function withdrawFees(uint256 amount) external onlyAdmin {
        payable(admin).transfer(amount);
    }

    function emergencyCancelListing(uint256 listingId) external onlyAdmin {
        listings[listingId].isActive = false;
        emit ListingCancelled(listingId);
    }
}