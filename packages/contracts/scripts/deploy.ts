import { ethers, upgrades } from "hardhat";
import { Contract } from "ethers";

async function main() {
  console.log("🚀 Deploying AIMY Security Token System...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // Contract addresses
  let complianceEngine: Contract;
  let assetRegistry: Contract;
  let solarFarmToken: Contract;

  // Token configuration
  const TOKEN_NAME = "Solar Farm Alpha Token";
  const TOKEN_SYMBOL = "SFAT";
  const MAX_SUPPLY = ethers.utils.parseEther("1000000"); // 1M tokens
  const MIN_TICKET_SIZE = ethers.utils.parseEther("1000"); // $1,000
  const MAX_TICKET_SIZE = ethers.utils.parseEther("100000"); // $100,000
  const LOCKUP_PERIOD = 365 * 24 * 60 * 60; // 1 year in seconds

  // Solar farm configuration
  const PROJECT_NAME = "Solar Farm Alpha";
  const LOCATION = "Arizona, USA";
  const CAPACITY_MW = 50; // 50 MW
  const EXPECTED_ANNUAL_YIELD = 8; // 8%
  const CONSTRUCTION_START_DATE = Math.floor(Date.now() / 1000); // Current timestamp
  const EXPECTED_LIFESPAN = 25; // 25 years

  try {
    // 1. Deploy ComplianceEngine
    console.log("\n📋 Deploying ComplianceEngine...");
    const ComplianceEngine = await ethers.getContractFactory("ComplianceEngine");
    complianceEngine = await upgrades.deployProxy(ComplianceEngine, [deployer.address], {
      initializer: "initialize",
    });
    await complianceEngine.deployed();
    console.log("✅ ComplianceEngine deployed to:", complianceEngine.address);

    // 2. Deploy AssetRegistry
    console.log("\n📋 Deploying AssetRegistry...");
    const AssetRegistry = await ethers.getContractFactory("AssetRegistry");
    assetRegistry = await upgrades.deployProxy(AssetRegistry, [deployer.address], {
      initializer: "initialize",
    });
    await assetRegistry.deployed();
    console.log("✅ AssetRegistry deployed to:", assetRegistry.address);

    // 3. Deploy SolarFarm3643
    console.log("\n📋 Deploying SolarFarm3643...");
    const SolarFarm3643 = await ethers.getContractFactory("SolarFarm3643");
    solarFarmToken = await upgrades.deployProxy(
      SolarFarm3643,
      [
        TOKEN_NAME,
        TOKEN_SYMBOL,
        MAX_SUPPLY,
        MIN_TICKET_SIZE,
        MAX_TICKET_SIZE,
        LOCKUP_PERIOD,
        complianceEngine.address,
        assetRegistry.address,
        deployer.address,
        PROJECT_NAME,
        LOCATION,
        CAPACITY_MW,
        EXPECTED_ANNUAL_YIELD,
        CONSTRUCTION_START_DATE,
        EXPECTED_LIFESPAN,
      ],
      {
        initializer: "initialize",
      }
    );
    await solarFarmToken.deployed();
    console.log("✅ SolarFarm3643 deployed to:", solarFarmToken.address);

    // 4. Set up initial configuration
    console.log("\n⚙️ Setting up initial configuration...");
    await setupInitialConfiguration();

    // 5. Log deployment summary
    console.log("\n🎉 Deployment completed successfully!");
    logDeploymentSummary();

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

async function setupInitialConfiguration() {
  const [deployer] = await ethers.getSigners();

  // Test investor addresses (using hardhat accounts)
  const investor1 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // US Accredited
  const investor2 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"; // Non-US
  const investor3 = "0x90F79bf6EB2c4f870365E785982E1f101E93b906"; // US Non-Accredited

  try {
    // Get contract instances
    const complianceEngine = await ethers.getContractAt("ComplianceEngine", (await ethers.getContractFactory("ComplianceEngine")).address);
    const assetRegistry = await ethers.getContractAt("AssetRegistry", (await ethers.getContractFactory("AssetRegistry")).address);

    // Register test investors
    console.log("👥 Registering test investors...");
    await registerTestInvestors(assetRegistry, investor1, investor2, investor3);

    // Set up compliance rules
    console.log("📜 Setting up compliance rules...");
    await setupComplianceRules(complianceEngine);

    // Set up jurisdiction information
    console.log("🌍 Setting up jurisdiction information...");
    await setupJurisdictionInfo(complianceEngine, investor1, investor2, investor3);

  } catch (error) {
    console.error("❌ Configuration setup failed:", error);
    throw error;
  }
}

async function registerTestInvestors(
  assetRegistry: Contract,
  investor1: string,
  investor2: string,
  investor3: string
) {
  // Register US Accredited Investor
  await assetRegistry.registerInvestor(
    investor1,
    "John Smith",
    "US",
    "California",
    315532800, // Jan 1, 1980
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("passport_john_smith"))
  );
  await assetRegistry.updateKYCStatus(investor1, "TIER_2", true);
  await assetRegistry.updateAMLStatus(investor1, true, "AML check passed");
  await assetRegistry.updateSanctionsStatus(investor1, true, "No sanctions found");

  // Register Non-US Investor
  await assetRegistry.registerInvestor(
    investor2,
    "Maria Garcia",
    "Spain",
    "Madrid",
    662688000, // Jan 1, 1991
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("passport_maria_garcia"))
  );
  await assetRegistry.updateKYCStatus(investor2, "TIER_1", true);
  await assetRegistry.updateAMLStatus(investor2, true, "AML check passed");
  await assetRegistry.updateSanctionsStatus(investor2, true, "No sanctions found");

  // Register US Non-Accredited Investor
  await assetRegistry.registerInvestor(
    investor3,
    "Bob Johnson",
    "US",
    "Texas",
    946684800, // Jan 1, 2000
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes("passport_bob_johnson"))
  );
  await assetRegistry.updateKYCStatus(investor3, "TIER_1", false); // Not accredited
  await assetRegistry.updateAMLStatus(investor3, true, "AML check passed");
  await assetRegistry.updateSanctionsStatus(investor3, true, "No sanctions found");
}

async function setupComplianceRules(complianceEngine: Contract) {
  await complianceEngine.setComplianceRule("REG_D_US", "US Accredited Investor", true);
  await complianceEngine.setComplianceRule("REG_S_NON_US", "Non-US Investor", true);
  await complianceEngine.setComplianceRule("MINIMUM_HOLDING", "1000", true);
  await complianceEngine.setComplianceRule("MAXIMUM_TRANSFER", "100000", true);
  await complianceEngine.setComplianceRule("LOCKUP_PERIOD", "365 days", true);
}

async function setupJurisdictionInfo(
  complianceEngine: Contract,
  investor1: string,
  investor2: string,
  investor3: string
) {
  // US Accredited Investor
  await complianceEngine.updateJurisdictionInfo(investor1, "US", "California", true);

  // Non-US Investor
  await complianceEngine.updateJurisdictionInfo(investor2, "Spain", "Madrid", false);

  // US Non-Accredited Investor
  await complianceEngine.updateJurisdictionInfo(investor3, "US", "Texas", false);
}

function logDeploymentSummary() {
  console.log("\n" + "=".repeat(60));
  console.log("🎯 AIMY Security Token System Deployment Summary");
  console.log("=".repeat(60));
  
  console.log("\n📋 Contract Addresses:");
  console.log("   ComplianceEngine: [ADDRESS]");
  console.log("   AssetRegistry: [ADDRESS]");
  console.log("   SolarFarm3643: [ADDRESS]");
  
  console.log("\n⚙️ Token Configuration:");
  console.log("   Name: Solar Farm Alpha Token");
  console.log("   Symbol: SFAT");
  console.log("   Max Supply: 1,000,000 tokens");
  console.log("   Min Ticket Size: $1,000");
  console.log("   Max Ticket Size: $100,000");
  console.log("   Lockup Period: 365 days");
  
  console.log("\n🌞 Solar Farm Configuration:");
  console.log("   Project Name: Solar Farm Alpha");
  console.log("   Location: Arizona, USA");
  console.log("   Capacity: 50 MW");
  console.log("   Expected Annual Yield: 8%");
  console.log("   Expected Lifespan: 25 years");
  
  console.log("\n👥 Test Investors:");
  console.log("   Investor 1 (US Accredited): 0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
  console.log("   Investor 2 (Non-US): 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
  console.log("   Investor 3 (US Non-Accredited): 0x90F79bf6EB2c4f870365E785982E1f101E93b906");
  
  console.log("\n🚀 Next Steps:");
  console.log("   1. Verify contracts on Etherscan");
  console.log("   2. Test compliance rules and transfer restrictions");
  console.log("   3. Create test issuances for compliant investors");
  console.log("   4. Test transfer restrictions and compliance checks");
  console.log("   5. Run Foundry tests: forge test");
  
  console.log("\n" + "=".repeat(60));
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
