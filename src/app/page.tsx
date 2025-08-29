'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Users, 
  Building, 
  DollarSign, 
  BarChart3, 
  Shield, 
  ArrowRight,
  Search,
  Filter,
  Eye,
  TrendingUp as TrendingUpIcon,
  Wallet,
  Target,
  Activity,
  FileText,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { AssetCard } from '../components/ui/asset-card';
import { InvestmentModal } from '../components/ui/investment-modal';
import { DataService, PLATFORM_METRICS } from '../services/data';
import { Asset } from '../types';
import { formatCurrency, formatNumber, getAssetTypeIcon } from '../lib/utils';
import { Badge } from '../components/ui/badge';
import { formatDate } from '../lib/utils';

export default function PortfolioPage() {
  const [investmentModal, setInvestmentModal] = useState<{
    isOpen: boolean;
    asset: Asset | null;
  }>({
    isOpen: false,
    asset: null
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const assets = DataService.getAssets();
  const dashboardData = DataService.getDashboardData();
  
  // Get user's owned assets (in real app, this would come from user's portfolio)
  const ownedAssets = assets.slice(0, 3); // Mock: first 3 assets as owned
  const availableToInvest = 50000; // Mock: $50K available to invest

  const filteredAssets = ownedAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    return matchesSearch && matchesType;
  });

  const assetTypes = [
    { value: 'all', label: 'All Types', icon: '📊' },
    { value: 'renewable_energy', label: 'Renewable Energy', icon: '🌞' },
    { value: 'real_estate', label: 'Real Estate', icon: '🏢' },
    { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
    { value: 'commodities', label: 'Commodities', icon: '⛏️' },
    { value: 'technology', label: 'Technology', icon: '💻' },
    { value: 'healthcare', label: 'Healthcare', icon: '🏥' }
  ];

  const handleInvest = (asset: Asset) => {
    setInvestmentModal({
      isOpen: true,
      asset
    });
  };

  const handleInvestmentSubmit = async (amount: number) => {
    if (!investmentModal.asset) return;
    
    try {
      // Calculate tokens to be purchased
      const asset = investmentModal.asset;
      const tokensToPurchase = Math.floor((amount / asset.value) * asset.tokens);
      
      // Validate investment amount
      if (amount <= 0) {
        alert('Investment amount must be greater than 0');
        return;
      }
      
      if (amount > asset.value) {
        alert('Investment amount cannot exceed asset total value');
        return;
      }
      
      // Check if asset has available tokens
      if (asset.remainingTokens < tokensToPurchase) {
        alert(`Only ${asset.remainingTokens} tokens available for this asset`);
        return;
      }
      
      // Check if user has enough available money
      if (amount > availableToInvest) {
        alert(`You only have ${formatCurrency(availableToInvest)} available to invest`);
        return;
      }
      
      // In a real app, this would make an API call to process the investment
      console.log(`Investing ${formatCurrency(amount)} in ${asset.name}`);
      
      // Close modal
      setInvestmentModal({
        isOpen: false,
        asset: null
      });
      
      // Show success message
      alert(`Successfully invested ${formatCurrency(amount)} in ${asset.name}!`);
      
    } catch (error) {
      console.error('Investment error:', error);
      alert('Failed to process investment. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
        <p className="text-gray-600 mt-2">Manage your investments and track your portfolio performance</p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.totalValue)}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUpIcon className="h-4 w-4 mr-1" />
                +{dashboardData.totalReturn}%
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Investments</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.activeInvestments}</p>
              <p className="text-sm text-gray-500 mt-1">Across {dashboardData.assetTypes} asset types</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available to Invest</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(availableToInvest)}</p>
              <p className="text-sm text-blue-600 mt-1">Ready for new opportunities</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Wallet className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Portfolio Health</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.portfolioHealth}%</p>
              <p className="text-sm text-green-600 mt-1">Excellent diversification</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {assetTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            <Button variant="outline" className="px-4">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onInvest={handleInvest}
            showActions={true}
          />
        ))}
      </div>

      {/* Investment Modal */}
      {investmentModal.isOpen && investmentModal.asset && (
        <InvestmentModal
          asset={investmentModal.asset}
          onClose={() => setInvestmentModal({ isOpen: false, asset: null })}
          onSubmit={handleInvestmentSubmit}
          maxAmount={Math.min(availableToInvest, investmentModal.asset.value)}
        />
      )}
    </div>
  );
}
