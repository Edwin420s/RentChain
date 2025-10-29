// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPropertyRegistry {
    function properties(uint256 propertyId) external view returns (
        address owner,
        string memory title,
        uint256 price,
        string memory location,
        string memory ipfsHash,
        bool isActive,
        uint256 timestamp
    );
    
    function getOwnerProperties(address owner) external view returns (uint256[] memory);
}
