const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3006;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'AIMY Admin Console',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Admin dashboard endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'AIMY Admin Console',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      assets: '/api/assets',
      insights: '/api/insights',
      users: '/api/users',
      compliance: '/api/compliance'
    },
    description: 'Admin console for AIMY platform management'
  });
});

// Mock assets endpoint
app.get('/api/assets', (req, res) => {
  res.json({
    total: 12,
    assets: [
      { id: 'solar-farm-alpha', name: 'Solar Farm Alpha', status: 'active', value: 25000000 },
      { id: 'real-estate-fund-beta', name: 'Real Estate Fund Beta', status: 'active', value: 15000000 },
      { id: 'infrastructure-bonds-gamma', name: 'Infrastructure Bonds Gamma', status: 'active', value: 8000000 },
      { id: 'wind-energy-delta', name: 'Wind Energy Delta', status: 'active', value: 12000000 },
      { id: 'tech-startup-epsilon', name: 'Tech Startup Epsilon', status: 'active', value: 5000000 },
      { id: 'commodity-fund-zeta', name: 'Commodity Fund Zeta', status: 'active', value: 18000000 },
      { id: 'healthcare-reit-eta', name: 'Healthcare REIT Eta', status: 'active', value: 22000000 },
      { id: 'data-center-theta', name: 'Data Center Theta', status: 'active', value: 35000000 },
      { id: 'agricultural-land-iota', name: 'Agricultural Land Iota', status: 'active', value: 9500000 },
      { id: 'mining-operation-kappa', name: 'Mining Operation Kappa', status: 'active', value: 28000000 },
      { id: 'intellipro-group', name: 'IntelliPro Group', status: 'active', value: 8500000 },
      { id: 'energy-storage-lambda', name: 'Energy Storage Lambda', status: 'active', value: 8500000 }
    ]
  });
});

// Mock insights endpoint
app.get('/api/insights', (req, res) => {
  res.json({
    totalInsights: 8,
    insights: [
      { id: 1, type: 'market_trend', title: 'Renewable Energy Growth', description: 'Strong growth in solar and wind investments' },
      { id: 2, type: 'risk_alert', title: 'Market Volatility', description: 'Increased volatility in commodity markets' },
      { id: 3, type: 'opportunity', title: 'Tech Sector Recovery', description: 'Tech startups showing recovery signs' },
      { id: 4, type: 'compliance', title: 'Regulatory Update', description: 'New compliance requirements for RWA tokens' }
    ]
  });
});

// Mock users endpoint
app.get('/api/users', (req, res) => {
  res.json({
    totalUsers: 1750,
    activeUsers: 1420,
    newUsers: 45,
    users: [
      { id: 1, name: 'John Smith', email: 'john@example.com', status: 'verified', joinDate: '2024-01-15' },
      { id: 2, name: 'Jane Doe', email: 'jane@example.com', status: 'verified', joinDate: '2024-01-20' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'pending', joinDate: '2024-01-25' }
    ]
  });
});

// Mock compliance endpoint
app.get('/api/compliance', (req, res) => {
  res.json({
    totalCases: 12,
    pendingCases: 3,
    resolvedCases: 9,
    cases: [
      { id: 1, type: 'kyc_review', status: 'pending', priority: 'high', assignedTo: 'Admin Team' },
      { id: 2, type: 'aml_check', status: 'resolved', priority: 'medium', assignedTo: 'Compliance Team' },
      { id: 3, type: 'document_verification', status: 'pending', priority: 'low', assignedTo: 'Admin Team' }
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AIMY Admin Console Service running on port ${PORT}`);
  console.log(`📊 Admin dashboard available at: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📈 Assets: http://localhost:${PORT}/api/assets`);
  console.log(`💡 Insights: http://localhost:${PORT}/api/insights`);
  console.log(`👥 Users: http://localhost:${PORT}/api/users`);
  console.log(`🛡️ Compliance: http://localhost:${PORT}/api/compliance`);
});
