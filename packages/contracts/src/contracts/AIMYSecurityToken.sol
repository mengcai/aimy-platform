// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";

import "./interfaces/IAIMYSecurityToken.sol";
import "./interfaces/IComplianceEngine.sol";
import "./interfaces/IAssetRegistry.sol";

/**
 * @title AIMYSecurityToken
 * @dev ERC-3643 compliant security token for real-world assets
 * @notice This contract implements a security token with compliance controls,
 * transfer restrictions, and upgradeability features
 */
contract AIMYSecurityToken is
    Initializable,
    ERC20Upgradeable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable,
    IAIMYSecurityToken
{
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using StringsUpgradeable for uint256;

    // Roles
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant COMPLIANCE_OFFICER_ROLE = keccak256("COMPLIANCE_OFFICER_ROLE");
    bytes32 public constant TRANSFER_AGENT_ROLE = keccak256("TRANSFER_AGENT_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // State variables
    IComplianceEngine public complianceEngine;
    IAssetRegistry public assetRegistry;
    
    CountersUpgradeable.Counter private _tokenIdCounter;
    
    // Token metadata
    string public tokenSymbol;
    string public assetId;
    string public issuerId;
    uint256 public totalSupplyCap;
    uint256 public issuanceDate;
    uint256 public maturityDate;
    uint8 public decimals;
    
    // Transfer restrictions
    bool public transferRestrictionsEnabled;
    mapping(address => bool) public blacklistedAddresses;
    mapping(address => uint256) public transferLimits;
    
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

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the contract
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _assetId Associated asset ID
     * @param _issuerId Issuer ID
     * @param _totalSupplyCap Maximum total supply
     * @param _issuanceDate Token issuance date
     * @param _maturityDate Token maturity date
     * @param _complianceEngine Compliance engine contract address
     * @param _assetRegistry Asset registry contract address
     */
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
    ) public initializer {
        __ERC20_init(_name, _symbol);
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        // Set roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
        _grantRole(COMPLIANCE_OFFICER_ROLE, msg.sender);
        _grantRole(TRANSFER_AGENT_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);

        // Set metadata
        tokenSymbol = _symbol;
        assetId = _assetId;
        issuerId = _issuerId;
        totalSupplyCap = _totalSupplyCap;
        issuanceDate = _issuanceDate;
        maturityDate = _maturityDate;
        decimals = 18;

        // Set contract addresses
        complianceEngine = IComplianceEngine(_complianceEngine);
        assetRegistry = IAssetRegistry(_assetRegistry);

        // Enable transfer restrictions by default
        transferRestrictionsEnabled = true;
    }

    /**
     * @dev Issue new tokens
     * @param to Recipient address
     * @param amount Amount to issue
     * @param reason Reason for issuance
     */
    function issueTokens(
        address to,
        uint256 amount,
        string memory reason
    ) external onlyRole(ISSUER_ROLE) whenNotPaused {
        require(to != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");
        require(
            totalSupply() + amount <= totalSupplyCap,
            "Exceeds total supply cap"
        );
        require(
            block.timestamp >= issuanceDate,
            "Token issuance not yet started"
        );
        require(
            block.timestamp <= maturityDate,
            "Token issuance period ended"
        );

        // Check compliance
        require(
            complianceEngine.checkIssuanceCompliance(to, amount, reason),
            "Issuance compliance check failed"
        );

        _mint(to, amount);
        emit TokenIssued(to, amount, reason, block.timestamp);
    }

    /**
     * @dev Redeem tokens
     * @param amount Amount to redeem
     * @param reason Reason for redemption
     */
    function redeemTokens(
        uint256 amount,
        string memory reason
    ) external whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        // Check compliance
        require(
            complianceEngine.checkRedemptionCompliance(msg.sender, amount, reason),
            "Redemption compliance check failed"
        );

        _burn(msg.sender, amount);
        emit TokenRedeemed(msg.sender, amount, reason, block.timestamp);
    }

    /**
     * @dev Transfer tokens with compliance checks
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function transfer(
        address to,
        uint256 amount
    ) public virtual override whenNotPaused returns (bool) {
        require(
            _checkTransferCompliance(msg.sender, to, amount),
            "Transfer compliance check failed"
        );
        
        return super.transfer(to, amount);
    }

    /**
     * @dev Transfer from with compliance checks
     * @param from Sender address
     * @param to Recipient address
     * @param amount Amount to transfer
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override whenNotPaused returns (bool) {
        require(
            _checkTransferCompliance(from, to, amount),
            "Transfer compliance check failed"
        );
        
        return super.transferFrom(from, to, amount);
    }

    /**
     * @dev Check transfer compliance
     * @param from Sender address
     * @param to Recipient address
     * @param amount Transfer amount
     */
    function _checkTransferCompliance(
        address from,
        address to,
        uint256 amount
    ) internal view returns (bool) {
        if (!transferRestrictionsEnabled) {
            return true;
        }

        // Check blacklist
        require(!blacklistedAddresses[from], "Sender is blacklisted");
        require(!blacklistedAddresses[to], "Recipient is blacklisted");

        // Check transfer limits
        if (transferLimits[from] > 0) {
            require(
                amount <= transferLimits[from],
                "Transfer amount exceeds limit"
            );
        }

        // Check compliance engine
        return complianceEngine.checkTransferCompliance(
            from,
            to,
            amount,
            ""
        );
    }

    /**
     * @dev Update transfer restrictions for an address
     * @param account Address to update
     * @param blacklisted Whether address is blacklisted
     * @param transferLimit Transfer limit for the address
     */
    function updateTransferRestrictions(
        address account,
        bool blacklisted,
        uint256 transferLimit
    ) external onlyRole(COMPLIANCE_OFFICER_ROLE) {
        blacklistedAddresses[account] = blacklisted;
        transferLimits[account] = transferLimit;
        
        emit TransferRestrictionUpdated(account, blacklisted, transferLimit);
    }

    /**
     * @dev Enable/disable transfer restrictions
     * @param enabled Whether restrictions are enabled
     */
    function setTransferRestrictionsEnabled(
        bool enabled
    ) external onlyRole(COMPLIANCE_OFFICER_ROLE) {
        transferRestrictionsEnabled = enabled;
    }

    /**
     * @dev Update token metadata
     * @param _tokenSymbol New token symbol
     * @param _totalSupplyCap New total supply cap
     * @param _maturityDate New maturity date
     */
    function updateTokenMetadata(
        string memory _tokenSymbol,
        uint256 _totalSupplyCap,
        uint256 _maturityDate
    ) external onlyRole(ISSUER_ROLE) {
        tokenSymbol = _tokenSymbol;
        totalSupplyCap = _totalSupplyCap;
        maturityDate = _maturityDate;
        
        emit TokenMetadataUpdated(
            assetId,
            _tokenSymbol,
            _totalSupplyCap,
            issuanceDate,
            _maturityDate
        );
    }

    /**
     * @dev Pause token operations
     */
    function pause() external onlyRole(COMPLIANCE_OFFICER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause token operations
     */
    function unpause() external onlyRole(COMPLIANCE_OFFICER_ROLE) {
        _unpause();
    }

    /**
     * @dev Get token information
     */
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
    ) {
        return (
            name(),
            symbol(),
            assetId,
            issuerId,
            totalSupply(),
            totalSupplyCap,
            issuanceDate,
            maturityDate,
            decimals,
            paused()
        );
    }

    /**
     * @dev Check if address is blacklisted
     * @param account Address to check
     */
    function isBlacklisted(address account) external view returns (bool) {
        return blacklistedAddresses[account];
    }

    /**
     * @dev Get transfer limit for address
     * @param account Address to check
     */
    function getTransferLimit(address account) external view returns (uint256) {
        return transferLimits[account];
    }

    /**
     * @dev Override _authorizeUpgrade to restrict upgrade access
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyRole(UPGRADER_ROLE) {}

    /**
     * @dev Override _beforeTokenTransfer to add custom logic
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
        
        // Additional custom logic can be added here
    }

    /**
     * @dev Override _afterTokenTransfer to add custom logic
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._afterTokenTransfer(from, to, amount);
        
        // Additional custom logic can be added here
    }
}
