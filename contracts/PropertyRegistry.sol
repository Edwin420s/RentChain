// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PropertyRegistry {
    struct Property {
        address owner;
        string title;
        uint256 price;
        string location;
        string ipfsHash;
        bool isActive;
        uint256 timestamp;
    }

    mapping(uint256 => Property) public properties;
    mapping(address => uint256[]) public ownerProperties;
    uint256 public nextPropertyId;

    event PropertyRegistered(uint256 indexed propertyId, address indexed owner, string title, uint256 price);
    event PropertyUpdated(uint256 indexed propertyId);
    event PropertyDeactivated(uint256 indexed propertyId);

    function registerProperty(
        string memory title,
        uint256 price,
        string memory location,
        string memory ipfsHash
    ) external returns (uint256) {
        uint256 propertyId = nextPropertyId++;
        
        properties[propertyId] = Property({
            owner: msg.sender,
            title: title,
            price: price,
            location: location,
            ipfsHash: ipfsHash,
            isActive: true,
            timestamp: block.timestamp
        });

        ownerProperties[msg.sender].push(propertyId);
        
        emit PropertyRegistered(propertyId, msg.sender, title, price);
        return propertyId;
    }

    function updateProperty(
        uint256 propertyId,
        string memory title,
        uint256 price,
        string memory location,
        string memory ipfsHash
    ) external {
        require(properties[propertyId].owner == msg.sender, "Not owner");
        require(properties[propertyId].isActive, "Property not active");
        
        properties[propertyId].title = title;
        properties[propertyId].price = price;
        properties[propertyId].location = location;
        properties[propertyId].ipfsHash = ipfsHash;
        
        emit PropertyUpdated(propertyId);
    }

    function deactivateProperty(uint256 propertyId) external {
        require(properties[propertyId].owner == msg.sender, "Not owner");
        properties[propertyId].isActive = false;
        emit PropertyDeactivated(propertyId);
    }

    function getOwnerProperties(address owner) external view returns (uint256[] memory) {
        return ownerProperties[owner];
    }

    function getActiveProperties(uint256 start, uint256 count) external view returns (uint256[] memory, Property[] memory) {
        uint256[] memory activeIds = new uint256[](count);
        Property[] memory activeProperties = new Property[](count);
        
        uint256 found = 0;
        for (uint256 i = start; i < nextPropertyId && found < count; i++) {
            if (properties[i].isActive) {
                activeIds[found] = i;
                activeProperties[found] = properties[i];
                found++;
            }
        }
        
        return (activeIds, activeProperties);
    }
}