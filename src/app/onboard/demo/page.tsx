'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import {
  Building2,
  FileText,
  Shield,
  TrendingUp,
  Users,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Upload,
  Eye,
  Download,
  Send,
  ArrowRight,
  ArrowLeft,
  Globe,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Lock,
  Unlock
} from 'lucide-react'

export default function OnboardingDemoPage() {
  const [currentSection, setCurrentSection] = useState(0)

  const sections = [
    {
      id: 'overview',
      title: 'IntelliPro Group Overview',
      description: 'Company background and business model'
    },
    {
      id: 'tokenization',
      title: 'Tokenization Strategy',
      description: 'Financial structure and token economics'
    },
    {
      id: 'compliance',
      title: 'Compliance & KYC',
      description: 'Regulatory requirements and verification'
    },
    {
      id: 'launch',
      title: 'Platform Launch',
      description: 'Smart contract deployment and trading'
    },
    {
      id: 'investment',
      title: 'Investment Opportunities',
      description: 'How investors can participate'
    }
  ]

  const renderSectionContent = () => {
    switch (currentSection) {
      case 0:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-blue-600" />
                  IntelliPro Group - Company Profile
                </CardTitle>
                <CardDescription>
                  Leading technology consulting and professional services company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Company Highlights</h4>
                      <ul className="space-y-2 text-sm text-blue-800">
                        <li>• Founded in 2018, headquartered in New York</li>
                        <li>• 150+ employees across 8 offices</li>
                        <li>• $45M annual revenue with 35% YoY growth</li>
                        <li>• 200+ enterprise clients including Fortune 500</li>
                        <li>• Specialized in AI, cloud, and digital transformation</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Business Model</h4>
                      <ul className="space-y-2 text-sm text-green-800">
                        <li>• Consulting Services (60% of revenue)</li>
                        <li>• Software Development (25% of revenue)</li>
                        <li>• Managed Services (15% of revenue)</li>
                        <li>• Recurring revenue streams from long-term contracts</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Market Position</h4>
                      <ul className="space-y-2 text-sm text-purple-800">
                        <li>• Top 10 in AI consulting services</li>
                        <li>• Strong presence in financial services sector</li>
                        <li>• Growing healthcare and retail segments</li>
                        <li>• International expansion opportunities</li>
                      </ul>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-2">Growth Drivers</h4>
                      <ul className="space-y-2 text-sm text-orange-800">
                        <li>• AI adoption acceleration</li>
                        <li>• Digital transformation demand</li>
                        <li>• Cloud migration trends</li>
                        <li>• Regulatory compliance needs</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Why Tokenize IntelliPro Group?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Globe className="h-6 w-6 text-blue-600" />
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">Global Access</h5>
                      <p className="text-sm text-gray-600">Enable worldwide investment in a growing tech company</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Target className="h-6 w-6 text-green-600" />
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">Fractional Ownership</h5>
                      <p className="text-sm text-gray-600">Investors can own small portions of the business</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">Liquidity</h5>
                      <p className="text-sm text-gray-600">Trade tokens on secondary markets</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  Tokenization Structure & Economics
                </CardTitle>
                <CardDescription>
                  Financial breakdown and token distribution strategy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Tokenization Parameters</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Company Valuation</span>
                        <span className="font-medium">$25,000,000</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Token Supply</span>
                        <span className="font-medium">1,000,000 IPG</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Token Price</span>
                        <span className="font-medium">$25.00</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Min Investment</span>
                        <span className="font-medium">$5,000</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Max Investment</span>
                        <span className="font-medium">$500,000</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Expected Returns</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-600">Annual Yield</span>
                        <span className="font-medium text-blue-900">8.5%</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-green-600">Investment Term</span>
                        <span className="font-medium text-green-900">5 years</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-purple-600">Exit Strategy</span>
                        <span className="font-medium text-purple-900">IPO or Acquisition</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="text-orange-600">Risk Level</span>
                        <span className="font-medium text-orange-900">Medium</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Token Distribution Strategy</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-bold text-blue-600">60%</span>
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">Public Offering</h5>
                      <p className="text-sm text-gray-600">600,000 tokens for investors</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-bold text-green-600">25%</span>
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">Company Reserve</h5>
                      <p className="text-sm text-gray-600">250,000 tokens for future use</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-bold text-purple-600">10%</span>
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">Team Incentives</h5>
                      <p className="text-sm text-gray-600">100,000 tokens for employees</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-bold text-orange-600">5%</span>
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">Liquidity Pool</h5>
                      <p className="text-sm text-gray-600">50,000 tokens for trading</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">💰 Investment Example</h4>
                  <p className="text-yellow-700 text-sm">
                    If you invest $25,000, you'll receive 1,000 IPG tokens. At 8.5% annual yield, 
                    you'll earn approximately $2,125 per year in returns, with the potential for 
                    capital appreciation if the company grows and token value increases.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-red-600" />
                  Compliance & Regulatory Framework
                </CardTitle>
                <CardDescription>
                  KYC, AML, and regulatory compliance requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Required Compliance Checks</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium text-green-900">KYC Verification</div>
                          <div className="text-sm text-green-700">Identity verification for all stakeholders</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium text-green-900">AML Screening</div>
                          <div className="text-sm text-green-700">Anti-money laundering compliance</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium text-blue-900">Regulatory Review</div>
                          <div className="text-sm text-blue-700">SEC and state compliance verification</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium text-blue-900">Risk Assessment</div>
                          <div className="text-sm text-blue-700">Comprehensive risk evaluation</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Documentation Requirements</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium text-green-900">Financial Statements</div>
                          <div className="text-sm text-green-700">3 years of audited financials</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium text-green-900">Legal Documents</div>
                          <div className="text-sm text-green-700">Corporate structure and bylaws</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium text-green-900">Business Plan</div>
                          <div className="text-sm text-green-700">Detailed growth projections</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium text-green-900">Market Analysis</div>
                          <div className="text-sm text-green-700">Competitive landscape review</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-4">Regulatory Framework</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Lock className="h-6 w-6 text-blue-600" />
                      </div>
                      <h5 className="font-medium text-blue-900 mb-1">SEC Compliance</h5>
                      <p className="text-sm text-blue-700">Regulation A+ offering structure</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Shield className="h-6 w-6 text-green-600" />
                      </div>
                      <h5 className="font-medium text-green-900 mb-1">State Regulations</h5>
                      <p className="text-sm text-green-700">Blue sky law compliance</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <h5 className="font-medium text-purple-900 mb-1">Investor Protection</h5>
                      <p className="text-sm text-purple-700">Accredited investor verification</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">⚠️ Important Compliance Notes</h4>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• All investors must be accredited (net worth >$1M or income >$200K)</li>
                    <li>• Investment is subject to 5-year lock-up period</li>
                    <li>• Tokens represent economic interest, not voting rights</li>
                    <li>• Company must maintain ongoing compliance reporting</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-6 w-6 text-yellow-600" />
                  Smart Contract & Platform Launch
                </CardTitle>
                <CardDescription>
                  Blockchain deployment and trading platform integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Smart Contract Details</h4>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Contract Address</div>
                        <div className="font-mono text-xs bg-white p-2 rounded">
                          0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Token Standard</div>
                        <div className="font-medium">ERC-20 (Ethereum)</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Decimals</div>
                        <div className="font-medium">18</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Total Supply</div>
                        <div className="font-medium">1,000,000 IPG</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Launch Checklist</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium text-green-900">Smart Contract Deployed</div>
                          <div className="text-sm text-green-700">ERC-20 token on Ethereum mainnet</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium text-green-900">Liquidity Pool Created</div>
                          <div className="text-sm text-green-700">Initial $2.5M liquidity provided</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium text-green-900">Trading Enabled</div>
                          <div className="text-sm text-green-700">Secondary market now active</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium text-green-900">Investor Dashboard</div>
                          <div className="text-sm text-green-700">New asset visible to all users</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Platform Integration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <BarChart3 className="h-6 w-6 text-green-600" />
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">Trading Dashboard</h5>
                      <p className="text-sm text-gray-600">Real-time price charts and order book</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <PieChart className="h-6 w-6 text-blue-600" />
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">Portfolio Tracking</h5>
                      <p className="text-sm text-gray-600">Investment performance monitoring</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <LineChart className="h-6 w-6 text-purple-600" />
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">Analytics</h5>
                      <p className="text-sm text-gray-600">Market data and insights</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Activity className="h-6 w-6 text-orange-600" />
                      </div>
                      <h5 className="font-medium text-gray-900 mb-1">Notifications</h5>
                      <p className="text-sm text-gray-600">Real-time updates and alerts</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">🔗 Trading Information</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">Current Price:</span>
                      <div className="font-medium">$25.00</div>
                    </div>
                    <div>
                      <span className="text-blue-600">24h Volume:</span>
                      <div className="font-medium">$125,000</div>
                    </div>
                    <div>
                      <span className="text-blue-600">Market Cap:</span>
                      <div className="font-medium">$25M</div>
                    </div>
                    <div>
                      <span className="text-blue-600">Circulating Supply:</span>
                      <div className="font-medium">600,000 IPG</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-purple-600" />
                  Investment Opportunities & Benefits
                </CardTitle>
                <CardDescription>
                  How investors can participate and what they gain
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Investment Benefits</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium text-green-900">High Growth Potential</div>
                          <div className="text-sm text-green-700">Technology sector growth opportunities</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <DollarSign className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium text-blue-900">Regular Income</div>
                          <div className="text-sm text-blue-700">8.5% annual yield distribution</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <Globe className="h-5 w-5 text-purple-500" />
                        <div>
                          <div className="font-medium text-purple-900">Diversification</div>
                          <div className="text-sm text-purple-700">Access to private tech companies</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                        <Unlock className="h-5 w-5 text-orange-500" />
                        <div>
                          <div className="font-medium text-orange-900">Liquidity</div>
                          <div className="text-sm text-orange-700">Trade tokens on secondary markets</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Investment Process</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                        <div>
                          <div className="font-medium text-gray-900">Account Setup</div>
                          <div className="text-sm text-gray-700">Create AIMYA platform account</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                        <div>
                          <div className="font-medium text-gray-900">KYC Verification</div>
                          <div className="text-sm text-gray-700">Complete identity verification</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                        <div>
                          <div className="font-medium text-gray-900">Investment</div>
                          <div className="text-sm text-gray-700">Purchase IPG tokens</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">4</div>
                        <div>
                          <div className="font-medium text-gray-900">Management</div>
                          <div className="text-sm text-gray-700">Monitor and trade tokens</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-4">Investment Scenarios</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h5 className="font-medium text-gray-900 mb-2">Conservative Investor</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>• Investment: $25,000</div>
                        <div>• Tokens: 1,000 IPG</div>
                        <div>• Annual Return: $2,125</div>
                        <div>• Focus: Income generation</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h5 className="font-medium text-gray-900 mb-2">Growth Investor</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>• Investment: $100,000</div>
                        <div>• Tokens: 4,000 IPG</div>
                        <div>• Annual Return: $8,500</div>
                        <div>• Focus: Capital appreciation</div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h5 className="font-medium text-gray-900 mb-2">Institutional</h5>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>• Investment: $500,000</div>
                        <div>• Tokens: 20,000 IPG</div>
                        <div>• Annual Return: $42,500</div>
                        <div>• Focus: Portfolio diversification</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">📈 Growth Projections</h4>
                  <p className="text-yellow-700 text-sm">
                    Based on current growth trajectory and market conditions, IntelliPro Group projects 
                    35% annual revenue growth over the next 5 years. This could potentially increase 
                    token value significantly, providing both income and capital appreciation opportunities 
                    for investors.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          IntelliPro Group Onboarding Demo
        </h1>
        <p className="text-gray-600">
          Complete walkthrough of the asset tokenization process on the AIMYA platform
        </p>
      </div>

      {/* Section Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between overflow-x-auto">
          {sections.map((section, index) => (
            <div key={section.id} className="flex items-center">
              <div className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer transition-colors ${
                    currentSection === index 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  onClick={() => setCurrentSection(index)}
                >
                  {index + 1}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">{section.title}</div>
                  <div className="text-xs text-gray-500">{section.description}</div>
                </div>
              </div>
              {index < sections.length - 1 && (
                <div className="mx-4 w-16 h-0.5 bg-gray-300"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section Content */}
      <div className="mb-8">
        {renderSectionContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          {currentSection < sections.length - 1 ? (
            <Button
              onClick={() => setCurrentSection(currentSection + 1)}
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Demo Guide
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Demo Progress</h3>
        <div className="text-sm text-gray-600 mb-2">
          Section {currentSection + 1} of {sections.length}: {sections[currentSection].title}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}
