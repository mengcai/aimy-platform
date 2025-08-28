'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  TrendingUp,
  Building,
  DollarSign,
  Users,
  Calendar
} from 'lucide-react';
import { AssetCard } from '../../components/ui/asset-card';
import { InvestmentModal } from '../../components/ui/investment-modal';
import { DataService } from '../../services/data';
import { Asset } from '../../types';
import { formatCurrency, formatNumber, getAssetTypeIcon } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export default function AssetsPage() {
  const [investmentModal, setInvestmentModal] = useState<{
    isOpen: boolean;
    asset: Asset | null;
  }>({
    isOpen: false,
    asset: null
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');

  const assets = DataService.getAssets();
  const recentAssets = assets.slice(0, 6);
  const dashboardData = DataService.getDashboardData();

  // Ensure we show all 12 assets
  const totalAssets = assets.length;

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.issuer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus;
    const matchesRisk = selectedRisk === 'all' || asset.riskLevel === selectedRisk;
    return matchesSearch && matchesType && matchesStatus && matchesRisk;
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'value':
        return b.value - a.value;
      case 'yield':
        return b.yield - a.yield;
      case 'risk':
        return a.riskLevel.localeCompare(b.riskLevel);
      case 'investors':
        return b.investors - a.investors;
      default:
        return 0;
    }
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

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'fundraising', label: 'Fundraising' },
    { value: 'mature', label: 'Mature' }
  ];

  const riskOptions = [
    { value: 'all', label: 'All Risk Levels' },
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' }
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'value', label: 'Value' },
    { value: 'yield', label: 'Yield' },
    { value: 'risk', label: 'Risk Level' },
    { value: 'investors', label: 'Investors' }
  ];

  const handleInvest = (asset: Asset) => {
    setInvestmentModal({
      isOpen: true,
      asset
    });
  };

  const handleCloseModal = () => {
    setInvestmentModal({
      isOpen: false,
      asset: null
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
      handleCloseModal();
      
      // Refresh the page to show updated data
      window.location.reload();
      
    } catch (error) {
      console.error('Investment failed:', error);
      alert('Investment failed. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'fundraising': return 'bg-blue-100 text-blue-800';
      case 'mature': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Assets</h1>
            <p className="mt-2 text-lg text-gray-600">
              Discover {totalAssets} investment opportunities across diverse sectors
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets, sectors, or issuers..."
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
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {riskOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  Sort by: {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing <span className="font-medium">{filteredAssets.length}</span> of{' '}
              <span className="font-medium">{assets.length}</span> assets
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Total Value: {formatCurrency(assets.reduce((sum, asset) => sum + asset.value, 0))}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Total Investors: {assets.reduce((sum, asset) => sum + asset.investors, 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assets Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onInvest={handleInvest}
                variant="detailed"
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yield
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedAssets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getAssetTypeIcon(asset.type)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                            <div className="text-sm text-gray-500">{asset.issuer}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline">{asset.sector}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(asset.value)}</div>
                        <div className="text-sm text-gray-500">{formatNumber(asset.tokens)} tokens</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">{asset.yield}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getRiskColor(asset.riskLevel)}>
                          {asset.riskLevel}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusColor(asset.status)}>
                          {asset.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleInvest(asset)}
                            className="flex items-center"
                          >
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Invest
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {sortedAssets.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assets found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search criteria or filters to find more assets.
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setSelectedStatus('all');
                setSelectedRisk('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Investment Modal */}
      <InvestmentModal
        isOpen={investmentModal.isOpen}
        asset={investmentModal.asset}
        onClose={handleCloseModal}
        onSubmit={handleInvestmentSubmit}
      />
    </div>
  );
}
