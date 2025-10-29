// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
}

contract RentChainNFT {
    string public constant name = "RentChain Property NFT";
    string public constant symbol = "RENTNFT";
    
    struct PropertyNFT {
        uint256 propertyId;
        address owner;
        uint256 mintedAt;
        string tokenURI;
    }
    
    mapping(uint256 => PropertyNFT) public propertyNFTs;
    mapping(uint256 => uint256) public propertyToTokenId;
    mapping(address => uint256[]) public ownerTokens;
    
    uint256 public nextTokenId;
    address public admin;
    address public propertyRegistry;

    event PropertyNFTMinted(uint256 indexed tokenId, uint256 indexed propertyId, address owner);
    event PropertyNFTTransferred(uint256 indexed tokenId, address from, address to);
    event PropertyRegistryUpdated(address newRegistry);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    modifier onlyPropertyOwner(uint256 propertyId) {
        // This would check the PropertyRegistry contract
        require(msg.sender == getPropertyOwner(propertyId), "Not property owner");
        _;
    }

    constructor(address _propertyRegistry) {
        admin = msg.sender;
        propertyRegistry = _propertyRegistry;
    }

    function mintPropertyNFT(
        uint256 propertyId,
        string memory tokenURI
    ) external onlyPropertyOwner(propertyId) returns (uint256) {
        require(propertyToTokenId[propertyId] == 0, "NFT already minted");
        
        uint256 tokenId = nextTokenId++;
        
        propertyNFTs[tokenId] = PropertyNFT({
            propertyId: propertyId,
            owner: msg.sender,
            mintedAt: block.timestamp,
            tokenURI: tokenURI
        });
        
        propertyToTokenId[propertyId] = tokenId;
        ownerTokens[msg.sender].push(tokenId);
        
        emit PropertyNFTMinted(tokenId, propertyId, msg.sender);
        return tokenId;
    }

    function transferPropertyNFT(
        uint256 tokenId,
        address to
    ) external {
        PropertyNFT storage nft = propertyNFTs[tokenId];
        require(nft.owner == msg.sender, "Not NFT owner");
        
        nft.owner = to;
        
        // Remove from current owner's list
        uint256[] storage currentOwnerTokens = ownerTokens[msg.sender];
        for (uint256 i = 0; i < currentOwnerTokens.length; i++) {
            if (currentOwnerTokens[i] == tokenId) {
                currentOwnerTokens[i] = currentOwnerTokens[currentOwnerTokens.length - 1];
                currentOwnerTokens.pop();
                break;
            }
        }
        
        // Add to new owner's list
        ownerTokens[to].push(tokenId);
        
        emit PropertyNFTTransferred(tokenId, msg.sender, to);
    }

    function getPropertyOwner(uint256 propertyId) public view returns (address) {
        // This would interact with the PropertyRegistry contract
        // For now, return a mock address - in production, this would call the actual registry
        (bool success, bytes memory data) = propertyRegistry.staticcall(
            abi.encodeWithSignature("properties(uint256)", propertyId)
        );
        
        if (success && data.length > 0) {
            (address owner, , , , , , ) = abi.decode(data, (address, string, uint256, string, string, bool, uint256));
            return owner;
        }
        
        return address(0);
    }

    function getTokenByProperty(uint256 propertyId) external view returns (uint256) {
        return propertyToTokenId[propertyId];
    }

    function getOwnerTokens(address owner) external view returns (uint256[] memory) {
        return ownerTokens[owner];
    }

    function getTokenInfo(uint256 tokenId) external view returns (
        uint256 propertyId,
        address owner,
        uint256 mintedAt,
        string memory tokenURI
    ) {
        PropertyNFT storage nft = propertyNFTs[tokenId];
        return (
            nft.propertyId,
            nft.owner,
            nft.mintedAt,
            nft.tokenURI
        );
    }

    function balanceOf(address owner) external view returns (uint256) {
        return ownerTokens[owner].length;
    }

    function ownerOf(uint256 tokenId) external view returns (address) {
        return propertyNFTs[tokenId].owner;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        return propertyNFTs[tokenId].tokenURI;
    }

    function setPropertyRegistry(address newRegistry) external onlyAdmin {
        propertyRegistry = newRegistry;
        emit PropertyRegistryUpdated(newRegistry);
    }

    function batchMintNFTs(
        uint256[] calldata propertyIds,
        string[] calldata tokenURIs
    ) external {
        require(propertyIds.length == tokenURIs.length, "Invalid input");
        
        for (uint256 i = 0; i < propertyIds.length; i++) {
            if (propertyToTokenId[propertyIds[i]] == 0 && getPropertyOwner(propertyIds[i]) == msg.sender) {
                mintPropertyNFT(propertyIds[i], tokenURIs[i]);
            }
        }
    }
}