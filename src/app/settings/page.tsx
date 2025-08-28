'use client';

import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  Settings as SettingsIcon, 
  Wallet, 
  CreditCard, 
  Globe, 
  Lock,
  Eye,
  EyeOff,
  Camera,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showCryptoKey, setShowCryptoKey] = useState(false);

  // Mock user data (in real app, this would come from user context/API)
  const userData = {
    profile: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      country: 'United States',
      dateOfBirth: '1985-03-15',
      profileImage: '/api/placeholder/150/150'
    },
    crypto: {
      ethereum: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      bitcoin: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      polygon: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
    },
    kyc: {
      status: 'verified',
      documents: ['passport', 'drivers_license'],
      verificationDate: '2025-01-10',
      nextReview: '2026-01-10'
    },
    security: {
      twoFactorEnabled: true,
      lastLogin: '2025-01-27T10:30:00Z',
      loginHistory: [
        { date: '2025-01-27T10:30:00Z', location: 'New York, NY', device: 'Chrome on MacBook Pro' },
        { date: '2025-01-26T15:45:00Z', location: 'New York, NY', device: 'Safari on iPhone' },
        { date: '2025-01-25T09:15:00Z', location: 'New York, NY', device: 'Chrome on Windows' }
      ]
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'crypto', name: 'Crypto Addresses', icon: Wallet },
    { id: 'kyc', name: 'KYC Verification', icon: Shield },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'preferences', name: 'Preferences', icon: SettingsIcon }
  ];

  const handleSignOut = () => {
    // In real app, this would clear auth tokens and redirect
    window.location.href = 'http://localhost:3000';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="mt-2 text-lg text-gray-600">
                Manage your account, security, and preferences
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <img
                      src={userData.profile.profileImage}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                    <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700">
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {userData.profile.firstName} {userData.profile.lastName}
                    </h3>
                    <p className="text-gray-600">{userData.profile.email}</p>
                    <Badge variant="outline" className="mt-2">Verified User</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      defaultValue={userData.profile.firstName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      defaultValue={userData.profile.lastName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={userData.profile.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      defaultValue={userData.profile.phone}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <select
                      defaultValue={userData.profile.country}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option>United States</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
                      <option>Germany</option>
                      <option>France</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      defaultValue={userData.profile.dateOfBirth}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Save Changes</Button>
                </div>
              </div>
            )}

            {/* Crypto Addresses Tab */}
            {activeTab === 'crypto' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      <strong>Important:</strong> Only send supported cryptocurrencies to these addresses. 
                      Sending unsupported tokens may result in permanent loss.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-bold">₿</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Bitcoin (BTC)</h4>
                          <p className="text-sm text-gray-600">Bitcoin network</p>
                        </div>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <code className="text-sm text-gray-800 font-mono break-all">
                          {userData.crypto.bitcoin}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(userData.crypto.bitcoin)}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold">Ξ</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Ethereum (ETH)</h4>
                          <p className="text-sm text-gray-600">Ethereum network</p>
                        </div>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <code className="text-sm text-gray-800 font-mono break-all">
                          {userData.crypto.ethereum}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(userData.crypto.ethereum)}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-bold">P</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Polygon (MATIC)</h4>
                          <p className="text-sm text-gray-600">Polygon network</p>
                        </div>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <code className="text-sm text-gray-800 font-mono break-all">
                          {userData.crypto.polygon}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigator.clipboard.writeText(userData.crypto.polygon)}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline">Add New Address</Button>
                </div>
              </div>
            )}

            {/* KYC Verification Tab */}
            {activeTab === 'kyc' && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-800">
                      <strong>KYC Verified:</strong> Your identity has been successfully verified. 
                      You can now access all platform features.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Verification Status</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Verification Date:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(userData.kyc.verificationDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Next Review:</span>
                        <span className="text-sm text-gray-900">
                          {new Date(userData.kyc.nextReview).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Documents Submitted</h4>
                    <div className="space-y-3">
                      {userData.kyc.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">
                            {doc.replace('_', ' ')}:
                          </span>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            Approved
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">KYC Requirements</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Valid government-issued photo ID (passport, driver's license, or national ID)</li>
                    <li>• Proof of address (utility bill, bank statement, or lease agreement)</li>
                    <li>• Selfie photo for identity verification</li>
                    <li>• Source of funds documentation for investments over $10,000</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline">Update Documents</Button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Two-Factor Authentication</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Your account is protected with 2FA using an authenticator app.
                    </p>
                    <Button variant="outline" size="sm" className="mt-3">
                      Manage 2FA
                    </Button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Password</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Last changed: 30 days ago
                    </p>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Recent Login Activity</h4>
                  <div className="space-y-3">
                    {userData.security.loginHistory.map((login, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{login.device}</p>
                          <p className="text-xs text-gray-600">{login.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">
                            {new Date(login.date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(login.date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline">View All Activity</Button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Investment Updates</h4>
                      <p className="text-sm text-gray-600">Get notified about portfolio performance and yield distributions</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">New Asset Opportunities</h4>
                      <p className="text-sm text-gray-600">Be the first to know about new investment opportunities</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Security Alerts</h4>
                      <p className="text-sm text-gray-600">Important security notifications and login alerts</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Referral Rewards</h4>
                      <p className="text-sm text-gray-600">Updates about your referral program earnings</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Save Preferences</Button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>USD - US Dollar</option>
                      <option>EUR - Euro</option>
                      <option>GBP - British Pound</option>
                      <option>JPY - Japanese Yen</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC-8 (Pacific Time)</option>
                      <option>UTC+0 (GMT)</option>
                      <option>UTC+1 (Central European Time)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Save Preferences</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
