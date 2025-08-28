#!/usr/bin/env node

/**
 * Mock AI Core Service for AIMY Platform
 * This is a simple Node.js service that provides AI insights without complex ML dependencies
 */

const http = require('http');
const url = require('url');

// Mock AI insights data
const MOCK_AI_INSIGHTS = {
  "solar_farm": {
    "valuation": 50000000,
    "risk_score": 2.1,
    "yield_prediction": 8.2,
    "market_sentiment": "positive",
    "recommendation": "Strong buy - Consistent energy production and stable cash flows",
    "confidence": 0.89
  },
  "infrastructure_fund": {
    "valuation": 75000000,
    "risk_score": 4.2,
    "yield_prediction": 6.8,
    "market_sentiment": "neutral",
    "recommendation": "Hold - Stable returns with moderate growth potential",
    "confidence": 0.76
  },
  "real_estate": {
    "valuation": 120000000,
    "risk_score": 6.2,
    "yield_prediction": 7.5,
    "market_sentiment": "cautious",
    "recommendation": "Monitor - High potential but increased market volatility",
    "confidence": 0.68
  }
};

// Mock portfolio optimization data
const MOCK_PORTFOLIO_OPTIMIZATION = {
  "solar_farm": {"target": 0.4, "current": 0.45, "action": "reduce"},
  "infrastructure": {"target": 0.3, "current": 0.3, "action": "maintain"},
  "real_estate": {"target": 0.2, "current": 0.15, "action": "increase"},
  "cash": {"target": 0.1, "current": 0.1, "action": "maintain"}
};

// Mock risk assessment data
const MOCK_RISK_ASSESSMENT = {
  "market_risk": "medium",
  "regulatory_risk": "low",
  "operational_risk": "low",
  "liquidity_risk": "medium",
  "credit_risk": "low"
};

// Helper function to parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
  });
}

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
        service: "AIMY AI Core Service",
        status: "running",
        version: "1.0.0",
        timestamp: new Date().toISOString()
      });
    }

    // Health check endpoint
    if (path === '/health' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        status: "healthy",
        service: "ai-core",
        timestamp: new Date().toISOString(),
        uptime: "mock"
      });
    }

    // Asset analysis endpoint
    if (path === '/api/v1/analyze/asset' && method === 'POST') {
      const body = await parseBody(req);
      const assetType = body.asset_type || 'solar_farm';
      const assetKey = assetType.toLowerCase().replace(/\s+/g, '_');
      const insights = MOCK_AI_INSIGHTS[assetKey] || MOCK_AI_INSIGHTS.solar_farm;

      return sendJsonResponse(res, 200, {
        asset_id: body.asset_id || 'unknown',
        analysis_timestamp: new Date().toISOString(),
        ai_insights: insights,
        market_analysis: {
          trend: insights.market_sentiment === "positive" ? "bullish" : "neutral",
          volatility: insights.risk_score < 3 ? "low" : insights.risk_score < 6 ? "medium" : "high",
          liquidity_score: insights.risk_score < 4 ? 0.8 : 0.6
        },
        recommendations: [
          insights.recommendation,
          `Expected yield: ${insights.yield_prediction}% APY`,
          `Risk level: ${insights.risk_score}/10`
        ]
      });
    }

    // Portfolio optimization endpoint
    if (path === '/api/v1/optimize/portfolio' && method === 'POST') {
      const body = await parseBody(req);
      const totalValue = (body.portfolio || []).reduce((sum, item) => sum + (item.value || 0), 0);

      return sendJsonResponse(res, 200, {
        optimization_timestamp: new Date().toISOString(),
        current_portfolio_value: totalValue,
        optimized_allocation: MOCK_PORTFOLIO_OPTIMIZATION,
        expected_improvement: {
          return_increase: "0.8%",
          risk_reduction: "12%",
          diversification_score: "85/100"
        },
        ai_recommendations: [
          "Rebalance to target allocation for optimal risk-adjusted returns",
          "Consider increasing real estate exposure for diversification",
          "Maintain cash position for opportunistic investments"
        ]
      });
    }

    // Risk assessment endpoint
    if (path === '/api/v1/assess/risk' && method === 'POST') {
      const body = await parseBody(req);
      const overallRisk = body.regulatory_environment === "stable" ? "low" : "medium";

      return sendJsonResponse(res, 200, {
        asset_id: body.asset_id || 'unknown',
        assessment_timestamp: new Date().toISOString(),
        overall_risk_score: overallRisk,
        risk_factors: MOCK_RISK_ASSESSMENT,
        risk_mitigation: [
          "Diversify across multiple asset classes",
          "Monitor regulatory changes closely",
          "Maintain adequate liquidity reserves"
        ],
        confidence: 0.82
      });
    }

    // Market insights endpoint
    if (path === '/api/v1/insights/market' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        timestamp: new Date().toISOString(),
        market_overview: {
          renewable_energy: "bullish",
          infrastructure: "neutral",
          real_estate: "cautious",
          overall_sentiment: "positive"
        },
        trending_assets: [
          "Solar Farm Tokenization",
          "Green Infrastructure Bonds",
          "Sustainable Real Estate"
        ],
        ai_predictions: {
          market_growth: "15-20% YOY",
          volatility: "moderate",
          opportunity_areas: ["emerging_markets", "battery_storage", "carbon_credits"]
        }
      });
    }

    // API documentation endpoint
    if (path === '/docs' && method === 'GET') {
      return sendJsonResponse(res, 200, {
        service: "AIMY AI Core Service",
        version: "1.0.0",
        endpoints: {
          "GET /": "Service status",
          "GET /health": "Health check",
          "POST /api/v1/analyze/asset": "Asset analysis",
          "POST /api/v1/optimize/portfolio": "Portfolio optimization",
          "POST /api/v1/assess/risk": "Risk assessment",
          "GET /api/v1/insights/market": "Market insights"
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
        "/api/v1/analyze/asset",
        "/api/v1/optimize/portfolio",
        "/api/v1/assess/risk",
        "/api/v1/insights/market"
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
const PORT = process.env.PORT || 8000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Starting AIMY AI Core Service on port', PORT);
  console.log('📊 Mock AI service providing insights and analysis');
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
  console.log('\n🛑 Shutting down AI Core Service...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down AI Core Service...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
