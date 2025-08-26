// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./interfaces/IComplianceEngine.sol";

/**
 * @title ComplianceEngine
 * @dev Handles compliance rules and jurisdiction checks for security tokens
 * @notice Implements on-chain compliance logic with off-chain oracle support
 */
contract ComplianceEngine is
    Initializable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    IComplianceEngine
{
    // Role definitions
    bytes32 public constant COMPLIANCE_OFFICER_ROLE = keccak256("COMPLIANCE_OFFICER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    // Compliance rules
    mapping(string => ComplianceRule) public complianceRules;
    mapping(address => JurisdictionInfo) public jurisdictionInfo;
    mapping(address => bool) public blockedAddresses;
    mapping(address => bool) public sanctionedAddresses;
    
    // Rule types
    string[] public ruleTypes;
    
    // Events
    event ComplianceRuleUpdated(
        string indexed ruleType,
        string ruleValue,
        bool isActive,
        uint256 timestamp
    );
    
    event JurisdictionInfoUpdated(
        address indexed address_,
        string country,
        string region,
        bool isAccredited,
        uint256 timestamp
    );
    
    event AddressBlocked(
        address indexed address_,
        string reason,
        uint256 timestamp
    );
    
    event AddressUnblocked(
        address indexed address_,
        uint256 timestamp
    );
    
    event SanctionsCheck(
        address indexed address_,
        bool isSanctioned,
        string reason,
        uint256 timestamp
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the contract
     * @param _admin Admin address
     */
    function initialize(address _admin) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(COMPLIANCE_OFFICER_ROLE, _admin);
        _grantRole(ORACLE_ROLE, _admin);
        
        // Initialize default compliance rules
        _initializeDefaultRules();
    }

    /**
     * @dev Initialize default compliance rules
     */
    function _initializeDefaultRules() private {
        _setComplianceRule("REG_D_US", "US Accredited Investor", true);
        _setComplianceRule("REG_S_NON_US", "Non-US Investor", true);
        _setComplianceRule("MINIMUM_HOLDING", "1000", true);
        _setComplianceRule("MAXIMUM_TRANSFER", "100000", true);
        _setComplianceRule("LOCKUP_PERIOD", "365 days", true);
    }

    /**
     * @dev Check if a transfer is compliant
     * @param _from From address
     * @param _to To address
     * @param _amount Transfer amount
     * @return Whether the transfer is compliant
     */
    function checkTransferCompliance(
        address _from,
        address _to,
        uint256 _amount
    ) external view override returns (bool) {
        // Check if addresses are blocked
        if (blockedAddresses[_from] || blockedAddresses[_to]) {
            return false;
        }
        
        // Check sanctions
        if (sanctionedAddresses[_from] || sanctionedAddresses[_to]) {
            return false;
        }
        
        // Check jurisdiction compliance
        if (!checkJurisdictionCompliance(_from) || !checkJurisdictionCompliance(_to)) {
            return false;
        }
        
        // Check amount limits
        if (!_checkAmountCompliance(_amount)) {
            return false;
        }
        
        return true;
    }

    /**
     * @dev Check jurisdiction compliance for an address
     * @param _address Address to check
     * @return Whether the address is jurisdiction compliant
     */
    function checkJurisdictionCompliance(address _address) public view override returns (bool) {
        JurisdictionInfo memory info = jurisdictionInfo[_address];
        
        // If no jurisdiction info, assume non-compliant
        if (bytes(info.country).length == 0) {
            return false;
        }
        
        // Check US accredited investor rules
        if (keccak256(bytes(info.country)) == keccak256(bytes("US"))) {
            return info.isAccredited;
        }
        
        // Check non-US investor rules
        if (keccak256(bytes(info.country)) != keccak256(bytes("US"))) {
            return true; // Non-US investors are generally compliant
        }
        
        return false;
    }

    /**
     * @dev Check amount compliance
     * @param _amount Amount to check
     * @return Whether the amount is compliant
     */
    function _checkAmountCompliance(uint256 _amount) private view returns (bool) {
        ComplianceRule memory minRule = complianceRules["MINIMUM_HOLDING"];
        ComplianceRule memory maxRule = complianceRules["MAXIMUM_TRANSFER"];
        
        if (minRule.isActive) {
            uint256 minAmount = _parseAmountRule(minRule.ruleValue);
            if (_amount < minAmount) {
                return false;
            }
        }
        
        if (maxRule.isActive) {
            uint256 maxAmount = _parseAmountRule(maxRule.ruleValue);
            if (_amount > maxAmount) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * @dev Parse amount rule value
     * @param _ruleValue Rule value string
     * @return Parsed amount
     */
    function _parseAmountRule(string memory _ruleValue) private pure returns (uint256) {
        bytes memory b = bytes(_ruleValue);
        uint256 result = 0;
        
        for (uint256 i = 0; i < b.length; i++) {
            if (b[i] >= 0x30 && b[i] <= 0x39) {
                result = result * 10 + (uint8(b[i]) - 0x30);
            }
        }
        
        return result;
    }

    /**
     * @dev Set compliance rule
     * @param _ruleType Rule type
     * @param _ruleValue Rule value
     * @param _isActive Whether the rule is active
     */
    function setComplianceRule(
        string memory _ruleType,
        string memory _ruleValue,
        bool _isActive
    ) external onlyRole(COMPLIANCE_OFFICER_ROLE) {
        _setComplianceRule(_ruleType, _ruleValue, _isActive);
    }

    /**
     * @dev Internal function to set compliance rule
     * @param _ruleType Rule type
     * @param _ruleValue Rule value
     * @param _isActive Whether the rule is active
     */
    function _setComplianceRule(
        string memory _ruleType,
        string memory _ruleValue,
        bool _isActive
    ) private {
        // Add rule type to array if it doesn't exist
        bool exists = false;
        for (uint256 i = 0; i < ruleTypes.length; i++) {
            if (keccak256(bytes(ruleTypes[i])) == keccak256(bytes(_ruleType))) {
                exists = true;
                break;
            }
        }
        
        if (!exists) {
            ruleTypes.push(_ruleType);
        }
        
        complianceRules[_ruleType] = ComplianceRule({
            ruleType: _ruleType,
            ruleValue: _ruleValue,
            isActive: _isActive,
            updatedAt: block.timestamp
        });
        
        emit ComplianceRuleUpdated(_ruleType, _ruleValue, _isActive, block.timestamp);
    }

    /**
     * @dev Update jurisdiction information for an address
     * @param _address Address to update
     * @param _country Country code
     * @param _region Region/state
     * @param _isAccredited Whether the address is accredited
     */
    function updateJurisdictionInfo(
        address _address,
        string memory _country,
        string memory _region,
        bool _isAccredited
    ) external onlyRole(ORACLE_ROLE) {
        require(_address != address(0), "Invalid address");
        
        jurisdictionInfo[_address] = JurisdictionInfo({
            country: _country,
            region: _region,
            isAccredited: _isAccredited,
            updatedAt: block.timestamp
        });
        
        emit JurisdictionInfoUpdated(_address, _country, _region, _isAccredited, block.timestamp);
    }

    /**
     * @dev Block an address
     * @param _address Address to block
     * @param _reason Reason for blocking
     */
    function blockAddress(address _address, string memory _reason) external onlyRole(COMPLIANCE_OFFICER_ROLE) {
        require(_address != address(0), "Invalid address");
        
        blockedAddresses[_address] = true;
        
        emit AddressBlocked(_address, _reason, block.timestamp);
    }

    /**
     * @dev Unblock an address
     * @param _address Address to unblock
     */
    function unblockAddress(address _address) external onlyRole(COMPLIANCE_OFFICER_ROLE) {
        require(_address != address(0), "Invalid address");
        
        blockedAddresses[_address] = false;
        
        emit AddressUnblocked(_address, block.timestamp);
    }

    /**
     * @dev Update sanctions status for an address
     * @param _address Address to update
     * @param _isSanctioned Whether the address is sanctioned
     * @param _reason Reason for sanctions
     */
    function updateSanctionsStatus(
        address _address,
        bool _isSanctioned,
        string memory _reason
    ) external onlyRole(ORACLE_ROLE) {
        require(_address != address(0), "Invalid address");
        
        sanctionedAddresses[_address] = _isSanctioned;
        
        emit SanctionsCheck(_address, _isSanctioned, _reason, block.timestamp);
    }

    /**
     * @dev Get compliance rule
     * @param _ruleType Rule type
     * @return Compliance rule struct
     */
    function getComplianceRule(string memory _ruleType) external view returns (ComplianceRule memory) {
        return complianceRules[_ruleType];
    }

    /**
     * @dev Get jurisdiction information for an address
     * @param _address Address to check
     * @return Jurisdiction info struct
     */
    function getJurisdictionInfo(address _address) external view returns (JurisdictionInfo memory) {
        return jurisdictionInfo[_address];
    }

    /**
     * @dev Get all rule types
     * @return Array of rule types
     */
    function getRuleTypes() external view returns (string[] memory) {
        return ruleTypes;
    }

    /**
     * @dev Check if an address is blocked
     * @param _address Address to check
     * @return Whether the address is blocked
     */
    function isAddressBlocked(address _address) external view returns (bool) {
        return blockedAddresses[_address];
    }

    /**
     * @dev Check if an address is sanctioned
     * @param _address Address to check
     * @return Whether the address is sanctioned
     */
    function isAddressSanctioned(address _address) external view returns (bool) {
        return sanctionedAddresses[_address];
    }

    /**
     * @dev Required by the OZ UUPS module
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}

    /**
     * @dev Override supportsInterface for AccessControl
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControlUpgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
