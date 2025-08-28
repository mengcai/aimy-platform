'use client';

import React from 'react';
import { 
  Shell, 
  PageHeader, 
  Stat, 
  DataCard, 
  Section,
  AChartLine,
  KeyValue
} from '@/components/ui';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Shield, 
  FileText,
  Calendar,
  MapPin,
  Building,
  Download,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for demonstration
const assetData = {
  id: 'solar-farm-alpha',
  name: 'Solar Farm Alpha',
  type: 'renewable_energy',
  status: 'active',
  location: 'California, USA',
  capacity: '50 MW',
  totalValue: 25000000,
  currentValue: 27500000,
  yield: 8.5,
  riskScore: 'Low',
  inceptionDate: '2023-01-15',
  maturityDate: '2033-01-15',
  issuer: 'SolarTech Energy Corp',
  documents: [
    { id: 1, name: 'Asset Prospectus', type: 'pdf', size: '2.4 MB', uploaded: '2023-12-01' },
    { id: 2, name: 'Financial Reports Q4 2023', type: 'pdf', size: '1.8 MB', uploaded: '2023-12-15' },
    { id: 3, name: 'Environmental Impact Assessment', type: 'pdf', size: '3.2 MB', uploaded: '2023-11-20' },
    { id: 4, name: 'Technical Specifications', type: 'pdf', size: '1.5 MB', uploaded: '2023-10-10' },
  ],
  onChainEvents: [
    { id: 1, type: 'token_mint', description: '100,000 tokens minted', timestamp: '2023-12-20T10:30:00Z', txHash: '0x1234...5678' },
    { id: 2, type: 'yield_distribution', description: 'Monthly yield distributed', timestamp: '2023-12-15T14:20:00Z', txHash: '0x8765...4321' },
    { id: 3, type: 'compliance_check', description: 'Quarterly compliance verification', timestamp: '2023-12-10T09:15:00Z', txHash: '0xabcd...efgh' },
  ],
  performanceData: [
    { month: 'Jan', value: 25000000, yield: 0.7 },
    { month: 'Feb', value: 25200000, yield: 0.8 },
    { month: 'Mar', value: 25400000, yield: 0.8 },
    { month: 'Apr', value: 25700000, yield: 0.9 },
    { month: 'May', value: 26000000, yield: 0.9 },
    { month: 'Jun', value: 27500000, yield: 1.1 },
  ],
  riskMetrics: {
    marketRisk: 'Low',
    operationalRisk: 'Low',
    regulatoryRisk: 'Medium',
    technologyRisk: 'Low',
    environmentalRisk: 'Low',
  }
};

export default function AssetDetailPage({ params }: { params: { id: string } }) {
  const asset = assetData; // In real app, fetch by params.id

  return (
    <Shell variant="default">
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title={asset.name}
          subtitle={`${asset.type.replace('_', ' ').toUpperCase()} • ${asset.location}`}
          description={`${asset.capacity} capacity • Managed by ${asset.issuer}`}
          status={{ label: asset.status, variant: 'success' }}
          actions={
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button>
                <Eye className="mr-2 h-4 w-4" />
                View on Blockchain
              </Button>
            </div>
          }
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Current Value"
            value={`$${(asset.currentValue / 1000000).toFixed(1)}M`}
            description="Market value"
            change={{ value: 10.0, period: 'vs inception', type: 'increase' }}
            icon={<DollarSign className="h-6 w-6 text-aimy-primary" />}
            variant="success"
          />
          
          <Stat
            label="Annual Yield"
            value={`${asset.yield}%`}
            description="Current yield rate"
            change={{ value: 0.3, period: 'vs last month', type: 'increase' }}
            icon={<Target className="h-6 w-6 text-aimy-accent" />}
            variant="success"
          />
          
          <Stat
            label="Risk Score"
            value={asset.riskScore}
            description="AI-assessed risk level"
            icon={<Shield className="h-6 w-6 text-success-500" />}
            variant="success"
          />
          
          <Stat
            label="Days to Maturity"
            value="3,285"
            description="Time remaining"
            icon={<Calendar className="h-6 w-6 text-warning-500" />}
          />
        </div>

        {/* Performance Chart */}
        <AChartLine
          title="Asset Performance"
          subtitle="Value and yield progression over time"
          data={asset.performanceData}
          lines={[
            { key: 'value', color: '#6366f1', name: 'Asset Value' },
            { key: 'yield', color: '#22c55e', name: 'Monthly Yield %' }
          ]}
          xAxisKey="month"
          height={400}
          change={{ value: 10.0, period: '6 months', type: 'increase' }}
        />

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="onchain">On-Chain Events</TabsTrigger>
            <TabsTrigger value="trade">Trade</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Asset Details */}
              <Section title="Asset Details" variant="bordered">
                <div className="space-y-4">
                  <KeyValue label="Asset Type" value={asset.type.replace('_', ' ').toUpperCase()} />
                  <KeyValue label="Location" value={asset.location} />
                  <KeyValue label="Capacity" value={asset.capacity} />
                  <KeyValue label="Issuer" value={asset.issuer} />
                  <KeyValue label="Inception Date" value={asset.inceptionDate} type="date" />
                  <KeyValue label="Maturity Date" value={asset.maturityDate} type="date" />
                </div>
              </Section>

              {/* Risk Metrics */}
              <Section title="Risk Assessment" variant="bordered">
                <div className="space-y-4">
                  <KeyValue label="Market Risk" value={asset.riskMetrics.marketRisk} status={{ label: asset.riskMetrics.marketRisk, variant: 'success' }} />
                  <KeyValue label="Operational Risk" value={asset.riskMetrics.operationalRisk} status={{ label: asset.riskMetrics.operationalRisk, variant: 'success' }} />
                  <KeyValue label="Regulatory Risk" value={asset.riskMetrics.regulatoryRisk} status={{ label: asset.riskMetrics.regulatoryRisk, variant: 'warning' }} />
                  <KeyValue label="Technology Risk" value={asset.riskMetrics.technologyRisk} status={{ label: asset.riskMetrics.technologyRisk, variant: 'success' }} />
                  <KeyValue label="Environmental Risk" value={asset.riskMetrics.environmentalRisk} status={{ label: asset.riskMetrics.environmentalRisk, variant: 'success' }} />
                </div>
              </Section>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Section title="Asset Documents" variant="bordered">
              <div className="space-y-3">
                {asset.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-base-ink-200 dark:border-base-ink-800 bg-base-bg-50 dark:bg-base-bg-50"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-aimy-primary" />
                      <div>
                        <p className="font-medium text-base-ink-900 dark:text-base-ink-100">
                          {doc.name}
                        </p>
                        <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                          {doc.size} • {new Date(doc.uploaded).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="onchain" className="space-y-6">
            <Section title="On-Chain Events" variant="bordered">
              <div className="space-y-3">
                {asset.onChainEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-base-ink-200 dark:border-base-ink-800 bg-base-bg-50 dark:bg-base-bg-50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 rounded-full bg-aimy-primary" />
                      <div>
                        <p className="font-medium text-base-ink-900 dark:text-base-ink-100">
                          {event.description}
                        </p>
                        <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                        <p className="text-xs text-base-ink-500 dark:text-base-ink-400 font-mono">
                          {event.txHash}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View on Explorer
                    </Button>
                  </div>
                ))}
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="trade" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Primary Market */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5" />
                    <span>Primary Market</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-success-50 dark:bg-success-950/20 border border-success-200 dark:border-success-800">
                    <p className="text-sm font-medium text-success-900 dark:text-success-100">
                      Available for Subscription
                    </p>
                    <p className="text-sm text-success-700 dark:text-success-300">
                      Minimum investment: $10,000
                    </p>
                  </div>
                  <Button className="w-full">
                    Subscribe Now
                  </Button>
                </CardContent>
              </Card>

              {/* Secondary Market */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Secondary Market</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-warning-50 dark:bg-warning-950/20 border border-warning-200 dark:border-warning-800">
                    <p className="text-sm font-medium text-warning-900 dark:text-warning-100">
                      Trading Available
                    </p>
                    <p className="text-sm text-warning-700 dark:text-warning-300">
                      Current price: $27.50 per token
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full">
                      Buy
                    </Button>
                    <Button variant="outline" className="w-full">
                      Sell
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Shell>
  );
}
