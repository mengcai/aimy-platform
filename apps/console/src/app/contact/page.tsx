"use client";

import { 
  Mail, 
  MapPin, 
  Phone, 
  MessageCircle,
  Send,
  ArrowLeft,
  MessageSquare,
  PhoneCall
} from 'lucide-react';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData);
    
    // In a real app, this would send to your backend
    console.log('Form submitted:', data);
    
    // Simulate form submission
    alert('Thank you for your message! We will get back to you within 24 hours.');
    
    // Reset form
    (e.target as HTMLFormElement).reset();
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hi! I'm interested in learning more about AIMYA investment opportunities.");
    window.open(`https://wa.me/1234567890?text=${message}`, '_blank');
  };

  const handleTelegram = () => {
    const message = encodeURIComponent("Hi! I'm interested in learning more about AIMYA investment opportunities.");
    window.open(`https://t.me/aimya_support?text=${message}`, '_blank');
  };

  const handleCall = () => {
    window.open('tel:+15551234567', '_self');
  };

  const handleEmail = () => {
    window.open('mailto:support@aimya.com?subject=Investment Inquiry', '_self');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">AIMYA</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Home</a>
              <a href="/assets" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Assets</a>
              <a href="/ai-copilot" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">AI Copilot</a>
              <a href="/contact" className="text-blue-600 font-medium">Contact</a>
            </nav>
            <div className="flex items-center space-x-4">
              <a href="/login">
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent h-10 px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">
                  Sign in
                </button>
              </a>
              <a href="/signup">
                <button className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg">
                  Get started
                </button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <a href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </a>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about our platform? Need support with your investments? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Office Location</h3>
                    <p className="text-gray-600">San Francisco, CA</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email Support</h3>
                    <p className="text-gray-600">support@aimya.com</p>
                    <p className="text-sm text-gray-500">We typically respond within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone Support</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500">Available during business hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact Options */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Contact Options</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center space-x-3 p-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors font-medium"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={handleTelegram}
                  className="flex items-center justify-center space-x-3 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Telegram</span>
                </button>
                <button
                  onClick={handleCall}
                  className="flex items-center justify-center space-x-3 p-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors font-medium"
                >
                  <PhoneCall className="h-5 w-5" />
                  <span>Call Now</span>
                </button>
                <button
                  onClick={handleEmail}
                  className="flex items-center justify-center space-x-3 p-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors font-medium"
                >
                  <Mail className="h-5 w-5" />
                  <span>Email</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">How do I get started with investing?</h3>
                  <p className="text-gray-600 text-sm">Create an account, complete KYC verification, and start browsing our available assets.</p>
                </div>
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">What is the minimum investment amount?</h3>
                  <p className="text-gray-600 text-sm">Minimum investments vary by asset, typically starting from $1,000.</p>
                </div>
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">How secure is my investment?</h3>
                  <p className="text-gray-600 text-sm">We use bank-grade security and blockchain technology to ensure the safety of your investments.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Can I withdraw my investment early?</h3>
                  <p className="text-gray-600 text-sm">Early withdrawal policies vary by asset. Check individual asset details for specific terms.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone number (optional)"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="investment">Investment Questions</option>
                  <option value="kyc">KYC & Verification</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="partnership">Partnership Opportunities</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please describe your inquiry in detail..."
                ></textarea>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="newsletter"
                  name="newsletter"
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="newsletter" className="text-sm text-gray-600">
                  I would like to receive updates about new investment opportunities and platform features
                </label>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Send className="mr-2 h-5 w-5" />
                Send Message
              </button>

              <p className="text-xs text-gray-500 text-center">
                By submitting this form, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>
        </div>

        {/* Additional Support Options */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Need Immediate Assistance?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Our support team is available to help you with any questions or concerns about your investments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/signup">
                <button className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Create Account
                </button>
              </a>
              <a href="/login">
                <button className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-transparent h-12 border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 rounded-xl transition-all duration-300">
                  Sign In
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
