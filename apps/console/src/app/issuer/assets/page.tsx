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
  Building,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for demonstration
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
  },
  {
    id: 'real-estate-fund-beta',
    name: 'Real Estate Fund Beta',
    type: 'real_estate',
    status: 'pending',
    location: 'New York, USA',
    value: 15000000,
    tokens: 600000,
    yield: 6.2,
    inceptionDate: '2023-03-20',
    complianceStatus: 'pending',
    documents: 2,
  },
  {
    id: 'infrastructure-bonds-gamma',
    name: 'Infrastructure Bonds Gamma',
    type: 'infrastructure',
    status: 'draft',
    location: 'Texas, USA',
    value: 8000000,
    tokens: 320000,
    yield: 5.8,
    inceptionDate: '2023-06-10',
    complianceStatus: 'draft',
    documents: 1,
  },
];

const assetTypes = [
  { value: 'renewable_energy', label: 'Renewable Energy', icon: '🌞' },
  { value: 'real_estate', label: 'Real Estate', icon: '🏢' },
  { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
  { value: 'commodities', label: 'Commodities', icon: '⛏️' },
  { value: 'intellectual_property', label: 'Intellectual Property', icon: '💡' },
];

const assetPerformance = [
  { month: 'Jan', solar: 25000000, realEstate: 15000000, infrastructure: 8000000 },
  { month: 'Feb', solar: 25200000, realEstate: 15100000, infrastructure: 8050000 },
  { month: 'Mar', solar: 25400000, realEstate: 15200000, infrastructure: 8100000 },
  { month: 'Apr', solar: 25700000, realEstate: 15300000, infrastructure: 8150000 },
  { month: 'May', solar: 26000000, realEstate: 15400000, infrastructure: 8200000 },
  { month: 'Jun', solar: 27500000, realEstate: 15500000, infrastructure: 8250000 },
];

export default function IssuerAssetsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || asset.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'draft': return 'secondary';
      default: return 'default';
    }
  };

  const getComplianceVariant = (status: string) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'draft': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    const assetType = assetTypes.find(t => t.value === type);
    return assetType?.icon || '📊';
  };

  return (
    <Shell variant="default">
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Asset Management"
          subtitle="Create and manage your tokenized assets"
          description="Build, configure, and monitor your real-world asset portfolio"
          actions={
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Asset
            </Button>
          }
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DataCard
            title="Total Assets"
            subtitle="Active tokenized assets"
            value={assets.length}
            description="Across all asset types"
            icon={<Building className="h-6 w-6 text-aimy-primary" />}
            variant="default"
          />
          
          <DataCard
            title="Total Value"
            subtitle="Combined asset value"
            value={`$${(assets.reduce((sum, asset) => sum + asset.value, 0) / 1000000).toFixed(1)}M`}
            description="Current market value"
            icon={<DollarSign className="h-6 w-6 text-success-500" />}
            variant="success"
          />
          
          <DataCard
            title="Active Assets"
            subtitle="Fully operational"
            value={assets.filter(a => a.status === 'active').length}
            description="Generating yield"
            icon={<CheckCircle className="h-6 w-6 text-success-500" />}
            variant="success"
          />
          
          <DataCard
            title="Pending Review"
            subtitle="Awaiting approval"
            value={assets.filter(a => a.status === 'pending').length}
            description="Compliance review"
            icon={<Clock className="h-6 w-6 text-warning-500" />}
            variant="warning"
          />
        </div>

        {/* Performance Chart */}
        <AChartBar
          title="Asset Performance Overview"
          subtitle="Monthly value progression by asset type"
          data={assetPerformance}
          bars={[
            { key: 'solar', color: '#22c55e', name: 'Solar Energy' },
            { key: 'realEstate', color: '#3b82f6', name: 'Real Estate' },
            { key: 'infrastructure', color: '#8b5cf6', name: 'Infrastructure' }
          ]}
          xAxisKey="month"
          height={300}
          change={{ value: 10.0, period: '6 months', type: 'increase' }}
        />

        {/* Asset Management */}
        <Section
          title="Asset Portfolio"
          subtitle="Manage your tokenized assets"
          variant="bordered"
        >
          {/* Filters and Search */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-ink-400" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-base-ink-200 dark:border-base-ink-800 rounded-md bg-base-bg-100 dark:bg-base-bg-100 text-base-ink-900 dark:text-base-ink-100"
            >
              <option value="all">All Types</option>
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

          {/* Assets Table */}
          <div className="rounded-lg border border-base-ink-200 dark:border-base-ink-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Yield</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getTypeIcon(asset.type)}</div>
                        <div>
                          <p className="font-medium text-base-ink-900 dark:text-base-ink-100">
                            {asset.name}
                          </p>
                          <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                            {asset.location}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {asset.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(asset.status) as any}>
                        {asset.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-base-ink-900 dark:text-base-ink-100">
                        ${(asset.value / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                        {asset.tokens.toLocaleString()} tokens
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-base-ink-900 dark:text-base-ink-100">
                        {asset.yield}%
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getComplianceVariant(asset.complianceStatus) as any}>
                        {asset.complianceStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-base-ink-600 dark:text-base-ink-400">
                          {asset.documents}
                        </span>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
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
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Section>

        {/* Create Asset Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Asset</DialogTitle>
              <DialogDescription>
                Set up a new tokenized asset with comprehensive configuration
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Asset Name</label>
                    <Input placeholder="Enter asset name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Asset Type</label>
                    <select className="w-full px-3 py-2 border border-base-ink-200 dark:border-base-ink-800 rounded-md">
                      {assetTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input placeholder="Enter asset location" />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-base-ink-200 dark:border-base-ink-800 rounded-md"
                    rows={3}
                    placeholder="Describe the asset..."
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="financial" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Total Value</label>
                    <Input placeholder="Enter total value" type="number" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Token Supply</label>
                    <Input placeholder="Enter token supply" type="number" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Expected Yield</label>
                    <Input placeholder="Enter expected yield %" type="number" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Maturity Date</label>
                    <Input type="date" />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <div className="border-2 border-dashed border-base-ink-300 dark:border-base-ink-700 rounded-lg p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-base-ink-400" />
                  <p className="mt-2 text-sm text-base-ink-600 dark:text-base-ink-400">
                    Drag and drop documents here, or click to browse
                  </p>
                  <Button variant="outline" className="mt-4">
                    Browse Files
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="review" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Asset Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Name:</strong> Solar Farm Beta</p>
                    <p><strong>Type:</strong> Renewable Energy</p>
                    <p><strong>Location:</strong> Arizona, USA</p>
                    <p><strong>Value:</strong> $20,000,000</p>
                    <p><strong>Tokens:</strong> 800,000</p>
                    <p><strong>Yield:</strong> 7.5%</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button>
                Create Asset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}
