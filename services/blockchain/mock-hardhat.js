#!/usr/bin/env node

/**
 * Mock Hardhat Blockchain Service for AIMY Platform
 * This is a simple Node.js service that simulates blockchain functionality
 */

const http = require('http');
const url = require('url');

// Mock blockchain data
const MOCK_BLOCKCHAIN = {
  chainId: 1337,
  networkName: "AIMY Local Network",
  latestBlock: {
    number: 12345,
    hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    timestamp: Math.floor(Date.now() / 1000),
    transactions: 15
  },
  accounts: [
    {
      address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      balance: "1000000000000000000000", // 1000 ETH
      privateKey: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    },
    {
      address: "0x8ba1f109551bD432803012645Hac136c772c3c7c",
      balance: "500000000000000000000", // 500 ETH
      privateKey: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
    }
  ],
  contracts: {
    "AIMYSecurityToken": {
      address: "0x1234567890abcdef1234567890abcdef1234567890",
      abi: ["function totalSupply() view returns (uint256)", "function balanceOf(address) view returns (uint256)"],
      bytecode: "0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806318160ddd1461003b57806370a0823114610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100ed565b61007e565b005b60008054905090565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b6100ca81610088565b81146100d557600080fd5b50565b6000813590506100e7816100c1565b92915050565b600060208284031215610103576101026100bc565b5b6000610111848285016100d8565b9150509291505056fea2646970667358221220abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef64736f6c63430008110033"
    },
    "AssetRegistry": {
      address: "0xabcdef1234567890abcdef1234567890abcdef1234",
      abi: ["function registerAsset(string, uint256) external", "function getAsset(string) view returns (uint256)"],
      bytecode: "0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c806318160ddd1461003b57806370a0823114610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100ed565b61007e565b005b60008054905090565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b6100ca81610088565b81146100d557600080fd5b50565b6000813590506100e7816100c1565b92915050565b600060208284031215610103576101026100bc565b5b6000610111848285016100d8565b9150509291505056fea2646970667358221220abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef64736f6c63430008110033"
    }
  }
};

// Helper function to send JSON response
function sendJsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

// Helper function to add CORS headers
function addCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Request handler
async function handleRequest(req, res) {
  addCorsHeaders(res);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  try {
    // Root endpoint
    if (path === '/' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        service: "AIMY Mock Hardhat Service",
        status: "running",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        network: MOCK_BLOCKCHAIN.networkName,
        chainId: MOCK_BLOCKCHAIN.chainId
      });
    }

    // Health check endpoint
    if (path === '/health' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        status: "healthy",
        service: "mock-hardhat",
        timestamp: new Date().toISOString(),
        uptime: "mock"
      });
    }

    // Get latest block
    if (path === '/api/v1/block/latest' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        block: MOCK_BLOCKCHAIN.latestBlock,
        timestamp: new Date().toISOString()
      });
    }

    // Get accounts
    if (path === '/api/v1/accounts' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        accounts: MOCK_BLOCKCHAIN.accounts.map(acc => ({
          address: acc.address,
          balance: acc.balance
        })),
        timestamp: new Date().toISOString()
      });
    }

    // Get contracts
    if (path === '/api/v1/contracts' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        contracts: Object.keys(MOCK_BLOCKCHAIN.contracts).map(name => ({
          name: name,
          address: MOCK_BLOCKCHAIN.contracts[name].address,
          abi: MOCK_BLOCKCHAIN.contracts[name].abi
        })),
        timestamp: new Date().toISOString()
      });
    }

    // Deploy contract (mock)
    if (path === '/api/v1/contract/deploy' && method === 'POST') {
      return sendJsonResponse(res, 200, {
        success: true,
        contractAddress: "0x" + Math.random().toString(16).substr(2, 40),
        transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
        gasUsed: Math.floor(Math.random() * 1000000) + 500000,
        timestamp: new Date().toISOString()
      });
    }

    // Call contract (mock)
    if (path === '/api/v1/contract/call' && method === 'POST') {
      return sendJsonResponse(res, 200, {
        success: true,
        result: "0x" + Math.random().toString(16).substr(2, 64),
        gasUsed: Math.floor(Math.random() * 100000) + 10000,
        timestamp: new Date().toISOString()
      });
    }

    // Send transaction (mock)
    if (path === '/api/v1/transaction/send' && method === 'POST') {
      return sendJsonResponse(res, 200, {
        success: true,
        transactionHash: "0x" + Math.random().toString(16).substr(2, 64),
        gasUsed: Math.floor(Math.random() * 100000) + 21000,
        blockNumber: MOCK_BLOCKCHAIN.latestBlock.number + 1,
        timestamp: new Date().toISOString()
      });
    }

    // Get transaction receipt (mock)
    if (path.startsWith('/api/v1/transaction/') && path.endsWith('/receipt') && method === 'GET') {
      const txHash = path.split('/')[3];
      return sendJsonResponse(res, 200, {
        transactionHash: txHash,
        blockNumber: MOCK_BLOCKCHAIN.latestBlock.number,
        gasUsed: Math.floor(Math.random() * 100000) + 21000,
        status: 1,
        timestamp: new Date().toISOString()
      });
    }

    // API documentation endpoint
    if (path === '/docs' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        service: "AIMY Mock Hardhat Service",
        version: "1.0.0",
        endpoints: {
          "GET /": "Service status",
          "GET /health": "Health check",
          "GET /api/v1/block/latest": "Get latest block",
          "GET /api/v1/accounts": "Get accounts",
          "GET /api/v1/contracts": "Get deployed contracts",
          "POST /api/v1/contract/deploy": "Deploy contract (mock)",
          "POST /api/v1/contract/call": "Call contract (mock)",
          "POST /api/v1/transaction/send": "Send transaction (mock)",
          "GET /api/v1/transaction/{hash}/receipt": "Get transaction receipt (mock)"
        },
        note: "This is a mock service for demonstration purposes"
      });
    }

    // 404 for unknown endpoints
    return sendJsonResponse(res, 404, {
      error: "Endpoint not found",
      available_endpoints: [
        "/",
        "/health",
        "/docs",
        "/api/v1/block/latest",
        "/api/v1/accounts",
        "/api/v1/contracts",
        "/api/v1/contract/deploy",
        "/api/v1/contract/call",
        "/api/v1/transaction/send"
      ]
    });

  } catch (error) {
    console.error('Error handling request:', error);
    return sendJsonResponse(res, 500, {
      error: "Internal server error",
      message: error.message
    });
  }
}

// Create HTTP server
const server = http.createServer(handleRequest);

// Start server
const PORT = process.env.PORT || 8545;
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Starting AIMY Mock Hardhat Service on port', PORT);
  console.log('⛓️  Mock blockchain service providing smart contract functionality');
  console.log('🔗 API available at: http://localhost:' + PORT);
  console.log('📖 Documentation at: http://localhost:' + PORT + '/docs');
  console.log('💡 This is a mock service for demonstration purposes');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    console.error('💡 Try using a different port or stop the service using that port');
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Mock Hardhat Service...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Mock Hardhat Service...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
