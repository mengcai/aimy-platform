import { ArrowLeft, Shield, FileText, Users, Lock, Globe } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-gray-900">
              <Globe className="h-8 w-8 text-blue-600" />
              AIMYA
            </Link>
            <Link 
              href="/" 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-xl text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Terms Content */}
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-6 w-6 text-blue-600 mr-3" />
                  1. Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Welcome to AIMYA ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our AI-powered investment platform, including our website, mobile applications, and related services (collectively, the "Service").
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access the Service.
                </p>
              </section>

              {/* Service Description */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Globe className="h-6 w-6 text-blue-600 mr-3" />
                  2. Service Description
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  AIMYA provides an AI-powered investment platform that enables users to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Browse and invest in tokenized real-world assets</li>
                  <li>Access AI-driven investment insights and recommendations</li>
                  <li>Manage investment portfolios with advanced analytics</li>
                  <li>Participate in asset tokenization and fractional ownership</li>
                  <li>Access educational resources and market analysis</li>
                </ul>
              </section>

              {/* User Accounts */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-3" />
                  3. User Accounts and Registration
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  To access certain features of our Service, you must create an account. You agree to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your account information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Be at least 18 years old and legally competent</li>
                </ul>
              </section>

              {/* Investment Risks */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-6 w-6 text-blue-600 mr-3" />
                  4. Investment Risks and Disclaimers
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Important:</strong> Investing involves substantial risk of loss and is not suitable for all investors. You acknowledge that:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Past performance does not guarantee future results</li>
                  <li>Asset values can fluctuate and may result in loss of principal</li>
                  <li>AI recommendations are for informational purposes only</li>
                  <li>You should consult with qualified financial advisors before investing</li>
                  <li>Cryptocurrency and blockchain investments carry additional risks</li>
                </ul>
              </section>

              {/* AI Services */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Globe className="h-6 w-6 text-blue-600 mr-3" />
                  5. AI Services and Limitations
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Our AI-powered services are designed to assist with investment decisions but have limitations:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>AI insights are based on available data and may not be complete</li>
                  <li>Market conditions can change rapidly, affecting AI predictions</li>
                  <li>AI recommendations should not be the sole basis for investment decisions</li>
                  <li>We are not responsible for investment outcomes based on AI suggestions</li>
                </ul>
              </section>

              {/* Prohibited Activities */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Lock className="h-6 w-6 text-blue-600 mr-3" />
                  6. Prohibited Activities
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You agree not to use our Service to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Engage in market manipulation or insider trading</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with the proper functioning of the Service</li>
                  <li>Use the Service for illegal or fraudulent purposes</li>
                </ul>
              </section>

              {/* Fees and Payments */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-6 w-6 text-blue-600 mr-3" />
                  7. Fees, Payments, and Taxes
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You are responsible for:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>All applicable fees associated with your use of the Service</li>
                  <li>Transaction fees for investments and withdrawals</li>
                  <li>Tax obligations related to your investment activities</li>
                  <li>Maintaining sufficient funds for your investment activities</li>
                </ul>
              </section>

              {/* Privacy and Data */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Lock className="h-6 w-6 text-blue-600 mr-3" />
                  8. Privacy and Data Protection
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
                </p>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-6 w-6 text-blue-600 mr-3" />
                  9. Intellectual Property Rights
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  The Service and its original content, features, and functionality are owned by AIMYA and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-3" />
                  10. Termination
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may terminate or suspend your account and access to the Service at any time, with or without cause, with or without notice, effective immediately. Upon termination, your right to use the Service will cease immediately.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-6 w-6 text-blue-600 mr-3" />
                  11. Limitation of Liability
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  To the maximum extent permitted by law, AIMYA shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </p>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Globe className="h-6 w-6 text-blue-600 mr-3" />
                  12. Governing Law and Dispute Resolution
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of the State of California, United States. Any disputes arising from these Terms or your use of the Service shall be resolved through binding arbitration.
                </p>
              </section>

              {/* Changes to Terms */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-6 w-6 text-blue-600 mr-3" />
                  13. Changes to Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-3" />
                  14. Contact Information
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <p className="text-gray-700">
                    <strong>Email:</strong> support@aimya.ai<br />
                    <strong>Address:</strong> San Francisco, CA<br />
                    <strong>Website:</strong> https://aimya.ai
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

