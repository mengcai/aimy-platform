import { Page, expect } from '@playwright/test';
import { ethers } from 'ethers';

/**
 * Test Utilities for AIMY Platform E2E Tests
 * 
 * Common functions for:
 * - Blockchain interactions
 * - Data validation
 * - UI element interactions
 * - Test data management
 */

export interface TestAsset {
  name: string;
  location: string;
  capacity: string;
  totalValue: number;
  annualYield: number;
  tokenSymbol: string;
  tokenName: string;
  contractAddress?: string;
}

export interface TestInvestor {
  name: string;
  email: string;
  nationality: string;
  accreditation?: string;
  qualification?: string;
  investmentAmount: number;
  walletAddress: string;
}

export interface TestOffering {
  name: string;
  description: string;
  totalAmount: number;
  minInvestment: number;
  maxInvestment: number;
  lockupPeriod: number;
  kycLevel: string;
  accreditationRequired: boolean;
}

/**
 * Blockchain Utilities
 */
export class BlockchainUtils {
  private provider: ethers.providers.JsonRpcProvider;
  
  constructor(rpcUrl: string = 'http://localhost:8545') {
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  }
  
  /**
   * Get test accounts from Hardhat
   */
  async getTestAccounts(): Promise<string[]> {
    return await this.provider.listAccounts();
  }
  
  /**
   * Get account balance
   */
  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  }
  
  /**
   * Verify contract deployment
   */
  async verifyContract(address: string): Promise<boolean> {
    try {
      const code = await this.provider.getCode(address);
      return code !== '0x';
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get network information
   */
  async getNetwork(): Promise<ethers.providers.Network> {
    return await this.provider.getNetwork();
  }
  
  /**
   * Create test wallet
   */
  createTestWallet(): ethers.Wallet {
    return ethers.Wallet.createRandom().connect(this.provider);
  }
}

/**
 * UI Interaction Utilities
 */
export class UIUtils {
  /**
   * Wait for and click element with retry
   */
  static async clickWithRetry(page: Page, selector: string, maxRetries: number = 3): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.click(selector);
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await page.waitForTimeout(1000);
      }
    }
  }
  
  /**
   * Fill form with validation
   */
  static async fillForm(page: Page, formData: Record<string, string>): Promise<void> {
    for (const [selector, value] of Object.entries(formData)) {
      await page.waitForSelector(selector);
      await page.fill(selector, value);
      
      // Verify value was set
      const actualValue = await page.inputValue(selector);
      if (actualValue !== value) {
        throw new Error(`Failed to set ${selector} to ${value}, got ${actualValue}`);
      }
    }
  }
  
  /**
   * Wait for success message
   */
  static async waitForSuccess(page: Page, message: string, timeout: number = 10000): Promise<void> {
    await page.waitForSelector(`text=${message}`, { timeout });
  }
  
  /**
   * Wait for processing to complete
   */
  static async waitForProcessing(page: Page, processingSelector: string, completeSelector: string, timeout: number = 60000): Promise<void> {
    await page.waitForSelector(processingSelector, { timeout: 10000 });
    await page.waitForSelector(completeSelector, { timeout });
  }
}

/**
 * Data Validation Utilities
 */
export class ValidationUtils {
  /**
   * Validate asset data
   */
  static validateAsset(asset: TestAsset): void {
    expect(asset.name).toBeTruthy();
    expect(asset.location).toBeTruthy();
    expect(asset.capacity).toBeTruthy();
    expect(asset.totalValue).toBeGreaterThan(0);
    expect(asset.annualYield).toBeGreaterThan(0);
    expect(asset.annualYield).toBeLessThan(1); // Should be percentage
    expect(asset.tokenSymbol).toBeTruthy();
    expect(asset.tokenName).toBeTruthy();
  }
  
  /**
   * Validate investor data
   */
  static validateInvestor(investor: TestInvestor): void {
    expect(investor.name).toBeTruthy();
    expect(investor.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(investor.nationality).toBeTruthy();
    expect(investor.investmentAmount).toBeGreaterThan(0);
    expect(investor.walletAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
    
    if (investor.nationality === 'US') {
      expect(investor.accreditation).toBe('ACCREDITED');
    } else if (investor.nationality === 'HK') {
      expect(investor.qualification).toBe('QUALIFIED');
    }
  }
  
  /**
   * Validate offering data
   */
  static validateOffering(offering: TestOffering): void {
    expect(offering.name).toBeTruthy();
    expect(offering.description).toBeTruthy();
    expect(offering.totalAmount).toBeGreaterThan(0);
    expect(offering.minInvestment).toBeGreaterThan(0);
    expect(offering.maxInvestment).toBeGreaterThan(offering.minInvestment);
    expect(offering.lockupPeriod).toBeGreaterThan(0);
    expect(offering.kycLevel).toBeTruthy();
  }
  
  /**
   * Validate token deployment
   */
  static validateTokenDeployment(contractAddress: string): void {
    expect(contractAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
  }
  
  /**
   * Validate yield calculations
   */
  static validateYieldCalculation(investment: number, yieldRate: number, expectedYield: number): void {
    const calculatedYield = (investment * yieldRate) / 4; // Quarterly
    expect(calculatedYield).toBeCloseTo(expectedYield, 0);
  }
}

/**
 * Test Data Generators
 */
export class TestDataGenerator {
  /**
   * Generate test asset data
   */
  static generateSolarFarmAsset(): TestAsset {
    return {
      name: 'Solar Farm 3643',
      location: 'Guangdong Province, China',
      capacity: '50MW',
      totalValue: 50000000, // $50M USD
      annualYield: 0.065, // 6.5%
      tokenSymbol: 'STV',
      tokenName: 'SolarTech Ventures Security Token'
    };
  }
  
  /**
   * Generate US accredited investor
   */
  static generateUSInvestor(): TestInvestor {
    return {
      name: 'John Smith',
      email: 'john.smith.test@example.com',
      nationality: 'US',
      accreditation: 'ACCREDITED',
      investmentAmount: 100000, // $100K
      walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    };
  }
  
  /**
   * Generate HK qualified investor
   */
  static generateHKInvestor(): TestInvestor {
    return {
      name: 'Li Wei',
      email: 'li.wei.test@example.com',
      nationality: 'HK',
      qualification: 'QUALIFIED',
      investmentAmount: 200000, // $200K
      walletAddress: '0x8ba1f109551bA432bdf5c3c2E3B1a5C8b1C2D3E4'
    };
  }
  
  /**
   * Generate test offering
   */
  static generateOffering(assetName: string): TestOffering {
    return {
      name: `${assetName} Initial Offering`,
      description: 'Initial token offering for the Solar Farm 3643 project',
      totalAmount: 50000000, // $50M
      minInvestment: 10000, // $10K
      maxInvestment: 1000000, // $1M
      lockupPeriod: 12, // months
      kycLevel: 'enhanced',
      accreditationRequired: true
    };
  }
}

/**
 * API Testing Utilities
 */
export class APIUtils {
  /**
   * Test API endpoint health
   */
  static async testEndpointHealth(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { 
        method: 'GET',
        timeout: 10000 
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Test API response structure
   */
  static async testAPIResponse(url: string, expectedStructure: Record<string, any>): Promise<void> {
    const response = await fetch(url);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    
    for (const [key, expectedType] of Object.entries(expectedStructure)) {
      expect(data).toHaveProperty(key);
      if (expectedType === 'array') {
        expect(Array.isArray(data[key])).toBe(true);
      } else if (expectedType === 'string') {
        expect(typeof data[key]).toBe('string');
      } else if (expectedType === 'number') {
        expect(typeof data[key]).toBe('number');
      }
    }
  }
}

/**
 * Compliance Testing Utilities
 */
export class ComplianceUtils {
  /**
   * Test KYC verification flow
   */
  static async testKYCFlow(page: Page, investor: TestInvestor): Promise<void> {
    // Navigate to KYC
    await page.click('[data-testid="kyc-verification-btn"]');
    
    // Upload documents based on nationality
    if (investor.nationality === 'US') {
      await page.setInputFiles('[data-testid="passport-upload"]', 'test-files/passport-us.pdf');
      await page.setInputFiles('[data-testid="drivers-license-upload"]', 'test-files/drivers-license-ny.pdf');
      await page.setInputFiles('[data-testid="accreditation-upload"]', 'test-files/accreditation-letter.pdf');
    } else if (investor.nationality === 'HK') {
      await page.setInputFiles('[data-testid="hk-id-upload"]', 'test-files/hk-id-card.pdf');
      await page.setInputFiles('[data-testid="passport-upload"]', 'test-files/passport-hk.pdf');
      await page.setInputFiles('[data-testid="qualification-upload"]', 'test-files/qualification-certificate.pdf');
    }
    
    // Submit KYC
    await page.click('[data-testid="submit-kyc-btn"]');
    
    // Wait for completion
    await UIUtils.waitForProcessing(
      page,
      '[data-testid="kyc-processing"]',
      '[data-testid="kyc-complete"]'
    );
    
    // Verify approval
    await expect(page.locator('[data-testid="kyc-approved"]')).toBeVisible();
  }
  
  /**
   * Test compliance rule enforcement
   */
  static async testComplianceEnforcement(page: Page, fromAddress: string, toAddress: string, amount: string): Promise<void> {
    // Navigate to compliance dashboard
    await page.click('[data-testid="compliance-dashboard-btn"]');
    
    // Attempt transfer
    await page.click('[data-testid="test-transfer-btn"]');
    await page.fill('[data-testid="transfer-from"]', fromAddress);
    await page.fill('[data-testid="transfer-to"]', toAddress);
    await page.fill('[data-testid="transfer-amount"]', amount);
    
    // Submit transfer
    await page.click('[data-testid="submit-transfer-btn"]');
    
    // Verify transfer blocked
    await expect(page.locator('[data-testid="transfer-blocked"]')).toBeVisible();
  }
}

/**
 * Settlement Testing Utilities
 */
export class SettlementUtils {
  /**
   * Test monthly payout process
   */
  static async testMonthlyPayout(page: Page): Promise<void> {
    // Navigate to settlement dashboard
    await page.click('[data-testid="settlement-dashboard-btn"]');
    
    // Trigger payout
    await page.click('[data-testid="monthly-payout-btn"]');
    
    // Wait for processing
    await UIUtils.waitForProcessing(
      page,
      '[data-testid="payout-processing"]',
      '[data-testid="payout-complete"]'
    );
    
    // Verify success
    await expect(page.locator('[data-testid="payout-success"]')).toBeVisible();
  }
  
  /**
   * Verify payout receipts
   */
  static async verifyPayoutReceipts(page: Page, investors: TestInvestor[], expectedYield: number): Promise<void> {
    await page.click('[data-testid="payout-receipts-btn"]');
    
    for (const investor of investors) {
      await expect(page.locator(`text=${investor.name}`)).toBeVisible();
      
      const receipt = page.locator(`[data-testid="receipt-${investor.name}"]`);
      const expectedAmount = (investor.investmentAmount * expectedYield) / 4; // Quarterly
      
      await expect(receipt.locator('[data-testid="receipt-amount"]')).toContainText(`$${expectedAmount.toLocaleString()}`);
      await expect(receipt.locator('[data-testid="receipt-currency"]')).toContainText('USDC');
    }
  }
}

export default {
  BlockchainUtils,
  UIUtils,
  ValidationUtils,
  TestDataGenerator,
  APIUtils,
  ComplianceUtils,
  SettlementUtils
};
