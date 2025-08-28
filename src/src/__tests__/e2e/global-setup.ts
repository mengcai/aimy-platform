import { chromium, FullConfig } from '@playwright/test';
import { ethers } from 'ethers';
import { Pool } from 'pg';

/**
 * Global Setup for AIMY Platform E2E Tests
 * 
 * This setup:
 * 1. Ensures all services are running
 * 2. Seeds test database with demo data
 * 3. Sets up blockchain test environment
 * 4. Prepares test wallets and accounts
 * 5. Verifies system health before tests
 */

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up AIMY Platform E2E test environment...');
  
  // Step 1: Verify services are running
  await verifyServicesHealth();
  
  // Step 2: Setup test database
  await setupTestDatabase();
  
  // Step 3: Setup blockchain environment
  await setupBlockchainEnvironment();
  
  // Step 4: Verify complete system readiness
  await verifySystemReadiness();
  
  console.log('✅ E2E test environment setup completed successfully!');
}

/**
 * Verify all required services are healthy
 */
async function verifyServicesHealth() {
  console.log('🔍 Verifying service health...');
  
  const services = [
    { name: 'Web App', url: 'http://localhost:3005/api/health' },
    { name: 'Console', url: 'http://localhost:3006/api/health' },
    { name: 'API Gateway', url: 'http://localhost:3001/health' },
    { name: 'AI Core', url: 'http://localhost:8000/health' },
    { name: 'Compliance', url: 'http://localhost:3002/health' },
    { name: 'Settlement', url: 'http://localhost:3003/health' },
    { name: 'Liquidity', url: 'http://localhost:3004/health' },
    { name: 'Database', url: 'http://localhost:8080' },
    { name: 'Blockchain', url: 'http://localhost:8545' }
  ];
  
  for (const service of services) {
    try {
      const response = await fetch(service.url, { 
        method: 'GET',
        timeout: 10000 
      });
      
      if (response.ok) {
        console.log(`✅ ${service.name}: Healthy`);
      } else {
        console.log(`⚠️  ${service.name}: Status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${service.name}: Unreachable - ${error.message}`);
      throw new Error(`Service ${service.name} is not healthy`);
    }
  }
}

/**
 * Setup test database with demo data
 */
async function setupTestDatabase() {
  console.log('🗄️  Setting up test database...');
  
  try {
    // Connect to test database
    const pool = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'aimy',
      user: 'aimy_user',
      password: 'aimy_password',
    });
    
    // Verify connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection established');
    
    // Check if demo data exists
    const result = await pool.query('SELECT COUNT(*) FROM issuers');
    const issuerCount = parseInt(result.rows[0].count);
    
    if (issuerCount === 0) {
      console.log('🌱 Seeding database with demo data...');
      
      // Run seed script
      const seedResult = await pool.query(`
        -- Insert test issuer
        INSERT INTO issuers (
          id, name, legal_name, registration_number, jurisdiction, address, 
          contact_email, contact_phone, website, status, kyc_level
        ) VALUES (
          'test-issuer-001',
          'Test SolarTech Ventures Ltd',
          'Test SolarTech Ventures Limited',
          'TEST-STV-2024-001',
          'HK',
          'Test Address, Hong Kong',
          'test@solartechventures.hk',
          '+852 2345 6789',
          'https://test.solartechventures.hk',
          'approved',
          'enhanced'
        ) ON CONFLICT (id) DO NOTHING;
        
        -- Insert test asset
        INSERT INTO assets (
          id, issuer_id, name, description, asset_type, total_value, 
          currency, location, status, metadata
        ) VALUES (
          'test-asset-001',
          'test-issuer-001',
          'Test Solar Farm 3643',
          '50MW test solar photovoltaic power plant',
          'renewable_energy',
          50000000.00,
          'USD',
          'Test Location, China',
          'active',
          '{"capacity_mw": 50, "annual_output_mwh": 75000, "test": true}'
        ) ON CONFLICT (id) DO NOTHING;
        
        -- Insert test token
        INSERT INTO tokens (
          id, asset_id, name, symbol, total_supply, decimals, 
          token_standard, contract_address, status, metadata
        ) VALUES (
          'test-token-001',
          'test-asset-001',
          'Test SolarTech Ventures Security Token',
          'TSTV',
          1000000,
          18,
          'ERC-3643',
          '0x0000000000000000000000000000000000000000',
          'draft',
          '{"test": true, "kyc_required": true}'
        ) ON CONFLICT (id) DO NOTHING;
      `);
      
      console.log(`✅ Database seeded with ${seedResult.rowCount} test records`);
    } else {
      console.log(`✅ Database already contains ${issuerCount} issuers`);
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    throw error;
  }
}

/**
 * Setup blockchain test environment
 */
async function setupBlockchainEnvironment() {
  console.log('⛓️  Setting up blockchain test environment...');
  
  try {
    // Connect to Hardhat node
    const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    
    // Verify connection
    const network = await provider.getNetwork();
    console.log(`✅ Connected to blockchain network: ${network.name} (ID: ${network.chainId})`);
    
    // Get test accounts
    const accounts = await provider.listAccounts();
    console.log(`✅ Found ${accounts.length} test accounts`);
    
    // Verify test account has balance
    const balance = await provider.getBalance(accounts[0]);
    console.log(`✅ Test account balance: ${ethers.utils.formatEther(balance)} ETH`);
    
    if (balance.lt(ethers.utils.parseEther('100'))) {
      console.log('⚠️  Test account has low balance, consider funding');
    }
    
  } catch (error) {
    console.error('❌ Blockchain setup failed:', error.message);
    throw error;
  }
}

/**
 * Verify complete system readiness
 */
async function verifySystemReadiness() {
  console.log('🔍 Verifying complete system readiness...');
  
  try {
    // Launch browser to verify web app
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Test web app accessibility
    await page.goto('http://localhost:3005');
    await page.waitForLoadState('networkidle');
    
    // Verify key elements are present
    await page.waitForSelector('[data-testid="main-navigation"]', { timeout: 10000 });
    console.log('✅ Web app is accessible and responsive');
    
    // Test console accessibility
    await page.goto('http://localhost:3006');
    await page.waitForLoadState('networkidle');
    
    await page.waitForSelector('[data-testid="console-navigation"]', { timeout: 10000 });
    console.log('✅ Console is accessible and responsive');
    
    await browser.close();
    
    // Test API endpoints
    const apiResponse = await fetch('http://localhost:3001/api/v1/health');
    if (apiResponse.ok) {
      console.log('✅ API Gateway is responding');
    }
    
    // Test AI service
    const aiResponse = await fetch('http://localhost:8000/health');
    if (aiResponse.ok) {
      console.log('✅ AI Core is responding');
    }
    
    console.log('✅ All systems are ready for testing');
    
  } catch (error) {
    console.error('❌ System readiness verification failed:', error.message);
    throw error;
  }
}

export default globalSetup;
