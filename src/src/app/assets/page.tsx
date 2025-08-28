'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Building, 
  MapPin, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

// Mock data for demonstration - matching the 7 assets shown in dashboard
const assets = [
  {
    id: 'solar-farm-alpha',
    name: 'Solar Farm Alpha',
    type: 'renewable_energy',
    status: 'active',
    location: 'California, USA',
    value: 25000000,
    tokens: 1000000,
    yield: 8.5,
    inceptionDate: '2023-01-15',
    complianceStatus: 'verified',
    documents: 4,
    image: '/api/placeholder/400/300',
    description: 'Large-scale solar energy facility with advanced photovoltaic technology and grid integration.',
    minInvestment: 1000,
    maxInvestment: 100000,
    remainingTokens: 400000,
    investors: 156,
    lastValuation: '2024-01-15',
    riskLevel: 'Low',
    sector: 'Clean Energy'
  },
  {
    id: 'real-estate-fund-beta',
    name: 'Real Estate Fund Beta',
    type: 'real_estate',
    status: 'active',
    location: 'New York, USA',
    value: 15000000,
    tokens: 600000,
    yield: 6.2,
    inceptionDate: '2023-03-20',
    complianceStatus: 'verified',
    documents: 2,
    image: '/api/placeholder/400/300',
    description: 'Diversified commercial real estate portfolio with prime locations and stable tenants.',
    minInvestment: 5000,
    maxInvestment: 500000,
    remainingTokens: 200000,
    investors: 89,
    lastValuation: '2024-01-10',
    riskLevel: 'Medium',
    sector: 'Real Estate'
  },
  {
    id: 'infrastructure-bonds-gamma',
    name: 'Infrastructure Bonds Gamma',
    type: 'infrastructure',
    status: 'active',
    location: 'Texas, USA',
    value: 8000000,
    tokens: 320000,
    yield: 5.8,
    inceptionDate: '2023-06-10',
    complianceStatus: 'verified',
    documents: 1,
    image: '/api/placeholder/400/300',
    description: 'Government-backed infrastructure bonds for transportation and utility projects.',
    minInvestment: 2500,
    maxInvestment: 250000,
    remainingTokens: 80000,
    investors: 234,
    lastValuation: '2024-01-05',
    riskLevel: 'Low',
    sector: 'Infrastructure'
  },
  {
    id: 'wind-energy-delta',
    name: 'Wind Energy Delta',
    type: 'renewable_energy',
    status: 'active',
    location: 'Iowa, USA',
    value: 12000000,
    tokens: 480000,
    yield: 7.2,
    inceptionDate: '2023-08-15',
    complianceStatus: 'verified',
    documents: 3,
    image: '/api/placeholder/400/300',
    description: 'Modern wind farm with high-efficiency turbines and energy storage integration.',
    minInvestment: 2000,
    maxInvestment: 200000,
    remainingTokens: 120000,
    investors: 178,
    lastValuation: '2024-01-12',
    riskLevel: 'Low',
    sector: 'Clean Energy'
  },
  {
    id: 'tech-startup-epsilon',
    name: 'Tech Startup Epsilon',
    type: 'technology',
    status: 'active',
    location: 'California, USA',
    value: 5000000,
    tokens: 200000,
    yield: 12.5,
    inceptionDate: '2023-11-01',
    complianceStatus: 'verified',
    documents: 5,
    image: '/api/placeholder/400/300',
    description: 'Innovative AI-powered software company with strong market traction and growth potential.',
    minInvestment: 10000,
    maxInvestment: 1000000,
    remainingTokens: 50000,
    investors: 45,
    lastValuation: '2024-01-08',
    riskLevel: 'High',
    sector: 'Technology'
  },
  {
    id: 'commodity-fund-zeta',
    name: 'Commodity Fund Zeta',
    type: 'commodities',
    status: 'active',
    location: 'Global',
    value: 18000000,
    tokens: 720000,
    yield: 4.8,
    inceptionDate: '2023-04-10',
    complianceStatus: 'verified',
    documents: 2,
    image: '/api/placeholder/400/300',
    description: 'Diversified commodity portfolio including precious metals, energy, and agricultural products.',
    minInvestment: 3000,
    maxInvestment: 300000,
    remainingTokens: 180000,
    investors: 312,
    lastValuation: '2024-01-03',
    riskLevel: 'Medium',
    sector: 'Commodities'
  },
  {
    id: 'healthcare-reit-eta',
    name: 'Healthcare REIT Eta',
    type: 'real_estate',
    status: 'active',
    location: 'Florida, USA',
    value: 9500000,
    tokens: 380000,
    yield: 6.8,
    inceptionDate: '2023-07-20',
    complianceStatus: 'verified',
    documents: 3,
    image: '/api/placeholder/400/300',
    description: 'Healthcare-focused real estate investment trust with medical office buildings and facilities.',
    minInvestment: 4000,
    maxInvestment: 400000,
    remainingTokens: 95000,
    investors: 134,
    lastValuation: '2024-01-14',
    riskLevel: 'Medium',
    sector: 'Healthcare Real Estate'
  }
];

const assetTypes = [
  { value: 'all', label: 'All Types', icon: '📊' },
  { value: 'renewable_energy', label: 'Renewable Energy', icon: '🌞' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏢' },
  { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
  { value: 'commodities', label: 'Commodities', icon: '⛏️' },
  { value: 'technology', label: 'Technology', icon: '💻' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' }
];

const riskLevels = [
  { value: 'all', label: 'All Risk Levels' },
  { value: 'low', label: 'Low Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'high', label: 'High Risk' }
];

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    const matchesRisk = selectedRisk === 'all' || asset.riskLevel.toLowerCase() === selectedRisk;
    
    return matchesSearch && matchesType && matchesRisk;
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'value':
        return b.value - a.value;
      case 'yield':
        return b.yield - a.yield;
      case 'investors':
        return b.investors - a.investors;
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    const assetType = assetTypes.find(t => t.value === type);
    return assetType?.icon || '📊';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const calculateProgress = (remaining: number, total: number) => {
    return Math.round(((total - remaining) / total) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Investment Assets</h1>
              <p className="mt-2 text-lg text-gray-600">
                Discover and invest in tokenized real-world assets
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Assets</p>
                  <p className="text-2xl font-bold text-gray-900">{assets.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(assets.reduce((sum, asset) => sum + asset.value, 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {assetTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {riskLevels.map(risk => (
                <option key={risk.value} value={risk.value}>
                  {risk.label}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="value">Sort by Value</option>
              <option value="yield">Sort by Yield</option>
              <option value="investors">Sort by Investors</option>
            </select>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAssets.map((asset) => (
            <div key={asset.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              {/* Asset Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg flex items-center justify-center">
                <div className="text-6xl">{getTypeIcon(asset.type)}</div>
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                    {asset.status}
                  </span>
                </div>
              </div>

              {/* Asset Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(asset.riskLevel)}`}>
                    {asset.riskLevel} Risk
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{asset.description}</p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {asset.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-2" />
                    {asset.sector}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {formatCurrency(asset.value)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {asset.yield}% Annual Yield
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {asset.investors} investors
                  </div>
                </div>

                {/* Investment Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Investment Progress</span>
                    <span>{calculateProgress(asset.remainingTokens, asset.tokens)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress(asset.remainingTokens, asset.tokens)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(asset.remainingTokens)} remaining of {formatNumber(asset.tokens)} tokens
                  </p>
                </div>

                {/* Investment Range */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Investment Range</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(asset.minInvestment)} - {formatCurrency(asset.maxInvestment)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Link
                    href={`/assets/${asset.id}`}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                  <button
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Invest Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {sortedAssets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
