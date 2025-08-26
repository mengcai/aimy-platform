import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "@openzeppelin/hardhat-upgrades";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: false,
    },
  },
  
  networks: {
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
    },
    
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1,
    },
    
    polygon: {
      url: process.env.POLYGON_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 137,
    },
    
    arbitrum: {
      url: process.env.ARBITRUM_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 42161,
    },
    
    optimism: {
      url: process.env.OPTIMISM_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 10,
    },
  },
  
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      arbitrumOne: process.env.ARBISCAN_API_KEY || "",
      optimisticEthereum: process.env.OPTIMISM_API_KEY || "",
    },
  },
  
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    gasPrice: 20,
    showMethodSig: true,
    showTimeSpent: true,
  },
  
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
  },
  
  mocha: {
    timeout: 60000,
  },
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  
  // Plugin configurations
  plugins: ["@openzeppelin/hardhat-upgrades"],
  
  // Compiler settings
  compilers: [
    {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        viaIR: false,
        outputSelection: {
          "*": {
            "*": ["*"],
          },
        },
      },
    },
  ],
  
  // TypeChain settings
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  
  // Coverage settings
  coverage: {
    enabled: true,
    runs: 200,
    exclude: [
      "contracts/mocks/**",
      "contracts/test/**",
      "test/**",
      "hardhat.config.ts",
    ],
  },
  
  // Verify settings
  sourcify: {
    enabled: true,
  },
  
  // Upgrades settings
  upgrades: {
    proxyContract: "ERC1967Proxy",
    implementationContract: "AIMYSecurityToken",
  },
};

export default config;
