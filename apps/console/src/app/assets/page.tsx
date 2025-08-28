"use client";

import { 
  Search, 
  Filter, 
  TrendingUp, 
  MapPin, 
  Building,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

// Mock assets data - consistent with port 3005
const assets = [
  {
    id: 'solar-farm-alpha',
    name: 'Solar Farm Alpha',
    type: 'renewable energy',
    status: 'active',
    location: 'California, USA',
    value: '$25,000,000',
    yield: '8.2%',
    inceptionDate: '2023-01-15',
    complianceStatus: 'verified',
    documents: 5,
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
    description: 'Large-scale solar energy farm providing clean electricity to 15,000 homes.',
    minInvestment: 5000,
    maxInvestment: 500000,
    remainingTokens: 125000,
    investors: 156,
    lastValuation: '2024-01-15',
    riskLevel: 'low',
    sector: 'Renewable Energy',
    issuer: 'Green Energy Solutions',
    tokenSymbol: 'SFA',
    maturity: '15 years'
  },
  {
    id: 'real-estate-fund-beta',
    name: 'Real Estate Fund Beta',
    type: 'real estate',
    status: 'active',
    location: 'New York, USA',
    value: '$15,000,000',
    yield: '6.8%',
    inceptionDate: '2023-03-20',
    complianceStatus: 'verified',
    documents: 4,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    description: 'Diversified real estate portfolio including commercial and residential properties.',
    minInvestment: 3000,
    maxInvestment: 300000,
    remainingTokens: 75000,
    investors: 89,
    lastValuation: '2024-01-10',
    riskLevel: 'medium',
    sector: 'Real Estate',
    issuer: 'Metro Real Estate Group',
    tokenSymbol: 'REFB',
    maturity: '10 years'
  },
  {
    id: 'infrastructure-bonds-gamma',
    name: 'Infrastructure Bonds Gamma',
    type: 'infrastructure',
    status: 'active',
    location: 'Texas, USA',
    value: '$8,000,000',
    yield: '7.5%',
    inceptionDate: '2023-06-10',
    complianceStatus: 'verified',
    documents: 6,
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop',
    description: 'Infrastructure development bonds for transportation and utility projects.',
    minInvestment: 2000,
    maxInvestment: 200000,
    remainingTokens: 40000,
    investors: 67,
    lastValuation: '2024-01-08',
    riskLevel: 'medium',
    sector: 'Infrastructure',
    issuer: 'Infra Development Corp',
    tokenSymbol: 'IBG',
    maturity: '12 years'
  },
  {
    id: 'wind-energy-delta',
    name: 'Wind Energy Delta',
    type: 'renewable energy',
    status: 'active',
    location: 'Iowa, USA',
    value: '$12,000,000',
    yield: '7.8%',
    inceptionDate: '2023-04-05',
    complianceStatus: 'verified',
    documents: 4,
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop',
    description: 'Wind farm generating clean energy for rural communities.',
    minInvestment: 4000,
    maxInvestment: 400000,
    remainingTokens: 60000,
    investors: 78,
    lastValuation: '2024-01-12',
    riskLevel: 'low',
    sector: 'Renewable Energy',
    issuer: 'Wind Power Solutions',
    tokenSymbol: 'WED',
    maturity: '18 years'
  },
  {
    id: 'tech-startup-epsilon',
    name: 'Tech Startup Epsilon',
    type: 'technology',
    status: 'active',
    location: 'California, USA',
    value: '$5,000,000',
    yield: '12.5%',
    inceptionDate: '2023-08-12',
    complianceStatus: 'verified',
    documents: 3,
    image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=300&fit=crop',
    description: 'Innovative AI-powered software solutions for enterprise clients.',
    minInvestment: 1000,
    maxInvestment: 100000,
    remainingTokens: 25000,
    investors: 45,
    lastValuation: '2024-01-05',
    riskLevel: 'high',
    sector: 'Technology',
    issuer: 'Epsilon Tech Inc',
    tokenSymbol: 'TSE',
    maturity: '8 years'
  },
  {
    id: 'commodity-fund-zeta',
    name: 'Commodity Fund Zeta',
    type: 'commodity',
    status: 'active',
    location: 'Global',
    value: '$18,000,000',
    yield: '9.2%',
    inceptionDate: '2023-02-28',
    complianceStatus: 'verified',
    documents: 7,
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop',
    description: 'Diversified commodity portfolio including precious metals and energy.',
    minInvestment: 2500,
    maxInvestment: 250000,
    remainingTokens: 90000,
    investors: 112,
    lastValuation: '2024-01-14',
    riskLevel: 'high',
    sector: 'Commodities',
    issuer: 'Global Commodity Partners',
    tokenSymbol: 'CFZ',
    maturity: '6 years'
  }
];

export default function AssetsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">AIMYA</span>
              </a>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Home</a>
              <a href="/assets" className="text-blue-600 font-medium">Assets</a>
              <a href="/ai-copilot" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">AI Copilot</a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Contact</a>
            </nav>
            <div className="flex items-center space-x-4">
              <a href="/login">
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent h-10 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">
                  Sign in
                </button>
              </a>
              <a href="/signup">
                <button className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg">
                  Get started
                </button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <a href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </a>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Investment Opportunities
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover a diverse range of tokenized real-world assets with transparent returns and professional management.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-12">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search assets by name, type, or location..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl">
              <Filter className="h-5 w-5 mr-2" />
              Filter
            </button>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {assets.map((asset) => (
            <div key={asset.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <img 
                  src={asset.image} 
                  alt={asset.name} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{asset.name}</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    {asset.status}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 leading-relaxed">{asset.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Type</span>
                    <span className="font-medium text-gray-900 capitalize">{asset.type}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Location</span>
                    <span className="font-medium text-gray-900">{asset.location}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Value</span>
                    <span className="font-medium text-green-600">{asset.value}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Yield</span>
                    <span className="font-medium text-blue-600">{asset.yield}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Min Investment</span>
                    <span className="font-medium text-gray-900">${asset.minInvestment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">Investors</span>
                    <span className="font-medium text-gray-900">{asset.investors}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <a href="/login" className="flex-1">
                    <button className="w-full inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl">
                      Invest Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </a>
                  <a href="/login" className="flex-1">
                    <button className="w-full inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-xl">
                      View Details
                    </button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Start Investing?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join thousands of investors who are already building wealth through tokenized real-world assets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/signup">
                <button className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Create Account
                </button>
              </a>
              <a href="/login">
                <button className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-transparent h-12 border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 rounded-xl transition-all duration-300">
                  Sign In
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
