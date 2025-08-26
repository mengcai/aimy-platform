'use client';

import React, { useState } from 'react';
import { 
  Shell, 
  PageHeader, 
  Section,
  DataCard,
  AChartBar
} from '@/components/ui';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  DollarSign, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText,
  Building,
  MapPin,
  Target,
  Lock,
  Globe,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for demonstration
const offers = [
  {
    id: 'OFFER-001',
    asset: 'Solar Farm Alpha',
    assetType: 'solar_energy',
    status: 'active',
    price: 100,
    minTicket: 1000,
    maxTicket: 100000,
    totalAmount: 5000000,
    raisedAmount: 3200000,
    lockupPeriod: 12,
    jurisdictions: ['US', 'EU', 'UK'],
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    investors: 45,
    complianceStatus: 'approved',
    createdAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'OFFER-002',
    asset: 'Wind Energy Beta',
    assetType: 'wind_energy',
    status: 'draft',
    price: 150,
    minTicket: 5000,
    maxTicket: 500000,
    totalAmount: 8000000,
    raisedAmount: 0,
    lockupPeriod: 24,
    jurisdictions: ['US', 'Canada'],
    startDate: '2024-02-01',
    endDate: '2024-04-01',
    investors: 0,
    complianceStatus: 'pending',
    createdAt: '2024-01-05T14:30:00Z',
  },
  {
    id: 'OFFER-003',
    asset: 'Real Estate Gamma',
    assetType: 'real_estate',
    status: 'completed',
    price: 200,
    minTicket: 2500,
    maxTicket: 250000,
    totalAmount: 3000000,
    raisedAmount: 3000000,
    lockupPeriod: 36,
    jurisdictions: ['US', 'EU'],
    startDate: '2023-10-01',
    endDate: '2023-12-01',
    investors: 28,
    complianceStatus: 'approved',
    createdAt: '2023-09-15T09:00:00Z',
  },
  {
    id: 'OFFER-004',
    asset: 'Infrastructure Delta',
    assetType: 'infrastructure',
    status: 'paused',
    price: 75,
    minTicket: 10000,
    maxTicket: 1000000,
    totalAmount: 12000000,
    raisedAmount: 8000000,
    lockupPeriod: 18,
    jurisdictions: ['US', 'UK', 'Australia'],
    startDate: '2024-01-01',
    endDate: '2024-06-01',
    investors: 32,
    complianceStatus: 'under_review',
    createdAt: '2023-12-20T16:45:00Z',
  },
];

const offerStatuses = [
  { value: 'draft', label: 'Draft', color: 'default' },
  { value: 'pending', label: 'Pending Review', color: 'warning' },
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'paused', label: 'Paused', color: 'warning' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'destructive' },
];

const complianceStatuses = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'under_review', label: 'Under Review', color: 'warning' },
  { value: 'approved', label: 'Approved', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'destructive' },
];

const assetTypes = [
  { value: 'solar_energy', label: 'Solar Energy', icon: '☀️' },
  { value: 'wind_energy', label: 'Wind Energy', icon: '💨' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏢' },
  { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
  { value: 'commodities', label: 'Commodities', icon: '📦' },
];

const jurisdictions = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'EU', name: 'European Union', flag: '🇪🇺' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'Canada', name: 'Canada', flag: '🇨🇦' },
  { code: 'Australia', name: 'Australia', flag: '🇦🇺' },
  { code: 'Singapore', name: 'Singapore', flag: '🇸🇬' },
];

const monthlyPerformance = [
  { month: 'Jan', offers: 3, raised: 2500000, investors: 45 },
  { month: 'Feb', offers: 2, raised: 1800000, investors: 32 },
  { month: 'Mar', offers: 4, raised: 3200000, investors: 58 },
  { month: 'Apr', offers: 3, raised: 2800000, investors: 41 },
  { month: 'May', offers: 5, raised: 4500000, investors: 67 },
  { month: 'Jun', offers: 4, raised: 3800000, investors: 52 },
];

export default function IssuerOffersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAssetType, setSelectedAssetType] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    asset: '',
    assetType: '',
    price: '',
    minTicket: '',
    maxTicket: '',
    totalAmount: '',
    lockupPeriod: '',
    jurisdictions: [] as string[],
    startDate: '',
    endDate: '',
  });

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || offer.status === selectedStatus;
    const matchesAssetType = selectedAssetType === 'all' || offer.assetType === selectedAssetType;
    return matchesSearch && matchesStatus && matchesAssetType;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'pending': return 'warning';
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getComplianceVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'under_review': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'destructive';
      default: return 'default';
    }
  };

  const getAssetTypeIcon = (type: string) => {
    const assetType = assetTypes.find(t => t.value === type);
    return assetType?.icon || '📊';
  };

  const getJurisdictionFlag = (code: string) => {
    const jurisdiction = jurisdictions.find(j => j.code === code);
    return jurisdiction?.flag || '🌍';
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

  const calculateProgress = (raised: number, total: number) => {
    return Math.round((raised / total) * 100);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleJurisdictionToggle = (code: string) => {
    setFormData(prev => ({
      ...prev,
      jurisdictions: prev.jurisdictions.includes(code)
        ? prev.jurisdictions.filter(j => j !== code)
        : [...prev.jurisdictions, code]
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const createOffer = () => {
    // In a real app, this would create the offer
    console.log('Creating offer:', formData);
    setIsCreateDialogOpen(false);
    setCurrentStep(1);
    setFormData({
      asset: '',
      assetType: '',
      price: '',
      minTicket: '',
      maxTicket: '',
      totalAmount: '',
      lockupPeriod: '',
      jurisdictions: [],
      startDate: '',
      endDate: '',
    });
  };

  return (
    <Shell variant="default">
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Primary Offerings"
          subtitle="Create and manage primary market offerings"
          description="Build primary offerings with pricing, terms, and jurisdiction controls"
          actions={
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Offering
            </Button>
          }
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DataCard
            title="Active Offerings"
            subtitle="Currently fundraising"
            value={offers.filter(o => o.status === 'active').length}
            description="Across all asset types"
            icon={<TrendingUp className="h-6 w-6 text-aimy-primary" />}
            variant="default"
          />
          
          <DataCard
            title="Total Raised"
            subtitle="This month"
            value={formatCurrency(3200000)}
            change="+15.2%"
            description="vs last month"
            icon={<DollarSign className="h-6 w-6 text-success-500" />}
            variant="success"
          />
          
          <DataCard
            title="New Investors"
            subtitle="This month"
            value={45}
            change="+8"
            description="vs last month"
            icon={<Users className="h-6 w-6 text-aimy-secondary" />}
            variant="default"
          />
          
          <DataCard
            title="Avg. Lockup"
            subtitle="Period in months"
            value="22.5"
            description="Across all offerings"
            icon={<Lock className="h-6 w-6 text-aimy-accent" />}
            variant="default"
          />
        </div>

        {/* Performance Chart */}
        <AChartBar
          title="Monthly Performance"
          subtitle="Offers, capital raised, and investor acquisition"
          data={monthlyPerformance}
          bars={[
            { key: 'offers', name: 'New Offers', color: '#6366f1' },
            { key: 'raised', name: 'Capital Raised', color: '#22c55e' },
            { key: 'investors', name: 'New Investors', color: '#8b5cf6' },
          ]}
          xAxisKey="month"
          height={300}
        />

        {/* Offers Management */}
        <Section
          title="Primary Offerings"
          subtitle="Manage and monitor primary market offerings"
          variant="bordered"
        >
          {/* Filters and Search */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-ink-400" />
              <Input
                placeholder="Search offerings..."
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
              {offerStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            
            <select
              value={selectedAssetType}
              onChange={(e) => setSelectedAssetType(e.target.value)}
              className="px-3 py-2 border border-base-ink-200 dark:border-base-ink-800 rounded-md bg-base-bg-100 dark:bg-base-bg-100 text-base-ink-900 dark:text-base-ink-100"
            >
              <option value="all">All Asset Types</option>
              {assetTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>

          {/* Offers Table */}
          <div className="rounded-lg border border-base-ink-200 dark:border-base-ink-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Offer ID</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Lockup</TableHead>
                  <TableHead>Jurisdictions</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOffers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <p className="font-mono text-sm font-medium text-base-ink-900 dark:text-base-ink-100">
                        {offer.id}
                      </p>
                      <p className="text-xs text-base-ink-600 dark:text-base-ink-400">
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getAssetTypeIcon(offer.assetType)}</span>
                        <div>
                          <p className="font-medium text-base-ink-900 dark:text-base-ink-100">
                            {offer.asset}
                          </p>
                          <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                            {offer.assetType.replace('_', ' ').toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(offer.status) as any}>
                        {offer.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-base-ink-900 dark:text-base-ink-100">
                        ${offer.price}
                      </p>
                      <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                        Min: ${formatNumber(offer.minTicket)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{formatCurrency(offer.raisedAmount)}</span>
                          <span>{formatCurrency(offer.totalAmount)}</span>
                        </div>
                        <div className="w-full bg-base-ink-200 dark:bg-base-ink-800 rounded-full h-2">
                          <div
                            className="bg-aimy-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${calculateProgress(offer.raisedAmount, offer.totalAmount)}%` }}
                          />
                        </div>
                        <p className="text-xs text-base-ink-600 dark:text-base-ink-400">
                          {calculateProgress(offer.raisedAmount, offer.totalAmount)}% raised
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4 text-base-ink-400" />
                        <span className="text-sm text-base-ink-900 dark:text-base-ink-100">
                          {offer.lockupPeriod} months
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {offer.jurisdictions.map((code) => (
                          <span key={code} className="text-sm">
                            {getJurisdictionFlag(code)}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getComplianceVariant(offer.complianceStatus) as any}>
                        {offer.complianceStatus.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
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
        </Section>

        {/* Create New Offering Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Primary Offering</DialogTitle>
              <DialogDescription>
                Build a primary offering with pricing, terms, and jurisdiction controls
              </DialogDescription>
            </DialogHeader>
            
            <Tabs value={`step-${currentStep}`} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="step-1" disabled={currentStep < 1}>Basic Info</TabsTrigger>
                <TabsTrigger value="step-2" disabled={currentStep < 2}>Financial Terms</TabsTrigger>
                <TabsTrigger value="step-3" disabled={currentStep < 3}>Jurisdictions</TabsTrigger>
                <TabsTrigger value="step-4" disabled={currentStep < 4}>Review</TabsTrigger>
              </TabsList>
              
              <TabsContent value="step-1" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Asset</label>
                    <Input
                      placeholder="Enter asset name"
                      value={formData.asset}
                      onChange={(e) => handleInputChange('asset', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Asset Type</label>
                    <select
                      value={formData.assetType}
                      onChange={(e) => handleInputChange('assetType', e.target.value)}
                      className="w-full px-3 py-2 border border-base-ink-200 dark:border-base-ink-800 rounded-md bg-base-bg-100 dark:bg-base-bg-100 text-base-ink-900 dark:text-base-ink-100"
                    >
                      <option value="">Select asset type</option>
                      {assetTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="step-2" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Token Price ($)</label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Amount ($)</label>
                    <Input
                      type="number"
                      placeholder="5000000"
                      value={formData.totalAmount}
                      onChange={(e) => handleInputChange('totalAmount', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum Ticket ($)</label>
                    <Input
                      type="number"
                      placeholder="1000"
                      value={formData.minTicket}
                      onChange={(e) => handleInputChange('minTicket', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Maximum Ticket ($)</label>
                    <Input
                      type="number"
                      placeholder="100000"
                      value={formData.maxTicket}
                      onChange={(e) => handleInputChange('maxTicket', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lockup Period (months)</label>
                  <Input
                    type="number"
                    placeholder="12"
                    value={formData.lockupPeriod}
                    onChange={(e) => handleInputChange('lockupPeriod', e.target.value)}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="step-3" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Jurisdictions</label>
                  <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                    Choose which jurisdictions can participate in this offering
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {jurisdictions.map((jurisdiction) => (
                    <div
                      key={jurisdiction.code}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.jurisdictions.includes(jurisdiction.code)
                          ? 'border-aimy-primary bg-aimy-primary/10'
                          : 'border-base-ink-200 dark:border-base-ink-800 hover:border-base-ink-300 dark:hover:border-base-ink-700'
                      }`}
                      onClick={() => handleJurisdictionToggle(jurisdiction.code)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{jurisdiction.flag}</span>
                        <div>
                          <p className="font-medium text-base-ink-900 dark:text-base-ink-100">
                            {jurisdiction.name}
                          </p>
                          <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                            {jurisdiction.code}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="step-4" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Offering Summary</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p><strong>Asset:</strong> {formData.asset || 'Not specified'}</p>
                        <p><strong>Type:</strong> {formData.assetType ? assetTypes.find(t => t.value === formData.assetType)?.label : 'Not specified'}</p>
                        <p><strong>Start Date:</strong> {formData.startDate || 'Not specified'}</p>
                        <p><strong>End Date:</strong> {formData.endDate || 'Not specified'}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Financial Terms</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p><strong>Price:</strong> ${formData.price || 'Not specified'}</p>
                        <p><strong>Total Amount:</strong> {formData.totalAmount ? formatCurrency(Number(formData.totalAmount)) : 'Not specified'}</p>
                        <p><strong>Min Ticket:</strong> {formData.minTicket ? formatCurrency(Number(formData.minTicket)) : 'Not specified'}</p>
                        <p><strong>Max Ticket:</strong> {formData.maxTicket ? formatCurrency(Number(formData.maxTicket)) : 'Not specified'}</p>
                        <p><strong>Lockup:</strong> {formData.lockupPeriod || 'Not specified'} months</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Jurisdictions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {formData.jurisdictions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {formData.jurisdictions.map((code) => {
                            const jurisdiction = jurisdictions.find(j => j.code === code);
                            return (
                              <div key={code} className="flex items-center space-x-2 px-3 py-1 bg-aimy-primary/10 border border-aimy-primary/20 rounded-full">
                                <span>{jurisdiction?.flag}</span>
                                <span className="text-sm font-medium">{jurisdiction?.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-base-ink-600 dark:text-base-ink-400">No jurisdictions selected</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <div className="flex justify-between w-full">
                <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                  Previous
                </Button>
                
                <div className="flex space-x-2">
                  {currentStep < 4 ? (
                    <Button onClick={nextStep}>
                      Next
                    </Button>
                  ) : (
                    <Button onClick={createOffer}>
                      Create Offering
                    </Button>
                  )}
                  
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}
