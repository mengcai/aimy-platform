// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IComplianceEngine
 * @dev Interface for the Compliance Engine contract
 */
interface IComplianceEngine {
    // Events
    event ComplianceRuleAdded(
        bytes32 indexed ruleId,
        string ruleType,
        string description,
        bool active
    );
    
    event ComplianceRuleUpdated(
        bytes32 indexed ruleId,
        string ruleType,
        string description,
        bool active
    );
    
    event ComplianceRuleRemoved(bytes32 indexed ruleId);
    
    event ComplianceCheck(
        address indexed account,
        string checkType,
        bool passed,
        string reason
    );
    
    event TransferRestrictionAdded(
        address indexed account,
        string restrictionType,
        uint256 restrictionValue
    );
    
    event TransferRestrictionRemoved(address indexed account);

    // Structs
    struct ComplianceRule {
        bytes32 ruleId;
        string ruleType;
        string description;
        bool active;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    struct TransferRestriction {
        string restrictionType;
        uint256 restrictionValue;
        uint256 createdAt;
        bool active;
    }

    // Functions
    function addComplianceRule(
        string memory ruleType,
        string memory description
    ) external returns (bytes32);
    
    function updateComplianceRule(
        bytes32 ruleId,
        string memory ruleType,
        string memory description,
        bool active
    ) external;
    
    function removeComplianceRule(bytes32 ruleId) external;
    
    function getComplianceRule(bytes32 ruleId) external view returns (ComplianceRule memory);
    
    function getAllComplianceRules() external view returns (ComplianceRule[] memory);
    
    function checkIssuanceCompliance(
        address account,
        uint256 amount,
        string memory reason
    ) external view returns (bool);
    
    function checkRedemptionCompliance(
        address account,
        uint256 amount,
        string memory reason
    ) external view returns (bool);
    
    function checkTransferCompliance(
        address from,
        address to,
        uint256 amount,
        string memory reason
    ) external view returns (bool);
    
    function addTransferRestriction(
        address account,
        string memory restrictionType,
        uint256 restrictionValue
    ) external;
    
    function removeTransferRestriction(address account) external;
    
    function getTransferRestriction(address account) external view returns (TransferRestriction memory);
    
    function isAccountCompliant(address account) external view returns (bool);
    
    function getComplianceScore(address account) external view returns (uint256);
    
    function validateKYC(address account) external view returns (bool);
    
    function validateAML(address account) external view returns (bool);
    
    function validateSanctions(address account) external view returns (bool);
    
    function getComplianceHistory(address account) external view returns (string[] memory);
}
