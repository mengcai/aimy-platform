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
import { Button } from '../../components/ui/button';
import { AssetCard } from '../../components/ui/asset-card';
import { InvestmentModal } from '../../components/ui/investment-modal';
import { DataService, PLATFORM_METRICS } from '../../services/data';
import { Asset } from '../../types';
import { formatCurrency, formatNumber, getAssetTypeIcon } from '../../lib/utils';
import { Badge } from '../../components/ui/badge';
import { formatDate } from '../../lib/utils';

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
        alert(`Insufficient funds. You have ${formatCurrency(availableToInvest)} available to invest.`);
        return;
      }
      
      // Create investment record
      const investment = {
        id: `inv_${Date.now()}`,
        assetId: asset.id,
        amount: amount,
        tokens: tokensToPurchase,
        date: new Date().toISOString(),
        status: 'confirmed',
        userId: 'user_123' // In real app, this would come from auth context
      };
      
      // Update asset availability
      asset.remainingTokens -= tokensToPurchase;
      asset.investors += 1;
      
      // In a real implementation, this would:
      // 1. Call investment service API
      // 2. Update blockchain state
      // 3. Update user portfolio
      // 4. Send confirmation email
      
      console.log('Investment created:', investment);
      console.log('Asset updated:', asset);
      
      // Show success message
      alert(`Successfully invested ${formatCurrency(amount)} in ${asset.name}!\nYou now own ${tokensToPurchase} tokens.`);
      
      // Close modal
      setInvestmentModal({
        isOpen: false,
        asset: null
      });
      
      // Refresh the page to show updated data
      window.location.reload();
      
    } catch (error) {
      console.error('Investment failed:', error);
      alert('Investment failed. Please try again.');
    }
  };

  const closeInvestmentModal = () => {
    setInvestmentModal({
      isOpen: false,
      asset: null
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Investment Portfolio</h1>
              <p className="mt-2 text-lg text-gray-600">
                Track your investments, performance, and available opportunities
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Link href="/assets">
                <Button variant="outline" size="lg">
                  <Building className="h-4 w-4 mr-2" />
                  Browse More Assets
                </Button>
              </Link>
              <Button size="lg">
                <TrendingUp className="h-4 w-4 mr-2" />
                New Investment
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assets Owned</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.myAssets}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.portfolioValue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Wallet className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available to Invest</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(availableToInvest)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Return</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData.totalReturn.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{dashboardData.averageYield.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Average Yield Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{dashboardData.totalReturn.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Total Return Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{formatCurrency(dashboardData.portfolioValue)}</div>
              <div className="text-sm text-gray-600">Current Portfolio Value</div>
            </div>
          </div>
        </div>

        {/* My Assets */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Assets</h2>
            <Link href="/assets" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
              Browse All Assets
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownedAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onInvest={handleInvest}
                variant="detailed"
              />
            ))}
          </div>
        </div>

        {/* Recent Orders & AI Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
            <div className="space-y-4">
              {dashboardData.recentInvestments.map((investment) => {
                const asset = DataService.getAssetById(investment.assetId);
                if (!asset) return null;
                
                return (
                  <div key={investment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getAssetTypeIcon(asset.type)}</span>
                      <div>
                        <p className="font-medium text-gray-900">{asset.name}</p>
                        <p className="text-sm text-gray-600">{formatDate(investment.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(investment.amount)}</p>
                      <p className="text-sm text-gray-600">{formatNumber(investment.tokens)} tokens</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <Link href="/orders" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All Orders →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
            <div className="space-y-4">
              {dashboardData.aiInsights.map((insight) => {
                const asset = DataService.getAssetById(insight.assetId);
                if (!asset) return null;
                
                return (
                  <div key={insight.id} className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-blue-900">{insight.title}</h4>
                      <Badge variant="info" className="text-xs">
                        {insight.confidence * 100}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-700 mb-2">{insight.description}</p>
                    <p className="text-xs text-blue-600">Asset: {asset.name}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <Link href="/ai-copilot" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Get More Insights →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/assets">
              <Button variant="outline" className="w-full h-20 flex-col">
                <Building className="h-6 w-6 mb-2" />
                Browse Assets
              </Button>
            </Link>
            <Link href="/orders">
              <Button variant="outline" className="w-full h-20 flex-col">
                <FileText className="h-6 w-6 mb-2" />
                View Orders
              </Button>
            </Link>
            <Link href="/referrals">
              <Button variant="outline" className="w-full h-20 flex-col">
                <Users className="h-6 w-6 mb-2" />
                Referrals
              </Button>
            </Link>
            <Link href="/ai-copilot">
              <Button variant="outline" className="w-full h-20 flex-col">
                <Sparkles className="h-6 w-6 mb-2" />
                AI Copilot
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      <InvestmentModal
        isOpen={investmentModal.isOpen}
        asset={investmentModal.asset}
        onClose={closeInvestmentModal}
        onSubmit={handleInvestmentSubmit}
      />
    </div>
  );
}
