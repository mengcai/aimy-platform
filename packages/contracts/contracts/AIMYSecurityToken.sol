// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20SnapshotUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "./interfaces/IAIMYSecurityToken.sol";
import "./interfaces/IComplianceEngine.sol";
import "./interfaces/IAssetRegistry.sol";

/**
 * @title AIMYSecurityToken
 * @dev ERC-3643 compliant security token with compliance and transfer restrictions
 * @notice Implements permissioned ERC20 with on-chain registry + off-chain oracle compliance
 */
contract AIMYSecurityToken is
    Initializable,
    ERC20Upgradeable,
    ERC20PausableUpgradeable,
    ERC20SnapshotUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable,
    IAIMYSecurityToken
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    // Role definitions
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant TRANSFER_AGENT_ROLE = keccak256("TRANSFER_AGENT_ROLE");

    // Compliance and registry addresses
    IComplianceEngine public complianceEngine;
    IAssetRegistry public assetRegistry;
    
    // Token configuration
    string public tokenSymbol;
    string public tokenName;
    uint256 public maxSupply;
    uint256 public minTicketSize;
    uint256 public maxTicketSize;
    uint256 public lockupPeriod;
    
    // Issuance tracking
    CountersUpgradeable.Counter private _issuanceIdCounter;
    mapping(uint256 => Issuance) public issuances;
    mapping(address => uint256[]) public userIssuances;
    
    // Transfer restrictions
    bool public transfersEnabled;
    mapping(address => bool) public blockedAddresses;
    mapping(address => uint256) public lastTransferBlock;
    
    // Snapshot and record date
    uint256 public currentSnapshotId;
    uint256 public recordDate;
    
    // Events
    event IssuanceCreated(
        uint256 indexed issuanceId,
        address indexed investor,
        uint256 amount,
        uint256 price,
        uint256 timestamp
    );
    
    event IssuanceCompleted(
        uint256 indexed issuanceId,
        address indexed investor,
        uint256 amount,
        uint256 timestamp
    );
    
    event RedemptionRequested(
        address indexed investor,
        uint256 amount,
        uint256 timestamp
    );
    
    event RedemptionCompleted(
        address indexed investor,
        uint256 amount,
        uint256 timestamp
    );
    
    event TransferBlocked(
        address indexed from,
        address indexed to,
        string reason,
        uint256 timestamp
    );
    
    event ComplianceRuleUpdated(
        string ruleType,
        string ruleValue,
        uint256 timestamp
    );
    
    event SnapshotCreated(uint256 snapshotId, uint256 timestamp);
    event RecordDateSet(uint256 recordDate, uint256 timestamp);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the contract
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _maxSupply Maximum token supply
     * @param _minTicketSize Minimum investment amount
     * @param _maxTicketSize Maximum investment amount
     * @param _lockupPeriod Lockup period in seconds
     * @param _complianceEngine Compliance engine address
     * @param _assetRegistry Asset registry address
     * @param _issuer Issuer address
     */
    function initialize(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        uint256 _minTicketSize,
        uint256 _maxTicketSize,
        uint256 _lockupPeriod,
        address _complianceEngine,
        address _assetRegistry,
        address _issuer
    ) public initializer {
        __ERC20_init(_name, _symbol);
        __ERC20Pausable_init();
        __ERC20Snapshot_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        tokenName = _name;
        tokenSymbol = _symbol;
        maxSupply = _maxSupply;
        minTicketSize = _minTicketSize;
        maxTicketSize = _maxTicketSize;
        lockupPeriod = _lockupPeriod;
        
        complianceEngine = IComplianceEngine(_complianceEngine);
        assetRegistry = IAssetRegistry(_assetRegistry);
        
        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, _issuer);
        _grantRole(ISSUER_ROLE, _issuer);
        _grantRole(COMPLIANCE_ROLE, _issuer);
        _grantRole(TRANSFER_AGENT_ROLE, _issuer);
        
        transfersEnabled = true;
        currentSnapshotId = 0;
    }

    /**
     * @dev Create a new issuance for an investor
     * @param _investor Investor address
     * @param _amount Token amount
     * @param _price Price per token
     */
    function createIssuance(
        address _investor,
        uint256 _amount,
        uint256 _price
    ) external onlyRole(ISSUER_ROLE) {
        require(_investor != address(0), "Invalid investor address");
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount >= minTicketSize, "Amount below minimum ticket size");
        require(_amount <= maxTicketSize, "Amount above maximum ticket size");
        require(totalSupply() + _amount <= maxSupply, "Exceeds max supply");
        
        // Check compliance
        require(
            complianceEngine.checkTransferCompliance(_investor, address(0), _amount),
            "Transfer compliance check failed"
        );
        
        uint256 issuanceId = _issuanceIdCounter.current();
        _issuanceIdCounter.increment();
        
        issuances[issuanceId] = Issuance({
            id: issuanceId,
            investor: _investor,
            amount: _amount,
            price: _price,
            status: IssuanceStatus.PENDING,
            createdAt: block.timestamp,
            completedAt: 0
        });
        
        userIssuances[_investor].push(issuanceId);
        
        emit IssuanceCreated(issuanceId, _investor, _amount, _price, block.timestamp);
    }

    /**
     * @dev Complete an issuance and mint tokens
     * @param _issuanceId Issuance ID to complete
     */
    function completeIssuance(uint256 _issuanceId) external onlyRole(ISSUER_ROLE) {
        Issuance storage issuance = issuances[_issuanceId];
        require(issuance.status == IssuanceStatus.PENDING, "Issuance not pending");
        
        issuance.status = IssuanceStatus.COMPLETED;
        issuance.completedAt = block.timestamp;
        
        _mint(issuance.investor, issuance.amount);
        
        emit IssuanceCompleted(_issuanceId, issuance.investor, issuance.amount, block.timestamp);
    }

    /**
     * @dev Request redemption of tokens
     * @param _amount Amount to redeem
     */
    function requestRedemption(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        require(block.timestamp >= lastTransferBlock[msg.sender] + lockupPeriod, "Lockup period not met");
        
        emit RedemptionRequested(msg.sender, _amount, block.timestamp);
    }

    /**
     * @dev Complete redemption and burn tokens
     * @param _investor Investor address
     * @param _amount Amount to redeem
     */
    function completeRedemption(
        address _investor,
        uint256 _amount
    ) external onlyRole(ISSUER_ROLE) {
        require(_amount > 0, "Amount must be greater than 0");
        require(balanceOf(_investor) >= _amount, "Insufficient balance");
        
        _burn(_investor, _amount);
        
        emit RedemptionCompleted(_investor, _amount, block.timestamp);
    }

    /**
     * @dev Override _beforeTokenTransfer to enforce compliance rules
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20Upgradeable, ERC20SnapshotUpgradeable) {
        super._beforeTokenTransfer(from, to, amount);
        
        // Skip minting and burning
        if (from == address(0) || to == address(0)) {
            return;
        }
        
        // Check if transfers are enabled
        require(transfersEnabled, "Transfers are disabled");
        
        // Check if addresses are blocked
        require(!blockedAddresses[from], "From address is blocked");
        require(!blockedAddresses[to], "To address is blocked");
        
        // Check compliance rules
        if (!complianceEngine.checkTransferCompliance(from, to, amount)) {
            emit TransferBlocked(from, to, "Compliance check failed", block.timestamp);
            revert("Transfer blocked by compliance rules");
        }
        
        // Check lockup period
        if (from != address(0)) {
            require(
                block.timestamp >= lastTransferBlock[from] + lockupPeriod,
                "Lockup period not met"
            );
        }
        
        // Update last transfer block
        lastTransferBlock[from] = block.timestamp;
        lastTransferBlock[to] = block.timestamp;
    }

    /**
     * @dev Create a new snapshot
     */
    function createSnapshot() external onlyRole(ISSUER_ROLE) returns (uint256) {
        currentSnapshotId = _snapshot();
        emit SnapshotCreated(currentSnapshotId, block.timestamp);
        return currentSnapshotId;
    }

    /**
     * @dev Set record date for dividends/distributions
     * @param _recordDate Record date timestamp
     */
    function setRecordDate(uint256 _recordDate) external onlyRole(ISSUER_ROLE) {
        recordDate = _recordDate;
        emit RecordDateSet(_recordDate, block.timestamp);
    }

    /**
     * @dev Block or unblock an address
     * @param _address Address to block/unblock
     * @param _blocked Whether to block the address
     */
    function setBlockedAddress(address _address, bool _blocked) external onlyRole(COMPLIANCE_ROLE) {
        blockedAddresses[_address] = _blocked;
    }

    /**
     * @dev Enable or disable transfers
     * @param _enabled Whether transfers should be enabled
     */
    function setTransfersEnabled(bool _enabled) external onlyRole(COMPLIANCE_ROLE) {
        transfersEnabled = _enabled;
    }

    /**
     * @dev Update compliance engine address
     * @param _complianceEngine New compliance engine address
     */
    function updateComplianceEngine(address _complianceEngine) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_complianceEngine != address(0), "Invalid compliance engine address");
        complianceEngine = IComplianceEngine(_complianceEngine);
    }

    /**
     * @dev Update asset registry address
     * @param _assetRegistry New asset registry address
     */
    function updateAssetRegistry(address _assetRegistry) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_assetRegistry != address(0), "Invalid asset registry address");
        assetRegistry = IAssetRegistry(_assetRegistry);
    }

    /**
     * @dev Get issuance details for an investor
     * @param _investor Investor address
     * @return Array of issuance IDs
     */
    function getInvestorIssuances(address _investor) external view returns (uint256[] memory) {
        return userIssuances[_investor];
    }

    /**
     * @dev Get issuance details by ID
     * @param _issuanceId Issuance ID
     * @return Issuance struct
     */
    function getIssuance(uint256 _issuanceId) external view returns (Issuance memory) {
        return issuances[_issuanceId];
    }

    /**
     * @dev Check if an address is KYC approved
     * @param _address Address to check
     * @return Whether the address is KYC approved
     */
    function isKYCApproved(address _address) external view returns (bool) {
        return assetRegistry.isKYCApproved(_address);
    }

    /**
     * @dev Check if an address is jurisdiction compliant
     * @param _address Address to check
     * @return Whether the address is jurisdiction compliant
     */
    function isJurisdictionCompliant(address _address) external view returns (bool) {
        return complianceEngine.checkJurisdictionCompliance(_address);
    }

    /**
     * @dev Pause token transfers
     */
    function pause() external onlyRole(COMPLIANCE_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyRole(COMPLIANCE_ROLE) {
        _unpause();
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
