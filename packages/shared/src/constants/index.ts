// Platform-wide constants and configuration values

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 100,
    BURST_LIMIT: 20
  }
} as const;

// Blockchain Configuration
export const BLOCKCHAIN_CONFIG = {
  NETWORKS: {
    MAINNET: {
      id: 1,
      name: 'Ethereum Mainnet',
      rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-project-id',
      chainId: 1,
      blockExplorer: 'https://etherscan.io'
    },
    POLYGON: {
      id: 137,
      name: 'Polygon Mainnet',
      rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
      chainId: 137,
      blockExplorer: 'https://polygonscan.com'
    },
    ARBITRUM: {
      id: 42161,
      name: 'Arbitrum One',
      rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
      chainId: 42161,
      blockExplorer: 'https://arbiscan.io'
    }
  },
  GAS_LIMITS: {
    TOKEN_MINT: 200000,
    TOKEN_TRANSFER: 65000,
    COMPLIANCE_CHECK: 100000,
    UPGRADE: 500000
  },
  CONFIRMATIONS: {
    MAINNET: 12,
    POLYGON: 256,
    ARBITRUM: 1
  }
} as const;

// Compliance Configuration
export const COMPLIANCE_CONFIG = {
  KYC_LEVELS: {
    TIER_1: {
      maxInvestment: 10000,
      requiredDocuments: ['id_document', 'proof_of_address'],
      reviewPeriod: 24 * 60 * 60 * 1000 // 24 hours
    },
    TIER_2: {
      maxInvestment: 100000,
      requiredDocuments: ['id_document', 'proof_of_address', 'financial_statement'],
      reviewPeriod: 48 * 60 * 60 * 1000 // 48 hours
    },
    TIER_3: {
      maxInvestment: Infinity,
      requiredDocuments: ['id_document', 'proof_of_address', 'financial_statement', 'source_of_funds'],
      reviewPeriod: 72 * 60 * 60 * 1000 // 72 hours
    }
  },
  RISK_THRESHOLDS: {
    LOW: { score: 0, max: 30 },
    MEDIUM: { score: 31, max: 60 },
    HIGH: { score: 61, max: 80 },
    CRITICAL: { score: 81, max: 100 }
  },
  SCREENING_FREQUENCY: {
    INVESTOR: 365 * 24 * 60 * 60 * 1000, // 1 year
    ISSUER: 180 * 24 * 60 * 60 * 1000,   // 6 months
    ASSET: 90 * 24 * 60 * 60 * 1000      // 3 months
  }
} as const;

// AI Service Configuration
export const AI_CONFIG = {
  MODELS: {
    VALUATION: {
      name: 'asset-valuation-v1',
      version: '1.0.0',
      confidenceThreshold: 0.8,
      maxRetries: 3
    },
    RISK_SCORING: {
      name: 'risk-assessment-v1',
      version: '1.0.0',
      confidenceThreshold: 0.85,
      maxRetries: 3
    },
    YIELD_PREDICTION: {
      name: 'yield-prediction-v1',
      version: '1.0.0',
      confidenceThreshold: 0.75,
      maxRetries: 3
    }
  },
  UPDATE_FREQUENCIES: {
    VALUATION: 24 * 60 * 60 * 1000,      // 24 hours
    RISK_SCORING: 7 * 24 * 60 * 60 * 1000, // 1 week
    YIELD_PREDICTION: 24 * 60 * 60 * 1000   // 24 hours
  }
} as const;

// Payment Configuration
export const PAYMENT_CONFIG = {
  STABLECOINS: {
    USDC: {
      symbol: 'USDC',
      address: '0xA0b86a33E6441b8C4C8C0C8C0C8C0C8C0C8C0C8C',
      decimals: 6,
      network: 'ethereum'
    },
    USDT: {
      symbol: 'USDT',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      network: 'ethereum'
    },
    DAI: {
      symbol: 'DAI',
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      decimals: 18,
      network: 'ethereum'
    }
  },
  FIAT_ADAPTERS: {
    STRIPE: {
      name: 'Stripe',
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'HKD', 'SGD'],
      processingTime: 2 * 24 * 60 * 60 * 1000, // 2 days
      fees: {
        percentage: 0.029,
        fixed: 0.30
      }
    },
    WISE: {
      name: 'Wise',
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'HKD', 'SGD', 'JPY', 'AUD'],
      processingTime: 1 * 24 * 60 * 60 * 1000, // 1 day
      fees: {
        percentage: 0.005,
        fixed: 0.50
      }
    }
  },
  SETTLEMENT_TIMEFRAMES: {
    INSTANT: 0,
    SAME_DAY: 24 * 60 * 60 * 1000,
    NEXT_DAY: 2 * 24 * 60 * 60 * 1000,
    STANDARD: 3 * 24 * 60 * 60 * 1000
  }
} as const;

// Liquidity Configuration
export const LIQUIDITY_CONFIG = {
  EXCHANGES: {
    BINANCE: {
      name: 'Binance',
      type: 'cex',
      supportedTokens: ['USDC', 'USDT', 'DAI', 'ETH', 'BTC'],
      minOrderSize: 10,
      fees: {
        maker: 0.001,
        taker: 0.001
      }
    },
    UNISWAP_V3: {
      name: 'Uniswap V3',
      type: 'dex',
      supportedTokens: ['USDC', 'USDT', 'DAI', 'ETH', 'WETH'],
      minOrderSize: 0.001,
      fees: {
        maker: 0.003,
        taker: 0.003
      }
    }
  },
  DEFI_PROTOCOLS: {
    AAVE: {
      name: 'Aave',
      supportedAssets: ['USDC', 'USDT', 'DAI', 'ETH'],
      apy: {
        USDC: 0.045,
        USDT: 0.042,
        DAI: 0.048,
        ETH: 0.038
      }
    },
    COMPOUND: {
      name: 'Compound',
      supportedAssets: ['USDC', 'USDT', 'DAI', 'ETH'],
      apy: {
        USDC: 0.043,
        USDT: 0.040,
        DAI: 0.046,
        ETH: 0.036
      }
    }
  }
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
  PASSWORD_POLICY: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
  },
  SESSION_CONFIG: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    refreshThreshold: 60 * 60 * 1000, // 1 hour
    maxConcurrentSessions: 3
  },
  RATE_LIMITING: {
    login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
    fileUpload: { maxFiles: 10, windowMs: 60 * 1000 } // 10 files per minute
  }
} as const;

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  STORAGE_PROVIDERS: {
    LOCAL: 'local',
    S3: 's3',
    MINIO: 'minio'
  },
  ENCRYPTION: {
    algorithm: 'AES-256-GCM',
    keyLength: 32
  }
} as const;

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  CHANNELS: {
    EMAIL: 'email',
    SMS: 'sms',
    PUSH: 'push',
    IN_APP: 'in_app'
  },
  TEMPLATES: {
    KYC_APPROVED: 'kyc_approved',
    KYC_REJECTED: 'kyc_rejected',
    PAYMENT_RECEIVED: 'payment_received',
    PAYMENT_FAILED: 'payment_failed',
    TOKEN_MINTED: 'token_minted',
    COMPLIANCE_ALERT: 'compliance_alert'
  },
  DELIVERY_TIMEOUTS: {
    EMAIL: 60 * 1000, // 1 minute
    SMS: 30 * 1000,   // 30 seconds
    PUSH: 10 * 1000   // 10 seconds
  }
} as const;

// Export all configurations
export default {
  API_CONFIG,
  BLOCKCHAIN_CONFIG,
  COMPLIANCE_CONFIG,
  AI_CONFIG,
  PAYMENT_CONFIG,
  LIQUIDITY_CONFIG,
  SECURITY_CONFIG,
  FILE_CONFIG,
  NOTIFICATION_CONFIG
};
