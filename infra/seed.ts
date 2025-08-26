#!/usr/bin/env tsx

import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'aimy',
  user: 'aimy',
  password: 'aimy123',
});

// Simple UUID generator for demo purposes
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Demo data
const demoData = {
  issuers: [
    {
      id: generateUUID(),
      name: 'Green Energy Holdings Ltd',
      type: 'corporation',
      jurisdiction: 'US',
      registrationNumber: 'US123456789',
      complianceStatus: 'approved',
      kycStatus: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateUUID(),
      name: 'Sustainable Infrastructure Fund I',
      type: 'fund',
      jurisdiction: 'SG',
      registrationNumber: 'SG987654321',
      complianceStatus: 'approved',
      kycStatus: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],

  investors: [
    {
      id: generateUUID(),
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1-555-0123',
      dateOfBirth: new Date('1985-03-15'),
      nationality: 'US',
      kycLevel: 'tier_2',
      complianceStatus: 'approved',
      riskProfile: 'moderate',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateUUID(),
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1-555-0456',
      dateOfBirth: new Date('1990-07-22'),
      nationality: 'CA',
      kycLevel: 'tier_1',
      complianceStatus: 'approved',
      riskProfile: 'conservative',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateUUID(),
      name: 'Michael Chen',
      email: 'michael.chen@example.com',
      phone: '+65-9123-4567',
      dateOfBirth: new Date('1988-11-08'),
      nationality: 'SG',
      kycLevel: 'tier_3',
      complianceStatus: 'approved',
      riskProfile: 'aggressive',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],

  assets: [
    {
      id: generateUUID(),
      name: 'Solar Farm Alpha',
      description: 'Large-scale solar photovoltaic power plant in California desert',
      type: 'renewable_energy',
      location: 'California, USA',
      estimatedValue: 50000000,
      currency: 'USD',
      status: 'active',
      issuerId: '', // Will be set after issuer creation
      tokenizationStatus: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateUUID(),
      name: 'Wind Farm Beta',
      description: 'Offshore wind farm in the North Sea',
      type: 'renewable_energy',
      location: 'North Sea, UK',
      estimatedValue: 75000000,
      currency: 'EUR',
      status: 'active',
      issuerId: '', // Will be set after issuer creation
      tokenizationStatus: 'completed',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateUUID(),
      name: 'Commercial Real Estate Portfolio',
      description: 'Mixed-use commercial properties in Singapore CBD',
      type: 'real_estate',
      location: 'Singapore',
      estimatedValue: 120000000,
      currency: 'SGD',
      status: 'active',
      issuerId: '', // Will be set after issuer creation
      tokenizationStatus: 'in_progress',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],

  securityTokens: [
    {
      id: generateUUID(),
      symbol: 'SOLAR',
      name: 'Solar Farm Alpha Token',
      assetId: '', // Will be set after asset creation
      totalSupply: 1000000,
      decimals: 18,
      standard: 'ERC_3643',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateUUID(),
      symbol: 'WIND',
      name: 'Wind Farm Beta Token',
      assetId: '', // Will be set after asset creation
      totalSupply: 1500000,
      decimals: 18,
      standard: 'ERC_3643',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],

  portfolios: [
    {
      id: generateUUID(),
      investorId: '', // Will be set after investor creation
      totalValue: 250000,
      currency: 'USD',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateUUID(),
      investorId: '', // Will be set after investor creation
      totalValue: 150000,
      currency: 'USD',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateUUID(),
      investorId: '', // Will be set after investor creation
      totalValue: 500000,
      currency: 'SGD',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],

  portfolioTokens: [
    {
      portfolioId: '', // Will be set after portfolio creation
      tokenId: '', // Will be set after token creation
      quantity: 5000,
      averagePrice: 50,
      currentValue: 250000,
    },
    {
      portfolioId: '', // Will be set after portfolio creation
      tokenId: '', // Will be set after token creation
      quantity: 3000,
      averagePrice: 50,
      currentValue: 150000,
    },
    {
      portfolioId: '', // Will be set after portfolio creation
      tokenId: '', // Will be set after token creation
      quantity: 10000,
      averagePrice: 50,
      currentValue: 500000,
    },
  ],

  complianceChecks: [
    {
      id: generateUUID(),
      entityId: '', // Will be set after entity creation
      entityType: 'investor',
      checkType: 'kyc',
      status: 'approved',
      score: 95,
      nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateUUID(),
      entityId: '', // Will be set after entity creation
      entityType: 'issuer',
      checkType: 'aml',
      status: 'approved',
      score: 98,
      nextReviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months from now
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],

  documents: [
    {
      id: generateUUID(),
      name: 'Solar Farm Alpha - Environmental Impact Assessment',
      type: 'asset_document',
      url: 'https://minio:9000/documents/solar-farm-alpha-eia.pdf',
      mimeType: 'application/pdf',
      size: 2048576, // 2MB
      hash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: generateUUID(),
      name: 'John Smith - Passport',
      type: 'id_document',
      url: 'https://minio:9000/documents/john-smith-passport.jpg',
      mimeType: 'image/jpeg',
      size: 1048576, // 1MB
      hash: 'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
};

async function createTables() {
  const client = await pool.connect();
  
  try {
    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS issuers (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        jurisdiction VARCHAR(2) NOT NULL,
        registration_number VARCHAR(100) NOT NULL,
        compliance_status VARCHAR(50) NOT NULL,
        kyc_status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS investors (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        date_of_birth DATE NOT NULL,
        nationality VARCHAR(2) NOT NULL,
        kyc_level VARCHAR(20) NOT NULL,
        compliance_status VARCHAR(50) NOT NULL,
        risk_profile VARCHAR(20) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL,
        location VARCHAR(255) NOT NULL,
        estimated_value DECIMAL(20,2) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        status VARCHAR(50) NOT NULL,
        issuer_id UUID REFERENCES issuers(id),
        tokenization_status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS security_tokens (
        id UUID PRIMARY KEY,
        symbol VARCHAR(10) NOT NULL,
        name VARCHAR(255) NOT NULL,
        asset_id UUID REFERENCES assets(id),
        total_supply DECIMAL(30,0) NOT NULL,
        decimals INTEGER NOT NULL,
        standard VARCHAR(20) NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS portfolios (
        id UUID PRIMARY KEY,
        investor_id UUID REFERENCES investors(id),
        total_value DECIMAL(20,2) NOT NULL,
        currency VARCHAR(3) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS portfolio_tokens (
        portfolio_id UUID REFERENCES portfolios(id),
        token_id UUID REFERENCES security_tokens(id),
        quantity DECIMAL(30,0) NOT NULL,
        average_price DECIMAL(20,2) NOT NULL,
        current_value DECIMAL(20,2) NOT NULL,
        PRIMARY KEY (portfolio_id, token_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS compliance_checks (
        id UUID PRIMARY KEY,
        entity_id UUID NOT NULL,
        entity_type VARCHAR(20) NOT NULL,
        check_type VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        score INTEGER NOT NULL,
        next_review_date TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        url TEXT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size BIGINT NOT NULL,
        hash VARCHAR(64) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );
    `);

    console.log('✅ Tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function seedData() {
  const client = await pool.connect();
  
  try {
    // Insert issuers
    console.log('🌱 Seeding issuers...');
    for (const issuer of demoData.issuers) {
      await client.query(`
        INSERT INTO issuers (id, name, type, jurisdiction, registration_number, compliance_status, kyc_status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, [issuer.id, issuer.name, issuer.type, issuer.jurisdiction, issuer.registrationNumber, issuer.complianceStatus, issuer.kycStatus, issuer.createdAt, issuer.updatedAt]);
    }

    // Insert investors
    console.log('🌱 Seeding investors...');
    for (const investor of demoData.investors) {
      await client.query(`
        INSERT INTO investors (id, name, email, phone, date_of_birth, nationality, kyc_level, compliance_status, risk_profile, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING
      `, [investor.id, investor.name, investor.email, investor.phone, investor.dateOfBirth, investor.nationality, investor.kycLevel, investor.complianceStatus, investor.riskProfile, investor.createdAt, investor.updatedAt]);
    }

    // Update asset issuer IDs and insert assets
    console.log('🌱 Seeding assets...');
    demoData.assets[0].issuerId = demoData.issuers[0].id; // Solar Farm -> Green Energy Holdings
    demoData.assets[1].issuerId = demoData.issuers[0].id; // Wind Farm -> Green Energy Holdings
    demoData.assets[2].issuerId = demoData.issuers[1].id; // Real Estate -> Sustainable Infrastructure Fund

    for (const asset of demoData.assets) {
      await client.query(`
        INSERT INTO assets (id, name, description, type, location, estimated_value, currency, status, issuer_id, tokenization_status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO NOTHING
      `, [asset.id, asset.name, asset.description, asset.type, asset.location, asset.estimatedValue, asset.currency, asset.status, asset.issuerId, asset.tokenizationStatus, asset.createdAt, asset.updatedAt]);
    }

    // Update token asset IDs and insert security tokens
    console.log('🌱 Seeding security tokens...');
    demoData.securityTokens[0].assetId = demoData.assets[0].id; // SOLAR -> Solar Farm Alpha
    demoData.securityTokens[1].assetId = demoData.assets[1].id; // WIND -> Wind Farm Beta

    for (const token of demoData.securityTokens) {
      await client.query(`
        INSERT INTO security_tokens (id, symbol, name, asset_id, total_supply, decimals, standard, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING
      `, [token.id, token.symbol, token.name, token.assetId, token.totalSupply, token.decimals, token.standard, token.status, token.createdAt, token.updatedAt]);
    }

    // Update portfolio investor IDs and insert portfolios
    console.log('🌱 Seeding portfolios...');
    demoData.portfolios[0].investorId = demoData.investors[0].id; // John Smith's portfolio
    demoData.portfolios[1].investorId = demoData.investors[1].id; // Sarah Johnson's portfolio
    demoData.portfolios[2].investorId = demoData.investors[2].id; // Michael Chen's portfolio

    for (const portfolio of demoData.portfolios) {
      await client.query(`
        INSERT INTO portfolios (id, investor_id, total_value, currency, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING
      `, [portfolio.id, portfolio.investorId, portfolio.totalValue, portfolio.currency, portfolio.createdAt, portfolio.updatedAt]);
    }

    // Update portfolio token references and insert portfolio tokens
    console.log('🌱 Seeding portfolio tokens...');
    demoData.portfolioTokens[0].portfolioId = demoData.portfolios[0].id; // John Smith's SOLAR tokens
    demoData.portfolioTokens[0].tokenId = demoData.securityTokens[0].id;
    demoData.portfolioTokens[1].portfolioId = demoData.portfolios[1].id; // Sarah Johnson's SOLAR tokens
    demoData.portfolioTokens[1].tokenId = demoData.securityTokens[0].id;
    demoData.portfolioTokens[2].portfolioId = demoData.portfolios[2].id; // Michael Chen's WIND tokens
    demoData.portfolioTokens[2].tokenId = demoData.securityTokens[1].id;

    for (const portfolioToken of demoData.portfolioTokens) {
      await client.query(`
        INSERT INTO portfolio_tokens (portfolio_id, token_id, quantity, average_price, current_value)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (portfolio_id, token_id) DO NOTHING
      `, [portfolioToken.portfolioId, portfolioToken.tokenId, portfolioToken.quantity, portfolioToken.averagePrice, portfolioToken.currentValue]);
    }

    // Update compliance check entity IDs and insert compliance checks
    console.log('🌱 Seeding compliance checks...');
    demoData.complianceChecks[0].entityId = demoData.investors[0].id; // John Smith's KYC check
    demoData.complianceChecks[1].entityId = demoData.issuers[0].id; // Green Energy Holdings' AML check

    for (const check of demoData.complianceChecks) {
      await client.query(`
        INSERT INTO compliance_checks (id, entity_id, entity_type, check_type, status, score, next_review_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, [check.id, check.entityId, check.entityType, check.checkType, check.status, check.score, check.nextReviewDate, check.createdAt, check.updatedAt]);
    }

    // Insert documents
    console.log('🌱 Seeding documents...');
    for (const document of demoData.documents) {
      await client.query(`
        INSERT INTO documents (id, name, type, url, mime_type, size, hash, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, [document.id, document.name, document.type, document.url, document.mimeType, document.size, document.hash, document.createdAt, document.updatedAt]);
    }

    console.log('✅ Demo data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function displaySummary() {
  const client = await pool.connect();
  
  try {
    console.log('\n📊 Demo Data Summary:');
    console.log('=====================');
    
    const issuerCount = await client.query('SELECT COUNT(*) FROM issuers');
    const investorCount = await client.query('SELECT COUNT(*) FROM investors');
    const assetCount = await client.query('SELECT COUNT(*) FROM assets');
    const tokenCount = await client.query('SELECT COUNT(*) FROM security_tokens');
    const portfolioCount = await client.query('SELECT COUNT(*) FROM portfolios');
    
    console.log(`🏢 Issuers: ${issuerCount.rows[0].count}`);
    console.log(`👥 Investors: ${investorCount.rows[0].count}`);
    console.log(`🏗️  Assets: ${assetCount.rows[0].count}`);
    console.log(`🪙 Security Tokens: ${tokenCount.rows[0].count}`);
    console.log(`💼 Portfolios: ${portfolioCount.rows[0].count}`);
    
    console.log('\n🎯 Demo Use Cases:');
    console.log('==================');
    console.log('• Solar Farm Alpha: 50MW solar plant tokenized into 1M SOLAR tokens');
    console.log('• Wind Farm Beta: 100MW offshore wind farm tokenized into 1.5M WIND tokens');
    console.log('• Commercial Real Estate: Singapore CBD portfolio (tokenization in progress)');
    console.log('• Multiple investor types: Conservative, Moderate, and Aggressive risk profiles');
    console.log('• Full compliance workflow: KYC, AML, and ongoing monitoring');
    
    console.log('\n🚀 Next Steps:');
    console.log('===============');
    console.log('1. Start the applications: pnpm dev');
    console.log('2. Access the web app: http://localhost:3001');
    console.log('3. Access the console: http://localhost:3002');
    console.log('4. API Gateway: http://localhost:3000');
    console.log('5. MinIO Console: http://localhost:9001 (aimy/aimy123)');
    console.log('6. Grafana: http://localhost:3003 (admin/admin)');
    
  } catch (error) {
    console.error('❌ Error displaying summary:', error);
  } finally {
    client.release();
  }
}

async function main() {
  try {
    console.log('🚀 Starting AIMY demo data seeding...\n');
    
    await createTables();
    await seedData();
    await displaySummary();
    
    console.log('\n🎉 AIMY demo platform is ready!');
    
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the seeding
if (require.main === module) {
  main();
}
