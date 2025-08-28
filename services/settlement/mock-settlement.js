#!/usr/bin/env node

/**
 * Mock Settlement Service for AIMY Platform
 * This is a simple Node.js service that provides settlement functionality without complex dependencies
 */

const http = require('http');
const url = require('url');

// Mock settlement data
const MOCK_PAYOUTS = {
  "payout_001": {
    id: "payout_001",
    assetId: "solar_farm_001",
    investorId: "investor_001",
    amount: 2500.00,
    currency: "USDC",
    status: "completed",
    payout_date: "2024-08-26",
    transaction_hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
  },
  "payout_002": {
    id: "payout_002",
    assetId: "solar_farm_001", 
    investorId: "investor_002",
    amount: 1800.00,
    currency: "USDC",
    status: "pending",
    payout_date: "2024-08-27",
    transaction_hash: null
  }
};

const MOCK_DISTRIBUTIONS = {
  "solar_farm_001": {
    assetId: "solar_farm_001",
    total_distributed: 4300.00,
    currency: "USDC",
    last_distribution: "2024-08-26",
    next_distribution: "2024-09-26",
    investors_count: 2
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
        service: "AIMY Mock Settlement Service",
        status: "running",
        version: "1.0.0",
        timestamp: new Date().toISOString()
      });
    }

    // Health check endpoint
    if (path === '/health' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        status: "healthy",
        service: "mock-settlement",
        timestamp: new Date().toISOString(),
        uptime: "mock"
      });
    }

    // API info endpoint
    if (path === '/api' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        service: "AIMY Mock Settlement Service",
        version: "1.0.0",
        description: "Mock settlement service for demonstration purposes",
        endpoints: {
          "GET /": "Service status",
          "GET /health": "Health check",
          "GET /api": "API information",
          "GET /api/v1/payouts": "List payouts",
          "GET /api/v1/payouts/:id": "Get payout details",
          "POST /api/v1/payouts": "Create payout",
          "GET /api/v1/distributions": "List distributions",
          "POST /api/v1/distributions/process": "Process distributions"
        }
      });
    }

    // Payouts endpoint
    if (path === '/api/v1/payouts' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        payouts: Object.values(MOCK_PAYOUTS),
        total: Object.keys(MOCK_PAYOUTS).length,
        timestamp: new Date().toISOString()
      });
    }

    // Payout details endpoint
    if (path.startsWith('/api/v1/payouts/') && method === 'GET') {
      const payoutId = path.split('/').pop();
      const payout = MOCK_PAYOUTS[payoutId];
      
      if (payout) {
        return sendJsonResponse(res, 200, {
          payout: payout,
          timestamp: new Date().toISOString()
        });
      } else {
        return sendJsonResponse(res, 404, {
          error: "Payout not found",
          message: `No payout found with ID: ${payoutId}`
        });
      }
    }

    // Create payout endpoint
    if (path === '/api/v1/payouts' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const newPayout = JSON.parse(body);
          const payoutId = `payout_${Date.now()}`;
          
          MOCK_PAYOUTS[payoutId] = {
            id: payoutId,
            ...newPayout,
            status: "pending",
            payout_date: new Date().toISOString().split('T')[0],
            transaction_hash: null
          };
          
          return sendJsonResponse(res, 201, {
            success: true,
            payout: MOCK_PAYOUTS[payoutId],
            message: "Payout created successfully"
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

    // Distributions endpoint
    if (path === '/api/v1/distributions' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        distributions: Object.values(MOCK_DISTRIBUTIONS),
        total: Object.keys(MOCK_DISTRIBUTIONS).length,
        timestamp: new Date().toISOString()
      });
    }

    // Process distributions endpoint
    if (path === '/api/v1/distributions/process' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const processRequest = JSON.parse(body);
          const assetId = processRequest.assetId || 'solar_farm_001';
          
          // Mock distribution processing
          const distribution = MOCK_DISTRIBUTIONS[assetId];
          if (distribution) {
            // Update distribution data
            distribution.last_distribution = new Date().toISOString().split('T')[0];
            distribution.next_distribution = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            
            return sendJsonResponse(res, 200, {
              success: true,
              assetId: assetId,
              distribution: distribution,
              message: "Distribution processed successfully"
            });
          } else {
            return sendJsonResponse(res, 404, {
              error: "Asset not found",
              message: `No distribution found for asset: ${assetId}`
            });
          }
        } catch (error) {
          return sendJsonResponse(res, 400, {
            error: "Invalid JSON",
            message: "Request body must be valid JSON"
          });
        }
      });
      return;
    }

    // 404 for unknown endpoints
    return sendJsonResponse(res, 404, {
      error: "Endpoint not found",
      available_endpoints: [
        "/",
        "/health",
        "/api",
        "/api/v1/payouts",
        "/api/v1/distributions",
        "/api/v1/distributions/process"
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
const PORT = process.env.PORT || 3003;
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Starting AIMY Mock Settlement Service on port', PORT);
  console.log('💰 Mock settlement service providing payout and distribution functionality');
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
  console.log('\n🛑 Shutting down Mock Settlement Service...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Mock Settlement Service...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
