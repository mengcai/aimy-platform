'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Share2, 
  Copy, 
  ExternalLink, 
  TrendingUp, 
  DollarSign, 
  Gift,
  MessageCircle,
  Mail,
  Twitter,
  Facebook,
  Linkedin,
  Instagram
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { formatCurrency } from '../../lib/utils';

export default function ReferralsPage() {
  const [copied, setCopied] = useState(false);
  
  // Mock referral data
  const referralData = {
    referralCode: 'AIMYA2025',
    referralLink: 'https://aimya.com/ref/AIMYA2025',
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarnings: 1250,
    pendingEarnings: 350,
    referralBonus: 100, // $100 per successful referral
    requirements: 'Minimum $1,000 investment to qualify'
  };

  const referralHistory = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@example.com',
      date: '2025-01-15',
      status: 'completed',
      investment: 5000,
      earnings: 100
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      date: '2025-01-10',
      status: 'pending',
      investment: 2000,
      earnings: 100
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike@example.com',
      date: '2025-01-05',
      status: 'completed',
      investment: 3000,
      earnings: 100
    }
  ];

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareOptions = [
    { name: 'Email', icon: Mail, color: 'bg-blue-500' },
    { name: 'Twitter', icon: Twitter, color: 'bg-sky-500' },
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-600' },
    { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-700' },
    { name: 'Instagram', icon: Instagram, color: 'bg-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>
              <p className="mt-2 text-lg text-gray-600">
                Invite friends and earn rewards together
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Gift className="h-4 w-4 mr-2" />
                How It Works
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Referral Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{referralData.totalReferrals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{referralData.activeReferrals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(referralData.totalEarnings)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Gift className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(referralData.pendingEarnings)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Link Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Share Your Referral Link</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Earn {formatCurrency(referralData.referralBonus)} for every friend who invests through your referral link
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="flex items-center space-x-3 mb-6">
              <input
                type="text"
                value={referralData.referralLink}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
              <Button onClick={copyReferralLink} className="px-6">
                {copied ? (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div className="text-center mb-8">
              <p className="text-sm text-gray-600 mb-4">
                <strong>Requirements:</strong> {referralData.requirements}
              </p>
              <Badge variant="outline" className="text-sm">
                Referral Code: {referralData.referralCode}
              </Badge>
            </div>

            {/* Share Options */}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 mb-4">Share via:</p>
              <div className="flex justify-center space-x-4">
                {shareOptions.map((option) => (
                  <button
                    key={option.name}
                    className={`p-3 rounded-full ${option.color} text-white hover:opacity-80 transition-opacity`}
                    title={`Share on ${option.name}`}
                  >
                    <option.icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Referral History */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Referral History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referred User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Earnings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {referralHistory.map((referral) => (
                  <tr key={referral.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{referral.name}</div>
                        <div className="text-sm text-gray-500">{referral.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(referral.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(referral.investment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(referral.earnings)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        className={
                          referral.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {referral.status === 'completed' ? 'Completed' : 'Pending'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-6 text-center">How the Referral Program Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Share Your Link</h4>
              <p className="text-blue-100">Copy and share your unique referral link with friends and family</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">They Invest</h4>
              <p className="text-blue-100">When they sign up and make their first investment, you both benefit</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">Earn Rewards</h4>
              <p className="text-blue-100">Receive {formatCurrency(referralData.referralBonus)} for each successful referral</p>
            </div>
          </div>
        </div>

        {/* Promotional Materials */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Promotional Materials</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Email Templates</h4>
              <p className="text-sm text-gray-600 mb-4">Ready-to-use email templates for referrals</p>
              <Button variant="outline" size="sm">Download</Button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Social Media Posts</h4>
              <p className="text-sm text-gray-600 mb-4">Pre-written posts for social platforms</p>
              <Button variant="outline" size="sm">Download</Button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Banners & Graphics</h4>
              <p className="text-sm text-gray-600 mb-4">Visual materials for your website</p>
              <Button variant="outline" size="sm">Download</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
