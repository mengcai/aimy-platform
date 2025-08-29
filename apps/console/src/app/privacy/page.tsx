import { ArrowLeft, Shield, FileText, Users, Lock, Globe, Eye, Database, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
              <ShieldCheck className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-xl text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Privacy Content */}
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-6 w-6 text-blue-600 mr-3" />
                  1. Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  AIMYA ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered investment platform and related services.
                </p>
                <p className="text-gray-700 leading-relaxed mt-4">
                  By using our services, you consent to the data practices described in this policy. We are committed to transparency and will notify you of any material changes to this policy.
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Database className="h-6 w-6 text-blue-600 mr-3" />
                  2. Information We Collect
                </h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We collect personal information that you provide directly to us:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>Name, email address, and contact information</li>
                  <li>Date of birth and government-issued identification</li>
                  <li>Financial information and investment preferences</li>
                  <li>KYC/AML verification documents</li>
                  <li>Account credentials and security information</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Usage Information</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We automatically collect information about your use of our services:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>IP address and device information</li>
                  <li>Browser type and operating system</li>
                  <li>Pages visited and time spent on our platform</li>
                  <li>Investment activities and portfolio interactions</li>
                  <li>AI interaction patterns and preferences</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Third-Party Information</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may receive information from third-party sources, including:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-2">
                  <li>Identity verification services</li>
                  <li>Financial institutions and payment processors</li>
                  <li>Public records and regulatory databases</li>
                  <li>Analytics and marketing partners</li>
                </ul>
              </section>

              {/* How We Use Information */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Eye className="h-6 w-6 text-blue-600 mr-3" />
                  3. How We Use Your Information
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Provide, maintain, and improve our investment platform</li>
                  <li>Process transactions and manage your investment account</li>
                  <li>Verify your identity and comply with regulatory requirements</li>
                  <li>Personalize your experience and provide AI-driven insights</li>
                  <li>Communicate with you about your account and our services</li>
                  <li>Detect and prevent fraud, abuse, and security threats</li>
                  <li>Comply with legal obligations and regulatory requirements</li>
                </ul>
              </section>

              {/* Information Sharing */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-3" />
                  4. Information Sharing and Disclosure
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in operating our platform</li>
                  <li><strong>Legal Requirements:</strong> When required by law, regulation, or legal process</li>
                  <li><strong>Regulatory Compliance:</strong> With regulatory authorities for KYC/AML purposes</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                  <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety</li>
                </ul>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Lock className="h-6 w-6 text-blue-600 mr-3" />
                  5. Data Security and Protection
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement comprehensive security measures to protect your information:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Bank-grade encryption for data transmission and storage</li>
                  <li>Multi-factor authentication and secure access controls</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Employee training on data protection and privacy</li>
                  <li>Incident response procedures and breach notification protocols</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  However, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security but are committed to maintaining the highest standards of data protection.
                </p>
              </section>

              {/* Data Retention */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Database className="h-6 w-6 text-blue-600 mr-3" />
                  6. Data Retention and Deletion
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We retain your personal information for as long as necessary to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2">
                  <li>Provide our services and maintain your account</li>
                  <li>Comply with legal and regulatory requirements</li>
                  <li>Resolve disputes and enforce our agreements</li>
                  <li>Detect and prevent fraud and security threats</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  You may request deletion of your account and associated data, subject to our legal obligations to retain certain information for regulatory compliance.
                </p>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-6 w-6 text-blue-600 mr-3" />
                  7. Your Privacy Rights
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal information</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Receive your data in a portable format</li>
                  <li><strong>Restriction:</strong> Limit how we use your information</li>
                  <li><strong>Objection:</strong> Object to certain processing activities</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  To exercise these rights, please contact us at support@aimya.ai.
                </p>
              </section>

              {/* Cookies and Tracking */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Eye className="h-6 w-6 text-blue-600 mr-3" />
                  8. Cookies and Tracking Technologies
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use cookies and similar technologies to enhance your experience:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
                  <li><strong>Security Cookies:</strong> Protect against fraud and security threats</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  You can control cookie settings through your browser preferences, though disabling certain cookies may affect platform functionality.
                </p>
              </section>

              {/* AI and Machine Learning */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Globe className="h-6 w-6 text-blue-600 mr-3" />
                  9. AI and Machine Learning
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our platform uses artificial intelligence and machine learning to provide investment insights:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>AI models analyze market data and investment patterns</li>
                  <li>Personalized recommendations based on your profile and preferences</li>
                  <li>Risk assessment and portfolio optimization algorithms</li>
                  <li>Fraud detection and security monitoring systems</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-4">
                  We ensure that AI processing respects your privacy rights and complies with applicable data protection regulations.
                </p>
              </section>

              {/* International Transfers */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Globe className="h-6 w-6 text-blue-600 mr-3" />
                  10. International Data Transfers
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-3" />
                  11. Children's Privacy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                </p>
              </section>

              {/* Changes to Policy */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-6 w-6 text-blue-600 mr-3" />
                  12. Changes to This Privacy Policy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our platform and updating the "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Users className="h-6 w-6 text-blue-600 mr-3" />
                  13. Contact Us
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">
                    <strong>Email:</strong> support@aimya.ai<br />
                    <strong>Address:</strong> San Francisco, CA<br />
                    <strong>Website:</strong> https://aimya.ai
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed mt-4">
                  We are committed to addressing your privacy concerns and will respond to your inquiry within a reasonable timeframe.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

