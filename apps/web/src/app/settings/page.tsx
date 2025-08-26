'use client';

import React, { useState } from 'react';
import { 
  Shell, 
  PageHeader, 
  Section,
  DataCard
} from '@/components/ui';
import { 
  User, 
  Shield, 
  CreditCard, 
  Settings, 
  Bell, 
  Globe, 
  Lock,
  Eye,
  EyeOff,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  Upload,
  Trash2,
  Plus,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Mock data for demonstration
const userProfile = {
  id: 'USER-001',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@example.com',
  phone: '+1 (555) 123-4567',
  dateOfBirth: '1985-03-15',
  nationality: 'US',
  address: {
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States'
  },
  kycStatus: 'verified',
  kycLevel: 'tier2',
  riskProfile: 'moderate',
  lastLogin: '2024-01-10T15:30:00Z',
  twoFactorEnabled: true,
  notifications: {
    email: true,
    sms: false,
    push: true
  }
};

const wallets = [
  {
    id: 'WALLET-001',
    name: 'Primary Trading Wallet',
    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    type: 'ethereum',
    balance: 25000,
    status: 'active',
    isDefault: true,
    lastUsed: '2024-01-10T14:30:00Z',
  },
  {
    id: 'WALLET-002',
    name: 'Cold Storage',
    address: '0x8ba1f109551bA432bdf5c3c92bEa2e89C3a602b7',
    type: 'ethereum',
    balance: 100000,
    status: 'active',
    isDefault: false,
    lastUsed: '2024-01-05T10:15:00Z',
  },
  {
    id: 'WALLET-003',
    name: 'Mobile Wallet',
    address: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE9',
    type: 'ethereum',
    balance: 5000,
    status: 'inactive',
    isDefault: false,
    lastUsed: '2023-12-20T16:45:00Z',
  }
];

const kycDocuments = [
  {
    id: 'DOC-001',
    type: 'passport',
    name: 'US Passport',
    status: 'verified',
    uploadedAt: '2024-01-05T09:00:00Z',
    verifiedAt: '2024-01-06T14:30:00Z',
    fileSize: '2.1 MB',
    verifiedBy: 'Compliance Officer 1'
  },
  {
    id: 'DOC-002',
    type: 'utility_bill',
    name: 'Electricity Bill',
    status: 'verified',
    uploadedAt: '2024-01-05T09:15:00Z',
    verifiedAt: '2024-01-06T15:00:00Z',
    fileSize: '1.8 MB',
    verifiedBy: 'Compliance Officer 1'
  },
  {
    id: 'DOC-003',
    type: 'bank_statement',
    name: 'Bank Statement',
    status: 'pending',
    uploadedAt: '2024-01-08T11:30:00Z',
    verifiedAt: null,
    fileSize: '3.2 MB',
    verifiedBy: null
  }
];

const securityLog = [
  {
    id: 'SEC-001',
    action: 'Login',
    timestamp: '2024-01-10T15:30:00Z',
    ip: '192.168.1.100',
    location: 'New York, US',
    device: 'Chrome on Windows',
    status: 'success'
  },
  {
    id: 'SEC-002',
    action: 'Password Change',
    timestamp: '2024-01-08T10:15:00Z',
    ip: '192.168.1.100',
    location: 'New York, US',
    device: 'Chrome on Windows',
    status: 'success'
  },
  {
    id: 'SEC-003',
    action: '2FA Enabled',
    timestamp: '2024-01-05T14:20:00Z',
    ip: '192.168.1.100',
    location: 'New York, US',
    device: 'Chrome on Windows',
    status: 'success'
  },
  {
    id: 'SEC-004',
    action: 'Failed Login',
    timestamp: '2024-01-03T09:45:00Z',
    ip: '203.0.113.1',
    location: 'Unknown',
    device: 'Unknown',
    status: 'failed'
  }
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAddingWallet, setIsAddingWallet] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    email: userProfile.email,
    phone: userProfile.phone,
    dateOfBirth: userProfile.dateOfBirth,
    street: userProfile.address.street,
    city: userProfile.address.city,
    state: userProfile.address.state,
    zipCode: userProfile.address.zipCode,
    country: userProfile.address.country
  });

  const [walletForm, setWalletForm] = useState({
    name: '',
    address: '',
    type: 'ethereum'
  });

  const getKYCStatusVariant = (status: string) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'destructive';
      default: return 'default';
    }
  };

  const getKYCLevelLabel = (level: string) => {
    switch (level) {
      case 'tier1': return 'Tier 1 - Basic';
      case 'tier2': return 'Tier 2 - Enhanced';
      case 'tier3': return 'Tier 3 - Advanced';
      default: return 'Unknown';
    }
  };

  const getRiskProfileLabel = (profile: string) => {
    switch (profile) {
      case 'conservative': return 'Conservative';
      case 'moderate': return 'Moderate';
      case 'aggressive': return 'Aggressive';
      default: return 'Unknown';
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'passport': return '📘';
      case 'utility_bill': return '📄';
      case 'bank_statement': return '🏦';
      case 'drivers_license': return '🚗';
      default: return '📋';
    }
  };

  const getSecurityStatusVariant = (status: string) => {
    return status === 'success' ? 'success' : 'destructive';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const saveProfile = () => {
    // In a real app, this would save to the backend
    console.log('Saving profile:', profileForm);
    setIsEditingProfile(false);
  };

  const addWallet = () => {
    // In a real app, this would add the wallet
    console.log('Adding wallet:', walletForm);
    setIsAddingWallet(false);
    setWalletForm({ name: '', address: '', type: 'ethereum' });
  };

  const toggleWalletStatus = (walletId: string) => {
    // In a real app, this would toggle wallet status
    console.log('Toggling wallet status:', walletId);
  };

  const deleteWallet = (walletId: string) => {
    // In a real app, this would delete the wallet
    console.log('Deleting wallet:', walletId);
  };

  const uploadDocument = () => {
    // In a real app, this would upload the document
    console.log('Uploading document...');
    setIsUploadingDocument(false);
  };

  return (
    <Shell variant="default">
      <div className="space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Account Settings"
          subtitle="Manage your profile, security, and preferences"
          description="Update personal information, manage wallets, and configure account settings"
        />

        {/* Account Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DataCard
            title="KYC Status"
            subtitle="Identity verification"
            value={userProfile.kycStatus.toUpperCase()}
            description={getKYCLevelLabel(userProfile.kycLevel)}
            icon={<Shield className="h-6 w-6 text-success-500" />}
            variant="success"
          />
          
          <DataCard
            title="Risk Profile"
            subtitle="Investment preference"
            value={getRiskProfileLabel(userProfile.riskProfile)}
            description="Based on KYC assessment"
            icon={<User className="h-6 w-6 text-aimy-primary" />}
            variant="default"
          />
          
          <DataCard
            title="Active Wallets"
            subtitle="Connected addresses"
            value={wallets.filter(w => w.status === 'active').length}
            description="Out of total wallets"
            icon={<CreditCard className="h-6 w-6 text-aimy-secondary" />}
            variant="default"
          />
          
          <DataCard
            title="2FA Status"
            subtitle="Two-factor authentication"
            value={userProfile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            description="Account security"
            icon={<Lock className="h-6 w-6 text-aimy-accent" />}
            variant={userProfile.twoFactorEnabled ? 'success' : 'warning'}
          />
        </div>

        {/* Settings Tabs */}
        <Section
          title="Account Settings"
          subtitle="Manage your account configuration"
          variant="bordered"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="wallets">Wallets</TabsTrigger>
              <TabsTrigger value="kyc">KYC & Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                {!isEditingProfile ? (
                  <Button onClick={() => setIsEditingProfile(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button onClick={saveProfile}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">First Name</label>
                        <Input
                          value={profileForm.firstName}
                          onChange={(e) => handleProfileChange('firstName', e.target.value)}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Last Name</label>
                        <Input
                          value={profileForm.lastName}
                          onChange={(e) => handleProfileChange('lastName', e.target.value)}
                          disabled={!isEditingProfile}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        disabled={!isEditingProfile}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone</label>
                      <Input
                        value={profileForm.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        disabled={!isEditingProfile}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date of Birth</label>
                      <Input
                        type="date"
                        value={profileForm.dateOfBirth}
                        onChange={(e) => handleProfileChange('dateOfBirth', e.target.value)}
                        disabled={!isEditingProfile}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Address Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Street Address</label>
                      <Input
                        value={profileForm.street}
                        onChange={(e) => handleProfileChange('street', e.target.value)}
                        disabled={!isEditingProfile}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">City</label>
                        <Input
                          value={profileForm.city}
                          onChange={(e) => handleProfileChange('city', e.target.value)}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">State</label>
                        <Input
                          value={profileForm.state}
                          onChange={(e) => handleProfileChange('state', e.target.value)}
                          disabled={!isEditingProfile}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">ZIP Code</label>
                        <Input
                          value={profileForm.zipCode}
                          onChange={(e) => handleProfileChange('zipCode', e.target.value)}
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Country</label>
                        <Input
                          value={profileForm.country}
                          onChange={(e) => handleProfileChange('country', e.target.value)}
                          disabled={!isEditingProfile}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Password & Security</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Current Password</label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter current password"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">New Password</label>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Confirm New Password</label>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                      />
                    </div>
                    
                    <Button className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      Update Password
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Two-Factor Authentication</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">2FA Status</p>
                        <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                          {userProfile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                      <Badge variant={userProfile.twoFactorEnabled ? 'success' : 'default'}>
                        {userProfile.twoFactorEnabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                        Two-factor authentication adds an extra layer of security to your account.
                      </p>
                    </div>
                    
                    <Button variant={userProfile.twoFactorEnabled ? 'outline' : 'default'} className="w-full">
                      {userProfile.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Security Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {securityLog.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border border-base-ink-200 dark:border-base-ink-800">
                        <div className="flex items-center space-x-3">
                          <Badge variant={getSecurityStatusVariant(log.status) as any}>
                            {log.status}
                          </Badge>
                          <div>
                            <p className="font-medium text-base-ink-900 dark:text-base-ink-100">
                              {log.action}
                            </p>
                            <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                              {log.device} • {log.location}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                          <p className="text-xs text-base-ink-500 dark:text-base-ink-500 font-mono">
                            {log.ip}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="wallets" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Connected Wallets</h3>
                <Button onClick={() => setIsAddingWallet(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Wallet
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {wallets.map((wallet) => (
                  <Card key={wallet.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{wallet.name}</CardTitle>
                        <Badge variant={wallet.status === 'active' ? 'success' : 'default'}>
                          {wallet.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <p className="text-sm text-base-ink-600 dark:text-base-ink-400">Address</p>
                        <p className="font-mono text-xs text-base-ink-900 dark:text-base-ink-100 break-all">
                          {wallet.address}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-base-ink-600 dark:text-base-ink-400">Balance</p>
                        <p className="font-medium text-base-ink-900 dark:text-base-ink-100">
                          {formatCurrency(wallet.balance)}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-base-ink-600 dark:text-base-ink-400">
                        <span>Type: {wallet.type}</span>
                        {wallet.isDefault && (
                          <Badge variant="outline">Default</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="mr-2 h-3 w-3" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleWalletStatus(wallet.id)}
                        >
                          {wallet.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteWallet(wallet.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Add Wallet Dialog */}
              <Dialog open={isAddingWallet} onOpenChange={setIsAddingWallet}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Wallet</DialogTitle>
                    <DialogDescription>
                      Connect a new wallet to your account
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Wallet Name</label>
                      <Input
                        placeholder="e.g., Trading Wallet"
                        value={walletForm.name}
                        onChange={(e) => setWalletForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Wallet Address</label>
                      <Input
                        placeholder="0x..."
                        value={walletForm.address}
                        onChange={(e) => setWalletForm(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Wallet Type</label>
                      <select
                        value={walletForm.type}
                        onChange={(e) => setWalletForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-base-ink-200 dark:border-base-ink-800 rounded-md bg-base-bg-100 dark:bg-base-bg-100 text-base-ink-900 dark:text-base-ink-100"
                      >
                        <option value="ethereum">Ethereum</option>
                        <option value="polygon">Polygon</option>
                        <option value="arbitrum">Arbitrum</option>
                        <option value="optimism">Optimism</option>
                      </select>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingWallet(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addWallet}>
                      Add Wallet
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
            
            <TabsContent value="kyc" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>KYC Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-base-ink-600 dark:text-base-ink-400">Status</span>
                        <Badge variant={getKYCStatusVariant(userProfile.kycStatus) as any}>
                          {userProfile.kycStatus.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-base-ink-600 dark:text-base-ink-400">Level</span>
                        <span className="text-sm font-medium text-base-ink-900 dark:text-base-ink-100">
                          {getKYCLevelLabel(userProfile.kycLevel)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-base-ink-600 dark:text-base-ink-400">Risk Profile</span>
                        <span className="text-sm font-medium text-base-ink-900 dark:text-base-ink-100">
                          {getRiskProfileLabel(userProfile.riskProfile)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-base-ink-600 dark:text-base-ink-400">Nationality</span>
                        <span className="text-sm font-medium text-base-ink-900 dark:text-base-ink-100">
                          {userProfile.nationality}
                        </span>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View KYC Report
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Document Upload</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                        Upload additional documents to complete your KYC verification
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-base-ink-300 dark:border-base-ink-700 rounded-lg p-6 text-center">
                        <Upload className="mx-auto h-8 w-8 text-base-ink-400 mb-2" />
                        <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                          Drag and drop files here or click to browse
                        </p>
                        <Button variant="outline" className="mt-3" onClick={() => setIsUploadingDocument(true)}>
                          Choose Files
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {kycDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-base-ink-200 dark:border-base-ink-800">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getDocumentTypeIcon(doc.type)}</span>
                          <div>
                            <p className="font-medium text-base-ink-900 dark:text-base-ink-100">
                              {doc.name}
                            </p>
                            <p className="text-sm text-base-ink-600 dark:text-base-ink-400">
                              {doc.fileSize} • {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge variant={getKYCStatusVariant(doc.status) as any}>
                            {doc.status.toUpperCase()}
                          </Badge>
                          
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Upload Document Dialog */}
              <Dialog open={isUploadingDocument} onOpenChange={setIsUploadingDocument}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                      Select a document type and upload the file
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Document Type</label>
                      <select className="w-full px-3 py-2 border border-base-ink-200 dark:border-base-ink-800 rounded-md bg-base-bg-100 dark:bg-base-bg-100 text-base-ink-900 dark:text-base-ink-100">
                        <option value="passport">Passport</option>
                        <option value="drivers_license">Driver's License</option>
                        <option value="utility_bill">Utility Bill</option>
                        <option value="bank_statement">Bank Statement</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">File</label>
                      <Input type="file" accept=".pdf,.jpg,.jpeg,.png" />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUploadingDocument(false)}>
                      Cancel
                    </Button>
                    <Button onClick={uploadDocument}>
                      Upload Document
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </Section>
      </div>
    </Shell>
  );
}
