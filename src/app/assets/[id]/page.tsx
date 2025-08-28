'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  TrendingUp, 
  Building, 
  DollarSign, 
  Users, 
  Calendar, 
  MapPin, 
  Shield,
  FileText,
  BarChart3,
  Eye,
  Share2,
  Bookmark
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { InvestmentModal } from '../../../components/ui/investment-modal';
import { DataService } from '../../../services/data';
import { Asset } from '../../../types';
import { formatCurrency, formatNumber, formatDate, getAssetTypeIcon, getRiskLevelColor, getStatusColor } from '../../../lib/utils';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.id as string;

  const [investmentModal, setInvestmentModal] = useState<{
    isOpen: boolean;
    asset: Asset | null;
  }>({
    isOpen: false,
    asset: null
  });

  // Get asset data - in a real app, this would be an API call
  const asset = DataService.getAssetById(assetId);

  if (!asset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Asset not found</h2>
          <p className="text-gray-500 mb-4">The asset you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/assets')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assets
          </Button>
        </div>
      </div>
    );
  }

  const handleInvest = () => {
    setInvestmentModal({
      isOpen: true,
      asset
    });
  };

  const handleInvestmentSubmit = async (amount: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert(`Successfully invested ${formatCurrency(amount)} in ${asset.name}!`);
  };

  const closeInvestmentModal = () => {
    setInvestmentModal({
      isOpen: false,
      asset: null
    });
  };

  const getAssetSpecificDetails = () => {
    switch (asset.type) {
      case 'renewable_energy':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Technology Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Technology:</span>
                    <span className="font-medium">{(asset as any).technology || 'Advanced Renewable Tech'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grid Integration:</span>
                    <span className="font-medium">{(asset as any).gridIntegration || 'Yes'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Government Incentives:</span>
                    <span className="font-medium">{(asset as any).governmentIncentives || 'Federal & State'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Environmental Impact:</span>
                    <span className="font-medium">{(asset as any).environmentalImpact || 'CO2 reduction: 15,000 tons/year'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        );

      case 'real_estate':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Property Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Types:</span>
                    <span className="font-medium">{(asset as any).propertyTypes || 'Commercial Real Estate'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Occupancy Rate:</span>
                    <span className="font-medium">{(asset as any).occupancyRate || '95%'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Lease Term:</span>
                    <span className="font-medium">{(asset as any).averageLeaseTerm || '5 years'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Market Area:</span>
                    <span className="font-medium">{(asset as any).marketArea || 'Urban Core'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        );

      case 'infrastructure':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Project Types:</span>
                    <span className="font-medium">{(asset as any).projectTypes || 'Transportation & Utilities'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Government Backing:</span>
                    <span className="font-medium">{(asset as any).governmentBacking || 'Yes'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completion Status:</span>
                    <span className="font-medium">{(asset as any).completionStatus || '75% Complete'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Economic Impact:</span>
                    <span className="font-medium">{(asset as any).economicImpact || 'Job creation: 500+ positions'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        );

      case 'technology':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Technology Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Market Traction:</span>
                    <span className="font-medium">{(asset as any).marketTraction || 'Growing rapidly'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Growth Rate:</span>
                    <span className="font-medium">{(asset as any).growthRate || '25% YoY'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Intellectual Property:</span>
                    <span className="font-medium">{(asset as any).intellectualProperty || 'Multiple patents'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        );

      case 'healthcare':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Healthcare Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Healthcare Tenants:</span>
                    <span className="font-medium">{(asset as any).healthcareTenants || 'Major hospital systems'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Regulatory Compliance:</span>
                    <span className="font-medium">{(asset as any).regulatoryCompliance || 'HIPAA & FDA compliant'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Market Demand:</span>
                    <span className="font-medium">{(asset as any).marketDemand || 'High - aging population'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/assets')}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{asset.name}</h1>
                <p className="text-gray-600">{asset.sector} • {asset.issuer}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button size="lg" onClick={handleInvest}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Invest Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Asset Image and Basic Info */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-6xl">{getAssetTypeIcon(asset.type)}</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">Asset Overview</h2>
                      <p className="text-gray-600">{asset.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Risk Level</p>
                        <Badge className={getRiskLevelColor(asset.riskLevel)}>
                          {asset.riskLevel}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <Badge className={getStatusColor(asset.status)}>
                          {asset.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{formatCurrency(asset.value)}</div>
                    <p className="text-sm text-gray-600">Total Value</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{asset.yield}%</div>
                    <p className="text-sm text-gray-600">Annual Yield</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{formatNumber(asset.tokens)}</div>
                    <p className="text-sm text-gray-600">Total Tokens</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{asset.investors}</div>
                    <p className="text-sm text-gray-600">Investors</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asset-Specific Details */}
            {getAssetSpecificDetails()}

            {/* Investment Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Minimum Investment:</span>
                      <span className="font-medium">{formatCurrency(asset.minInvestment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maximum Investment:</span>
                      <span className="font-medium">{formatCurrency(asset.maxInvestment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining Tokens:</span>
                      <span className="font-medium">{formatNumber(asset.remainingTokens)}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Token Symbol:</span>
                      <span className="font-medium">{asset.tokenSymbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maturity:</span>
                      <span className="font-medium">{asset.maturity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Inception Date:</span>
                      <span className="font-medium">{formatDate(asset.inceptionDate)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Performance History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Performance chart will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Investment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Asset Value:</span>
                  <span className="font-medium">{formatCurrency(asset.value)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Your Investment:</span>
                  <span className="font-medium">$0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tokens Owned:</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projected Annual Return:</span>
                    <span className="font-medium text-green-600">{asset.yield}%</span>
                  </div>
                </div>
                <Button onClick={handleInvest} className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Invest Now
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Location</span>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm">{asset.location}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Documents</span>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm">{asset.documents} files</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Valuation</span>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm">{formatDate(asset.lastValuation)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Compliance</span>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-gray-400 mr-1" />
                    <Badge variant="outline">{asset.complianceStatus}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Risk Level</span>
                    <Badge className={getRiskLevelColor(asset.riskLevel)}>
                      {asset.riskLevel}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        asset.riskLevel === 'low' ? 'bg-green-500' :
                        asset.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: asset.riskLevel === 'low' ? '25%' :
                               asset.riskLevel === 'medium' ? '50%' : '75%'
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {asset.riskLevel === 'low' ? 'Conservative investment with stable returns' :
                     asset.riskLevel === 'medium' ? 'Balanced risk-reward profile' :
                     'Higher risk with potential for higher returns'}
                  </p>
                </div>
              </CardContent>
            </Card>
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
