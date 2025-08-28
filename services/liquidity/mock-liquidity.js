#!/usr/bin/env node

/**
 * Mock Liquidity Service for AIMY Platform
 * This is a simple Node.js service that provides liquidity functionality without complex dependencies
 */

const http = require('http');
const url = require('url');

// Mock liquidity data
const MOCK_POOLS = {
  "pool_001": {
    id: "pool_001",
    assetId: "solar_farm_001",
    tokenA: "AIMY",
    tokenB: "USDC",
    liquidity: 1500000.00,
    volume_24h: 45000.00,
    fees_24h: 135.00,
    apr: 12.5,
    status: "active"
  },
  "pool_002": {
    id: "pool_002",
    assetId: "infrastructure_001",
    tokenA: "AIMY",
    tokenB: "USDC",
    liquidity: 800000.00,
    volume_24h: 22000.00,
    fees_24h: 66.00,
    apr: 8.2,
    status: "active"
  }
};

const MOCK_TRADES = {
  "trade_001": {
    id: "trade_001",
    poolId: "pool_001",
    type: "buy",
    amount: 5000.00,
    price: 0.85,
    timestamp: "2024-08-26T10:30:00Z",
    user: "investor_001"
  },
  "trade_002": {
    id: "trade_002",
    poolId: "pool_001",
    type: "sell",
    amount: 2500.00,
    price: 0.87,
    timestamp: "2024-08-26T14:15:00Z",
    user: "investor_002"
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
        service: "AIMY Mock Liquidity Service",
        status: "running",
        version: "1.0.0",
        timestamp: new Date().toISOString()
      });
    }

    // Health check endpoint
    if (path === '/health' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        status: "healthy",
        service: "mock-liquidity",
        timestamp: new Date().toISOString(),
        uptime: "mock"
      });
    }

    // API info endpoint
    if (path === '/api' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        service: "AIMY Mock Liquidity Service",
        version: "1.0.0",
        description: "Mock liquidity service for demonstration purposes",
        endpoints: {
          "GET /": "Service status",
          "GET /health": "Health check",
          "GET /api": "API information",
          "GET /api/v1/pools": "List liquidity pools",
          "GET /api/v1/pools/:id": "Get pool details",
          "GET /api/v1/trades": "List trades",
          "POST /api/v1/trades": "Execute trade",
          "GET /api/v1/market-data": "Get market data"
        }
      });
    }

    // Pools endpoint
    if (path === '/api/v1/pools' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        pools: Object.values(MOCK_POOLS),
        total: Object.keys(MOCK_POOLS).length,
        timestamp: new Date().toISOString()
      });
    }

    // Pool details endpoint
    if (path.startsWith('/api/v1/pools/') && method === 'GET') {
      const poolId = path.split('/').pop();
      const pool = MOCK_POOLS[poolId];
      
      if (pool) {
        return sendJsonResponse(res, 200, {
          pool: pool,
          timestamp: new Date().toISOString()
        });
      } else {
        return sendJsonResponse(res, 404, {
          error: "Pool not found",
          message: `No pool found with ID: ${poolId}`
        });
      }
    }

    // Trades endpoint
    if (path === '/api/v1/trades' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        trades: Object.values(MOCK_TRADES),
        total: Object.keys(MOCK_TRADES).length,
        timestamp: new Date().toISOString()
      });
    }

    // Execute trade endpoint
    if (path === '/api/v1/trades' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const tradeRequest = JSON.parse(body);
          const tradeId = `trade_${Date.now()}`;
          
          // Mock trade execution
          const trade = {
            id: tradeId,
            poolId: tradeRequest.poolId,
            type: tradeRequest.type,
            amount: tradeRequest.amount,
            price: tradeRequest.price || Math.random() * 0.2 + 0.8, // Random price between 0.8-1.0
            timestamp: new Date().toISOString(),
            user: tradeRequest.user
          };
          
          MOCK_TRADES[tradeId] = trade;
          
          return sendJsonResponse(res, 201, {
            success: true,
            trade: trade,
            message: "Trade executed successfully"
          });
        } catch (error) {
          return sendJsonResponse(res, 400, {
            error: "Invalid JSON",
            message: "Request body must be valid JSON"
          });
        }
      });
      return;
    }

    // Market data endpoint
    if (path === '/api/v1/market-data' && method === 'GET') {
      const marketData = {
        total_liquidity: Object.values(MOCK_POOLS).reduce((sum, pool) => sum + pool.liquidity, 0),
        total_volume_24h: Object.values(MOCK_POOLS).reduce((sum, pool) => sum + pool.volume_24h, 0),
        total_fees_24h: Object.values(MOCK_POOLS).reduce((sum, pool) => sum + pool.fees_24h, 0),
        active_pools: Object.values(MOCK_POOLS).filter(pool => pool.status === 'active').length,
        trades_24h: Object.values(MOCK_TRADES).filter(trade => {
          const tradeTime = new Date(trade.timestamp);
          const now = new Date();
          return (now - tradeTime) <= 24 * 60 * 60 * 1000;
        }).length
      };
      
      return sendJsonResponse(res, 200, {
        market_data: marketData,
        timestamp: new Date().toISOString()
      });
    }

    // 404 for unknown endpoints
    return sendJsonResponse(res, 404, {
      error: "Endpoint not found",
      available_endpoints: [
        "/",
        "/health",
        "/api",
        "/api/v1/pools",
        "/api/v1/trades",
        "/api/v1/market-data"
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
const PORT = process.env.PORT || 3004;
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Starting AIMY Mock Liquidity Service on port', PORT);
  console.log('💧 Mock liquidity service providing AMM and trading functionality');
  console.log('🔗 API available at: http://localhost:' + PORT);
  console.log('📖 Documentation at: http://localhost:' + PORT + '/api');
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
  console.log('\n🛑 Shutting down Mock Liquidity Service...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Mock Liquidity Service...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
