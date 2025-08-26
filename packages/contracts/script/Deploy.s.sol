// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/AIMYSecurityToken.sol";
import "../contracts/ComplianceEngine.sol";
import "../contracts/AssetRegistry.sol";
import "../contracts/examples/SolarFarm3643.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title Deploy
 * @dev Foundry deployment script for the AIMY security token system
 * @notice Deploys all contracts and sets up the initial configuration
 */
contract Deploy is Script {
    // Contract addresses
    address public complianceEngine;
    address public assetRegistry;
    address public solarFarmToken;
    address public issuer;
    address public kycOfficer;
    address public oracle;
    
    // Token configuration
    string public constant TOKEN_NAME = "Solar Farm Alpha Token";
    string public constant TOKEN_SYMBOL = "SFAT";
    uint256 public constant MAX_SUPPLY = 1_000_000; // 1M tokens
    uint256 public constant MIN_TICKET_SIZE = 1_000; // $1,000
    uint256 public constant MAX_TICKET_SIZE = 100_000; // $100,000
    uint256 public constant LOCKUP_PERIOD = 365 days; // 1 year
    
    // Solar farm configuration
    string public constant PROJECT_NAME = "Solar Farm Alpha";
    string public constant LOCATION = "Arizona, USA";
    uint256 public constant CAPACITY_MW = 50; // 50 MW
    uint256 public constant EXPECTED_ANNUAL_YIELD = 8; // 8%
    uint256 public constant CONSTRUCTION_START_DATE = 1704067200; // Jan 1, 2024
    uint256 public constant EXPECTED_LIFESPAN = 25; // 25 years

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Set up addresses
        issuer = vm.addr(deployerPrivateKey);
        kycOfficer = vm.addr(deployerPrivateKey);
        oracle = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy ComplianceEngine
        console.log("Deploying ComplianceEngine...");
        ComplianceEngine complianceEngineImpl = new ComplianceEngine();
        ERC1967Proxy complianceEngineProxy = new ERC1967Proxy(
            address(complianceEngineImpl),
            abi.encodeWithSelector(
                ComplianceEngine.initialize.selector,
                issuer
            )
        );
        complianceEngine = address(complianceEngineProxy);
        console.log("ComplianceEngine deployed at:", complianceEngine);
        
        // Deploy AssetRegistry
        console.log("Deploying AssetRegistry...");
        AssetRegistry assetRegistryImpl = new AssetRegistry();
        ERC1967Proxy assetRegistryProxy = new ERC1967Proxy(
            address(assetRegistryImpl),
            abi.encodeWithSelector(
                AssetRegistry.initialize.selector,
                issuer
            )
        );
        assetRegistry = address(assetRegistryProxy);
        console.log("AssetRegistry deployed at:", assetRegistry);
        
        // Deploy SolarFarm3643
        console.log("Deploying SolarFarm3643...");
        SolarFarm3643 solarFarmImpl = new SolarFarm3643();
        ERC1967Proxy solarFarmProxy = new ERC1967Proxy(
            address(solarFarmImpl),
            abi.encodeWithSelector(
                SolarFarm3643.initialize.selector,
                TOKEN_NAME,
                TOKEN_SYMBOL,
                MAX_SUPPLY,
                MIN_TICKET_SIZE,
                MAX_TICKET_SIZE,
                LOCKUP_PERIOD,
                complianceEngine,
                assetRegistry,
                issuer,
                PROJECT_NAME,
                LOCATION,
                CAPACITY_MW,
                EXPECTED_ANNUAL_YIELD,
                CONSTRUCTION_START_DATE,
                EXPECTED_LIFESPAN
            )
        );
        solarFarmToken = address(solarFarmProxy);
        console.log("SolarFarm3643 deployed at:", solarFarmToken);
        
        // Set up initial configuration
        console.log("Setting up initial configuration...");
        _setupInitialConfiguration();
        
        vm.stopBroadcast();
        
        // Log deployment summary
        _logDeploymentSummary();
    }
    
    function _setupInitialConfiguration() internal {
        ComplianceEngine complianceEngineContract = ComplianceEngine(complianceEngine);
        AssetRegistry assetRegistryContract = AssetRegistry(assetRegistry);
        
        // Register some test investors
        console.log("Registering test investors...");
        _registerTestInvestors(assetRegistryContract);
        
        // Set up compliance rules
        console.log("Setting up compliance rules...");
        _setupComplianceRules(complianceEngineContract);
        
        // Set up jurisdiction information
        console.log("Setting up jurisdiction information...");
        _setupJurisdictionInfo(complianceEngineContract);
    }
    
    function _registerTestInvestors(AssetRegistry assetRegistryContract) internal {
        // Test investor 1: US Accredited
        address investor1 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        assetRegistryContract.registerInvestor(
            investor1,
            "John Smith",
            "US",
            "California",
            315532800, // Jan 1, 1980
            keccak256("passport_john_smith")
        );
        assetRegistryContract.updateKYCStatus(investor1, "TIER_2", true);
        assetRegistryContract.updateAMLStatus(investor1, true, "AML check passed");
        assetRegistryContract.updateSanctionsStatus(investor1, true, "No sanctions found");
        
        // Test investor 2: Non-US
        address investor2 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        assetRegistryContract.registerInvestor(
            investor2,
            "Maria Garcia",
            "Spain",
            "Madrid",
            662688000, // Jan 1, 1991
            keccak256("passport_maria_garcia")
        );
        assetRegistryContract.updateKYCStatus(investor2, "TIER_1", true);
        assetRegistryContract.updateAMLStatus(investor2, true, "AML check passed");
        assetRegistryContract.updateSanctionsStatus(investor2, true, "No sanctions found");
        
        // Test investor 3: US Non-Accredited (for testing restrictions)
        address investor3 = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;
        assetRegistryContract.registerInvestor(
            investor3,
            "Bob Johnson",
            "US",
            "Texas",
            946684800, // Jan 1, 2000
            keccak256("passport_bob_johnson")
        );
        assetRegistryContract.updateKYCStatus(investor3, "TIER_1", false); // Not accredited
        assetRegistryContract.updateAMLStatus(investor3, true, "AML check passed");
        assetRegistryContract.updateSanctionsStatus(investor3, true, "No sanctions found");
    }
    
    function _setupComplianceRules(ComplianceEngine complianceEngineContract) internal {
        // Set up basic compliance rules
        complianceEngineContract.setComplianceRule("REG_D_US", "US Accredited Investor", true);
        complianceEngineContract.setComplianceRule("REG_S_NON_US", "Non-US Investor", true);
        complianceEngineContract.setComplianceRule("MINIMUM_HOLDING", "1000", true);
        complianceEngineContract.setComplianceRule("MAXIMUM_TRANSFER", "100000", true);
        complianceEngineContract.setComplianceRule("LOCKUP_PERIOD", "365 days", true);
    }
    
    function _setupJurisdictionInfo(ComplianceEngine complianceEngineContract) internal {
        // Set up jurisdiction information for test investors
        address investor1 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        address investor2 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        address investor3 = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;
        
        // US Accredited Investor
        complianceEngineContract.updateJurisdictionInfo(investor1, "US", "California", true);
        
        // Non-US Investor
        complianceEngineContract.updateJurisdictionInfo(investor2, "Spain", "Madrid", false);
        
        // US Non-Accredited Investor
        complianceEngineContract.updateJurisdictionInfo(investor3, "US", "Texas", false);
    }
    
    function _logDeploymentSummary() internal view {
        console.log("\n=== AIMY Security Token System Deployment Summary ===");
        console.log("ComplianceEngine:", complianceEngine);
        console.log("AssetRegistry:", assetRegistry);
        console.log("SolarFarm3643:", solarFarmToken);
        console.log("Issuer:", issuer);
        console.log("\nToken Configuration:");
        console.log("- Name:", TOKEN_NAME);
        console.log("- Symbol:", TOKEN_SYMBOL);
        console.log("- Max Supply:", MAX_SUPPLY);
        console.log("- Min Ticket Size:", MIN_TICKET_SIZE);
        console.log("- Max Ticket Size:", MAX_TICKET_SIZE);
        console.log("- Lockup Period:", LOCKUP_PERIOD / 1 days, "days");
        console.log("\nSolar Farm Configuration:");
        console.log("- Project Name:", PROJECT_NAME);
        console.log("- Location:", LOCATION);
        console.log("- Capacity:", CAPACITY_MW, "MW");
        console.log("- Expected Annual Yield:", EXPECTED_ANNUAL_YIELD, "%");
        console.log("- Construction Start:", CONSTRUCTION_START_DATE);
        console.log("- Expected Lifespan:", EXPECTED_LIFESPAN, "years");
        console.log("\nTest Investors:");
        console.log("- Investor 1 (US Accredited):", 0x70997970C51812dc3A010C7d01b50e0d17dc79C8);
        console.log("- Investor 2 (Non-US):", 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC);
        console.log("- Investor 3 (US Non-Accredited):", 0x90F79bf6EB2c4f870365E785982E1f101E93b906);
        console.log("\nNext Steps:");
        console.log("1. Verify contracts on Etherscan");
        console.log("2. Test compliance rules and transfer restrictions");
        console.log("3. Create test issuances for compliant investors");
        console.log("4. Test transfer restrictions and compliance checks");
        console.log("==================================================\n");
    }
}
