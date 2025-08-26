'use client';

import React, { useState } from 'react';
import { 
  Shell, 
  PageHeader, 
  Section,
  DataCard,
  AChartLine,
  AChartBar,
  AChartPie
} from '@/components/ui';
import { 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building,
  Shield,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Filter,
  Search,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for demonstration
const portfolioValue = [
  { date: '2024-01-01', value: 12500000, assets: 45, investors: 1200 },
  { date: '2024-01-02', value: 12550000, assets: 45, investors: 1205 },
  { date: '2024-01-03', value: 12620000, assets: 46, investors: 1210 },
  { date: '2024-01-04', value: 12580000, assets: 46, investors: 1212 },
  { date: '2024-01-05', value: 12650000, assets: 47, investors: 1215 },
  { date: '2024-01-06', value: 12710000, assets: 47, investors: 1220 },
  { date: '2024-01-07', value: 12780000, assets: 48, investors: 1225 },
];

const assetAllocation = [
  { name: 'Solar Farms', value: 35, color: '#f59e0b' },
  { name: 'Wind Energy', value: 25, color: '#06b6d4' },
  { name: 'Real Estate', value: 20, color: '#8b5cf6' },
  { name: 'Infrastructure', value: 15, color: '#6366f1' },
  { name: 'Other', value: 5, color: '#64748b' },
];

const monthlyFlows = [
  { month: 'Jan', subscriptions: 2500000, redemptions: 800000, net: 1700000 },
  { month: 'Feb', subscriptions: 3200000, redemptions: 1200000, net: 2000000 },
  { month: 'Mar', subscriptions: 2800000, redemptions: 900000, net: 1900000 },
  { month: 'Apr', subscriptions: 3500000, redemptions: 1100000, net: 2400000 },
  { month: 'May', subscriptions: 3000000, redemptions: 1000000, net: 2000000 },
  { month: 'Jun', subscriptions: 3800000, redemptions: 1300000, net: 2500000 },
];

const auditLogs = [
  {
    id: 'AUDIT-001',
    timestamp: '2024-01-10T15:30:00Z',
    user: 'Compliance Officer 1',
    action: 'KYC Approval',
    entity: 'John Smith',
    details: 'Individual KYC verification approved',
    ip: '192.168.1.100',
    status: 'success',
  },
  {
    id: 'AUDIT-002',
    timestamp: '2024-01-10T14:45:00Z',
    user: 'System Admin',
    action: 'Configuration Update',
    entity: 'Risk Parameters',
    details: 'Updated risk scoring thresholds',
    ip: '192.168.1.101',
    status: 'success',
  },
  {
    id: 'AUDIT-003',
    timestamp: '2024-01-10T14:20:00Z',
    user: 'Compliance Officer 2',
    action: 'Document Upload',
    entity: 'TechCorp Solutions',
    details: 'Uploaded corporate registration documents',
    ip: '192.168.1.102',
    status: 'success',
  },
  {
    id: 'AUDIT-004',
    timestamp: '2024-01-10T13:55:00Z',
    user: 'Compliance Officer 1',
    action: 'Sanctions Screening',
    entity: 'Sarah Johnson',
    details: 'External sanctions screening completed',
    ip: '192.168.1.100',
    status: 'success',
  },
];

const reportTypes = [
  { id: 'por', name: 'Proof of Reserve', description: 'Current portfolio holdings and valuations', icon: '📊' },
  { id: 'flows', name: 'Capital Flows', description: 'Subscription and redemption activity', icon: '💰' },
  { id: 'audit', name: 'Audit Trail', description: 'System access and compliance actions', icon: '🔍' },
  { id: 'compliance', name: 'Compliance Report', description: 'KYC/AML status and risk metrics', icon: '🛡️' },
  { id: 'performance', name: 'Performance Report', description: 'Asset performance and returns', icon: '📈' },
  { id: 'risk', name: 'Risk Assessment', description: 'Portfolio risk metrics and analysis', icon: '⚠️' },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');

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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'destructive';
      default: return 'default';
    }
  };

  const generateReport = (reportType: string) => {
    setSelectedReport(reportType);
    // In a real app, this would trigger report generation
    console.log(`Generating ${reportType} report...`);
  };

  const downloadReport = (reportType: string, format: string) => {
    // In a real app, this would download the generated report
    console.log(`Downloading ${reportType} report in ${format} format...`);
  };

  return (
    <Shell variant="default">
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Reports & Analytics"
          subtitle="Portfolio insights and compliance reporting"
          description="Generate Proof of Reserve, capital flows, and audit trail reports"
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DataCard
            title="Portfolio Value"
            subtitle="Total assets under management"
            value={formatCurrency(12780000)}
            change="+2.2%"
            description="vs last week"
            icon={<DollarSign className="h-6 w-6 text-aimy-primary" />}
            variant="default"
          />
          
          <DataCard
            title="Total Assets"
            subtitle="Number of tokenized assets"
            value={48}
            change="+1"
            description="vs last week"
            icon={<Building className="h-6 w-6 text-aimy-secondary" />}
            variant="default"
          />
          
          <DataCard
            title="Active Investors"
            subtitle="Unique investor accounts"
            value={1225}
            change="+5"
            description="vs last week"
            icon={<Users className="h-6 w-6 text-success-500" />}
            variant="success"
          />
          
          <DataCard
            title="Compliance Score"
            subtitle="Overall platform compliance"
            value="98.5%"
            change="+0.5%"
            description="vs last month"
            icon={<Shield className="h-6 w-6 text-aimy-accent" />}
            variant="success"
          />
        </div>

        {/* Portfolio Performance Chart */}
        <AChartLine
          title="Portfolio Performance"
          subtitle="7-day portfolio value and metrics"
          data={portfolioValue}
          lines={[
            { key: 'value', name: 'Portfolio Value', color: '#6366f1' },
            { key: 'assets', name: 'Number of Assets', color: '#8b5cf6' },
            { key: 'investors', name: 'Active Investors', color: '#06b6d4' },
          ]}
          xAxisKey="date"
          height={400}
        />

        {/* Asset Allocation and Flows */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AChartPie
            title="Asset Allocation"
            subtitle="Portfolio composition by asset type"
            data={assetAllocation}
            height={300}
          />
          
          <AChartBar
            title="Monthly Capital Flows"
            subtitle="Subscription vs redemption activity"
            data={monthlyFlows}
            bars={[
              { key: 'subscriptions', name: 'Subscriptions', color: '#22c55e' },
              { key: 'redemptions', name: 'Redemptions', color: '#ef4444' },
              { key: 'net', name: 'Net Flow', color: '#6366f1' },
            ]}
            xAxisKey="month"
            height={300}
          />
        </div>

        {/* Report Generation */}
        <Section
          title="Report Generation"
          subtitle="Generate and download compliance and performance reports"
          variant="bordered"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reportTypes.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{report.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => generateReport(report.id)}
                      className="flex-1"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Generate
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadReport(report.id, 'pdf')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        {/* Audit Trail */}
        <Section
          title="Audit Trail"
          subtitle="System access and compliance action logs"
          variant="bordered"
        >
          {/* Filters */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-ink-400" />
              <Input
                placeholder="Search audit logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-base-ink-200 dark:border-base-ink-800 rounded-md bg-base-bg-100 dark:bg-base-bg-100 text-base-ink-900 dark:text-base-ink-100"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>

          {/* Audit Logs Table */}
          <div className="rounded-lg border border-base-ink-200 dark:border-base-ink-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-base-ink-400" />
                        <span className="text-sm text-base-ink-900 dark:text-base-ink-100">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-base-ink-900 dark:text-base-ink-100">
                        {log.user}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-base-ink-900 dark:text-base-ink-100">
                        {log.entity}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-base-ink-600 dark:text-base-ink-400 max-w-xs truncate">
                        {log.details}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-mono text-xs text-base-ink-600 dark:text-base-ink-400">
                        {log.ip}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(log.status) as any}>
                        {log.status}
                      </Badge>
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
        </Section>

        {/* Export Options */}
        <Section
          title="Export & Integration"
          subtitle="Download reports and integrate with external systems"
          variant="bordered"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>PDF Export</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-base-ink-600 dark:text-base-ink-400 mb-3">
                  Generate PDF reports for compliance and audit purposes
                </p>
                <Button className="w-full" size="sm">
                  Export All Reports
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>CSV Export</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-base-ink-600 dark:text-base-ink-400 mb-3">
                  Download data in CSV format for analysis and reporting
                </p>
                <Button variant="outline" className="w-full" size="sm">
                  Export Data
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ExternalLink className="h-5 w-5" />
                  <span>API Access</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-base-ink-600 dark:text-base-ink-400 mb-3">
                  Access reports programmatically via REST API
                </p>
                <Button variant="outline" className="w-full" size="sm">
                  View API Docs
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Real-time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-base-ink-600 dark:text-base-ink-400 mb-3">
                  Set up real-time reporting and alerts
                </p>
                <Button variant="outline" className="w-full" size="sm">
                  Configure
                </Button>
              </CardContent>
            </Card>
          </div>
        </Section>
      </div>
    </Shell>
  );
}
