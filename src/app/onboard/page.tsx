'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
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
  ArrowLeft
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed' | 'error'
}

interface AssetDetails {
  companyName: string
  industry: string
  location: string
  valuation: string
  tokenAmount: string
  minInvestment: string
  maxInvestment: string
  expectedYield: string
  term: string
  description: string
}

export default function AssetOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [assetDetails, setAssetDetails] = useState<AssetDetails>({
    companyName: 'IntelliPro Group',
    industry: 'Technology & Professional Services',
    location: 'New York, NY',
    valuation: '25000000',
    tokenAmount: '1000000',
    minInvestment: '5000',
    maxInvestment: '500000',
    expectedYield: '8.5',
    term: '5',
    description: 'IntelliPro Group is a leading technology consulting and professional services company specializing in digital transformation, AI implementation, and enterprise software solutions.'
  })

  const [documents, setDocuments] = useState({
    financialStatements: false,
    businessPlan: false,
    legalDocuments: false,
    complianceCertificates: false,
    marketAnalysis: false
  })

  const [complianceChecks, setComplianceChecks] = useState({
    kyc: false,
    aml: false,
    regulatory: false,
    riskAssessment: false
  })

  const steps: OnboardingStep[] = [
    {
      id: 'company-info',
      title: 'Company Information',
      description: 'Basic company details and business overview',
      status: 'completed'
    },
    {
      id: 'asset-valuation',
      title: 'Asset Valuation',
      description: 'Financial assessment and tokenization structure',
      status: 'completed'
    },
    {
      id: 'documentation',
      title: 'Documentation',
      description: 'Required legal and financial documents',
      status: 'in-progress'
    },
    {
      id: 'compliance',
      title: 'Compliance & KYC',
      description: 'Regulatory compliance and verification',
      status: 'pending'
    },
    {
      id: 'review',
      title: 'Review & Approval',
      description: 'Final review and platform approval',
      status: 'pending'
    },
    {
      id: 'launch',
      title: 'Token Launch',
      description: 'Smart contract deployment and trading',
      status: 'pending'
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      // Update step status
      steps[currentStep].status = 'completed'
      if (currentStep + 1 < steps.length) {
        steps[currentStep + 1].status = 'in-progress'
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleDocumentUpload = (documentType: keyof typeof documents) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: true
    }))
  }

  const handleComplianceCheck = (checkType: keyof typeof complianceChecks) => {
    setComplianceChecks(prev => ({
      ...prev,
      [checkType]: true
    }))
  }

  const getStepStatusIcon = (status: OnboardingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in-progress':
        return <AlertCircle className="h-5 w-5 text-blue-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Overview
                </CardTitle>
                <CardDescription>
                  Basic information about IntelliPro Group
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <Input
                      value={assetDetails.companyName}
                      onChange={(e) => setAssetDetails(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <Input
                      value={assetDetails.industry}
                      onChange={(e) => setAssetDetails(prev => ({ ...prev, industry: e.target.value }))}
                      placeholder="Enter industry"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <Input
                      value={assetDetails.location}
                      onChange={(e) => setAssetDetails(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Description
                    </label>
                    <textarea
                      value={assetDetails.description}
                      onChange={(e) => setAssetDetails(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Describe the business"
                    />
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
                  <TrendingUp className="h-5 w-5" />
                  Asset Valuation & Tokenization
                </CardTitle>
                <CardDescription>
                  Financial structure and tokenization parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Valuation ($)
                    </label>
                    <Input
                      value={assetDetails.valuation}
                      onChange={(e) => setAssetDetails(prev => ({ ...prev, valuation: e.target.value }))}
                      placeholder="25,000,000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Token Amount
                    </label>
                    <Input
                      value={assetDetails.tokenAmount}
                      onChange={(e) => setAssetDetails(prev => ({ ...prev, tokenAmount: e.target.value }))}
                      placeholder="1,000,000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Investment ($)
                    </label>
                    <Input
                      value={assetDetails.minInvestment}
                      onChange={(e) => setAssetDetails(prev => ({ ...prev, minInvestment: e.target.value }))}
                      placeholder="5,000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Investment ($)
                    </label>
                    <Input
                      value={assetDetails.maxInvestment}
                      onChange={(e) => setAssetDetails(prev => ({ ...prev, maxInvestment: e.target.value }))}
                      placeholder="500,000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Annual Yield (%)
                    </label>
                    <Input
                      value={assetDetails.expectedYield}
                      onChange={(e) => setAssetDetails(prev => ({ ...prev, expectedYield: e.target.value }))}
                      placeholder="8.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Investment Term (Years)
                    </label>
                    <Input
                      value={assetDetails.term}
                      onChange={(e) => setAssetDetails(prev => ({ ...prev, term: e.target.value }))}
                      placeholder="5"
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Tokenization Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">Token Price:</span>
                      <div className="font-medium">${(parseInt(assetDetails.valuation) / parseInt(assetDetails.tokenAmount)).toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="text-blue-600">Total Value:</span>
                      <div className="font-medium">${parseInt(assetDetails.valuation).toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-blue-600">Expected Return:</span>
                      <div className="font-medium">{assetDetails.expectedYield}%</div>
                    </div>
                    <div>
                      <span className="text-blue-600">Term:</span>
                      <div className="font-medium">{assetDetails.term} years</div>
                    </div>
                  </div>
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
                  <FileText className="h-5 w-5" />
                  Required Documentation
                </CardTitle>
                <CardDescription>
                  Upload all necessary legal and financial documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(documents).map(([key, uploaded]) => (
                    <div key={key} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h4>
                        {uploaded ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Upload className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {key === 'financialStatements' && 'Last 3 years of audited financial statements'}
                        {key === 'businessPlan' && 'Detailed business plan and growth projections'}
                        {key === 'legalDocuments' && 'Corporate structure and legal entity documents'}
                        {key === 'complianceCertificates' && 'Regulatory compliance certificates'}
                        {key === 'marketAnalysis' && 'Market research and competitive analysis'}
                      </p>
                      <Button
                        variant={uploaded ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleDocumentUpload(key as keyof typeof documents)}
                        className="w-full"
                      >
                        {uploaded ? 'Document Uploaded' : 'Upload Document'}
                      </Button>
                    </div>
                  ))}
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
                  <Shield className="h-5 w-5" />
                  Compliance & KYC Verification
                </CardTitle>
                <CardDescription>
                  Regulatory compliance checks and verification processes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(complianceChecks).map(([key, completed]) => (
                    <div key={key} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium uppercase">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </h4>
                        {completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {key === 'kyc' && 'Know Your Customer verification for all stakeholders'}
                        {key === 'aml' && 'Anti-Money Laundering compliance check'}
                        {key === 'regulatory' && 'Regulatory framework compliance verification'}
                        {key === 'riskAssessment' && 'Comprehensive risk assessment and scoring'}
                      </p>
                      <Button
                        variant={completed ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleComplianceCheck(key as keyof typeof complianceChecks)}
                        className="w-full"
                      >
                        {completed ? 'Verification Complete' : 'Start Verification'}
                      </Button>
                    </div>
                  ))}
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
                  <Eye className="h-5 w-5" />
                  Review & Approval
                </CardTitle>
                <CardDescription>
                  Final review of all information before platform approval
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">✅ All Requirements Met</h4>
                  <p className="text-green-700 text-sm">
                    IntelliPro Group has successfully completed all onboarding requirements and is ready for platform approval.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Asset Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Company:</span>
                        <span className="font-medium">{assetDetails.companyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Industry:</span>
                        <span className="font-medium">{assetDetails.industry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{assetDetails.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valuation:</span>
                        <span className="font-medium">${parseInt(assetDetails.valuation).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tokens:</span>
                        <span className="font-medium">{parseInt(assetDetails.tokenAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min Investment:</span>
                        <span className="font-medium">${parseInt(assetDetails.minInvestment).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Yield:</span>
                        <span className="font-medium">{assetDetails.expectedYield}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Term:</span>
                        <span className="font-medium">{assetDetails.term} years</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Documentation Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(documents).map(([key, uploaded]) => (
                      <div key={key} className="flex items-center gap-2">
                        {uploaded ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Compliance Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(complianceChecks).map(([key, completed]) => (
                      <div key={key} className="flex items-center gap-2">
                        {completed ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm uppercase">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Token Launch
                </CardTitle>
                <CardDescription>
                  Smart contract deployment and trading platform integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">🚀 Launch Ready!</h4>
                  <p className="text-lg text-gray-600 mb-6">
                    IntelliPro Group tokens are ready for launch on the AIMYA platform.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Launch Checklist</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium text-green-900">Smart Contract Deployed</div>
                        <div className="text-sm text-green-700">ERC-20 token contract on Ethereum mainnet</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium text-green-900">Liquidity Pool Created</div>
                        <div className="text-sm text-green-700">Initial liquidity of $2.5M provided</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium text-green-900">Trading Enabled</div>
                        <div className="text-sm text-green-700">Secondary market trading now available</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium text-green-900">Investor Dashboard Updated</div>
                        <div className="text-sm text-green-700">New asset visible to all investors</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Token Details</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Contract Address:</span>
                        <div className="font-mono text-xs bg-white p-2 rounded mt-1">
                          0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Token Symbol:</span>
                        <div className="font-medium">IPG</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Decimals:</span>
                        <div className="font-medium">18</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Supply:</span>
                        <div className="font-medium">1,000,000 IPG</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Next Steps</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Monitor initial trading activity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Provide ongoing investor support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Quarterly performance reporting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Regulatory compliance monitoring</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">🎉 Congratulations!</h4>
                  <p className="text-yellow-700 text-sm">
                    IntelliPro Group has been successfully onboarded to the AIMYA platform. The asset is now available for investment and trading.
                  </p>
                  <div className="mt-3">
                    <a 
                      href="/assets" 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      View IntelliPro Group in Assets
                    </a>
                  </div>
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
          Asset Onboarding Wizard
        </h1>
        <p className="text-gray-600">
          Onboard IntelliPro Group to the AIMY platform for tokenization
        </p>
        <div className="mt-4">
          <a 
            href="/onboard/demo" 
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Eye className="h-4 w-4" />
            View Complete Demo Walkthrough
          </a>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center">
                {getStepStatusIcon(step.status)}
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="mx-4 w-16 h-0.5 bg-gray-300"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
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
              Download Summary
            </Button>
          )}
        </div>
      </div>

      {/* Current Status */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Current Status</h3>
        <div className="text-sm text-gray-600">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
        </div>
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
