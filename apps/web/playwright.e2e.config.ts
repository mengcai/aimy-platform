import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration for AIMY Platform
 * 
 * This configuration is optimized for end-to-end testing of the complete
 * solar farm tokenization workflow including blockchain interactions.
 */

export default defineConfig({
  testDir: './src/__tests__/e2e',
  fullyParallel: false, // Run tests sequentially for blockchain state consistency
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for blockchain tests
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
    ['junit', { outputFile: 'test-results/e2e-results.xml' }]
  ],
  
  use: {
    // Base URL for all tests
    baseURL: 'http://localhost:3005',
    
    // Global test timeout
    actionTimeout: 30000,
    navigationTimeout: 30000,
    
    // Screenshot and video capture
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Test data directory
    testDir: './test-files',
    
    // Browser context options
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    
    // Authentication state (if needed)
    // storageState: 'playwright/.auth/user.json',
  },

  // Test projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Chrome-specific settings for blockchain interactions
        args: [
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]
      },
    },
    
    // Uncomment for multi-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./src/__tests__/e2e/global-setup.ts'),
  globalTeardown: require.resolve('./src/__tests__/e2e/global-teardown.ts'),

  // Web server for testing
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3005',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes for full stack startup
  },

  // Test output directory
  outputDir: 'test-results/e2e',
  
  // Test data and fixtures
  testMatch: '**/*.spec.ts',
  
  // Environment variables for tests
  env: {
    NODE_ENV: 'test',
    TEST_MODE: 'e2e',
    BLOCKCHAIN_NETWORK: 'hardhat',
    DATABASE_URL: 'postgresql://aimy_user:aimy_password@localhost:5432/aimy_test',
    REDIS_URL: 'redis://:aimy_redis_password@localhost:6379/1',
  },

  // Timeout configurations
  timeout: 300000, // 5 minutes for full test suite
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },

  // Test retry logic
  retries: process.env.CI ? 2 : 1,
  
  // Parallel execution settings
  workers: 1, // Single worker for blockchain consistency
  
  // Reporters
  reporter: [
    ['html', { outputFolder: 'test-results/e2e/html-report' }],
    ['json', { outputFile: 'test-results/e2e/e2e-results.json' }],
    ['junit', { outputFile: 'test-results/e2e/e2e-results.xml' }],
    ['list'], // Console output
  ],

  // Test metadata
  metadata: {
    platform: 'AIMY Platform',
    testType: 'End-to-End',
    workflow: 'Solar Farm Tokenization',
    components: [
      'Web App',
      'Console',
      'API Gateway',
      'AI Core',
      'Compliance',
      'Settlement',
      'Liquidity',
      'Blockchain',
      'Database'
    ],
    testData: {
      asset: 'Solar Farm 3643',
      value: '$50M USD',
      token: 'STV (ERC-3643)',
      investors: ['US Accredited', 'HK Qualified'],
      yield: '6.5% annual'
    }
  },
});
