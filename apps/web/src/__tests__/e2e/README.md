# 🧪 AIMY Platform End-to-End Tests

This directory contains comprehensive end-to-end tests for the AIMY Platform, designed to validate the complete solar farm tokenization workflow from issuer onboarding to Proof of Reserve reporting.

## 🎯 Test Overview

The E2E test suite covers the complete lifecycle of digital asset tokenization:

### **Phase 1: Issuer Onboarding & Asset Creation**
- ✅ Issuer registration and KYC completion
- ✅ Solar farm asset creation with technical specifications
- ✅ AI-powered valuation and risk assessment
- ✅ ERC-3643 token deployment to blockchain
- ✅ Primary offering launch with compliance terms

### **Phase 2: Investor A KYC & Primary Subscription**
- ✅ US accredited investor registration
- ✅ Enhanced KYC verification with document upload
- ✅ Primary offering subscription
- ✅ Token allocation verification

### **Phase 3: Investor B KYC & Secondary Trading**
- ✅ HK qualified investor registration
- ✅ KYC verification for HK jurisdiction
- ✅ Secondary market trading on AMM
- ✅ Liquidity pool verification

### **Phase 4: Monthly Settlement & Payout**
- ✅ Automated monthly yield payout in USDC
- ✅ Receipt generation for all investors
- ✅ Portfolio updates with yield earnings
- ✅ Settlement audit trail

### **Phase 5: Compliance & Transfer Restrictions**
- ✅ Compliance rule enforcement
- ✅ Transfer blocking for ineligible transactions
- ✅ Audit trail recording
- ✅ Violation dashboard updates

### **Phase 6: AI Insights & Portfolio Updates**
- ✅ AI insights refresh with new data
- ✅ Portfolio analytics updates
- ✅ Risk assessment recalculation
- ✅ Yield forecasting updates

### **Phase 7: Proof of Reserve Snapshot**
- ✅ PoR snapshot generation
- ✅ Reserve ratio calculation
- ✅ Asset verification
- ✅ Report export functionality

### **Final Verification: Complete System State**
- ✅ Cross-service data consistency
- ✅ UI state synchronization
- ✅ API response validation
- ✅ Blockchain state verification

## 🚀 Quick Start

### **Prerequisites**
- AIMY Platform running locally (`make up`)
- Database seeded with demo data (`make seed`)
- All services healthy (`make health`)

### **Run Complete E2E Test**
```bash
# Run the comprehensive solar farm tokenization test
make test:e2e:solar
```

### **Run All E2E Tests**
```bash
# Run all E2E tests
make test:e2e
```

### **Run Specific Test Phase**
```bash
# Run only issuer onboarding tests
cd apps/web && pnpm test:e2e --grep="Phase 1"

# Run only investor tests
cd apps/web && pnpm test:e2e --grep="Phase 2|Phase 3"

# Run only settlement tests
cd apps/web && pnpm test:e2e --grep="Phase 4"
```

## 📁 Test Structure

```
src/__tests__/e2e/
├── solar_farm_tokenization.spec.ts    # Main E2E test suite
├── global-setup.ts                     # Test environment setup
├── global-teardown.ts                  # Test cleanup & reporting
├── test-utils.ts                       # Common test utilities
└── README.md                           # This file
```

## 🔧 Test Configuration

### **Playwright Configuration**
- **File**: `playwright.e2e.config.ts`
- **Browser**: Chromium (optimized for blockchain interactions)
- **Parallelization**: Disabled (for blockchain state consistency)
- **Timeouts**: Extended for blockchain operations
- **Artifacts**: Screenshots, videos, and traces on failure

### **Environment Variables**
```bash
NODE_ENV=test
TEST_MODE=e2e
BLOCKCHAIN_NETWORK=hardhat
DATABASE_URL=postgresql://aimy_user:aimy_password@localhost:5432/aimy
REDIS_URL=redis://:aimy_redis_password@localhost:6379/1
```

### **Test Data**
- **Asset**: Solar Farm 3643 ($50M, 50MW, 6.5% yield)
- **Token**: STV (ERC-3643 with compliance module)
- **Investor A**: John Smith (US Accredited, $100K)
- **Investor B**: Li Wei (HK Qualified, $200K)

## 🧪 Test Execution

### **Local Development**
```bash
# Start the platform
make up

# Seed database
make seed

# Run E2E tests
make test:e2e:solar
```

### **CI/CD Pipeline**
The E2E tests are automatically run in the GitHub Actions CI/CD pipeline:
- **Trigger**: On push to main/develop branches
- **Environment**: Ubuntu with Docker services
- **Artifacts**: Test results, screenshots, and reports
- **Integration**: With unit tests and smart contract tests

### **Test Reports**
After test execution, comprehensive reports are generated:
- **HTML Report**: Interactive test results with screenshots
- **JSON Report**: Machine-readable test data
- **JUnit Report**: CI/CD integration format
- **Test Summary**: High-level test coverage and results

## 🔍 Test Utilities

### **BlockchainUtils**
- Test account management
- Contract verification
- Network information
- Wallet creation

### **UIUtils**
- Element interaction with retry logic
- Form filling with validation
- Processing state management
- Success message verification

### **ValidationUtils**
- Data structure validation
- Business rule verification
- Yield calculation validation
- Address format verification

### **TestDataGenerator**
- Consistent test data creation
- Asset data generation
- Investor profile creation
- Offering configuration

### **APIUtils**
- Endpoint health checking
- Response structure validation
- Service integration testing

### **ComplianceUtils**
- KYC flow testing
- Compliance rule enforcement
- Transfer restriction validation

### **SettlementUtils**
- Payout process testing
- Receipt verification
- Settlement audit trails

## 📊 Test Coverage

### **Service Coverage**
- ✅ **Web App** (Port 3005) - Investor interface
- ✅ **Console** (Port 3006) - Issuer management
- ✅ **API Gateway** (Port 3001) - REST endpoints
- ✅ **AI Core** (Port 8000) - AI insights
- ✅ **Compliance** (Port 3002) - KYC & rules
- ✅ **Settlement** (Port 3003) - Payouts
- ✅ **Liquidity** (Port 3004) - AMM trading
- ✅ **Blockchain** (Port 8545) - Smart contracts
- ✅ **Database** (Port 5432) - Data persistence

### **Workflow Coverage**
- ✅ **Issuer Journey**: Registration → Asset Creation → Token Deployment
- ✅ **Investor Journey**: Registration → KYC → Investment → Portfolio
- ✅ **Trading Journey**: Primary → Secondary → Liquidity
- ✅ **Settlement Journey**: Yield Calculation → Payout → Receipts
- ✅ **Compliance Journey**: Rule Enforcement → Violation → Audit
- ✅ **AI Journey**: Data Input → Processing → Insights → Updates
- ✅ **PoR Journey**: Data Collection → Verification → Report → Export

## 🚨 Troubleshooting

### **Common Issues**

#### **1. Service Unavailable**
```bash
# Check service health
make health

# View service logs
make logs

# Restart services
make restart
```

#### **2. Database Connection Issues**
```bash
# Check database status
make status

# Reset database
make db:reset

# Re-seed data
make seed
```

#### **3. Blockchain Issues**
```bash
# Check Hardhat node
make status

# View blockchain logs
make logs:hardhat

# Restart blockchain
make restart
```

#### **4. Test Timeout Issues**
```bash
# Increase timeouts in playwright.e2e.config.ts
timeout: 600000, // 10 minutes
expect: { timeout: 20000 } // 20 seconds
```

### **Debug Mode**
```bash
# Run tests with debug output
DEBUG=pw:api pnpm test:e2e

# Run with headed browser
HEADED=true pnpm test:e2e

# Run with slow motion
SLOWMO=1000 pnpm test:e2e
```

## 📈 Performance & Monitoring

### **Test Execution Time**
- **Complete Suite**: ~15-20 minutes
- **Individual Phase**: ~2-3 minutes
- **Setup/Teardown**: ~1-2 minutes

### **Resource Requirements**
- **Memory**: 4GB+ RAM
- **CPU**: 2+ cores
- **Storage**: 2GB+ free space
- **Network**: Local services accessible

### **Monitoring**
- **Real-time Logs**: `make logs`
- **Service Status**: `make status`
- **Health Checks**: `make health`
- **Test Results**: `test-results/e2e/`

## 🔄 Continuous Improvement

### **Test Maintenance**
- **Weekly**: Review test failures and flakiness
- **Monthly**: Update test data and scenarios
- **Quarterly**: Add new workflow coverage
- **Annually**: Comprehensive test suite review

### **Adding New Tests**
1. **Create Test File**: `new_feature.spec.ts`
2. **Add Test Data**: Update `test-utils.ts`
3. **Update Configuration**: Modify `playwright.e2e.config.ts`
4. **Add to Makefile**: Include new test commands
5. **Update Documentation**: Modify this README

### **Test Data Management**
- **Test Files**: Stored in `test-files/` directory
- **Database**: Test data with `test-` prefix
- **Cleanup**: Automatic cleanup in global teardown
- **Archiving**: Test results archived with timestamps

## 🤝 Contributing

### **Test Development Guidelines**
1. **Use Test Utilities**: Leverage existing utility classes
2. **Follow Naming**: Use descriptive test names and selectors
3. **Add Documentation**: Document complex test scenarios
4. **Handle Failures**: Implement proper error handling
5. **Clean Up**: Ensure test data is properly cleaned

### **Code Review Checklist**
- [ ] Tests follow naming conventions
- [ ] Test utilities are used appropriately
- [ ] Error handling is implemented
- [ ] Documentation is updated
- [ ] Test data is properly managed
- [ ] Performance considerations are addressed

## 📞 Support

### **Getting Help**
- **Documentation**: Check this README and platform docs
- **Logs**: Review test execution logs
- **Issues**: Open GitHub issue with test details
- **Community**: Join AIMY Platform discussions

### **Test Team**
- **Lead**: E2E Test Architect
- **Contributors**: Platform developers
- **Reviewers**: QA engineers
- **Maintainers**: DevOps team

---

**Happy Testing! 🚀**

The E2E test suite ensures the AIMY Platform delivers a robust, compliant, and user-friendly digital asset tokenization experience.
