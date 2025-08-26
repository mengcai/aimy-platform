// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IAssetRegistry
 * @dev Interface for the Asset Registry contract
 */
interface IAssetRegistry {
    // Events
    event AssetRegistered(
        string indexed assetId,
        address indexed issuer,
        string assetType,
        uint256 estimatedValue,
        string currency
    );
    
    event AssetUpdated(
        string indexed assetId,
        string field,
        string oldValue,
        string newValue
    );
    
    event AssetStatusChanged(
        string indexed assetId,
        string oldStatus,
        string newStatus,
        string reason
    );
    
    event AssetDocumentAdded(
        string indexed assetId,
        string documentId,
        string documentType,
        string documentHash
    );
    
    event AssetDocumentRemoved(
        string indexed assetId,
        string documentId
    );

    // Structs
    struct Asset {
        string assetId;
        address issuer;
        string name;
        string description;
        string assetType;
        string location;
        uint256 estimatedValue;
        string currency;
        string status;
        uint256 createdAt;
        uint256 updatedAt;
        bool active;
    }
    
    struct AssetDocument {
        string documentId;
        string documentType;
        string documentHash;
        string metadata;
        uint256 createdAt;
        bool active;
    }
    
    struct AssetMetadata {
        string industry;
        string sector;
        string country;
        string region;
        uint256 acquisitionDate;
        uint256 expectedLifespan;
        string riskProfile;
        string yieldProfile;
    }

    // Functions
    function registerAsset(
        string memory _assetId,
        string memory _name,
        string memory _description,
        string memory _assetType,
        string memory _location,
        uint256 _estimatedValue,
        string memory _currency
    ) external returns (bool);
    
    function updateAsset(
        string memory _assetId,
        string memory _field,
        string memory _value
    ) external returns (bool);
    
    function updateAssetStatus(
        string memory _assetId,
        string memory _newStatus,
        string memory _reason
    ) external returns (bool);
    
    function getAsset(string memory _assetId) external view returns (Asset memory);
    
    function getAssetMetadata(string memory _assetId) external view returns (AssetMetadata memory);
    
    function getAllAssets() external view returns (Asset[] memory);
    
    function getAssetsByIssuer(address _issuer) external view returns (Asset[] memory);
    
    function getAssetsByType(string memory _assetType) external view returns (Asset[] memory);
    
    function getAssetsByStatus(string memory _status) external view returns (Asset[] memory);
    
    function getAssetsByLocation(string memory _location) external view returns (Asset[] memory);
    
    function getAssetsByValueRange(
        uint256 _minValue,
        uint256 _maxValue,
        string memory _currency
    ) external view returns (Asset[] memory);
    
    function isAssetRegistered(string memory _assetId) external view returns (bool);
    
    function isAssetActive(string memory _assetId) external view returns (bool);
    
    function getAssetCount() external view returns (uint256);
    
    function getAssetCountByIssuer(address _issuer) external view returns (uint256);
    
    function getAssetCountByType(string memory _assetType) external view returns (uint256);
    
    function getAssetCountByStatus(string memory _status) external view returns (uint256);
    
    function addAssetDocument(
        string memory _assetId,
        string memory _documentId,
        string memory _documentType,
        string memory _documentHash,
        string memory _metadata
    ) external returns (bool);
    
    function removeAssetDocument(
        string memory _assetId,
        string memory _documentId
    ) external returns (bool);
    
    function getAssetDocuments(string memory _assetId) external view returns (AssetDocument[] memory);
    
    function getAssetDocument(
        string memory _assetId,
        string memory _documentId
    ) external view returns (AssetDocument memory);
    
    function validateAssetOwnership(
        string memory _assetId,
        address _owner
    ) external view returns (bool);
    
    function transferAssetOwnership(
        string memory _assetId,
        address _newOwner
    ) external returns (bool);
    
    function getAssetValuationHistory(
        string memory _assetId
    ) external view returns (uint256[] memory, uint256[] memory);
    
    function updateAssetValuation(
        string memory _assetId,
        uint256 _newValue,
        string memory _currency
    ) external returns (bool);
    
    function getAssetRiskProfile(string memory _assetId) external view returns (string memory);
    
    function updateAssetRiskProfile(
        string memory _assetId,
        string memory _riskProfile
    ) external returns (bool);
    
    function getAssetYieldProfile(string memory _assetId) external view returns (string memory);
    
    function updateAssetYieldProfile(
        string memory _assetId,
        string memory _yieldProfile
    ) external returns (bool);
}
