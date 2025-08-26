// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IAIMYSecurityToken
 * @dev Interface for the AIMY Security Token contract
 */
interface IAIMYSecurityToken {
    // Events
    event TokenMetadataUpdated(
        string indexed assetId,
        string tokenSymbol,
        uint256 totalSupplyCap,
        uint256 issuanceDate,
        uint256 maturityDate
    );
    
    event TransferRestrictionUpdated(
        address indexed account,
        bool blacklisted,
        uint256 transferLimit
    );
    
    event ComplianceCheck(
        address indexed from,
        address indexed to,
        uint256 amount,
        bool approved,
        string reason
    );
    
    event TokenIssued(
        address indexed to,
        uint256 amount,
        string reason,
        uint256 timestamp
    );
    
    event TokenRedeemed(
        address indexed from,
        uint256 amount,
        string reason,
        uint256 timestamp
    );

    // Functions
    function initialize(
        string memory _name,
        string memory _symbol,
        string memory _assetId,
        string memory _issuerId,
        uint256 _totalSupplyCap,
        uint256 _issuanceDate,
        uint256 _maturityDate,
        address _complianceEngine,
        address _assetRegistry
    ) external;
    
    function issueTokens(
        address to,
        uint256 amount,
        string memory reason
    ) external;
    
    function redeemTokens(
        uint256 amount,
        string memory reason
    ) external;
    
    function updateTransferRestrictions(
        address account,
        bool blacklisted,
        uint256 transferLimit
    ) external;
    
    function setTransferRestrictionsEnabled(bool enabled) external;
    
    function updateTokenMetadata(
        string memory _tokenSymbol,
        uint256 _totalSupplyCap,
        uint256 _maturityDate
    ) external;
    
    function pause() external;
    
    function unpause() external;
    
    function getTokenInfo() external view returns (
        string memory _name,
        string memory _symbol,
        string memory _assetId,
        string memory _issuerId,
        uint256 _totalSupply,
        uint256 _totalSupplyCap,
        uint256 _issuanceDate,
        uint256 _maturityDate,
        uint8 _decimals,
        bool _paused
    );
    
    function isBlacklisted(address account) external view returns (bool);
    
    function getTransferLimit(address account) external view returns (uint256);
}
