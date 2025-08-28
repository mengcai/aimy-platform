import { test, expect, Page } from '@playwright/test';
import { ethers } from 'ethers';

/**
 * Solar Farm Tokenization End-to-End Test
 * 
 * This test covers the complete lifecycle:
 * 1. Issuer onboards solar farm, runs AI valuation, deploys ERC-3643 token, opens primary
 * 2. Investor A (US, Reg D accredited) passes KYC, subscribes primary
 * 3. Investor B (HK, qualified) passes KYC, buys on secondary AMM
 * 4. Settlement runs monthly payout in USDC; receipts generated
 * 5. Compliance blocks an ineligible transfer; audit trail recorded
 * 
 * Expected: All screens reflect positions, AI Insights, and PoR snapshot updated
 */

test.describe('Solar Farm Tokenization E2E', () => {
  let page: Page;
  let issuerWallet: ethers.Wallet;
  let investorAWallet: ethers.Wallet;
  let investorBWallet: ethers.Wallet;
  
  // Test data
  const solarFarmData = {
    name: 'Solar Farm 3643',
    location: 'Guangdong Province, China',
    capacity: '50MW',
    totalValue: 50000000, // $50M USD
    annualYield: 0.065, // 6.5%
    tokenSymbol: 'STV',
    tokenName: 'SolarTech Ventures Security Token'
  };

  const investorAData = {
    name: 'John Smith',
    email: 'john.smith.test@example.com',
    nationality: 'US',
    accreditation: 'ACCREDITED',
    investmentAmount: 100000, // $100K
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  };

  const investorBData = {
    name: 'Li Wei',
    email: 'li.wei.test@example.com',
    nationality: 'HK',
    qualification: 'QUALIFIED',
    investmentAmount: 200000, // $200K
    walletAddress: '0x8ba1f109551bA432bdf5c3c2E3B1a5C8b1C2D3E4'
  };

  test.beforeAll(async ({ browser }) => {
    // Initialize wallets for testing
    issuerWallet = ethers.Wallet.createRandom();
    investorAWallet = ethers.Wallet.createRandom();
    investorBWallet = ethers.Wallet.createRandom();

    // Setup test environment
    page = await browser.newPage();
    
    // Navigate to the platform
    await page.goto('http://localhost:3005');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.describe('Phase 1: Issuer Onboarding & Asset Creation', () => {
    test('should allow issuer to create account and complete KYC', async () => {
      // Navigate to issuer registration
      await page.click('[data-testid="issuer-register-btn"]');
      
      // Fill issuer details
      await page.fill('[data-testid="issuer-name"]', 'SolarTech Ventures Ltd');
      await page.fill('[data-testid="issuer-legal-name"]', 'SolarTech Ventures Limited');
      await page.fill('[data-testid="issuer-registration-number"]', 'STV-2024-001');
      await page.selectOption('[data-testid="issuer-jurisdiction"]', 'HK');
      await page.fill('[data-testid="issuer-address"]', 'Suite 2501, 25/F, Central Plaza, 18 Harbour Road, Wan Chai, Hong Kong');
      await page.fill('[data-testid="issuer-email"]', 'contact@solartechventures.hk');
      await page.fill('[data-testid="issuer-phone"]', '+852 2345 6789');
      
      // Submit registration
      await page.click('[data-testid="issuer-submit-btn"]');
      
      // Verify success
      await expect(page.locator('[data-testid="registration-success"]')).toBeVisible();
      await expect(page.locator('text=Issuer account created successfully')).toBeVisible();
    });

    test('should allow issuer to create solar farm asset', async () => {
      // Navigate to asset creation
      await page.click('[data-testid="create-asset-btn"]');
      
      // Fill asset details
      await page.fill('[data-testid="asset-name"]', solarFarmData.name);
      await page.fill('[data-testid="asset-description"]', `${solarFarmData.capacity} solar photovoltaic power plant in ${solarFarmData.location}`);
      await page.selectOption('[data-testid="asset-type"]', 'renewable_energy');
      await page.fill('[data-testid="asset-value"]', solarFarmData.totalValue.toString());
      await page.selectOption('[data-testid="asset-currency"]', 'USD');
      await page.fill('[data-testid="asset-location"]', solarFarmData.location);
      
      // Fill technical details
      await page.fill('[data-testid="asset-capacity"]', solarFarmData.capacity);
      await page.fill('[data-testid="asset-annual-output"]', '75000'); // MWh
      await page.fill('[data-testid="asset-land-area"]', '120'); // hectares
      await page.fill('[data-testid="asset-lifespan"]', '25'); // years
      
      // Submit asset creation
      await page.click('[data-testid="asset-submit-btn"]');
      
      // Verify success
      await expect(page.locator('[data-testid="asset-created-success"]')).toBeVisible();
      await expect(page.locator(`text=${solarFarmData.name} created successfully`)).toBeVisible();
    });

    test('should run AI valuation and generate insights', async () => {
      // Navigate to AI insights
      await page.click('[data-testid="ai-insights-btn"]');
      
      // Trigger AI valuation
      await page.click('[data-testid="run-ai-valuation-btn"]');
      
      // Wait for AI processing
      await page.waitForSelector('[data-testid="ai-processing"]', { timeout: 30000 });
      await page.waitForSelector('[data-testid="ai-complete"]', { timeout: 60000 });
      
      // Verify AI insights
      await expect(page.locator('[data-testid="ai-valuation-result"]')).toBeVisible();
      await expect(page.locator('[data-testid="ai-yield-forecast"]')).toBeVisible();
      await expect(page.locator('[data-testid="ai-risk-assessment"]')).toBeVisible();
      
      // Verify specific insights
      const yieldForecast = await page.locator('[data-testid="yield-forecast-value"]').textContent();
      expect(yieldForecast).toContain('6.5%');
      
      const riskScore = await page.locator('[data-testid="risk-score-value"]').textContent();
      expect(parseFloat(riskScore || '0')).toBeLessThan(0.3); // Low risk
    });

    test('should deploy ERC-3643 token to blockchain', async () => {
      // Navigate to token deployment
      await page.click('[data-testid="deploy-token-btn"]');
      
      // Fill token details
      await page.fill('[data-testid="token-name"]', solarFarmData.tokenName);
      await page.fill('[data-testid="token-symbol"]', solarFarmData.tokenSymbol);
      await page.fill('[data-testid="token-supply"]', '1000000');
      await page.selectOption('[data-testid="token-standard"]', 'ERC-3643');
      
      // Configure compliance settings
      await page.check('[data-testid="token-kyc-required"]');
      await page.check('[data-testid="token-transfer-restrictions"]');
      await page.fill('[data-testid="token-max-transfer"]', '100000');
      
      // Deploy token
      await page.click('[data-testid="deploy-token-submit-btn"]');
      
      // Wait for deployment
      await page.waitForSelector('[data-testid="deployment-processing"]', { timeout: 30000 });
      await page.waitForSelector('[data-testid="deployment-complete"]', { timeout: 120000 });
      
      // Verify deployment
      await expect(page.locator('[data-testid="token-deployed-success"]')).toBeVisible();
      
      // Get contract address
      const contractAddress = await page.locator('[data-testid="token-contract-address"]').textContent();
      expect(contractAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
      
      // Store for later use
      solarFarmData.contractAddress = contractAddress;
    });

    test('should open primary offering with terms', async () => {
      // Navigate to offering creation
      await page.click('[data-testid="create-offering-btn"]');
      
      // Fill offering details
      await page.fill('[data-testid="offering-name"]', `${solarFarmData.name} Initial Offering`);
      await page.fill('[data-testid="offering-description"]', 'Initial token offering for the Solar Farm 3643 project');
      await page.selectOption('[data-testid="offering-type"]', 'primary');
      await page.fill('[data-testid="offering-total-amount"]', solarFarmData.totalValue.toString());
      await page.fill('[data-testid="offering-min-investment"]', '10000');
      await page.fill('[data-testid="offering-max-investment"]', '1000000');
      
      // Set dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 60);
      
      await page.fill('[data-testid="offering-start-date"]', startDate.toISOString().split('T')[0]);
      await page.fill('[data-testid="offering-end-date"]', endDate.toISOString().split('T')[0]);
      
      // Set terms
      await page.fill('[data-testid="offering-lockup-period"]', '12');
      await page.selectOption('[data-testid="offering-kyc-level"]', 'enhanced');
      await page.check('[data-testid="offering-accreditation-required"]');
      
      // Launch offering
      await page.click('[data-testid="launch-offering-btn"]');
      
      // Verify success
      await expect(page.locator('[data-testid="offering-launched-success"]')).toBeVisible();
      await expect(page.locator('text=Primary offering launched successfully')).toBeVisible();
    });
  });

  test.describe('Phase 2: Investor A KYC & Primary Subscription', () => {
    test('should allow Investor A to register and complete KYC', async () => {
      // Switch to investor registration
      await page.click('[data-testid="investor-register-btn"]');
      
      // Fill investor details
      await page.fill('[data-testid="investor-name"]', investorAData.name);
      await page.fill('[data-testid="investor-email"]', investorAData.email);
      await page.fill('[data-testid="investor-phone"]', '+1 555 123 4567');
      await page.fill('[data-testid="investor-address"]', '123 Wall Street, New York, NY 10005, USA');
      await page.fill('[data-testid="investor-dob"]', '1980-05-15');
      await page.selectOption('[data-testid="investor-nationality"]', 'US');
      await page.selectOption('[data-testid="investor-kyc-level"]', 'enhanced');
      await page.selectOption('[data-testid="investor-accreditation"]', 'ACCREDITED');
      
      // Submit registration
      await page.click('[data-testid="investor-submit-btn"]');
      
      // Verify success
      await expect(page.locator('[data-testid="investor-registered-success"]')).toBeVisible();
    });

    test('should complete KYC verification for Investor A', async () => {
      // Navigate to KYC verification
      await page.click('[data-testid="kyc-verification-btn"]');
      
      // Upload required documents
      await page.setInputFiles('[data-testid="passport-upload"]', 'test-files/passport-us.pdf');
      await page.setInputFiles('[data-testid="drivers-license-upload"]', 'test-files/drivers-license-ny.pdf');
      await page.setInputFiles('[data-testid="accreditation-upload"]', 'test-files/accreditation-letter.pdf');
      
      // Submit KYC
      await page.click('[data-testid="submit-kyc-btn"]');
      
      // Wait for processing
      await page.waitForSelector('[data-testid="kyc-processing"]', { timeout: 30000 });
      await page.waitForSelector('[data-testid="kyc-complete"]', { timeout: 60000 });
      
      // Verify KYC approval
      await expect(page.locator('[data-testid="kyc-approved"]')).toBeVisible();
      await expect(page.locator('text=KYC verification completed successfully')).toBeVisible();
    });

    test('should allow Investor A to subscribe to primary offering', async () => {
      // Navigate to primary offering
      await page.click('[data-testid="primary-offerings-btn"]');
      await page.click(`[data-testid="offering-${solarFarmData.name}"]`);
      
      // Fill subscription details
      await page.fill('[data-testid="subscription-amount"]', investorAData.investmentAmount.toString());
      await page.fill('[data-testid="wallet-address"]', investorAData.walletAddress);
      
      // Accept terms
      await page.check('[data-testid="accept-terms-checkbox"]');
      await page.check('[data-testid="accept-kyc-checkbox"]');
      
      // Submit subscription
      await page.click('[data-testid="submit-subscription-btn"]');
      
      // Verify success
      await expect(page.locator('[data-testid="subscription-success"]')).toBeVisible();
      await expect(page.locator('text=Primary subscription successful')).toBeVisible();
    });

    test('should verify Investor A position and token allocation', async () => {
      // Navigate to portfolio
      await page.click('[data-testid="portfolio-btn"]');
      
      // Verify position
      await expect(page.locator(`text=${solarFarmData.tokenSymbol}`)).toBeVisible();
      await expect(page.locator(`text=${solarFarmData.name}`)).toBeVisible();
      
      // Verify token amount
      const tokenAmount = await page.locator('[data-testid="token-amount"]').textContent();
      const expectedTokens = (investorAData.investmentAmount / (solarFarmData.totalValue / 1000000)).toFixed(2);
      expect(tokenAmount).toContain(expectedTokens);
      
      // Verify investment value
      const investmentValue = await page.locator('[data-testid="investment-value"]').textContent();
      expect(investmentValue).toContain('$100,000');
    });
  });

  test.describe('Phase 3: Investor B KYC & Secondary Trading', () => {
    test('should allow Investor B to register and complete KYC', async () => {
      // Switch to investor registration
      await page.click('[data-testid="investor-register-btn"]');
      
      // Fill investor details
      await page.fill('[data-testid="investor-name"]', investorBData.name);
      await page.fill('[data-testid="investor-email"]', investorBData.email);
      await page.fill('[data-testid="investor-phone"]', '+852 9876 5432');
      await page.fill('[data-testid="investor-address"]', '456 Nathan Road, Tsim Sha Tsui, Kowloon, Hong Kong');
      await page.fill('[data-testid="investor-dob"]', '1985-08-22');
      await page.selectOption('[data-testid="investor-nationality"]', 'HK');
      await page.selectOption('[data-testid="investor-kyc-level"]', 'enhanced');
      await page.selectOption('[data-testid="investor-qualification"]', 'QUALIFIED');
      
      // Submit registration
      await page.click('[data-testid="investor-submit-btn"]');
      
      // Verify success
      await expect(page.locator('[data-testid="investor-registered-success"]')).toBeVisible();
    });

    test('should complete KYC verification for Investor B', async () => {
      // Navigate to KYC verification
      await page.click('[data-testid="kyc-verification-btn"]');
      
      // Upload required documents
      await page.setInputFiles('[data-testid="hk-id-upload"]', 'test-files/hk-id-card.pdf');
      await page.setInputFiles('[data-testid="passport-upload"]', 'test-files/passport-hk.pdf');
      await page.setInputFiles('[data-testid="qualification-upload"]', 'test-files/qualification-certificate.pdf');
      
      // Submit KYC
      await page.click('[data-testid="submit-kyc-btn"]');
      
      // Wait for processing
      await page.waitForSelector('[data-testid="kyc-processing"]', { timeout: 30000 });
      await page.waitForSelector('[data-testid="kyc-complete"]', { timeout: 60000 });
      
      // Verify KYC approval
      await expect(page.locator('[data-testid="kyc-approved"]')).toBeVisible();
      await expect(page.locator('text=KYC verification completed successfully')).toBeVisible();
    });

    test('should allow Investor B to buy tokens on secondary AMM', async () => {
      // Navigate to secondary trading
      await page.click('[data-testid="secondary-trading-btn"]');
      await page.click(`[data-testid="token-${solarFarmData.tokenSymbol}"]`);
      
      // Fill trade details
      await page.fill('[data-testid="trade-amount"]', investorBData.investmentAmount.toString());
      await page.fill('[data-testid="wallet-address"]', investorBData.walletAddress);
      await page.selectOption('[data-testid="trade-type"]', 'buy');
      
      // Execute trade
      await page.click('[data-testid="execute-trade-btn"]');
      
      // Wait for trade execution
      await page.waitForSelector('[data-testid="trade-processing"]', { timeout: 30000 });
      await page.waitForSelector('[data-testid="trade-complete"]', { timeout: 60000 });
      
      // Verify success
      await expect(page.locator('[data-testid="trade-success"]')).toBeVisible();
      await expect(page.locator('text=Trade executed successfully')).toBeVisible();
    });

    test('should verify Investor B position and liquidity pool update', async () => {
      // Navigate to portfolio
      await page.click('[data-testid="portfolio-btn"]');
      
      // Verify position
      await expect(page.locator(`text=${solarFarmData.tokenSymbol}`)).toBeVisible();
      await expect(page.locator(`text=${solarFarmData.name}`)).toBeVisible();
      
      // Verify token amount
      const tokenAmount = await page.locator('[data-testid="token-amount"]').textContent();
      const expectedTokens = (investorBData.investmentAmount / (solarFarmData.totalValue / 1000000)).toFixed(2);
      expect(tokenAmount).toContain(expectedTokens);
      
      // Check liquidity pool
      await page.click('[data-testid="liquidity-pools-btn"]');
      await expect(page.locator(`text=${solarFarmData.tokenSymbol}/USDC`)).toBeVisible();
      
      // Verify pool liquidity increased
      const poolLiquidity = await page.locator('[data-testid="pool-liquidity"]').textContent();
      expect(parseFloat(poolLiquidity?.replace(/[^0-9.]/g, '') || '0')).toBeGreaterThan(0);
    });
  });

  test.describe('Phase 4: Monthly Settlement & Payout', () => {
    test('should process monthly yield payout in USDC', async () => {
      // Navigate to settlement dashboard
      await page.click('[data-testid="settlement-dashboard-btn"]');
      
      // Trigger monthly payout
      await page.click('[data-testid="monthly-payout-btn"]');
      
      // Wait for processing
      await page.waitForSelector('[data-testid="payout-processing"]', { timeout: 30000 });
      await page.waitForSelector('[data-testid="payout-complete"]', { timeout: 60000 });
      
      // Verify payout success
      await expect(page.locator('[data-testid="payout-success"]')).toBeVisible();
      await expect(page.locator('text=Monthly payout processed successfully')).toBeVisible();
    });

    test('should generate payout receipts for all investors', async () => {
      // Navigate to receipts
      await page.click('[data-testid="payout-receipts-btn"]');
      
      // Verify Investor A receipt
      await expect(page.locator(`text=${investorAData.name}`)).toBeVisible();
      const investorAReceipt = await page.locator(`[data-testid="receipt-${investorAData.name}"]`);
      await expect(investorAReceipt.locator('[data-testid="receipt-amount"]')).toContainText('$1,625'); // $100K * 6.5% / 4
      await expect(investorAReceipt.locator('[data-testid="receipt-currency"]')).toContainText('USDC');
      
      // Verify Investor B receipt
      await expect(page.locator(`text=${investorBData.name}`)).toBeVisible();
      const investorBReceipt = await page.locator(`[data-testid="receipt-${investorBData.name}"]`);
      await expect(investorBReceipt.locator('[data-testid="receipt-amount"]')).toContainText('$3,250'); // $200K * 6.5% / 4
      await expect(investorBReceipt.locator('[data-testid="receipt-currency"]')).toContainText('USDC');
    });

    test('should update investor portfolios with yield earnings', async () => {
      // Check Investor A portfolio
      await page.click('[data-testid="portfolio-btn"]');
      await page.fill('[data-testid="search-investor"]', investorAData.name);
      await page.click(`[data-testid="investor-${investorAData.name}"]`);
      
      // Verify yield earnings
      const yieldEarnings = await page.locator('[data-testid="yield-earnings"]').textContent();
      expect(yieldEarnings).toContain('$1,625');
      
      // Check Investor B portfolio
      await page.fill('[data-testid="search-investor"]', investorBData.name);
      await page.click(`[data-testid="investor-${investorBData.name}"]`);
      
      // Verify yield earnings
      const yieldEarningsB = await page.locator('[data-testid="yield-earnings"]').textContent();
      expect(yieldEarningsB).toContain('$3,250');
    });
  });

  test.describe('Phase 5: Compliance & Transfer Restrictions', () => {
    test('should block ineligible token transfer', async () => {
      // Navigate to compliance dashboard
      await page.click('[data-testid="compliance-dashboard-btn"]');
      
      // Attempt unauthorized transfer
      await page.click('[data-testid="test-transfer-btn"]');
      await page.fill('[data-testid="transfer-from"]', investorAData.walletAddress);
      await page.fill('[data-testid="transfer-to"]', '0x0000000000000000000000000000000000000000');
      await page.fill('[data-testid="transfer-amount"]', '1000');
      
      // Submit transfer
      await page.click('[data-testid="submit-transfer-btn"]');
      
      // Verify transfer blocked
      await expect(page.locator('[data-testid="transfer-blocked"]')).toBeVisible();
      await expect(page.locator('text=Transfer blocked by compliance rules')).toBeVisible();
    });

    test('should record compliance audit trail', async () => {
      // Navigate to audit logs
      await page.click('[data-testid="audit-logs-btn"]');
      
      // Verify blocked transfer recorded
      await expect(page.locator('[data-testid="audit-entry"]')).toBeVisible();
      await expect(page.locator('text=Transfer blocked')).toBeVisible();
      await expect(page.locator('text=Compliance rule violation')).toBeVisible();
      
      // Verify details
      const auditDetails = await page.locator('[data-testid="audit-details"]').textContent();
      expect(auditDetails).toContain(investorAData.walletAddress);
      expect(auditDetails).toContain('0x0000000000000000000000000000000000000000');
      expect(auditDetails).toContain('1000');
    });

    test('should update compliance dashboard with violation', async () => {
      // Return to compliance dashboard
      await page.click('[data-testid="compliance-dashboard-btn"]');
      
      // Verify violation count increased
      const violationCount = await page.locator('[data-testid="violation-count"]').textContent();
      expect(parseInt(violationCount || '0')).toBeGreaterThan(0);
      
      // Verify recent violations
      await expect(page.locator('[data-testid="recent-violations"]')).toBeVisible();
      await expect(page.locator('text=Transfer blocked')).toBeVisible();
    });
  });

  test.describe('Phase 6: AI Insights & Portfolio Updates', () => {
    test('should update AI insights with new data', async () => {
      // Navigate to AI insights
      await page.click('[data-testid="ai-insights-btn"]');
      
      // Refresh insights
      await page.click('[data-testid="refresh-insights-btn"]');
      
      // Wait for processing
      await page.waitForSelector('[data-testid="ai-processing"]', { timeout: 30000 });
      await page.waitForSelector('[data-testid="ai-complete"]', { timeout: 60000 });
      
      // Verify updated insights
      await expect(page.locator('[data-testid="updated-yield-forecast"]')).toBeVisible();
      await expect(page.locator('[data-testid="updated-risk-assessment"]')).toBeVisible();
      
      // Verify investor count updated
      const investorCount = await page.locator('[data-testid="total-investors"]').textContent();
      expect(parseInt(investorCount || '0')).toBe(2);
      
      // Verify total investment updated
      const totalInvestment = await page.locator('[data-testid="total-investment"]').textContent();
      expect(totalInvestment).toContain('$300,000');
    });

    test('should update portfolio analytics', async () => {
      // Navigate to portfolio analytics
      await page.click('[data-testid="portfolio-analytics-btn"]');
      
      // Verify asset allocation
      await expect(page.locator(`text=${solarFarmData.name}`)).toBeVisible();
      const assetAllocation = await page.locator('[data-testid="asset-allocation"]').textContent();
      expect(assetAllocation).toContain('100%'); // Only one asset
      
      // Verify investor distribution
      await expect(page.locator(`text=${investorAData.name}`)).toBeVisible();
      await expect(page.locator(`text=${investorBData.name}`)).toBeVisible();
      
      // Verify yield distribution
      const yieldDistribution = await page.locator('[data-testid="yield-distribution"]').textContent();
      expect(yieldDistribution).toContain('$4,875'); // Total quarterly yield
    });
  });

  test.describe('Phase 7: Proof of Reserve Snapshot', () => {
    test('should generate updated PoR snapshot', async () => {
      // Navigate to PoR dashboard
      await page.click('[data-testid="por-dashboard-btn"]');
      
      // Generate new snapshot
      await page.click('[data-testid="generate-por-btn"]');
      
      // Wait for generation
      await page.waitForSelector('[data-testid="por-generating"]', { timeout: 30000 });
      await page.waitForSelector('[data-testid="por-complete"]', { timeout: 60000 });
      
      // Verify snapshot generated
      await expect(page.locator('[data-testid="por-generated"]')).toBeVisible();
      await expect(page.locator('text=Proof of Reserve snapshot generated')).toBeVisible();
    });

    test('should verify PoR snapshot accuracy', async () => {
      // View snapshot details
      await page.click('[data-testid="view-por-details-btn"]');
      
      // Verify asset count
      const assetCount = await page.locator('[data-testid="por-asset-count"]').textContent();
      expect(assetCount).toBe('1');
      
      // Verify total value
      const totalValue = await page.locator('[data-testid="por-total-value"]').textContent();
      expect(totalValue).toContain('$50,000,000');
      
      // Verify investor count
      const investorCount = await page.locator('[data-testid="por-investor-count"]').textContent();
      expect(investorCount).toBe('2');
      
      // Verify total commitments
      const totalCommitments = await page.locator('[data-testid="por-total-commitments"]').textContent();
      expect(totalCommitments).toContain('$300,000');
      
      // Verify reserve ratio
      const reserveRatio = await page.locator('[data-testid="por-reserve-ratio"]').textContent();
      expect(parseFloat(reserveRatio || '0')).toBeGreaterThan(1.0); // Over-collateralized
    });

    test('should export PoR report', async () => {
      // Export report
      await page.click('[data-testid="export-por-btn"]');
      
      // Wait for export
      await page.waitForSelector('[data-testid="export-processing"]', { timeout: 30000 });
      await page.waitForSelector('[data-testid="export-complete"]', { timeout: 60000 });
      
      // Verify export success
      await expect(page.locator('[data-testid="export-success"]')).toBeVisible();
      
      // Verify file downloaded
      const downloadPromise = page.waitForEvent('download');
      await page.click('[data-testid="download-por-btn"]');
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/proof-of-reserve-\d{4}-\d{2}-\d{2}\.json/);
    });
  });

  test.describe('Final Verification: Complete System State', () => {
    test('should reflect all positions across all screens', async () => {
      // Verify web app positions
      await page.goto('http://localhost:3005/portfolio');
      await expect(page.locator(`text=${solarFarmData.tokenSymbol}`)).toBeVisible();
      await expect(page.locator('text=Total Value: $300,000')).toBeVisible();
      
      // Verify console positions
      await page.goto('http://localhost:3006/assets');
      await expect(page.locator(`text=${solarFarmData.name}`)).toBeVisible();
      await expect(page.locator('text=Status: Active')).toBeVisible();
      
      // Verify API responses
      const response = await page.request.get('http://localhost:3001/api/v1/assets');
      expect(response.status()).toBe(200);
      const assets = await response.json();
      expect(assets).toHaveLength(1);
      expect(assets[0].name).toBe(solarFarmData.name);
    });

    test('should show updated AI insights across platform', async () => {
      // Check web app insights
      await page.goto('http://localhost:3005/insights');
      await expect(page.locator('[data-testid="ai-insights"]')).toBeVisible();
      
      // Check console insights
      await page.goto('http://localhost:3006/insights');
      await expect(page.locator('[data-testid="ai-insights"]')).toBeVisible();
      
      // Verify insights consistency
      const webAppYield = await page.locator('[data-testid="yield-forecast"]').textContent();
      await page.goto('http://localhost:3006/insights');
      const consoleYield = await page.locator('[data-testid="yield-forecast"]').textContent();
      expect(webAppYield).toBe(consoleYield);
    });

    test('should maintain data consistency across all services', async () => {
      // Verify database consistency
      const dbResponse = await page.request.get('http://localhost:3001/api/v1/health/database');
      expect(dbResponse.status()).toBe(200);
      
      // Verify blockchain consistency
      const blockchainResponse = await page.request.get('http://localhost:3001/api/v1/health/blockchain');
      expect(blockchainResponse.status()).toBe(200);
      
      // Verify compliance consistency
      const complianceResponse = await page.request.get('http://localhost:3002/health');
      expect(complianceResponse.status()).toBe(200);
      
      // Verify settlement consistency
      const settlementResponse = await page.request.get('http://localhost:3003/health');
      expect(settlementResponse.status()).toBe(200);
    });
  });
});
