// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/AIMYSecurityToken.sol";
import "../contracts/ComplianceEngine.sol";
import "../contracts/AssetRegistry.sol";
import "../contracts/examples/SolarFarm3643.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title AIMYSecurityTokenTest
 * @dev Comprehensive tests for the AIMY security token system
 * @notice Tests compliance rules, transfer restrictions, and token functionality
 */
contract AIMYSecurityTokenTest is Test {
    // Contract instances
    AIMYSecurityToken public token;
    ComplianceEngine public complianceEngine;
    AssetRegistry public assetRegistry;
    SolarFarm3643 public solarFarmToken;
    
    // Test addresses
    address public issuer;
    address public investor1; // US Accredited
    address public investor2; // Non-US
    address public investor3; // US Non-Accredited
    address public investor4; // Blocked address
    
    // Test constants
    string public constant TOKEN_NAME = "Test Token";
    string public constant TOKEN_SYMBOL = "TEST";
    uint256 public constant MAX_SUPPLY = 1_000_000;
    uint256 public constant MIN_TICKET_SIZE = 1_000;
    uint256 public constant MAX_TICKET_SIZE = 100_000;
    uint256 public constant LOCKUP_PERIOD = 365 days;
    
    // Events
    event IssuanceCreated(uint256 indexed issuanceId, address indexed investor, uint256 amount, uint256 price, uint256 timestamp);
    event IssuanceCompleted(uint256 indexed issuanceId, address indexed investor, uint256 amount, uint256 timestamp);
    event TransferBlocked(address indexed from, address indexed to, string reason, uint256 timestamp);
    event ComplianceRuleUpdated(string ruleType, string ruleValue, bool isActive, uint256 timestamp);

    function setUp() public {
        // Set up test addresses
        issuer = makeAddr("issuer");
        investor1 = makeAddr("investor1");
        investor2 = makeAddr("investor2");
        investor3 = makeAddr("investor3");
        investor4 = makeAddr("investor4");
        
        vm.startPrank(issuer);
        
        // Deploy ComplianceEngine
        ComplianceEngine complianceEngineImpl = new ComplianceEngine();
        ERC1967Proxy complianceEngineProxy = new ERC1967Proxy(
            address(complianceEngineImpl),
            abi.encodeWithSelector(
                ComplianceEngine.initialize.selector,
                issuer
            )
        );
        complianceEngine = ComplianceEngine(address(complianceEngineProxy));
        
        // Deploy AssetRegistry
        AssetRegistry assetRegistryImpl = new AssetRegistry();
        ERC1967Proxy assetRegistryProxy = new ERC1967Proxy(
            address(assetRegistryImpl),
            abi.encodeWithSelector(
                AssetRegistry.initialize.selector,
                issuer
            )
        );
        assetRegistry = AssetRegistry(address(assetRegistryProxy));
        
        // Deploy AIMYSecurityToken
        AIMYSecurityToken tokenImpl = new AIMYSecurityToken();
        ERC1967Proxy tokenProxy = new ERC1967Proxy(
            address(tokenImpl),
            abi.encodeWithSelector(
                AIMYSecurityToken.initialize.selector,
                TOKEN_NAME,
                TOKEN_SYMBOL,
                MAX_SUPPLY,
                MIN_TICKET_SIZE,
                MAX_TICKET_SIZE,
                LOCKUP_PERIOD,
                address(complianceEngine),
                address(assetRegistry),
                issuer
            )
        );
        token = AIMYSecurityToken(address(tokenProxy));
        
        // Deploy SolarFarm3643
        SolarFarm3643 solarFarmImpl = new SolarFarm3643();
        ERC1967Proxy solarFarmProxy = new ERC1967Proxy(
            address(solarFarmImpl),
            abi.encodeWithSelector(
                SolarFarm3643.initialize.selector,
                "Solar Farm Test",
                "SFT",
                MAX_SUPPLY,
                MIN_TICKET_SIZE,
                MAX_TICKET_SIZE,
                LOCKUP_PERIOD,
                address(complianceEngine),
                address(assetRegistry),
                issuer,
                "Test Solar Farm",
                "Test Location",
                50, // 50 MW
                8, // 8% yield
                block.timestamp, // Construction start
                25 // 25 years lifespan
            )
        );
        solarFarmToken = SolarFarm3643(address(solarFarmProxy));
        
        // Set up test investors
        _setupTestInvestors();
        
        // Set up compliance rules
        _setupComplianceRules();
        
        vm.stopPrank();
    }
    
    function _setupTestInvestors() internal {
        // Register test investors
        assetRegistry.registerInvestor(
            investor1,
            "John Smith",
            "US",
            "California",
            315532800, // Jan 1, 1980
            keccak256("passport_john_smith")
        );
        assetRegistry.updateKYCStatus(investor1, "TIER_2", true);
        assetRegistry.updateAMLStatus(investor1, true, "AML check passed");
        assetRegistry.updateSanctionsStatus(investor1, true, "No sanctions found");
        
        assetRegistry.registerInvestor(
            investor2,
            "Maria Garcia",
            "Spain",
            "Madrid",
            662688000, // Jan 1, 1991
            keccak256("passport_maria_garcia")
        );
        assetRegistry.updateKYCStatus(investor2, "TIER_1", true);
        assetRegistry.updateAMLStatus(investor2, true, "AML check passed");
        assetRegistry.updateSanctionsStatus(investor2, true, "No sanctions found");
        
        assetRegistry.registerInvestor(
            investor3,
            "Bob Johnson",
            "US",
            "Texas",
            946684800, // Jan 1, 2000
            keccak256("passport_bob_johnson")
        );
        assetRegistry.updateKYCStatus(investor3, "TIER_1", false); // Not accredited
        assetRegistry.updateAMLStatus(investor3, true, "AML check passed");
        assetRegistry.updateSanctionsStatus(investor3, true, "No sanctions found");
        
        // Set up jurisdiction information
        complianceEngine.updateJurisdictionInfo(investor1, "US", "California", true);
        complianceEngine.updateJurisdictionInfo(investor2, "Spain", "Madrid", false);
        complianceEngine.updateJurisdictionInfo(investor3, "US", "Texas", false);
    }
    
    function _setupComplianceRules() internal {
        complianceEngine.setComplianceRule("REG_D_US", "US Accredited Investor", true);
        complianceEngine.setComplianceRule("REG_S_NON_US", "Non-US Investor", true);
        complianceEngine.setComplianceRule("MINIMUM_HOLDING", "1000", true);
        complianceEngine.setComplianceRule("MAXIMUM_TRANSFER", "100000", true);
        complianceEngine.setComplianceRule("LOCKUP_PERIOD", "365 days", true);
    }

    // ============ Basic Token Functionality Tests ============

    function testTokenInitialization() public {
        assertEq(token.name(), TOKEN_NAME);
        assertEq(token.symbol(), TOKEN_SYMBOL);
        assertEq(token.maxSupply(), MAX_SUPPLY);
        assertEq(token.minTicketSize(), MIN_TICKET_SIZE);
        assertEq(token.maxTicketSize(), MAX_TICKET_SIZE);
        assertEq(token.lockupPeriod(), LOCKUP_PERIOD);
        assertEq(token.totalSupply(), 0);
        assertTrue(token.transfersEnabled());
    }

    function testRoleAssignment() public {
        assertTrue(token.hasRole(token.ISSUER_ROLE(), issuer));
        assertTrue(token.hasRole(token.COMPLIANCE_ROLE(), issuer));
        assertTrue(token.hasRole(token.TRANSFER_AGENT_ROLE(), issuer));
        assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), issuer));
    }

    // ============ Compliance Engine Tests ============

    function testComplianceEngineInitialization() public {
        assertTrue(complianceEngine.hasRole(complianceEngine.COMPLIANCE_OFFICER_ROLE(), issuer));
        assertTrue(complianceEngine.hasRole(complianceEngine.ORACLE_ROLE(), issuer));
        assertTrue(complianceEngine.hasRole(complianceEngine.DEFAULT_ADMIN_ROLE(), issuer));
    }

    function testComplianceRuleManagement() public {
        vm.startPrank(issuer);
        
        // Test setting compliance rules
        complianceEngine.setComplianceRule("TEST_RULE", "Test Value", true);
        
        ComplianceEngine.ComplianceRule memory rule = complianceEngine.getComplianceRule("TEST_RULE");
        assertEq(rule.ruleType, "TEST_RULE");
        assertEq(rule.ruleValue, "Test Value");
        assertTrue(rule.isActive);
        
        // Test updating rules
        complianceEngine.setComplianceRule("TEST_RULE", "Updated Value", false);
        rule = complianceEngine.getComplianceRule("TEST_RULE");
        assertEq(rule.ruleValue, "Updated Value");
        assertFalse(rule.isActive);
        
        vm.stopPrank();
    }

    function testJurisdictionCompliance() public {
        // US Accredited Investor should be compliant
        assertTrue(complianceEngine.checkJurisdictionCompliance(investor1));
        
        // Non-US Investor should be compliant
        assertTrue(complianceEngine.checkJurisdictionCompliance(investor2));
        
        // US Non-Accredited Investor should not be compliant
        assertFalse(complianceEngine.checkJurisdictionCompliance(investor3));
    }

    function testTransferCompliance() public {
        // Test compliant transfer
        assertTrue(complianceEngine.checkTransferCompliance(investor1, investor2, 5000));
        
        // Test non-compliant transfer (from non-accredited US investor)
        assertFalse(complianceEngine.checkTransferCompliance(investor3, investor1, 5000));
    }

    // ============ Asset Registry Tests ============

    function testAssetRegistryInitialization() public {
        assertTrue(assetRegistry.hasRole(assetRegistry.KYC_OFFICER_ROLE(), issuer));
        assertTrue(assetRegistry.hasRole(assetRegistry.ORACLE_ROLE(), issuer));
        assertTrue(assetRegistry.hasRole(assetRegistry.DEFAULT_ADMIN_ROLE(), issuer));
    }

    function testInvestorRegistration() public {
        address newInvestor = makeAddr("newInvestor");
        
        vm.startPrank(issuer);
        
        assetRegistry.registerInvestor(
            newInvestor,
            "New Investor",
            "Canada",
            "Toronto",
            662688000, // Jan 1, 1991
            keccak256("passport_new_investor")
        );
        
        AssetRegistry.InvestorInfo memory info = assetRegistry.getInvestorInfo(newInvestor);
        assertEq(info.name, "New Investor");
        assertEq(info.country, "Canada");
        assertEq(info.region, "Toronto");
        
        vm.stopPrank();
    }

    function testKYCStatusManagement() public {
        vm.startPrank(issuer);
        
        // Test KYC status update
        assetRegistry.updateKYCStatus(investor1, "TIER_3", true);
        
        AssetRegistry.InvestorInfo memory info = assetRegistry.getInvestorInfo(investor1);
        assertEq(info.kycLevel, "TIER_3");
        
        vm.stopPrank();
    }

    function testKYCApproval() public {
        // Test KYC approval
        assertTrue(assetRegistry.isKYCApproved(investor1));
        assertTrue(assetRegistry.isKYCApproved(investor2));
        assertFalse(assetRegistry.isKYCApproved(investor3));
    }

    // ============ Token Issuance Tests ============

    function testCreateIssuance() public {
        vm.startPrank(issuer);
        
        // Test creating issuance for compliant investor
        token.createIssuance(investor1, 5000, 100);
        
        // Verify issuance was created
        AIMYSecurityToken.Issuance memory issuance = token.getIssuance(0);
        assertEq(issuance.investor, investor1);
        assertEq(issuance.amount, 5000);
        assertEq(issuance.price, 100);
        assertEq(uint256(issuance.status), uint256(AIMYSecurityToken.IssuanceStatus.PENDING));
        
        vm.stopPrank();
    }

    function testCreateIssuanceNonCompliant() public {
        vm.startPrank(issuer);
        
        // Test creating issuance for non-compliant investor (should fail)
        vm.expectRevert("Transfer compliance check failed");
        token.createIssuance(investor3, 5000, 100);
        
        vm.stopPrank();
    }

    function testCompleteIssuance() public {
        vm.startPrank(issuer);
        
        // Create and complete issuance
        token.createIssuance(investor1, 5000, 100);
        token.completeIssuance(0);
        
        // Verify tokens were minted
        assertEq(token.balanceOf(investor1), 5000);
        assertEq(token.totalSupply(), 5000);
        
        // Verify issuance status
        AIMYSecurityToken.Issuance memory issuance = token.getIssuance(0);
        assertEq(uint256(issuance.status), uint256(AIMYSecurityToken.IssuanceStatus.COMPLETED));
        
        vm.stopPrank();
    }

    // ============ Transfer Restriction Tests ============

    function testTransferRestrictions() public {
        vm.startPrank(issuer);
        
        // Create and complete issuance for investor1
        token.createIssuance(investor1, 5000, 100);
        token.completeIssuance(0);
        
        vm.stopPrank();
        
        // Test transfer to compliant investor
        vm.startPrank(investor1);
        token.transfer(investor2, 1000);
        assertEq(token.balanceOf(investor2), 1000);
        assertEq(token.balanceOf(investor1), 4000);
        vm.stopPrank();
    }

    function testTransferToNonCompliant() public {
        vm.startPrank(issuer);
        
        // Create and complete issuance for investor1
        token.createIssuance(investor1, 5000, 100);
        token.completeIssuance(0);
        
        vm.stopPrank();
        
        // Test transfer to non-compliant investor (should fail)
        vm.startPrank(investor1);
        vm.expectRevert("Transfer blocked by compliance rules");
        token.transfer(investor3, 1000);
        vm.stopPrank();
    }

    function testTransferFromBlockedAddress() public {
        vm.startPrank(issuer);
        
        // Block investor1
        token.setBlockedAddress(investor1, true);
        
        // Create and complete issuance for investor1
        token.createIssuance(investor1, 5000, 100);
        token.completeIssuance(0);
        
        vm.stopPrank();
        
        // Test transfer from blocked address (should fail)
        vm.startPrank(investor1);
        vm.expectRevert("From address is blocked");
        token.transfer(investor2, 1000);
        vm.stopPrank();
    }

    function testLockupPeriod() public {
        vm.startPrank(issuer);
        
        // Create and complete issuance for investor1
        token.createIssuance(investor1, 5000, 100);
        token.completeIssuance(0);
        
        vm.stopPrank();
        
        // Test transfer before lockup period (should fail)
        vm.startPrank(investor1);
        vm.expectRevert("Lockup period not met");
        token.transfer(investor2, 1000);
        vm.stopPrank();
        
        // Fast forward past lockup period
        vm.warp(block.timestamp + LOCKUP_PERIOD + 1);
        
        // Test transfer after lockup period (should succeed)
        vm.startPrank(investor1);
        token.transfer(investor2, 1000);
        assertEq(token.balanceOf(investor2), 1000);
        vm.stopPrank();
    }

    // ============ Snapshot and Pause Tests ============

    function testSnapshotCreation() public {
        vm.startPrank(issuer);
        
        // Create and complete issuance
        token.createIssuance(investor1, 5000, 100);
        token.completeIssuance(0);
        
        // Create snapshot
        uint256 snapshotId = token.createSnapshot();
        assertEq(snapshotId, 1);
        assertEq(token.currentSnapshotId(), 1);
        
        vm.stopPrank();
    }

    function testPauseUnpause() public {
        vm.startPrank(issuer);
        
        // Create and complete issuance
        token.createIssuance(investor1, 5000, 100);
        token.completeIssuance(0);
        
        // Pause transfers
        token.pause();
        assertTrue(token.paused());
        
        // Test transfer while paused (should fail)
        vm.stopPrank();
        vm.startPrank(investor1);
        vm.expectRevert("Pausable: paused");
        token.transfer(investor2, 1000);
        vm.stopPrank();
        
        // Unpause transfers
        vm.startPrank(issuer);
        token.unpause();
        assertFalse(token.paused());
        vm.stopPrank();
    }

    // ============ Solar Farm Token Tests ============

    function testSolarFarmInitialization() public {
        assertEq(solarFarmToken.projectName(), "Test Solar Farm");
        assertEq(solarFarmToken.location(), "Test Location");
        assertEq(solarFarmToken.capacityMW(), 50);
        assertEq(solarFarmToken.expectedAnnualYield(), 8);
    }

    function testSolarFarmConstructionStatus() public {
        (bool constructionStarted, bool constructionCompleted, uint256 daysSinceStart, uint256 daysUntilOperational) = 
            solarFarmToken.getConstructionStatus();
        
        assertTrue(constructionStarted);
        assertFalse(constructionCompleted);
        assertGt(daysSinceStart, 0);
        assertEq(daysUntilOperational, 0); // No operational date set
    }

    function testSolarFarmOperationalDate() public {
        vm.startPrank(issuer);
        
        uint256 operationalDate = block.timestamp + 180 days;
        solarFarmToken.setOperationalDate(operationalDate);
        
        assertEq(solarFarmToken.operationalDate(), operationalDate);
        assertFalse(solarFarmToken.isOperational());
        
        // Fast forward to operational date
        vm.warp(operationalDate + 1);
        assertTrue(solarFarmToken.isOperational());
        
        vm.stopPrank();
    }

    // ============ Edge Cases and Error Tests ============

    function testInvalidIssuanceAmounts() public {
        vm.startPrank(issuer);
        
        // Test amount below minimum ticket size
        vm.expectRevert("Amount below minimum ticket size");
        token.createIssuance(investor1, 500, 100);
        
        // Test amount above maximum ticket size
        vm.expectRevert("Amount above maximum ticket size");
        token.createIssuance(investor1, 150000, 100);
        
        vm.stopPrank();
    }

    function testExceedMaxSupply() public {
        vm.startPrank(issuer);
        
        // Create issuance that would exceed max supply
        vm.expectRevert("Exceeds max supply");
        token.createIssuance(investor1, MAX_SUPPLY + 1, 100);
        
        vm.stopPrank();
    }

    function testUnauthorizedAccess() public {
        // Test unauthorized access to issuer functions
        vm.startPrank(investor1);
        
        vm.expectRevert();
        token.createIssuance(investor2, 5000, 100);
        
        vm.expectRevert();
        token.completeIssuance(0);
        
        vm.stopPrank();
    }

    function testComplianceEngineUpdates() public {
        vm.startPrank(issuer);
        
        // Test updating compliance engine address
        address newComplianceEngine = makeAddr("newComplianceEngine");
        token.updateComplianceEngine(newComplianceEngine);
        
        assertEq(address(token.complianceEngine()), newComplianceEngine);
        
        vm.stopPrank();
    }

    function testAssetRegistryUpdates() public {
        vm.startPrank(issuer);
        
        // Test updating asset registry address
        address newAssetRegistry = makeAddr("newAssetRegistry");
        token.updateAssetRegistry(newAssetRegistry);
        
        assertEq(address(token.assetRegistry()), newAssetRegistry);
        
        vm.stopPrank();
    }

    // ============ Integration Tests ============

    function testFullIssuanceFlow() public {
        vm.startPrank(issuer);
        
        // 1. Create issuance
        token.createIssuance(investor1, 10000, 100);
        
        // 2. Verify issuance details
        AIMYSecurityToken.Issuance memory issuance = token.getIssuance(0);
        assertEq(issuance.investor, investor1);
        assertEq(issuance.amount, 10000);
        assertEq(uint256(issuance.status), uint256(AIMYSecurityToken.IssuanceStatus.PENDING));
        
        // 3. Complete issuance
        token.completeIssuance(0);
        
        // 4. Verify tokens minted
        assertEq(token.balanceOf(investor1), 10000);
        assertEq(token.totalSupply(), 10000);
        
        // 5. Verify issuance completed
        issuance = token.getIssuance(0);
        assertEq(uint256(issuance.status), uint256(AIMYSecurityToken.IssuanceStatus.COMPLETED));
        
        vm.stopPrank();
    }

    function testComplianceRuleUpdates() public {
        vm.startPrank(issuer);
        
        // Update compliance rule
        complianceEngine.setComplianceRule("MINIMUM_HOLDING", "5000", true);
        
        // Verify rule updated
        ComplianceEngine.ComplianceRule memory rule = complianceEngine.getComplianceRule("MINIMUM_HOLDING");
        assertEq(rule.ruleValue, "5000");
        assertTrue(rule.isActive);
        
        vm.stopPrank();
    }

    function testInvestorComplianceFlow() public {
        vm.startPrank(issuer);
        
        // 1. Register new investor
        address newInvestor = makeAddr("newInvestor");
        assetRegistry.registerInvestor(
            newInvestor,
            "New Test Investor",
            "Germany",
            "Berlin",
            662688000,
            keccak256("passport_new_test_investor")
        );
        
        // 2. Update KYC status
        assetRegistry.updateKYCStatus(newInvestor, "TIER_2", true);
        assetRegistry.updateAMLStatus(newInvestor, true, "AML check passed");
        assetRegistry.updateSanctionsStatus(newInvestor, true, "No sanctions found");
        
        // 3. Set jurisdiction info
        complianceEngine.updateJurisdictionInfo(newInvestor, "Germany", "Berlin", false);
        
        // 4. Verify compliance
        assertTrue(assetRegistry.isKYCApproved(newInvestor));
        assertTrue(complianceEngine.checkJurisdictionCompliance(newInvestor));
        assertTrue(complianceEngine.checkTransferCompliance(newInvestor, investor1, 5000));
        
        vm.stopPrank();
    }
}
