'use client';

import React, { useState } from 'react';
import { 
  Shell, 
  PageHeader, 
  Section,
  DataCard,
  AChartPie
} from '@/components/ui';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle,
  Shield,
  User,
  Building,
  FileText,
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
const complianceCases = [
  {
    id: 'CASE-001',
    type: 'kyc_verification',
    entity: 'John Smith',
    entityType: 'individual',
    status: 'pending_review',
    priority: 'high',
    createdAt: '2024-01-10T09:00:00Z',
    assignedTo: 'Compliance Officer 1',
    riskScore: 85,
    documents: 3,
    alerts: ['document_expiry', 'address_mismatch'],
  },
  {
    id: 'CASE-002',
    type: 'sanctions_screening',
    entity: 'TechCorp Solutions',
    entityType: 'corporate',
    status: 'under_investigation',
    priority: 'critical',
    createdAt: '2024-01-09T14:30:00Z',
    assignedTo: 'Compliance Officer 2',
    riskScore: 95,
    documents: 5,
    alerts: ['sanctions_hit', 'high_risk_jurisdiction'],
  },
  {
    id: 'CASE-003',
    type: 'aml_investigation',
    entity: 'Sarah Johnson',
    entityType: 'individual',
    status: 'approved',
    priority: 'medium',
    createdAt: '2024-01-08T11:15:00Z',
    assignedTo: 'Compliance Officer 1',
    riskScore: 45,
    documents: 2,
    alerts: ['unusual_activity'],
  },
  {
    id: 'CASE-004',
    type: 'kyc_verification',
    entity: 'Green Energy Fund LP',
    entityType: 'corporate',
    status: 'pending_documents',
    priority: 'medium',
    createdAt: '2024-01-07T16:45:00Z',
    assignedTo: 'Compliance Officer 3',
    riskScore: 60,
    documents: 1,
    alerts: ['missing_documents'],
  },
];

const caseTypes = [
  { value: 'kyc_verification', label: 'KYC Verification', icon: '👤' },
  { value: 'sanctions_screening', label: 'Sanctions Screening', icon: '🚫' },
  { value: 'aml_investigation', label: 'AML Investigation', icon: '💰' },
  { value: 'compliance_review', label: 'Compliance Review', icon: '📋' },
];

const caseStatuses = [
  { value: 'pending_review', label: 'Pending Review', color: 'warning' },
  { value: 'under_investigation', label: 'Under Investigation', color: 'error' },
  { value: 'pending_documents', label: 'Pending Documents', color: 'warning' },
  { value: 'approved', label: 'Approved', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'error' },
];

const riskDistribution = [
  { name: 'Low Risk', value: 45, color: '#22c55e' },
  { name: 'Medium Risk', value: 35, color: '#f59e0b' },
  { name: 'High Risk', value: 15, color: '#ef4444' },
  { name: 'Critical Risk', value: 5, color: '#dc2626' },
];

export default function ComplianceCasesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isCaseDetailOpen, setIsCaseDetailOpen] = useState(false);

  const filteredCases = complianceCases.filter(case_ => {
    const matchesSearch = case_.entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || case_.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || case_.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending_review': return 'warning';
      case 'under_investigation': return 'error';
      case 'pending_documents': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'destructive';
      default: return 'default';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'low': return 'default';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'destructive';
      default: return 'default';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-error-600 dark:text-error-400';
    if (score >= 60) return 'text-warning-600 dark:text-warning-400';
    return 'text-success-600 dark:text-success-400';
  };

  const getTypeIcon = (type: string) => {
    const caseType = caseTypes.find(t => t.value === type);
    return caseType?.icon || '📊';
  };

  const openCaseDetail = (case_: any) => {
    setSelectedCase(case_);
    setIsCaseDetailOpen(true);
  };

  return (
    <Shell variant="default">
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Compliance Cases"
          subtitle="Review and manage compliance investigations"
          description="Monitor KYC verifications, sanctions screening, and AML investigations"
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DataCard
            title="Total Cases"
            subtitle="Active compliance cases"
            value={complianceCases.length}
            description="Across all types"
            icon={<Shield className="h-6 w-6 text-aimy-primary" />}
            variant="default"
          />
          
          <DataCard
            title="Pending Review"
            subtitle="Awaiting compliance officer"
            value={complianceCases.filter(c => c.status === 'pending_review').length}
            description="High priority cases"
            icon={<Clock className="h-6 w-6 text-warning-500" />}
            variant="warning"
          />
          
          <DataCard
            title="Under Investigation"
            subtitle="Active investigations"
            value={complianceCases.filter(c => c.status === 'under_investigation').length}
            description="Critical cases"
            icon={<AlertTriangle className="h-6 w-6 text-error-500" />}
            variant="error"
          />
          
          <DataCard
            title="Approved Today"
            subtitle="Successfully processed"
            value={complianceCases.filter(c => c.status === 'approved').length}
            description="Compliance verified"
            icon={<CheckCircle className="h-6 w-6 text-success-500" />}
            variant="success"
          />
        </div>

        {/* Risk Distribution Chart */}
        <AChartPie
          title="Risk Distribution"
          subtitle="Cases by risk level"
          data={riskDistribution}
          height={300}
        />

        {/* Cases Management */}
        <Section
          title="Compliance Cases"
          subtitle="Review and manage compliance investigations"
          variant="bordered"
        >
          {/* Filters and Search */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-ink-400" />
              <Input
                placeholder="Search cases..."
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
              {caseTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-base-ink-200 dark:border-base-ink-800 rounded-md bg-base-bg-100 dark:bg-base-bg-100 text-base-ink-900 dark:text-base-ink-100"
            >
              <option value="all">All Statuses</option>
              {caseStatuses.map(status => (
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

          {/* Cases Table */}
          <div className="rounded-lg border border-base-ink-200 dark:border-base-ink-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((case_) => (
                  <TableRow key={case_.id}>
                    <TableCell>
                      <p className="font-mono text-sm font-medium text-base-ink-900 dark:text-base-ink-100">
                        {case_.id}
                      </p>
                      <p className="text-xs text-base-ink-600 dark:text-base-ink-400">
                        {new Date(case_.createdAt).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getTypeIcon(case_.type)}</span>
                        <Badge variant="outline">
                          {case_.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {case_.entityType === 'individual' ? (
                          <User className="h-4 w-4 text-aimy-primary" />
                        ) : (
                          <Building className="h-4 w-4 text-aimy-secondary" />
                        )}
                        <div>
                          <p className="font-medium text-base-ink-900 dark:text-base-ink-100">
                            {case_.entity}
                          </p>
                          <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                            {case_.entityType}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(case_.status) as any}>
                        {case_.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityVariant(case_.priority) as any}>
                        {case_.priority.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className={`font-medium ${getRiskColor(case_.riskScore)}`}>
                        {case_.riskScore}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-base-ink-900 dark:text-base-ink-100">
                        {case_.assignedTo}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openCaseDetail(case_)}>
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

        {/* Case Detail Dialog */}
        <Dialog open={isCaseDetailOpen} onOpenChange={setIsCaseDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Case Details - {selectedCase?.id}</DialogTitle>
              <DialogDescription>
                Comprehensive view of compliance case and investigation details
              </DialogDescription>
            </DialogHeader>
            
            {selectedCase && (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="investigation">Investigation</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Case Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p><strong>Case ID:</strong> {selectedCase.id}</p>
                        <p><strong>Type:</strong> {selectedCase.type.replace('_', ' ').toUpperCase()}</p>
                        <p><strong>Status:</strong> {selectedCase.status.replace('_', ' ').toUpperCase()}</p>
                        <p><strong>Priority:</strong> {selectedCase.priority.toUpperCase()}</p>
                        <p><strong>Created:</strong> {new Date(selectedCase.createdAt).toLocaleString()}</p>
                        <p><strong>Assigned To:</strong> {selectedCase.assignedTo}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Entity Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p><strong>Name:</strong> {selectedCase.entity}</p>
                        <p><strong>Type:</strong> {selectedCase.entityType}</p>
                        <p><strong>Risk Score:</strong> {selectedCase.riskScore}</p>
                        <p><strong>Documents:</strong> {selectedCase.documents}</p>
                        <p><strong>Alerts:</strong> {selectedCase.alerts.length}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {selectedCase.alerts.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Active Alerts</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedCase.alerts.map((alert: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-warning-50 dark:bg-warning-950/20 border border-warning-200 dark:border-warning-800">
                              <AlertTriangle className="h-4 w-4 text-warning-500" />
                              <span className="text-sm text-warning-700 dark:text-warning-300">
                                {alert.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="documents" className="space-y-4">
                  <div className="border-2 border-dashed border-base-ink-300 dark:border-base-ink-700 rounded-lg p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-base-ink-400" />
                    <p className="mt-2 text-sm text-base-ink-600 dark:text-base-ink-400">
                      Document management interface would be implemented here
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="investigation" className="space-y-4">
                  <div className="border-2 border-dashed border-base-ink-300 dark:border-base-ink-700 rounded-lg p-8 text-center">
                    <Shield className="mx-auto h-12 w-12 text-base-ink-400" />
                    <p className="mt-2 text-sm text-base-ink-600 dark:text-base-ink-400">
                      Investigation workflow and notes would be implemented here
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="actions" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="w-full">
                      <Clock className="mr-2 h-4 w-4" />
                      Request Documents
                    </Button>
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      External Screening
                    </Button>
                    <Button className="w-full">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve Case
                    </Button>
                    <Button variant="destructive" className="w-full">
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject Case
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCaseDetailOpen(false)}>
                Close
              </Button>
              <Button>
                Update Case
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Shell>
  );
}
