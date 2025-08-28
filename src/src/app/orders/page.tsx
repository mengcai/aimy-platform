'use client';

import React, { useState } from 'react';
import { 
  Shell, 
  PageHeader, 
  Section,
  DataCard,
  AChartLine
} from '@/components/ui';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Building,
  FileText,
  BarChart3,
  RefreshCw,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for demonstration
const primarySubscriptions = [
  {
    id: 'SUB-001',
    asset: 'Solar Farm Alpha',
    assetType: 'solar_energy',
    type: 'primary',
    status: 'confirmed',
    amount: 5000,
    tokens: 50,
    price: 100,
    date: '2024-01-10T14:30:00Z',
    lockupEnd: '2025-01-10T14:30:00Z',
    expectedYield: 8.5,
    documents: ['subscription_agreement.pdf', 'risk_disclosure.pdf'],
  },
  {
    id: 'SUB-002',
    asset: 'Wind Energy Beta',
    assetType: 'wind_energy',
    type: 'primary',
    status: 'pending',
    amount: 10000,
    tokens: 66.67,
    price: 150,
    date: '2024-01-08T10:15:00Z',
    lockupEnd: '2026-01-08T10:15:00Z',
    expectedYield: 7.2,
    documents: ['subscription_agreement.pdf'],
  },
  {
    id: 'SUB-003',
    asset: 'Real Estate Gamma',
    assetType: 'real_estate',
    type: 'primary',
    status: 'completed',
    amount: 2500,
    tokens: 12.5,
    price: 200,
    date: '2023-12-15T16:45:00Z',
    lockupEnd: '2026-12-15T16:45:00Z',
    expectedYield: 6.8,
    documents: ['subscription_agreement.pdf', 'property_deed.pdf'],
  },
];

const secondaryTrades = [
  {
    id: 'TRADE-001',
    asset: 'Solar Farm Alpha',
    assetType: 'solar_energy',
    type: 'secondary',
    status: 'executed',
    side: 'buy',
    amount: 3000,
    tokens: 30,
    price: 105,
    date: '2024-01-09T11:20:00Z',
    counterparty: 'Investor XYZ',
    fees: 15,
    marketPrice: 105,
  },
  {
    id: 'TRADE-002',
    asset: 'Infrastructure Delta',
    assetType: 'infrastructure',
    type: 'secondary',
    status: 'pending',
    side: 'sell',
    amount: 7500,
    tokens: 100,
    price: 75,
    date: '2024-01-07T09:30:00Z',
    counterparty: 'Investor ABC',
    fees: 37.5,
    marketPrice: 75,
  },
  {
    id: 'TRADE-003',
    asset: 'Wind Energy Beta',
    assetType: 'wind_energy',
    type: 'secondary',
    status: 'cancelled',
    side: 'buy',
    amount: 5000,
    tokens: 33.33,
    price: 150,
    date: '2024-01-05T14:15:00Z',
    counterparty: 'Investor DEF',
    fees: 25,
    marketPrice: 150,
  },
];

const orderStatuses = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'confirmed', label: 'Confirmed', color: 'success' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'destructive' },
  { value: 'executed', label: 'Executed', color: 'success' },
];

const monthlyActivity = [
  { month: 'Jan', subscriptions: 15000, trades: 8000, total: 23000 },
  { month: 'Feb', subscriptions: 12000, trades: 12000, total: 24000 },
  { month: 'Mar', subscriptions: 18000, trades: 9000, total: 27000 },
  { month: 'Apr', subscriptions: 14000, trades: 15000, total: 29000 },
  { month: 'May', subscriptions: 22000, trades: 11000, total: 33000 },
  { month: 'Jun', subscriptions: 16000, trades: 18000, total: 34000 },
];

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [activeTab, setActiveTab] = useState('primary');

  const filteredPrimarySubscriptions = primarySubscriptions.filter(sub => {
    const matchesSearch = sub.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || sub.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredSecondaryTrades = secondaryTrades.filter(trade => {
    const matchesSearch = trade.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || trade.status === selectedStatus;
    const matchesType = selectedType === 'all' || trade.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      case 'executed': return 'success';
      default: return 'default';
    }
  };

  const getSideVariant = (side: string) => {
    return side === 'buy' ? 'success' : 'destructive';
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
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case 'solar_energy': return '☀️';
      case 'wind_energy': return '💨';
      case 'real_estate': return '🏢';
      case 'infrastructure': return '🏗️';
      default: return '📊';
    }
  };

  const getDaysUntilLockup = (lockupEnd: string) => {
    const end = new Date(lockupEnd);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const totalSubscriptions = primarySubscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  const totalTrades = secondaryTrades.reduce((sum, trade) => sum + trade.amount, 0);
  const activeSubscriptions = primarySubscriptions.filter(sub => sub.status === 'confirmed' || sub.status === 'pending').length;
  const pendingTrades = secondaryTrades.filter(trade => trade.status === 'pending').length;

  return (
    <Shell variant="default">
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Orders & Trades"
          subtitle="Primary subscriptions and secondary market activity"
          description="Track your investment orders, subscription status, and secondary market trades"
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DataCard
            title="Total Subscriptions"
            subtitle="Primary market investments"
            value={formatCurrency(totalSubscriptions)}
            description="Across all assets"
            icon={<TrendingUp className="h-6 w-6 text-aimy-primary" />}
            variant="default"
          />
          
          <DataCard
            title="Secondary Trades"
            subtitle="Market trading volume"
            value={formatCurrency(totalTrades)}
            description="Buy/sell activity"
            icon={<BarChart3 className="h-6 w-6 text-aimy-secondary" />}
            variant="default"
          />
          
          <DataCard
            title="Active Subscriptions"
            subtitle="Confirmed and pending"
            value={activeSubscriptions}
            description="Active positions"
            icon={<CheckCircle className="h-6 w-6 text-success-500" />}
            variant="success"
          />
          
          <DataCard
            title="Pending Trades"
            subtitle="Awaiting execution"
            value={pendingTrades}
            description="In queue"
            icon={<Clock className="h-6 w-6 text-warning-500" />}
            variant="warning"
          />
        </div>

        {/* Activity Chart */}
        <AChartLine
          title="Monthly Activity"
          subtitle="Subscription and trading volume over time"
          data={monthlyActivity}
          lines={[
            { key: 'subscriptions', name: 'Primary Subscriptions', color: '#6366f1' },
            { key: 'trades', name: 'Secondary Trades', color: '#8b5cf6' },
            { key: 'total', name: 'Total Activity', color: '#06b6d4' },
          ]}
          xAxisKey="month"
          height={300}
        />

        {/* Orders Management */}
        <Section
          title="Investment Orders"
          subtitle="Manage primary subscriptions and secondary trades"
          variant="bordered"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="primary">Primary Subscriptions</TabsTrigger>
              <TabsTrigger value="secondary">Secondary Trades</TabsTrigger>
            </TabsList>
            
            <TabsContent value="primary" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-ink-400" />
                  <Input
                    placeholder="Search subscriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-base-ink-200 dark:border-base-ink-800 rounded-md bg-base-bg-100 dark:bg-base-bg-100 text-base-ink-900 dark:text-base-ink-100"
                >
                  <option value="all">All Statuses</option>
                  {orderStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
              </div>

              {/* Subscriptions Table */}
              <div className="rounded-lg border border-base-ink-200 dark:border-base-ink-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Tokens</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Lockup</TableHead>
                      <TableHead>Yield</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPrimarySubscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <p className="font-mono text-sm font-medium text-base-ink-900 dark:text-base-ink-100">
                            {sub.id}
                          </p>
                          <p className="text-xs text-base-ink-600 dark:text-base-ink-400">
                            {new Date(sub.date).toLocaleDateString()}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getAssetTypeIcon(sub.assetType)}</span>
                            <div>
                              <p className="font-medium text-base-ink-900 dark:text-base-ink-100">
                                {sub.asset}
                              </p>
                              <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                                {sub.assetType.replace('_', ' ').toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(sub.status) as any}>
                            {sub.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-base-ink-900 dark:text-base-ink-100">
                            {formatCurrency(sub.amount)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-base-ink-900 dark:text-base-ink-100">
                            {formatNumber(sub.tokens)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-base-ink-900 dark:text-base-ink-100">
                            ${sub.price}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Lock className="h-4 w-4 text-base-ink-400" />
                            <span className="text-sm text-base-ink-900 dark:text-base-ink-100">
                              {getDaysUntilLockup(sub.lockupEnd)} days
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-success-600 dark:text-success-400 font-medium">
                            {sub.expectedYield}%
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="secondary" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-ink-400" />
                  <Input
                    placeholder="Search trades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-base-ink-200 dark:border-base-ink-800 rounded-md bg-base-bg-100 dark:bg-base-bg-100 text-base-ink-900 dark:text-base-ink-100"
                >
                  <option value="all">All Statuses</option>
                  {orderStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-base-ink-200 dark:border-base-ink-800 rounded-md bg-base-bg-100 dark:bg-base-bg-100 text-base-ink-900 dark:text-base-ink-100"
                >
                  <option value="all">All Types</option>
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
                
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  More Filters
                </Button>
              </div>

              {/* Trades Table */}
              <div className="rounded-lg border border-base-ink-200 dark:border-base-ink-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trade ID</TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead>Side</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Tokens</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Fees</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSecondaryTrades.map((trade) => (
                      <TableRow key={trade.id}>
                        <TableCell>
                          <p className="font-mono text-sm font-medium text-base-ink-900 dark:text-base-ink-100">
                            {trade.id}
                          </p>
                          <p className="text-xs text-base-ink-600 dark:text-base-ink-400">
                            {new Date(trade.date).toLocaleDateString()}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getAssetTypeIcon(trade.assetType)}</span>
                            <div>
                              <p className="font-medium text-base-ink-900 dark:text-base-ink-100">
                                {trade.asset}
                              </p>
                              <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                                {trade.assetType.replace('_', ' ').toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSideVariant(trade.side) as any}>
                            {trade.side.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(trade.status) as any}>
                            {trade.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-base-ink-900 dark:text-base-ink-100">
                            {formatCurrency(trade.amount)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-base-ink-900 dark:text-base-ink-100">
                            {formatNumber(trade.tokens)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm text-base-ink-900 dark:text-base-ink-100">
                              ${trade.price}
                            </p>
                            <p className="text-xs text-base-ink-600 dark:text-base-ink-400">
                              Market: ${trade.marketPrice}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                            {formatCurrency(trade.fees)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                            {trade.status === 'pending' && (
                              <Button variant="ghost" size="sm">
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </Section>

        {/* Quick Actions */}
        <Section
          title="Quick Actions"
          subtitle="Common investment and trading actions"
          variant="bordered"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-aimy-primary" />
                  <span>New Subscription</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-base-ink-600 dark:text-base-ink-400 mb-3">
                  Subscribe to new primary offerings
                </p>
                <Button className="w-full" size="sm">
                  Browse Offerings
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-aimy-secondary" />
                  <span>Place Trade</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-base-ink-600 dark:text-base-ink-400 mb-3">
                  Buy or sell on secondary market
                </p>
                <Button variant="outline" className="w-full" size="sm">
                  View Market
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5 text-aimy-accent" />
                  <span>Export Orders</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-base-ink-600 dark:text-base-ink-400 mb-3">
                  Download order history and reports
                </p>
                <Button variant="outline" className="w-full" size="sm">
                  Export Data
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-success-500" />
                  <span>Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-base-ink-600 dark:text-base-ink-400 mb-3">
                  Access subscription agreements and reports
                </p>
                <Button variant="outline" className="w-full" size="sm">
                  View Documents
                </Button>
              </CardContent>
            </Card>
          </div>
        </Section>
      </div>
    </Shell>
  );
}
