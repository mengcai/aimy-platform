#!/usr/bin/env node

/**
 * Mock Compliance Service for AIMY Platform
 * This is a simple Node.js service that provides compliance functionality without complex dependencies
 */

const http = require('http');
const url = require('url');

// Mock compliance data
const MOCK_KYC_DATA = {
  "applicant_001": {
    id: "applicant_001",
    name: "John Doe",
    email: "john.doe@example.com",
    status: "approved",
    risk_score: 2.1,
    documents: ["passport", "utility_bill"],
    kyc_date: "2024-08-26"
  },
  "applicant_002": {
    id: "applicant_002", 
    name: "Jane Smith",
    email: "jane.smith@example.com",
    status: "pending",
    risk_score: 4.8,
    documents: ["passport"],
    kyc_date: "2024-08-27"
  }
};

const MOCK_SCREENING_RESULTS = {
  "applicant_001": {
    sanctions_check: "clear",
    pep_check: "clear", 
    aml_score: "low",
    last_screened: "2024-08-26"
  },
  "applicant_002": {
    sanctions_check: "clear",
    pep_check: "clear",
    aml_score: "medium", 
    last_screened: "2024-08-27"
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
        service: "AIMY Mock Compliance Service",
        status: "running",
        version: "1.0.0",
        timestamp: new Date().toISOString()
      });
    }

    // Health check endpoint
    if (path === '/health' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        status: "healthy",
        service: "mock-compliance",
        timestamp: new Date().toISOString(),
        uptime: "mock"
      });
    }

    // API info endpoint
    if (path === '/api' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        service: "AIMY Mock Compliance Service",
        version: "1.0.0",
        description: "Mock compliance service for demonstration purposes",
        endpoints: {
          "GET /": "Service status",
          "GET /health": "Health check",
          "GET /api": "API information",
          "GET /api/v1/kyc/applicants": "List KYC applicants",
          "GET /api/v1/kyc/applicants/:id": "Get KYC applicant details",
          "POST /api/v1/kyc/applicants": "Create KYC applicant",
          "GET /api/v1/screening/:applicantId": "Get screening results",
          "POST /api/v1/screening/check": "Perform screening check"
        }
      });
    }

    // KYC applicants endpoint
    if (path === '/api/v1/kyc/applicants' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        applicants: Object.values(MOCK_KYC_DATA),
        total: Object.keys(MOCK_KYC_DATA).length,
        timestamp: new Date().toISOString()
      });
    }

    // KYC applicant details endpoint
    if (path.startsWith('/api/v1/kyc/applicants/') && method === 'GET') {
      const applicantId = path.split('/').pop();
      const applicant = MOCK_KYC_DATA[applicantId];
      
      if (applicant) {
        return sendJsonResponse(res, 200, {
          applicant: applicant,
          timestamp: new Date().toISOString()
        });
      } else {
        return sendJsonResponse(res, 404, {
          error: "Applicant not found",
          message: `No applicant found with ID: ${applicantId}`
        });
      }
    }

    // Create KYC applicant endpoint
    if (path === '/api/v1/kyc/applicants' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const newApplicant = JSON.parse(body);
          const applicantId = `applicant_${Date.now()}`;
          
          MOCK_KYC_DATA[applicantId] = {
            id: applicantId,
            ...newApplicant,
            status: "pending",
            kyc_date: new Date().toISOString().split('T')[0]
          };
          
          return sendJsonResponse(res, 201, {
            success: true,
            applicant: MOCK_KYC_DATA[applicantId],
            message: "KYC applicant created successfully"
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

    // Screening results endpoint
    if (path.startsWith('/api/v1/screening/') && !path.endsWith('/check') && method === 'GET') {
      const applicantId = path.split('/').pop();
      const screening = MOCK_SCREENING_RESULTS[applicantId];
      
      if (screening) {
        return sendJsonResponse(res, 200, {
          applicantId: applicantId,
          screening: screening,
          timestamp: new Date().toISOString()
        });
      } else {
        return sendJsonResponse(res, 404, {
          error: "Screening results not found",
          message: `No screening results found for applicant: ${applicantId}`
        });
      }
    }

    // Screening check endpoint
    if (path === '/api/v1/screening/check' && method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const checkRequest = JSON.parse(body);
          const applicantId = checkRequest.applicantId || `applicant_${Date.now()}`;
          
          // Mock screening results
          const screeningResult = {
            sanctions_check: "clear",
            pep_check: "clear",
            aml_score: Math.random() > 0.7 ? "high" : Math.random() > 0.3 ? "medium" : "low",
            last_screened: new Date().toISOString(),
            risk_factors: []
          };
          
          MOCK_SCREENING_RESULTS[applicantId] = screeningResult;
          
          return sendJsonResponse(res, 200, {
            success: true,
            applicantId: applicantId,
            screening: screeningResult,
            message: "Screening check completed successfully"
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

    // 404 for unknown endpoints
    return sendJsonResponse(res, 404, {
      error: "Endpoint not found",
      available_endpoints: [
        "/",
        "/health", 
        "/api",
        "/api/v1/kyc/applicants",
        "/api/v1/screening/:applicantId",
        "/api/v1/screening/check"
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
const PORT = process.env.PORT || 3002;
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Starting AIMY Mock Compliance Service on port', PORT);
  console.log('🛡️  Mock compliance service providing KYC and screening functionality');
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
  console.log('\n🛑 Shutting down Mock Compliance Service...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Mock Compliance Service...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
