// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./interfaces/IAssetRegistry.sol";

/**
 * @title AssetRegistry
 * @dev Manages KYC status and investor information for security tokens
 * @notice Central registry for investor verification and compliance
 */
contract AssetRegistry is
    Initializable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    IAssetRegistry
{
    // Role definitions
    bytes32 public constant KYC_OFFICER_ROLE = keccak256("KYC_OFFICER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    // Investor information
    mapping(address => InvestorInfo) public investors;
    mapping(address => bool) public kycApproved;
    mapping(address => bool) public amlApproved;
    mapping(address => bool) public sanctionsApproved;
    
    // Investor addresses for enumeration
    address[] public investorAddresses;
    mapping(address => uint256) public investorIndex;
    
    // KYC levels and requirements
    mapping(string => KYCLevel) public kycLevels;
    string[] public kycLevelNames;
    
    // Events
    event InvestorRegistered(
        address indexed investor,
        string name,
        string country,
        uint256 timestamp
    );
    
    event KYCStatusUpdated(
        address indexed investor,
        string level,
        bool approved,
        uint256 timestamp
    );
    
    event AMLStatusUpdated(
        address indexed investor,
        bool approved,
        string reason,
        uint256 timestamp
    );
    
    event SanctionsStatusUpdated(
        address indexed investor,
        bool approved,
        string reason,
        uint256 timestamp
    );
    
    event KYCLevelAdded(
        string level,
        uint256 minInvestment,
        uint256 maxInvestment,
        uint256 timestamp
    );
    
    event KYCLevelUpdated(
        string level,
        uint256 minInvestment,
        uint256 maxInvestment,
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
        _grantRole(KYC_OFFICER_ROLE, _admin);
        _grantRole(ORACLE_ROLE, _admin);
        
        // Initialize default KYC levels
        _initializeDefaultKYCLevels();
    }

    /**
     * @dev Initialize default KYC levels
     */
    function _initializeDefaultKYCLevels() private {
        _addKYCLevel("TIER_1", 1000, 10000, "Basic verification required");
        _addKYCLevel("TIER_2", 10000, 100000, "Enhanced verification required");
        _addKYCLevel("TIER_3", 100000, 1000000, "Advanced verification required");
        _addKYCLevel("TIER_4", 1000000, type(uint256).max, "Maximum verification required");
    }

    /**
     * @dev Register a new investor
     * @param _investor Investor address
     * @param _name Investor name
     * @param _country Country code
     * @param _region Region/state
     * @param _dateOfBirth Date of birth
     * @param _documentHash Hash of identity document
     */
    function registerInvestor(
        address _investor,
        string memory _name,
        string memory _country,
        string memory _region,
        uint256 _dateOfBirth,
        bytes32 _documentHash
    ) external onlyRole(KYC_OFFICER_ROLE) {
        require(_investor != address(0), "Invalid investor address");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_country).length > 0, "Country cannot be empty");
        
        // Check if investor already exists
        require(bytes(investors[_investor].name).length == 0, "Investor already registered");
        
        investors[_investor] = InvestorInfo({
            name: _name,
            country: _country,
            region: _region,
            dateOfBirth: _dateOfBirth,
            documentHash: _documentHash,
            kycLevel: "TIER_1",
            registeredAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        // Add to investor addresses array
        investorAddresses.push(_investor);
        investorIndex[_investor] = investorAddresses.length - 1;
        
        emit InvestorRegistered(_investor, _name, _country, block.timestamp);
    }

    /**
     * @dev Update KYC status for an investor
     * @param _investor Investor address
     * @param _level KYC level
     * @param _approved Whether KYC is approved
     */
    function updateKYCStatus(
        address _investor,
        string memory _level,
        bool _approved
    ) external onlyRole(KYC_OFFICER_ROLE) {
        require(_investor != address(0), "Invalid investor address");
        require(bytes(investors[_investor].name).length > 0, "Investor not registered");
        require(bytes(kycLevels[_level].name).length > 0, "Invalid KYC level");
        
        kycApproved[_investor] = _approved;
        
        if (_approved) {
            investors[_investor].kycLevel = _level;
        }
        
        investors[_investor].updatedAt = block.timestamp;
        
        emit KYCStatusUpdated(_investor, _level, _approved, block.timestamp);
    }

    /**
     * @dev Update AML status for an investor
     * @param _investor Investor address
     * @param _approved Whether AML is approved
     * @param _reason Reason for approval/rejection
     */
    function updateAMLStatus(
        address _investor,
        bool _approved,
        string memory _reason
    ) external onlyRole(KYC_OFFICER_ROLE) {
        require(_investor != address(0), "Invalid investor address");
        require(bytes(investors[_investor].name).length > 0, "Investor not registered");
        
        amlApproved[_investor] = _approved;
        investors[_investor].updatedAt = block.timestamp;
        
        emit AMLStatusUpdated(_investor, _approved, _reason, block.timestamp);
    }

    /**
     * @dev Update sanctions status for an investor
     * @param _investor Investor address
     * @param _approved Whether sanctions check is approved
     * @param _reason Reason for approval/rejection
     */
    function updateSanctionsStatus(
        address _investor,
        bool _approved,
        string memory _reason
    ) external onlyRole(ORACLE_ROLE) {
        require(_investor != address(0), "Invalid investor address");
        require(bytes(investors[_investor].name).length > 0, "Investor not registered");
        
        sanctionsApproved[_investor] = _approved;
        investors[_investor].updatedAt = block.timestamp;
        
        emit SanctionsStatusUpdated(_investor, _approved, _reason, block.timestamp);
    }

    /**
     * @dev Add a new KYC level
     * @param _level Level name
     * @param _minInvestment Minimum investment amount
     * @param _maxInvestment Maximum investment amount
     * @param _description Level description
     */
    function addKYCLevel(
        string memory _level,
        uint256 _minInvestment,
        uint256 _maxInvestment,
        string memory _description
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _addKYCLevel(_level, _minInvestment, _maxInvestment, _description);
    }

    /**
     * @dev Internal function to add KYC level
     * @param _level Level name
     * @param _minInvestment Minimum investment amount
     * @param _maxInvestment Maximum investment amount
     * @param _description Level description
     */
    function _addKYCLevel(
        string memory _level,
        uint256 _minInvestment,
        uint256 _maxInvestment,
        string memory _description
    ) private {
        require(bytes(_level).length > 0, "Level name cannot be empty");
        require(_minInvestment < _maxInvestment, "Invalid investment range");
        require(bytes(kycLevels[_level].name).length == 0, "KYC level already exists");
        
        kycLevels[_level] = KYCLevel({
            name: _level,
            minInvestment: _minInvestment,
            maxInvestment: _maxInvestment,
            description: _description,
            createdAt: block.timestamp
        });
        
        kycLevelNames.push(_level);
        
        emit KYCLevelAdded(_level, _minInvestment, _maxInvestment, block.timestamp);
    }

    /**
     * @dev Update an existing KYC level
     * @param _level Level name
     * @param _minInvestment Minimum investment amount
     * @param _maxInvestment Maximum investment amount
     * @param _description Level description
     */
    function updateKYCLevel(
        string memory _level,
        uint256 _minInvestment,
        uint256 _maxInvestment,
        string memory _description
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(bytes(kycLevels[_level].name).length > 0, "KYC level does not exist");
        require(_minInvestment < _maxInvestment, "Invalid investment range");
        
        kycLevels[_level].minInvestment = _minInvestment;
        kycLevels[_level].maxInvestment = _maxInvestment;
        kycLevels[_level].description = _description;
        
        emit KYCLevelUpdated(_level, _minInvestment, _maxInvestment, block.timestamp);
    }

    /**
     * @dev Check if an address is KYC approved
     * @param _address Address to check
     * @return Whether the address is KYC approved
     */
    function isKYCApproved(address _address) external view override returns (bool) {
        return kycApproved[_address] && amlApproved[_address] && sanctionsApproved[_address];
    }

    /**
     * @dev Check if an address is fully compliant
     * @param _address Address to check
     * @return Whether the address is fully compliant
     */
    function isFullyCompliant(address _address) external view returns (bool) {
        return isKYCApproved(_address) && 
               bytes(investors[_address].name).length > 0;
    }

    /**
     * @dev Get investor information
     * @param _address Investor address
     * @return Investor info struct
     */
    function getInvestorInfo(address _address) external view returns (InvestorInfo memory) {
        return investors[_address];
    }

    /**
     * @dev Get KYC level information
     * @param _level Level name
     * @return KYC level struct
     */
    function getKYCLevel(string memory _level) external view returns (KYCLevel memory) {
        return kycLevels[_level];
    }

    /**
     * @dev Get all KYC level names
     * @return Array of KYC level names
     */
    function getKYCLevelNames() external view returns (string[] memory) {
        return kycLevelNames;
    }

    /**
     * @dev Get all investor addresses
     * @return Array of investor addresses
     */
    function getInvestorAddresses() external view returns (address[] memory) {
        return investorAddresses;
    }

    /**
     * @dev Get investor count
     * @return Number of registered investors
     */
    function getInvestorCount() external view returns (uint256) {
        return investorAddresses.length;
    }

    /**
     * @dev Check if an address is a registered investor
     * @param _address Address to check
     * @return Whether the address is a registered investor
     */
    function isRegisteredInvestor(address _address) external view returns (bool) {
        return bytes(investors[_address].name).length > 0;
    }

    /**
     * @dev Get compliance status for an investor
     * @param _address Investor address
     * @return Compliance status struct
     */
    function getComplianceStatus(address _address) external view returns (ComplianceStatus memory) {
        return ComplianceStatus({
            kycApproved: kycApproved[_address],
            amlApproved: amlApproved[_address],
            sanctionsApproved: sanctionsApproved[_address],
            fullyCompliant: kycApproved[_address] && amlApproved[_address] && sanctionsApproved[_address]
        });
    }

    /**
     * @dev Remove an investor (admin only)
     * @param _address Investor address to remove
     */
    function removeInvestor(address _address) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(bytes(investors[_address].name).length > 0, "Investor not registered");
        
        // Remove from investor addresses array
        uint256 index = investorIndex[_address];
        if (index < investorAddresses.length - 1) {
            address lastAddress = investorAddresses[investorAddresses.length - 1];
            investorAddresses[index] = lastAddress;
            investorIndex[lastAddress] = index;
        }
        investorAddresses.pop();
        
        // Clear investor data
        delete investors[_address];
        delete kycApproved[_address];
        delete amlApproved[_address];
        delete sanctionsApproved[_address];
        delete investorIndex[_address];
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
