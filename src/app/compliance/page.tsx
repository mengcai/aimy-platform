'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  XCircle, 
  Search, 
  Filter,
  Download,
  Eye,
  User,
  FileText,
  Building,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { DataService } from '../../services/data';
import { ComplianceCase, KYCApplicant } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function CompliancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [activeTab, setActiveTab] = useState('cases');
  const [selectedCase, setSelectedCase] = useState<ComplianceCase | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<KYCApplicant | null>(null);

  const complianceCases = DataService.getComplianceCases();
  const kycApplicants = DataService.getKYCApplicants();

  const filteredCases = complianceCases.filter(case_ => {
    const matchesSearch = case_.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (case_.title && case_.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || case_.status === selectedStatus;
    const matchesType = selectedType === 'all' || case_.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredApplicants = kycApplicants.filter(applicant => {
    const matchesSearch = applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         applicant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || applicant.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'under_review', label: 'Under Review' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'kyc', label: 'KYC' },
    { value: 'aml', label: 'AML' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'regulatory', label: 'Regulatory' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'under_review':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'kyc':
        return 'bg-blue-100 text-blue-800';
      case 'aml':
        return 'bg-purple-100 text-purple-800';
      case 'compliance':
        return 'bg-green-100 text-green-800';
      case 'regulatory':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportReports = () => {
    // Simulate export functionality
    alert('Exporting compliance reports...');
  };

  const handleNewCase = () => {
    alert('Creating new compliance case...');
  };

  const handleViewCase = (case_: ComplianceCase) => {
    setSelectedCase(case_);
    alert(`Viewing case: ${case_.id} - ${case_.title || case_.description}`);
  };

  const handleApproveCase = (case_: ComplianceCase) => {
    alert(`Approving case: ${case_.id}`);
    // In a real app, this would update the case status
  };

  const handleRejectCase = (case_: ComplianceCase) => {
    alert(`Rejecting case: ${case_.id}`);
    // In a real app, this would update the case status
  };

  const handleViewApplicant = (applicant: KYCApplicant) => {
    setSelectedApplicant(applicant);
    alert(`Reviewing KYC application for: ${applicant.name}`);
  };

  const handleApproveApplicant = (applicant: KYCApplicant) => {
    alert(`Approving KYC for: ${applicant.name}`);
    // In a real app, this would update the applicant status
  };

  const handleViewAllKYC = () => {
    alert('Navigating to full KYC applications page...');
  };

  const pendingCases = complianceCases.filter(case_ => case_.status === 'pending').length;
  const approvedCases = complianceCases.filter(case_ => case_.status === 'approved').length;
  const rejectedCases = complianceCases.filter(case_ => case_.status === 'rejected').length;
  const pendingKYC = kycApplicants.filter(applicant => applicant.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Compliance & KYC</h1>
              <p className="mt-2 text-lg text-gray-600">
                Manage regulatory compliance and customer verification
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <Button variant="outline" onClick={handleExportReports}>
                <Download className="h-4 w-4 mr-2" />
                Export Reports
              </Button>
              <Button onClick={handleNewCase}>
                <Shield className="h-4 w-4 mr-2" />
                New Case
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('pending')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Cases</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('approved')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved Cases</p>
                  <p className="text-2xl font-bold text-gray-900">{approvedCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedStatus('rejected')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected Cases</p>
                  <p className="text-2xl font-bold text-gray-900">{rejectedCases}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('kyc')}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <User className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending KYC</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingKYC}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cases, applicants, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

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
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button 
                className={`border-b-2 py-2 px-1 text-sm font-medium ${
                  activeTab === 'cases' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('cases')}
              >
                Compliance Cases
              </button>
              <button 
                className={`border-b-2 py-2 px-1 text-sm font-medium ${
                  activeTab === 'kyc' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('kyc')}
              >
                KYC Applications
              </button>
              <button 
                className={`border-b-2 py-2 px-1 text-sm font-medium ${
                  activeTab === 'regulatory' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('regulatory')}
              >
                Regulatory Updates
              </button>
            </nav>
          </div>
        </div>

        {/* Compliance Cases Tab */}
        {activeTab === 'cases' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Compliance Cases</h2>
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{filteredCases.length}</span> of{' '}
                <span className="font-medium">{complianceCases.length}</span> cases
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {filteredCases.map((case_) => (
                <Card key={case_.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Badge className={getTypeColor(case_.type)}>
                            {case_.type.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(case_.status)}>
                            {case_.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-gray-500">#{case_.id}</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{case_.title || 'Untitled Case'}</h3>
                        <p className="text-gray-600 mb-4">{case_.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">Created: {formatDate(case_.createdAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">Assignee: {case_.assignedTo || 'Unassigned'}</span>
                          </div>
                          <div className="flex items-center">
                            <Building className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-gray-600">Priority: {case_.priority}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 ml-6">
                        <Button variant="outline" size="sm" onClick={() => handleViewCase(case_)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {case_.status === 'pending' && (
                          <Button size="sm" onClick={() => handleApproveCase(case_)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        {case_.status === 'pending' && (
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleRejectCase(case_)}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredCases.length === 0 && (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No compliance cases found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria or filters to find more cases.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedStatus('all');
                    setSelectedType('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* KYC Applications Tab */}
        {activeTab === 'kyc' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">KYC Applications</h2>
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium">{filteredApplicants.length}</span> of{' '}
                <span className="font-medium">{kycApplicants.length}</span> applications
              </p>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredApplicants.map((applicant) => (
                        <tr key={applicant.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{applicant.name}</div>
                              <div className="text-sm text-gray-500">{applicant.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(applicant.status)}
                              <Badge className={`ml-2 ${getStatusColor(applicant.status)}`}>
                                {applicant.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(applicant.submittedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleViewApplicant(applicant)}>
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                              {applicant.status === 'pending' && (
                                <Button size="sm" onClick={() => handleApproveApplicant(applicant)}>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-center p-4">
                  <Button variant="outline" onClick={handleViewAllKYC}>View All KYC Applications</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Regulatory Updates Tab */}
        {activeTab === 'regulatory' && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Regulatory Updates</h3>
              <p className="text-gray-500 mb-4">
                Stay informed about the latest regulatory changes and compliance requirements.
              </p>
              <Button variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Updates
              </Button>
            </div>
          </div>
        )}

        {/* Compliance Metrics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Compliance Metrics</CardTitle>
            <CardDescription>Overview of compliance performance and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {complianceCases.length > 0 ? ((approvedCases / complianceCases.length) * 100).toFixed(1) : '0'}%
                </div>
                <p className="text-sm text-gray-600">Approval Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {complianceCases.length > 0 ? Math.round(complianceCases.reduce((sum, case_) => sum + (case_.processingTime || 0), 0) / complianceCases.length) : 0}h
                </div>
                <p className="text-sm text-gray-600">Avg Processing Time</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {kycApplicants.filter(a => a.status === 'verified').length}
                </div>
                <p className="text-sm text-gray-600">Verified Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
