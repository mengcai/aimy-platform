# @aimy/contracts

ERC-3643 compliant security token contracts for the AIMY platform, implementing permissioned ERC20 with on-chain registry + off-chain oracle compliance.

## 🏗️ Architecture Overview

The AIMY contracts package implements a comprehensive security token system that combines:

- **ERC-3643 Compliance**: Permissioned ERC20 tokens with transfer restrictions
- **On-Chain Registry**: KYC/AML status and investor information management
- **Off-Chain Oracle**: Compliance rule engine with jurisdiction and sanctions checks
- **Upgradeable Contracts**: OpenZeppelin UUPS upgrade pattern for future enhancements
- **Role-Based Access Control**: Granular permissions for issuers, compliance officers, and transfer agents

## 📋 Contract Structure

### Core Contracts

#### `AIMYSecurityToken.sol`
The main security token contract implementing ERC-3643 compliance:

- **Transfer Restrictions**: Only KYC-approved addresses can hold/transfer tokens
- **Jurisdiction Rules**: Reg D (US accredited) and Reg S (non-US) compliance
- **Lockup Periods**: Configurable holding periods for investors
- **Snapshot Support**: Record dates for dividends and distributions
- **Pausability**: Emergency pause functionality for compliance officers

#### `ComplianceEngine.sol`
Handles compliance rules and jurisdiction checks:

- **Rule Management**: Configurable compliance rules (minimum holdings, transfer limits)
- **Jurisdiction Checks**: US accredited investor verification
- **Sanctions Screening**: Address blocking and sanctions status
- **Oracle Integration**: Off-chain compliance data updates

#### `AssetRegistry.sol`
Manages investor KYC/AML status and information:

- **Investor Registration**: Complete investor profile management
- **KYC Levels**: Tiered verification requirements
- **AML Screening**: Anti-money laundering compliance
- **Sanctions Checks**: OFAC and other sanctions screening

### Example Implementation

#### `SolarFarm3643.sol`
A concrete example of the AIMY security token for a solar farm asset:

- **Asset-Specific Properties**: Capacity, location, expected yield
- **Construction Tracking**: Milestone management and operational status
- **Yield Calculations**: Expected returns based on token holdings
- **Project Valuation**: Real-time project worth calculations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- Foundry (for testing and deployment)
- Hardhat (for development and deployment)

### Installation

```bash
# Install dependencies
pnpm install

# Install Foundry (if not already installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Compilation

```bash
# Compile with Hardhat
pnpm compile

# Compile with Foundry
pnpm build:foundry
```

### Testing

```bash
# Run Hardhat tests
pnpm test

# Run Foundry tests
pnpm test:foundry

# Run with coverage
pnpm test:coverage
```

### Deployment

#### Local Development

```bash
# Start local node
pnpm hardhat node

# Deploy contracts
pnpm deploy:local
```

#### Testnet/Mainnet

```bash
# Set environment variables
export PRIVATE_KEY="your_private_key"
export SEPOLIA_RPC_URL="your_rpc_url"
export ETHERSCAN_API_KEY="your_api_key"

# Deploy to Sepolia
pnpm deploy:sepolia

# Deploy to mainnet
pnpm deploy:mainnet
```

#### Foundry Deployment

```bash
# Set environment variables
export PRIVATE_KEY="your_private_key"
export RPC_URL="your_rpc_url"

# Deploy with Foundry
pnpm deploy:foundry
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the contracts directory:

```env
# Network RPC URLs
MAINNET_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY
SEPOLIA_RPC_URL=https://eth-sepolia.alchemyapi.io/v2/YOUR_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
OPTIMISM_RPC_URL=https://mainnet.optimism.io

# API Keys
ETHERSCAN_API_KEY=your_etherscan_key
POLYGONSCAN_API_KEY=your_polygonscan_key
ARBISCAN_API_KEY=your_arbiscan_key
OPTIMISM_API_KEY=your_optimism_key
COINMARKETCAP_API_KEY=your_coinmarketcap_key

# Deployment
PRIVATE_KEY=your_deployment_private_key
REPORT_GAS=true
```

### Network Configuration

The contracts support multiple networks:

- **Local Development**: Hardhat local node
- **Testnets**: Sepolia, Mumbai, Arbitrum Sepolia
- **Mainnets**: Ethereum, Polygon, Arbitrum, Optimism

## 📊 Contract Features

### Transfer Restrictions

```solidity
// Only KYC-approved addresses can transfer
function _beforeTokenTransfer(
    address from,
    address to,
    uint256 amount
) internal virtual override {
    // Check compliance rules
    require(
        complianceEngine.checkTransferCompliance(from, to, amount),
        "Transfer blocked by compliance rules"
    );
    
    // Check lockup period
    require(
        block.timestamp >= lastTransferBlock[from] + lockupPeriod,
        "Lockup period not met"
    );
}
```

### Compliance Rules

```solidity
// Configurable compliance rules
mapping(string => ComplianceRule) public complianceRules;

struct ComplianceRule {
    string ruleType;
    string ruleValue;
    bool isActive;
    uint256 updatedAt;
}
```

### Role Management

```solidity
// Role definitions
bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
bytes32 public constant TRANSFER_AGENT_ROLE = keccak256("TRANSFER_AGENT_ROLE");
```

## 🧪 Testing

### Test Coverage

The contracts include comprehensive tests covering:

- **Basic Functionality**: Token creation, transfers, approvals
- **Compliance Rules**: Transfer restrictions and jurisdiction checks
- **Role Management**: Access control and permissions
- **Edge Cases**: Error conditions and boundary testing
- **Integration**: End-to-end workflows

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm hardhat test test/AIMYSecurityToken.t.sol

# Run with gas reporting
pnpm gas

# Run with coverage
pnpm test:coverage
```

### Foundry Tests

```bash
# Run Foundry tests
forge test

# Run with verbose output
forge test -vvv

# Run specific test
forge test --match-test testTokenInitialization

# Run with gas reporting
forge test --gas-report
```

## 🔍 Security & Auditing

### Static Analysis

```bash
# Run Slither analysis
pnpm slither

# Run Slither checks
pnpm slither:check
```

### Code Quality

```bash
# Format Solidity code
pnpm format

# Check formatting
pnpm format:check

# Lint Solidity code
pnpm lint

# Fix linting issues
pnpm lint:fix
```

## 📈 Gas Optimization

### Optimization Settings

- **Compiler Version**: Solidity 0.8.20
- **Optimizer**: Enabled with 200 runs
- **Via IR**: Disabled for better compatibility
- **Gas Reporting**: Comprehensive gas analysis

### Gas Reports

```bash
# Generate gas report
pnpm gas

# View gas usage by function
cat gas-report.txt
```

## 🔄 Upgradeability

### UUPS Pattern

All contracts use OpenZeppelin's UUPS upgrade pattern:

```solidity
contract AIMYSecurityToken is UUPSUpgradeable {
    function _authorizeUpgrade(address newImplementation) 
        internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
```

### Upgrade Process

1. Deploy new implementation contract
2. Call upgrade function on proxy
3. Verify new functionality
4. Update contract addresses

## 🌐 Network Deployment

### Supported Networks

| Network | Chain ID | Status | Explorer |
|---------|----------|---------|----------|
| Ethereum Mainnet | 1 | ✅ | Etherscan |
| Polygon | 137 | ✅ | Polygonscan |
| Arbitrum One | 42161 | ✅ | Arbiscan |
| Optimism | 10 | ✅ | Optimistic Etherscan |
| Sepolia | 11155111 | ✅ | Etherscan |
| Mumbai | 80001 | ✅ | Polygonscan |

### Deployment Addresses

Contract addresses for each network are maintained in the deployment artifacts and can be verified on their respective block explorers.

## 📚 API Reference

### Core Functions

#### Token Management
- `createIssuance(investor, amount, price)`: Create new token issuance
- `completeIssuance(issuanceId)`: Complete issuance and mint tokens
- `requestRedemption(amount)`: Request token redemption
- `completeRedemption(investor, amount)`: Complete redemption and burn tokens

#### Compliance
- `checkTransferCompliance(from, to, amount)`: Verify transfer compliance
- `setComplianceRule(ruleType, ruleValue, isActive)`: Update compliance rules
- `updateJurisdictionInfo(address, country, region, isAccredited)`: Update jurisdiction data

#### Administration
- `setBlockedAddress(address, blocked)`: Block/unblock addresses
- `setTransfersEnabled(enabled)`: Enable/disable transfers
- `createSnapshot()`: Create new token snapshot
- `pause()/unpause()`: Emergency pause functionality

### Events

#### Core Events
- `IssuanceCreated`: New issuance created
- `IssuanceCompleted`: Issuance completed and tokens minted
- `TransferBlocked`: Transfer blocked by compliance rules
- `ComplianceRuleUpdated`: Compliance rule updated

#### Solar Farm Events
- `SolarFarmDetailsUpdated`: Project details updated
- `ConstructionMilestone`: Construction milestone reached
- `YieldDistribution`: Yield distributed to investors

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards

- Follow Solidity style guide
- Use NatSpec documentation
- Write comprehensive tests
- Maintain 100% test coverage
- Follow security best practices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

### Documentation
- [AIMY Platform Documentation](https://docs.aimy.com)
- [Contract Architecture Guide](https://docs.aimy.com/contracts)
- [Deployment Guide](https://docs.aimy.com/deployment)

### Community
- [Discord](https://discord.gg/aimy)
- [Telegram](https://t.me/aimyplatform)
- [Twitter](https://twitter.com/aimyplatform)

### Issues
- [GitHub Issues](https://github.com/aimy-platform/aimy-contracts/issues)
- [Security Issues](mailto:security@aimy.com)

## 🔗 Related Packages

- **@aimy/sdk**: TypeScript SDK for contract interactions
- **@aimy/shared**: Shared types and utilities
- **@aimy/ai**: AI-powered valuation and risk assessment
- **@aimy/web**: Investor portal web application
- **@aimy/console**: Issuer and compliance console
