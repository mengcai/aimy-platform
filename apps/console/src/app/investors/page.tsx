'use client';

import React, { useState } from 'react';
import { 
  Shell, 
  PageHeader, 
  Section,
  DataCard,
  AChartPie,
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger
} from '@/components/ui';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Edit,
  Trash2,
  User,
  Building,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Mail,
  Phone,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Input from '@/components/ui/input';

// Mock data for demonstration
const investors = [
  {
    id: 'INV-001',
    name: 'John Smith',
    type: 'individual',
    status: 'active',
    location: 'New York, USA',
    totalInvestment: 250000,
    activeInvestments: 3,
    kycStatus: 'verified',
    complianceStatus: 'approved',
    lastActivity: '2024-01-10T15:30:00Z',
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
  },
  {
    id: 'INV-002',
    name: 'TechCorp Solutions',
    type: 'corporate',
    status: 'active',
    location: 'California, USA',
    totalInvestment: 1500000,
    activeInvestments: 5,
    kycStatus: 'verified',
    complianceStatus: 'approved',
    lastActivity: '2024-01-09T14:45:00Z',
    email: 'investments@techcorp.com',
    phone: '+1-555-0456',
  },
  {
    id: 'INV-003',
    name: 'Sarah Johnson',
    type: 'individual',
    status: 'pending',
    location: 'Texas, USA',
    totalInvestment: 75000,
    activeInvestments: 1,
    kycStatus: 'pending',
    complianceStatus: 'under_review',
    lastActivity: '2024-01-08T11:20:00Z',
    email: 'sarah.johnson@email.com',
    phone: '+1-555-0789',
  },
];

const investorTypes = [
  { value: 'individual', label: 'Individual', icon: '👤' },
  { value: 'corporate', label: 'Corporate', icon: '🏢' },
  { value: 'institutional', label: 'Institutional', icon: '🏛️' },
  { value: 'family_office', label: 'Family Office', icon: '👨‍👩‍👧‍👦' },
];

const investorDistribution = [
  { label: 'Individual', value: 65, color: '#3b82f6' },
  { label: 'Corporate', value: 25, color: '#10b981' },
  { label: 'Institutional', value: 8, color: '#f59e0b' },
  { label: 'Family Office', value: 2, color: '#8b5cf6' },
];

export default function InvestorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredInvestors = investors.filter(investor => {
    const matchesSearch = investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investor.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || investor.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Shell>
      <PageHeader
        title="Investor Management"
        description="Manage investor relationships, track investments, and monitor compliance status."
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Investor
        </Button>
      </PageHeader>

      {/* Overview Cards */}
      <Section title="Investor Overview">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DataCard
            title="Total Investors"
            value={investors.length}
            subtitle="Active and pending investors"
            icon={<Users className="h-8 w-8 text-blue-600" />}
          />
          <DataCard
            title="Active Investors"
            value={investors.filter(i => i.status === 'active').length}
            subtitle="Currently active investors"
            icon={<CheckCircle className="h-8 w-8 text-green-600" />}
          />
          <DataCard
            title="Pending KYC"
            value={investors.filter(i => i.kycStatus === 'pending').length}
            subtitle="Awaiting verification"
            icon={<Clock className="h-8 w-8 text-yellow-600" />}
          />
          <DataCard
            title="Total Investment"
            value={`$${(investors.reduce((sum, i) => sum + i.totalInvestment, 0) / 1000000).toFixed(1)}M`}
            subtitle="Combined investment value"
            icon={<DollarSign className="h-8 w-8 text-purple-600" />}
          />
        </div>
      </Section>

      {/* Investor Distribution Chart */}
      <Section title="Investor Distribution">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AChartPie
            data={investorDistribution}
            title="Investors by Type"
          />
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {investors.slice(0, 5).map((investor) => (
                  <div key={investor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {investor.type === 'individual' ? (
                        <User className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Building className="h-5 w-5 text-gray-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{investor.name}</p>
                        <p className="text-xs text-gray-500">{investor.type}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(investor.status)}>
                      {investor.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Investor Management */}
      <Section title="Investor Management">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search investors by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Types</option>
              {investorTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Investors Table */}
        <Card>
          <CardHeader>
            <CardTitle>Investors</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investor ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Total Investment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvestors.map((investor) => (
                  <TableRow key={investor.id}>
                    <TableCell className="font-mono text-sm">{investor.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {investor.type === 'individual' ? (
                          <User className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Building className="h-4 w-4 text-gray-500" />
                        )}
                        <div>
                          <p className="font-medium">{investor.name}</p>
                          <p className="text-sm text-gray-500">{investor.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {investor.type.charAt(0).toUpperCase() + investor.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(investor.status)}>
                        {investor.status.charAt(0).toUpperCase() + investor.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getKycStatusColor(investor.kycStatus)}>
                        {investor.kycStatus.charAt(0).toUpperCase() + investor.kycStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        ${investor.totalInvestment.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Section>
    </Shell>
  );
}
