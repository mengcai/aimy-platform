'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  Star, 
  Network, 
  FileCode, 
  Coins, 
  Building, 
  Target, 
  TrendingUp, 
  Rocket, 
  Users, 
  Clock, 
  Lock, 
  Award,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  Twitter,
  Linkedin,
  Github,
  Phone,
  MessageSquare,
  PhoneCall,
  Sparkles,
  PieChart,
  Brain,
  Leaf,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { getAssetImage } from '@/lib/asset-images';



// Web3 features with updated content focus
const web3Features = [
  {
    icon: Network,
    title: 'Blockchain Infrastructure',
    description: 'Built on enterprise-grade blockchain technology for transparency and immutability'
  },
  {
    icon: FileCode,
    title: 'Smart Contracts',
    description: 'Automated compliance and execution through audited smart contracts'
  },
  {
    icon: Coins,
    title: 'Stablecoin Integration',
    description: 'Seamless integration with USDC, USDT, and other stablecoins for enhanced liquidity'
  },
  {
    icon: Building,
    title: 'Real World Assets (RWA)',
    description: 'Tokenization of physical assets including real estate, commodities, and infrastructure'
  },
  {
    icon: FileCode,
    title: 'Large Language Models (LLM)',
    description: 'AI-powered analysis using advanced language models for market insights and risk assessment'
  },
  {
    icon: FileCode,
    title: 'AI-Powered Analytics',
    description: 'Advanced machine learning for market analysis and investment insights'
  }
];

// Technology stack with real company names
const technologyStack = [
  { icon: '🔷', name: 'Ethereum', description: 'Smart contract platform' },
  { icon: '🟣', name: 'Polygon', description: 'Layer 2 scaling solution' },
  { icon: '💵', name: 'USDC', description: 'Stablecoin integration' },
  { icon: '🟡', name: 'USDT', description: 'Tether stablecoin' },
  { icon: '🔗', name: 'Chainlink', description: 'Oracle data feeds' },
  { icon: '🛡️', name: 'OpenZeppelin', description: 'Security standards' },
  { icon: '🤖', name: 'GPT-5', description: 'Advanced LLM for analysis' },
  { icon: '⚡', name: 'Solana', description: 'High-performance blockchain' }
];

// Featured assets with larger images and consistent data
const featuredAssets = [
  {
    id: 'solar-farm-alpha',
    name: 'Solar Farm Alpha',
    type: 'renewable energy',
    location: 'California, USA',
    value: '$25,000,000',
    yield: '8.5%',
    investors: 156,
    description: 'Large-scale solar energy facility with advanced photovoltaic technology'
  },
  {
    id: 'real-estate-fund-beta',
    name: 'Real Estate Fund Beta',
    type: 'real estate',
    location: 'New York, USA',
    value: '$15,000,000',
    yield: '6.2%',
    investors: 89,
    description: 'Diversified commercial real estate portfolio with prime locations'
  },
  {
    id: 'infrastructure-bonds-gamma',
    name: 'Infrastructure Bonds Gamma',
    type: 'infrastructure',
    location: 'Texas, USA',
    value: '$8,000,000',
    yield: '5.8%',
    investors: 234,
    description: 'Government-backed infrastructure bonds for transportation projects'
  }
];

export default function HomePage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
    newsletter: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Send the form data to our API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus('success');
        setSubmitMessage('Thank you! Your message has been sent successfully to cal.ericcai@gmail.com. We\'ll get back to you within 24 hours.');
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          subject: '',
          message: '',
          newsletter: false
        });
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
      
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Sorry, there was an error sending your message. Please try again or contact us directly at support@aimya.com');
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // AI response generator function
  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('portfolio') || input.includes('review')) {
      return "Based on your portfolio analysis, I recommend rebalancing towards renewable energy (25%) and infrastructure (30%). Your current allocation shows good diversification, but consider increasing exposure to emerging markets for growth potential.";
    } else if (input.includes('market') || input.includes('analysis')) {
      return "Current market analysis indicates strong momentum in renewable energy (+15% YTD) and infrastructure (+12% YTD). Tech sector showing recovery signs. I recommend maintaining defensive positions while gradually increasing growth exposure.";
    } else if (input.includes('risk') || input.includes('assessment')) {
      return "Risk assessment shows your portfolio has moderate risk exposure. Key risk factors: interest rate sensitivity (medium), market volatility (low), and sector concentration (medium). Consider adding inflation-protected assets for risk mitigation.";
    } else if (input.includes('investment') || input.includes('ideas')) {
      return "Top investment ideas for Q1 2025: 1) Solar energy ETFs (strong policy support), 2) Infrastructure bonds (government backing), 3) Real estate in tech hubs (demand growth), 4) Commodity funds (inflation hedge).";
    } else if (input.includes('renewable') || input.includes('energy')) {
      return "Renewable energy sector is experiencing unprecedented growth with solar up 23% and wind up 18% year-over-year. Key drivers: government incentives, declining technology costs, and corporate demand. Focus on utility-scale projects.";
    } else if (input.includes('real estate') || input.includes('property')) {
      return "Real estate market shows resilience with stable yields. Commercial properties in tech hubs have strong fundamentals. Consider REITs for diversification and professional management. Residential market varies by location.";
    } else if (input.includes('blockchain') || input.includes('crypto')) {
      return "Blockchain technology is revolutionizing finance through tokenization and smart contracts. RWA tokenization enables fractional ownership of high-value assets. Focus on regulated platforms and established protocols.";
    } else {
      return "Thank you for your question! I'm analyzing your query using real-time market data and AI models. For personalized investment recommendations, please provide more specific details about your investment goals and risk tolerance.";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center group">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-white font-bold text-2xl">A</span>
                </div>
                <span className="text-2xl font-bold text-gray-900 ml-3 group-hover:text-blue-600 transition-colors">AIMYA</span>
              </a>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Features
              </a>
              <a href="#assets" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Browse Assets
              </a>
              <a href="#ai-copilot" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                AI Copilot
              </a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                Contact
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center space-x-4">
              <a href="/login">
                <button className="px-6 py-3 text-gray-700 hover:text-blue-600 transition-colors font-medium rounded-xl hover:bg-blue-50">
                  Sign in
                </button>
              </a>
              <a href="/signup">
                <button className="inline-flex items-center justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 border-2 border-white text-white font-bold px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Sign up
                </button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-center max-w-5xl mx-auto">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg">
                <Rocket className="h-5 w-5 mr-2" />
                Next-Generation AI-Powered Investment Platform
              </div>
              <h1 className="text-6xl lg:text-8xl font-bold text-gray-900 mb-8 leading-tight">
                Revolutionizing Asset
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Tokenization</span>
              </h1>
              <p className="text-2xl lg:text-3xl text-gray-700 mb-8 leading-relaxed font-medium">
                AI My Assets
              </p>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Artificial Intelligence for Monetizing Your Assets
              </p>
              
              <p className="text-xl text-gray-600 mb-16 max-w-4xl mx-auto leading-relaxed">
                AIMYA is pioneering the future of digital asset investment by combining cutting-edge AI algorithms with institutional-grade blockchain infrastructure. 
                We're democratizing access to premium real-world assets—from renewable energy projects to commercial real estate—making them accessible to investors 
                of all sizes with fractional ownership starting at just $1. Our AI-driven platform provides intelligent portfolio optimization, real-time risk assessment, 
                and predictive market insights that were previously available only to institutional investors.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <a href="/signup">
                <button className="group inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-10 py-4 text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border-2 border-white">
                  <Rocket className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                  Start Investing Today
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </a>
              <a href="/login">
                <button className="group inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-14 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 font-bold px-10 py-4 text-lg rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border-2 border-gray-200 hover:border-gray-300">
                  <Shield className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                  Access Your Portfolio
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </a>
            </div>

            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">$189.5M</div>
                <div className="text-sm font-semibold text-gray-600 mb-1">Total Asset Value</div>
                <div className="text-xs text-gray-500">Institutional-grade real-world assets</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">12</div>
                <div className="text-sm font-semibold text-gray-600 mb-1">Premium Assets</div>
                <div className="text-xs text-gray-500">Diversified across multiple sectors</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">2,847</div>
                <div className="text-sm font-semibold text-gray-600 mb-1">Active Investors</div>
                <div className="text-xs text-gray-500">Building wealth through AI insights</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">8.4%</div>
                <div className="text-sm font-semibold text-gray-600 mb-1">Average Yield</div>
                <div className="text-xs text-gray-500">Consistent returns across portfolio</div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Features Section */}
      <section id="features" className="py-32 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-3"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-24">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Rocket className="h-5 w-5 mr-2" />
              Revolutionary Technology Stack
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Engineered for the 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Future of Finance</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              AIMYA represents the convergence of cutting-edge blockchain technology, advanced artificial intelligence, 
              and institutional-grade security. Our platform is designed to democratize access to premium investment opportunities 
              that were previously reserved for large institutions and high-net-worth individuals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/20 group hover:border-blue-200 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Network className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Enterprise Blockchain Infrastructure</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Built on institutional-grade blockchain technology with multi-layer security protocols, ensuring unparalleled transparency, immutability, and trust for all transactions.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/20 group hover:border-purple-200 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FileCode className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Intelligent Smart Contracts</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Advanced smart contracts with automated compliance, execution, and risk management, significantly reducing operational costs while eliminating human error.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/20 group hover:border-green-200 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Coins className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Seamless Stablecoin Integration</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Native integration with major stablecoins including USDC, USDT, and DAI, providing enhanced liquidity, stable value preservation, and instant settlement.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/20 group hover:border-orange-200 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Building className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Real World Asset Tokenization</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Revolutionary tokenization of physical assets including real estate, infrastructure, and commodities, enabling fractional ownership and global accessibility.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/20 group hover:border-indigo-200 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Brain className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">AI-Powered Investment Intelligence</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Sophisticated machine learning algorithms deliver real-time market insights, predictive analytics, and personalized investment recommendations.</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-white/20 group hover:border-teal-200 hover:scale-105">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Institutional-Grade Security</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Bank-level security infrastructure with comprehensive regulatory compliance, multi-signature protocols, and regular third-party security audits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Assets Section */}
      <section id="assets" className="py-32 bg-gradient-to-br from-white via-gray-50 to-blue-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-3"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-24">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Star className="h-5 w-5 mr-2" />
              Curated Investment Opportunities
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Premium Real-World Assets
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> Ready for Investment</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Discover a meticulously curated selection of institutional-grade investment opportunities. Each asset has been 
              carefully vetted and tokenized to provide you with access to previously inaccessible markets and returns.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                id: 'solar-farm-alpha',
                name: 'Solar Farm Alpha',
                type: 'renewable energy',
                location: 'California, USA',
                value: '$25,000,000',
                yield: '8.2%',
                investors: 156,
                image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
                description: 'Large-scale solar energy farm providing clean electricity to 15,000 homes.',
                minInvestment: 1,
                maxInvestment: 10000,
                riskLevel: 'Low',
                maturity: '15 years',
                sector: 'Renewable Energy',
                issuer: 'Green Energy Solutions',
                tokenSymbol: 'SFA',
                complianceStatus: 'Verified',
                documents: 5,
                lastValuation: '2024-01-15',
                remainingTokens: 125000,
                totalTokens: 500000,
                tokenPrice: 50,
                expectedReturn: '8.2% annually',
                paymentFrequency: 'Quarterly',
                assetClass: 'Infrastructure',
                environmentalImpact: 'Reduces 12,000 tons CO2 annually',
                technology: 'Advanced solar panels with 25-year warranty',
                gridConnection: 'Connected to California ISO grid',
                regulatoryApprovals: 'FERC approved, state permits secured',
                inceptionDate: '2023-03-15'
              },
              {
                id: 'real-estate-fund-beta',
                name: 'Real Estate Fund Beta',
                type: 'real estate',
                location: 'New York, USA',
                value: '$15,000,000',
                yield: '6.8%',
                investors: 89,
                image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
                description: 'Diversified real estate portfolio including commercial and residential properties.',
                minInvestment: 1,
                maxInvestment: 6000,
                riskLevel: 'Medium',
                maturity: '10 years',
                sector: 'Real Estate',
                issuer: 'Metro Real Estate Group',
                tokenSymbol: 'REFB',
                complianceStatus: 'Verified',
                documents: 4,
                lastValuation: '2024-01-10',
                remainingTokens: 75000,
                totalTokens: 300000,
                tokenPrice: 50,
                expectedReturn: '6.8% annually',
                paymentFrequency: 'Monthly',
                assetClass: 'Real Estate',
                propertyTypes: 'Office, Retail, Residential',
                locations: 'Manhattan, Brooklyn, Queens',
                occupancyRate: '94% average',
                tenantQuality: 'Investment grade tenants',
                propertyManagement: 'Professional management team',
                marketPosition: 'Prime locations in growing neighborhoods',
                appreciationPotential: 'Strong long-term appreciation expected',
                inceptionDate: '2023-06-20'
              },
              {
                id: 'infrastructure-bonds-gamma',
                name: 'Infrastructure Bonds Gamma',
                type: 'infrastructure',
                location: 'Texas, USA',
                value: '$8,000,000',
                yield: '7.5%',
                investors: 67,
                image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop',
                description: 'Infrastructure development bonds for transportation and utility projects.',
                minInvestment: 1,
                maxInvestment: 4000,
                riskLevel: 'Medium',
                maturity: '12 years',
                sector: 'Infrastructure',
                issuer: 'Infra Development Corp',
                tokenSymbol: 'IBG',
                complianceStatus: 'Verified',
                documents: 6,
                lastValuation: '2024-01-08',
                remainingTokens: 40000,
                totalTokens: 160000,
                tokenPrice: 50,
                expectedReturn: '7.5% annually',
                paymentFrequency: 'Semi-annually',
                assetClass: 'Fixed Income',
                projectTypes: 'Highways, Bridges, Utilities',
                governmentBacking: 'State and federal guarantees',
                constructionPhase: 'Phase 2 of 4 completed',
                completionDate: '2026 Q2',
                economicImpact: 'Creates 500+ local jobs',
                environmentalBenefits: 'Reduces traffic congestion, improves air quality',
                regulatoryStatus: 'All permits and approvals secured',
                insuranceCoverage: 'Comprehensive project insurance',
                inceptionDate: '2023-09-10'
              }
            ].map((asset, index) => (
              <div key={asset.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img 
                    src={asset.image} 
                    alt={asset.name} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{asset.name}</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      {asset.complianceStatus}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed text-sm">{asset.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Type</span>
                      <span className="font-medium text-gray-900 text-sm capitalize">{asset.type}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Location</span>
                      <span className="font-medium text-gray-900 text-sm">{asset.location}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Value</span>
                      <span className="font-medium text-green-600 text-sm">{asset.value}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Yield</span>
                      <span className="font-medium text-blue-600 text-sm">{asset.yield}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Token Price</span>
                      <span className="font-medium text-purple-600 text-sm">${asset.tokenPrice || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Risk Level</span>
                      <span className={`font-medium text-sm px-2 py-1 rounded-full ${
                        asset.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                        asset.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {asset.riskLevel}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Maturity</span>
                      <span className="font-medium text-gray-900 text-sm">{asset.maturity}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Min Investment</span>
                      <span className="font-medium text-gray-900 text-sm">{asset.minInvestment} token (${(asset.tokenPrice || 0) * asset.minInvestment})</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-500 text-sm">Investors</span>
                      <span className="font-medium text-gray-900 text-sm">{asset.investors}</span>
                    </div>
                  </div>

                  {/* Additional Asset Details */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm">Key Highlights</h4>
                    <div className="space-y-2 text-xs text-gray-600">
                      {asset.id === 'solar-farm-alpha' && (
                        <>
                          <div>• {asset.environmentalImpact}</div>
                          <div>• {asset.technology}</div>
                          <div>• {asset.gridConnection}</div>
                          <div>• {asset.regulatoryApprovals}</div>
                        </>
                      )}
                      {asset.id === 'real-estate-fund-beta' && (
                        <>
                          <div>• {asset.propertyTypes}</div>
                          <div>• {asset.occupancyRate} occupancy rate</div>
                          <div>• {asset.tenantQuality}</div>
                          <div>• {asset.marketPosition}</div>
                        </>
                      )}
                      {asset.id === 'infrastructure-bonds-gamma' && (
                        <>
                          <div>• {asset.projectTypes}</div>
                          <div>• {asset.governmentBacking}</div>
                          <div>• {asset.constructionPhase}</div>
                          <div>• {asset.economicImpact}</div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <a href="/login" className="flex-1">
                      <button className="w-full inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl">
                        Invest Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </a>
                    <button 
                      className="flex-1 inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-xl"
                      onClick={() => {
                        // Create and show detailed asset modal
                        const modal = document.createElement('div');
                        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
                        modal.innerHTML = `
                          <div class="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
                            <!-- Header -->
                            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6 rounded-t-2xl">
                              <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-4">
                                  <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                                    <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                    </svg>
                                  </div>
                                  <div>
                                    <h2 class="text-2xl font-bold text-gray-900">${asset.name}</h2>
                                    <div class="flex items-center space-x-2 mt-2">
                                      <span class="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                        ${asset.complianceStatus}
                                      </span>
                                      <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                        ${asset.sector}
                                      </span>
                                      <span class="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                                        ${asset.assetClass || 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                  </svg>
                                </button>
                              </div>
                            </div>
                            
                            <!-- Content -->
                            <div class="overflow-y-auto max-h-[calc(95vh-120px)] p-6">
                              <!-- Asset Image and Quick Stats -->
                              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                <!-- Left: Asset Image -->
                                <div class="lg:col-span-1">
                                  <img src="${asset.image}" alt="${asset.name}" class="w-full h-48 object-cover rounded-xl mb-4" />
                                  <div class="bg-gray-50 rounded-xl p-4">
                                    <h3 class="font-semibold text-gray-900 mb-3 text-sm">Quick Facts</h3>
                                    <div class="space-y-3 text-sm">
                                      <div class="flex justify-between">
                                        <span class="text-gray-500">Token Symbol:</span>
                                        <span class="font-medium text-gray-900">${asset.tokenSymbol}</span>
                                      </div>
                                      <div class="flex justify-between">
                                        <span class="text-gray-500">Token Price:</span>
                                        <span class="font-medium text-purple-600">$${asset.tokenPrice || 'N/A'}</span>
                                      </div>
                                      <div class="flex justify-between">
                                        <span class="text-gray-500">Total Tokens:</span>
                                        <span class="font-medium text-gray-900">${asset.totalTokens?.toLocaleString() || 'N/A'}</span>
                                      </div>
                                      <div class="flex justify-between">
                                        <span class="text-gray-500">Remaining:</span>
                                        <span class="font-medium text-gray-900">${asset.remainingTokens?.toLocaleString() || 'N/A'}</span>
                                      </div>
                                      <div class="flex justify-between">
                                        <span class="text-gray-500">Documents:</span>
                                        <span class="font-medium text-gray-900">${asset.documents || 'N/A'}</span>
                                      </div>
                                      <div class="flex justify-between">
                                        <span class="text-gray-500">Inception:</span>
                                        <span class="font-medium text-gray-900">${asset.inceptionDate || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <!-- Center: Investment Details -->
                                <div class="lg:col-span-1">
                                  <div class="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                    <h3 class="font-semibold text-gray-900 mb-4 flex items-center text-sm">
                                      <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                      </svg>
                                      Investment Details
                                    </h3>
                                    <div class="space-y-3">
                                      <div class="flex justify-between items-center py-2 border-b border-blue-100">
                                        <span class="text-gray-600 text-sm">Minimum Investment</span>
                                        <span class="font-semibold text-gray-900 text-sm">${asset.minInvestment} token ($${(asset.tokenPrice || 0) * asset.minInvestment})</span>
                                      </div>
                                      <div class="flex justify-between items-center py-2 border-b border-blue-100">
                                        <span class="text-gray-600 text-sm">Maximum Investment</span>
                                        <span class="font-semibold text-gray-900 text-sm">${asset.maxInvestment} tokens ($${(asset.tokenPrice || 0) * asset.maxInvestment})</span>
                                      </div>
                                      <div class="flex justify-between items-center py-2 border-b border-blue-100">
                                        <span class="text-gray-600 text-sm">Token Price</span>
                                        <span class="font-semibold text-purple-600 text-sm">$${asset.tokenPrice || 'N/A'}</span>
                                      </div>
                                      <div class="flex justify-between items-center py-2 border-b border-blue-100">
                                        <span class="text-gray-600 text-sm">Expected Return</span>
                                        <span class="font-semibold text-green-600 text-sm">${asset.expectedReturn || 'N/A'}</span>
                                      </div>
                                      <div class="flex justify-between items-center py-2 border-b border-blue-100">
                                        <span class="text-gray-600 text-sm">Payment Frequency</span>
                                        <span class="font-semibold text-gray-900 text-sm">${asset.paymentFrequency || 'N/A'}</span>
                                      </div>
                                      <div class="flex justify-between items-center py-2">
                                        <span class="text-gray-600 text-sm">Maturity</span>
                                        <span class="font-semibold text-gray-900 text-sm">${asset.maturity || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <!-- Right: Risk & Performance -->
                                <div class="lg:col-span-1">
                                  <div class="bg-orange-50 rounded-xl p-5 border border-orange-100">
                                    <h3 class="font-semibold text-gray-900 mb-4 flex items-center text-sm">
                                      <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                      </svg>
                                      Risk & Performance
                                    </h3>
                                    <div class="space-y-3">
                                      <div class="flex justify-between items-center py-2 border-b border-orange-100">
                                        <span class="text-gray-600 text-sm">Risk Level</span>
                                        <span class="px-2 py-1 rounded-full text-xs font-medium ${
                                          asset.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                                          asset.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-red-100 text-red-800'
                                        }">${asset.riskLevel || 'N/A'}</span>
                                      </div>
                                      <div class="flex justify-between items-center py-2 border-b border-orange-100">
                                        <span class="text-gray-600 text-sm">Current Yield</span>
                                        <span class="font-semibold text-blue-600 text-sm">${asset.yield || 'N/A'}</span>
                                      </div>
                                      <div class="flex justify-between items-center py-2 border-b border-orange-100">
                                        <span class="text-gray-600 text-sm">Total Investors</span>
                                        <span class="font-semibold text-gray-900 text-sm">${asset.investors || 'N/A'}</span>
                                      </div>
                                      <div class="flex justify-between items-center py-2 border-b border-orange-100">
                                        <span class="text-gray-600 text-sm">Last Valuation</span>
                                        <span class="font-semibold text-gray-900 text-sm">${asset.lastValuation || 'N/A'}</span>
                                      </div>
                                      <div class="flex justify-between items-center py-2">
                                        <span class="text-gray-600 text-sm">Total Value</span>
                                        <span class="font-semibold text-gray-900 text-sm">${asset.value}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <!-- Investment Calculator -->
                              <div class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 mb-8 border border-emerald-100">
                                <h3 class="font-semibold text-gray-900 mb-6 flex items-center">
                                  <svg class="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                  </svg>
                                  Investment Calculator
                                </h3>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div class="bg-white rounded-lg p-4 border border-emerald-100">
                                    <div class="text-center">
                                      <div class="text-2xl font-bold text-emerald-600 mb-2">1 Token</div>
                                      <div class="text-sm text-gray-500 mb-2">Minimum Investment</div>
                                      <div class="text-lg font-semibold text-gray-900">$${asset.tokenPrice || 'N/A'}</div>
                                      <div class="text-xs text-gray-400 mt-1">Start your investment journey</div>
                                    </div>
                                  </div>
                                  <div class="bg-white rounded-lg p-4 border border-emerald-100">
                                    <div class="text-center">
                                      <div class="text-2xl font-bold text-emerald-600 mb-2">10 Tokens</div>
                                      <div class="text-sm text-gray-500 mb-2">Popular Choice</div>
                                      <div class="text-lg font-semibold text-gray-900">$${(asset.tokenPrice || 0) * 10}</div>
                                      <div class="text-xs text-gray-400 mt-1">Build your portfolio</div>
                                    </div>
                                  </div>
                                  <div class="bg-white rounded-lg p-4 border border-emerald-100">
                                    <div class="text-center">
                                      <div class="text-2xl font-bold text-emerald-600 mb-2">100 Tokens</div>
                                      <div class="text-sm text-gray-500 mb-2">Significant Position</div>
                                      <div class="text-lg font-semibold text-gray-900">$${(asset.tokenPrice || 0) * 100}</div>
                                      <div class="text-xs text-gray-400 mt-1">Major investment</div>
                                    </div>
                                  </div>
                                </div>
                                <div class="mt-6 p-4 bg-emerald-100 rounded-lg">
                                  <div class="text-sm text-emerald-800 text-center">
                                    <strong>Investment Flexibility:</strong> Start with just 1 token and scale up gradually. Each token represents a fractional ownership in the underlying asset.
                                  </div>
                                </div>
                              </div>
                              
                              <!-- Asset Description -->
                              <div class="bg-gray-50 rounded-xl p-6 mb-8">
                                <h3 class="font-semibold text-gray-900 mb-4 flex items-center">
                                  <svg class="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                  </svg>
                                  Asset Description
                                </h3>
                                <p class="text-gray-700 leading-relaxed text-sm">${asset.description}</p>
                              </div>
                              
                              <!-- Key Highlights -->
                              <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8">
                                <h3 class="font-semibold text-gray-900 mb-6 flex items-center">
                                  <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                                  </svg>
                                  Key Highlights & Features
                                </h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  ${asset.id === 'solar-farm-alpha' ? `
                                    <div class="bg-white rounded-lg p-4 border border-indigo-100">
                                      <div class="text-sm text-indigo-600 font-medium mb-2">Environmental Impact</div>
                                      <div class="text-gray-700 text-sm">${asset.environmentalImpact || 'N/A'}</div>
                                    </div>
                                    <div class="bg-white rounded-lg p-4 border border-indigo-100">
                                      <div class="text-sm text-indigo-600 font-medium mb-2">Advanced Technology</div>
                                      <div class="text-gray-700 text-sm">${asset.technology || 'N/A'}</div>
                                    </div>
                                    <div class="bg-white rounded-lg p-4 border border-indigo-100">
                                      <div class="text-sm text-indigo-600 font-medium mb-2">Grid Integration</div>
                                      <div class="text-gray-700 text-sm">${asset.gridConnection || 'N/A'}</div>
                                    </div>
                                    <div class="bg-white rounded-lg p-4 border border-indigo-100">
                                      <div class="text-sm text-indigo-600 font-medium mb-2">Regulatory Compliance</div>
                                      <div class="text-gray-700 text-sm">${asset.regulatoryApprovals || 'N/A'}</div>
                                    </div>
                                    <div class="bg-white rounded-lg p-4 border border-indigo-100">
                                      <div class="text-sm text-indigo-600 font-medium mb-2">Energy Production</div>
                                      <div class="text-gray-700 text-sm">Produces 45,000 MWh annually, powering 15,000 homes</div>
                                    </div>
                                    <div class="bg-white rounded-lg p-4 border border-indigo-100">
                                      <div class="text-sm text-indigo-600 font-medium mb-2">Maintenance Schedule</div>
                                      <div class="text-gray-700 text-sm">Annual maintenance with 24/7 monitoring systems</div>
                                    </div>
                                  ` : asset.id === 'real-estate-fund-beta' ? `
                                    <div class="bg-white rounded-lg p-4 border border-indigo-100">
                                      <div class="text-sm text-indigo-600 font-medium mb-2">Property Portfolio</div>
                                      <div class="text-gray-700 text-sm">${asset.propertyTypes || 'N/A'}</div>
                                    </div>
                                    <div class="bg-white rounded-lg p-4 border border-indigo-100">
                                      <div class="text-sm text-indigo-600 font-medium mb-2">Occupancy Performance</div>
                                      <div class="text-gray-700 text-sm">${asset.occupancyRate || 'N/A'} occupancy rate</div>
                                    </div>
                                    <div class="bg-white rounded-lg p-4 border border-indigo-100">
                                      <div class="text-sm text-indigo-600 font-medium mb-2">Tenant Quality</div>
                                      <div class="text-gray-700 text-sm">${asset.tenantQuality || 'N/A'}</div>
                                    </div>
                                    <div class="bg-white rounded-lg p-4 border border-indigo-100">
                                      <div class="text-sm text-indigo-600 font-medium mb-2">Market Position</div>
                                      <div class="text-gray-700 text-sm">${asset.marketPosition || 'N/A'}</div>
                                    </div>
                                    <div class="bg-white rounded-lg p-4 border border-indigo-100">
                                      <div class="text-sm text-indigo-600 font-medium mb-2">Geographic Focus</div>
                                      <div class="text-gray-700 text-sm">${asset.locations || 'N/A'}</div>
                                    </div>
                                    <div class="bg-white rounded-lg p-4 border border-indigo-100">
                                      <div class="text-sm text-indigo-600 font-medium mb-2">Management Team</div>
                                      <div class="text-gray-700 text-sm">${asset.propertyManagement || 'N/A'}</div>
                                    </div>
                                  ` : asset.id === 'infrastructure-bonds-gamma' ? `
                                    <div class="bg-white rounded-lg p-4 border border-indigo-100">
                                      <div class="text-sm text-indigo-600 font-medium mb-2">Project Scope</div>
                                      <div class="text-gray-700 text-sm">${asset.projectTypes || 'N/A'}</div>
                                    </div>
                                    <div class="bg-white rounded-lg p-4 border border-indigo-100">
                                      <div class="text-sm text-indigo-600 font-medium mb-2">Government Support</div>
                                      <div class="text-gray-700 text-sm">${asset.governmentBacking || 'N/A'}</div>
                                    </div>
                                    <div class="bg-white rounded-lg p-4 border border-indigo-100">
                                      <div class="text-sm text-indigo-600 font-medium mb-2">Construction Progress</div>
                                      <div class="text-gray-700 text-sm">${asset.constructionPhase || 'N/A'}</div>
                                    </div>
                                    <div class="bg-white rounded-lg p-4 border border-indigo-100">
                                      <div class="text-sm text-indigo-600 font-medium mb-2">Economic Benefits</div>
                                      <div class="text-gray-700 text-sm">${asset.economicImpact || 'N/A'}</div>
                                    </div>
                                    <div class="bg-white rounded-lg p-4 border border-indigo-100">
                                      <div class="text-sm text-indigo-600 font-medium mb-2">Environmental Benefits</div>
                                      <div class="text-gray-700 text-sm">${asset.environmentalBenefits || 'N/A'}</div>
                                    </div>
                                    <div class="bg-white rounded-lg p-4 border border-indigo-100">
                                      <div class="text-sm text-indigo-600 font-medium mb-2">Completion Timeline</div>
                                      <div class="text-gray-700 text-sm">${asset.completionDate || 'N/A'}</div>
                                    </div>
                                  ` : ''}
                                </div>
                              </div>
                              
                              <!-- Issuer Information -->
                              <div class="bg-white rounded-xl p-6 border border-gray-200 mb-8">
                                <h3 class="font-semibold text-gray-900 mb-6 flex items-center">
                                  <svg class="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                  </svg>
                                  Issuer & Company Information
                                </h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  <div class="bg-gray-50 rounded-lg p-4">
                                    <div class="text-sm text-gray-500 mb-1">Issuer Name</div>
                                    <div class="font-medium text-gray-900">${asset.issuer || 'N/A'}</div>
                                  </div>
                                  <div class="bg-gray-50 rounded-lg p-4">
                                    <div class="text-sm text-gray-500 mb-1">Asset Class</div>
                                    <div class="font-medium text-gray-900">${asset.assetClass || 'N/A'}</div>
                                  </div>
                                  <div class="bg-gray-50 rounded-lg p-4">
                                    <div class="text-sm text-gray-500 mb-1">Geographic Location</div>
                                    <div class="font-medium text-gray-900">${asset.location || 'N/A'}</div>
                                  </div>
                                  <div class="bg-gray-50 rounded-lg p-4">
                                    <div class="text-sm text-gray-500 mb-1">Inception Date</div>
                                    <div class="font-medium text-gray-900">${asset.inceptionDate || 'N/A'}</div>
                                  </div>
                                  <div class="bg-gray-50 rounded-lg p-4">
                                    <div class="text-sm text-gray-500 mb-1">Sector Focus</div>
                                    <div class="font-medium text-gray-900">${asset.sector || 'N/A'}</div>
                                  </div>
                                  <div class="bg-gray-50 rounded-lg p-4">
                                    <div class="text-sm text-gray-500 mb-1">Regulatory Status</div>
                                    <div class="font-medium text-gray-900">${asset.complianceStatus || 'N/A'}</div>
                                  </div>
                                </div>
                              </div>
                              
                              <!-- Action Buttons -->
                              <div class="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                                <a href="/login" class="flex-1">
                                  <button class="w-full inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                                    <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                    </svg>
                                    Invest Now
                                  </button>
                                </a>
                                <button 
                                  onclick="this.closest('.fixed').remove()"
                                  class="flex-1 inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-all duration-300"
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          </div>
                        `;
                        document.body.appendChild(modal);
                        
                        // Close modal when clicking outside
                        modal.addEventListener('click', (e) => {
                          if (e.target === modal) modal.remove();
                        });
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <a href="/login">
              <button className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                View all assets
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* AI Copilot Section */}
      <section id="ai-copilot" className="py-32 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-3"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-24">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Brain className="h-5 w-5 mr-2" />
              AI-Powered Investment Intelligence
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Your Personal 
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Investment AI Assistant</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Experience the future of investment decision-making with our advanced AI system. Get instant insights, 
              real-time market analysis, and personalized recommendations powered by cutting-edge artificial intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Left Column - Quick Topics */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Quick Topics
                </h3>
                <div className="space-y-3">
                  {[
                    { topic: 'Market trends for renewable energy', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
                    { topic: 'Risk assessment for real estate', icon: Shield, color: 'from-blue-500 to-cyan-500' },
                    { topic: 'Portfolio diversification strategies', icon: PieChart, color: 'from-purple-500 to-pink-500' },
                    { topic: 'AI-powered investment recommendations', icon: Brain, color: 'from-indigo-500 to-purple-500' },
                    { topic: 'Blockchain technology in finance', icon: Network, color: 'from-orange-500 to-red-500' },
                    { topic: 'Sustainable investment opportunities', icon: Leaf, color: 'from-teal-500 to-green-500' }
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          const responses = {
                            'Market trends for renewable energy': 'The renewable energy sector is experiencing unprecedented growth with solar investments up 23% and wind energy up 18% year-over-year. Key drivers include government incentives, declining technology costs, and increasing corporate demand for clean energy. We recommend focusing on utility-scale solar projects and offshore wind developments. The sector shows strong fundamentals with increasing policy support and declining technology costs making renewable energy competitive with traditional sources.',
                            'Risk assessment for real estate': 'Real estate investments offer stable returns but require careful risk assessment. Key factors include location analysis, market cycle timing, and property type diversification. Commercial real estate in tech hubs shows strong fundamentals. Consider REITs for diversification and professional management. Focus on markets with strong job growth and demographic trends.',
                            'Portfolio diversification strategies': 'Effective portfolio diversification involves spreading investments across different asset classes, sectors, and geographies. For RWA investments, we recommend: 40% real estate, 30% infrastructure, 20% renewable energy, and 10% commodities. This provides balance between stability and growth.',
                            'AI-powered investment recommendations': 'Our AI system analyzes thousands of data points including market trends, economic indicators, and asset performance to generate personalized recommendations. The system considers your risk tolerance, investment goals, and market conditions. Current AI analysis suggests overweighting infrastructure and renewable energy.',
                            'Blockchain technology in finance': 'Blockchain technology is revolutionizing finance through tokenization, smart contracts, and decentralized finance (DeFi). RWA tokenization enables fractional ownership of high-value assets, making them accessible to smaller investors. Smart contracts automate compliance and reduce administrative costs.',
                            'Sustainable investment opportunities': 'Sustainable investments are outperforming traditional assets with 12% average returns vs 8% for conventional investments. Focus areas include renewable energy, green infrastructure, and clean technology. ESG factors are increasingly important for institutional investors and regulatory compliance.'
                          };
                          
                          // Add user question to chat
                          const chatMessages = document.getElementById('chatMessages');
                          if (chatMessages) {
                            const userMessage = document.createElement('div');
                            userMessage.className = 'flex justify-end';
                            userMessage.innerHTML = `
                              <div class="max-w-xs p-3 rounded-2xl bg-purple-600 text-white text-sm">
                                <p>${item.topic}</p>
                              </div>
                            `;
                            chatMessages.appendChild(userMessage);
                          }
                          
                          // Add AI response to chat
                          setTimeout(() => {
                            const aiResponse = document.createElement('div');
                            aiResponse.className = 'flex justify-start';
                            aiResponse.innerHTML = `
                              <div class="max-w-xs p-3 rounded-2xl bg-purple-100 text-gray-900 text-sm">
                                <p>${responses[item.topic]}</p>
                              </div>
                            `;
                            chatMessages?.appendChild(aiResponse);
                            
                            // Scroll to bottom
                            const chatContainer = document.querySelector('.h-64.overflow-y-auto');
                            if (chatContainer) {
                              chatContainer.scrollTop = chatContainer.scrollHeight;
                            }
                          }, 800);
                        }}
                        className="w-full text-left p-4 rounded-xl border border-blue-200 hover:border-blue-400 hover:bg-blue-100 transition-all duration-200 text-sm font-medium text-gray-700 hover:text-blue-800 bg-white group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="flex-1">{item.topic}</span>
                          <ArrowRight className="h-4 w-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - Interactive Chat Interface */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
                  Chat with AI Copilot
                </h3>
                
                {/* Chat Messages */}
                <div className="bg-white rounded-xl p-4 border border-purple-200 mb-4 h-80 overflow-y-auto">
                  <div className="space-y-3" id="chatMessages">
                    <div className="flex justify-start">
                      <div className="max-w-xs p-3 rounded-2xl bg-purple-100 text-gray-900 text-sm">
                        <p>Hello! I'm your AI Investment Copilot. How can I help you today?</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="max-w-xs p-3 rounded-2xl bg-purple-100 text-gray-900 text-sm">
                        <p>💡 <strong>Pro tip:</strong> Click on any Quick Topic to get instant AI analysis, or type your own questions below!</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      id="chatInput"
                      placeholder="Ask me about investments, market trends, or portfolio strategies..."
                      className="flex-1 px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            // Add user message
                            const chatMessages = document.getElementById('chatMessages');
                            if (chatMessages) {
                              const userMessage = document.createElement('div');
                              userMessage.className = 'flex justify-end';
                              userMessage.innerHTML = `
                                <div class="max-w-xs p-3 rounded-2xl bg-purple-600 text-white text-sm">
                                  <p>${input.value}</p>
                                </div>
                              `;
                              chatMessages.appendChild(userMessage);
                            }
                            
                            // Generate AI response
                            setTimeout(() => {
                              const aiResponse = document.createElement('div');
                              aiResponse.className = 'flex justify-start';
                              aiResponse.innerHTML = `
                                <div class="max-w-xs p-3 rounded-2xl bg-purple-100 text-gray-900 text-sm">
                                  <p>${generateAIResponse(input.value)}</p>
                                </div>
                              `;
                              chatMessages?.appendChild(aiResponse);
                              
                              // Scroll to bottom
                              const chatContainer = document.querySelector('.h-64.overflow-y-auto');
                              if (chatContainer) {
                                chatContainer.scrollTop = chatContainer.scrollHeight;
                              }
                            }, 1000);
                            
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <button 
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm font-medium"
                      onClick={() => {
                        const input = document.getElementById('chatInput') as HTMLInputElement;
                        if (input && input.value.trim()) {
                          // Add user message
                          const chatMessages = document.getElementById('chatMessages');
                          if (chatMessages) {
                            const userMessage = document.createElement('div');
                            userMessage.className = 'flex justify-end';
                            userMessage.innerHTML = `
                              <div class="max-w-xs p-3 rounded-2xl bg-purple-600 text-white text-sm">
                                <p>${input.value}</p>
                              </div>
                            `;
                            chatMessages.appendChild(userMessage);
                          }
                          
                          // Generate AI response
                          setTimeout(() => {
                            const aiResponse = document.createElement('div');
                            aiResponse.className = 'flex justify-start';
                            aiResponse.innerHTML = `
                              <div class="max-w-xs p-3 rounded-2xl bg-purple-100 text-gray-900 text-sm">
                                <p>${generateAIResponse(input.value)}</p>
                              </div>
                            `;
                            chatMessages?.appendChild(aiResponse);
                            
                            // Scroll to bottom
                            const chatContainer = document.querySelector('.h-64.overflow-y-auto');
                            if (chatContainer) {
                              chatContainer.scrollTop = chatContainer.scrollHeight;
                            }
                          }, 1000);
                          
                          input.value = '';
                        }
                      }}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Portfolio review',
                      'Market analysis',
                      'Risk assessment',
                      'Investment ideas'
                    ].map((action, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          const input = document.getElementById('chatInput') as HTMLInputElement;
                          if (input) {
                            input.value = action;
                            input.focus();
                          }
                        }}
                        className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-xs text-purple-700 hover:bg-purple-50 transition-colors"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-6 text-center">
                  <a href="/signup">
                    <button className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                      Unlock Full AI Features
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </button>
                  </a>
                  <p className="text-xs text-gray-500 mt-2">
                    Sign up for complete access to advanced AIMYA AI analysis
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Latest AI Insights - Moved Below */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 mr-3 text-green-600" />
              Latest AI Insights & Market Research
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  category: 'Market Analysis',
                  title: 'Renewable Energy Sector Growth',
                  summary: 'Solar and wind investments showing strong upward momentum with 15% year-over-year growth.',
                  details: 'The renewable energy sector continues to outperform traditional energy investments, driven by policy support, declining technology costs, and increasing corporate demand for clean energy solutions.',
                  citedArticle: 'International Energy Agency (IEA): "Renewable Energy Market Report 2024" - Published January 15, 2025',
                  icon: TrendingUp,
                  color: 'from-green-500 to-emerald-500',
                  confidence: 'High',
                  impact: 'Positive',
                  readTime: '3 min read'
                },
                {
                  category: 'Risk Assessment',
                  title: 'Real Estate Market Stability',
                  summary: 'Commercial real estate showing resilience with stable yields and low volatility.',
                  details: 'Despite economic uncertainties, commercial real estate in major markets maintains stability through diversified tenant bases and strong fundamentals in tech and healthcare sectors.',
                  citedArticle: 'CBRE Research: "Global Real Estate Market Outlook 2025" - Published January 12, 2025',
                  icon: Shield,
                  color: 'from-blue-500 to-cyan-500',
                  confidence: 'Medium',
                  impact: 'Neutral',
                  readTime: '4 min read'
                },
                {
                  category: 'Investment Opportunity',
                  title: 'Infrastructure Bonds Performance',
                  summary: 'Government-backed infrastructure projects offer attractive risk-adjusted returns.',
                  details: 'Infrastructure bonds continue to provide stable returns with government backing, particularly in transportation and renewable energy projects across developed markets.',
                  citedArticle: 'S&P Global: "Infrastructure Investment Trends and Performance 2024" - Published January 10, 2025',
                  icon: Building,
                  color: 'from-purple-500 to-pink-500',
                  confidence: 'High',
                  impact: 'Positive',
                  readTime: '5 min read'
                }
              ].map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <div key={index} className="bg-white rounded-xl p-6 border border-green-200 hover:border-green-300 transition-colors cursor-pointer group shadow-sm hover:shadow-md" onClick={() => {
                    // Show detailed insight modal
                    const modal = document.createElement('div');
                    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                    modal.innerHTML = `
                      <div class="bg-white rounded-2xl p-6 max-w-3xl mx-4 max-h-[80vh] overflow-y-auto">
                        <div class="flex items-center justify-between mb-4">
                          <h3 class="text-xl font-bold text-gray-900">AI Insight: ${insight.title}</h3>
                          <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        </div>
                        
                        <div class="flex items-center space-x-4 mb-6">
                          <div class="w-12 h-12 bg-gradient-to-r ${insight.color} rounded-xl flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                          </div>
                          <div>
                            <div class="text-sm text-green-600 font-medium">${insight.category}</div>
                            <div class="text-lg font-semibold text-gray-900">${insight.title}</div>
                          </div>
                        </div>
                        
                        <div class="space-y-6">
                          <div class="bg-green-50 rounded-xl p-4 border border-green-100">
                            <h4 class="font-semibold text-green-900 mb-2">Executive Summary</h4>
                            <p class="text-green-800 leading-relaxed">${insight.summary}</p>
                          </div>
                          
                          <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <h4 class="font-semibold text-gray-900 mb-2">Detailed Analysis</h4>
                            <p class="text-gray-700 leading-relaxed">${insight.details}</p>
                          </div>
                          
                          <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <h4 class="font-semibold text-blue-900 mb-2">Cited Research</h4>
                            <p class="text-blue-800 leading-relaxed">${insight.citedArticle}</p>
                          </div>
                          
                          <div class="grid grid-cols-2 gap-4">
                            <div class="bg-gray-50 rounded-lg p-3">
                              <div class="text-sm text-gray-500">Confidence Level</div>
                              <div class="font-semibold text-gray-900">${insight.confidence}</div>
                            </div>
                            <div class="bg-gray-50 rounded-lg p-3">
                              <div class="text-sm text-gray-500">Market Impact</div>
                              <div class="font-semibold text-gray-900">${insight.impact}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div class="mt-6 pt-4 border-t border-gray-200">
                          <p class="text-sm text-gray-500">This insight is generated by AIMYA AI system analyzing real-time market data, economic indicators, and historical performance patterns.</p>
                        </div>
                      </div>
                    `;
                    document.body.appendChild(modal);
                    
                    // Close modal when clicking outside
                    modal.addEventListener('click', (e) => {
                      if (e.target === modal) modal.remove();
                    });
                  }}>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-r ${insight.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-green-600 font-medium mb-1">{insight.category}</div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">{insight.title}</h4>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-gray-600 leading-relaxed text-sm">{insight.summary}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Confidence: {insight.confidence}</span>
                          <span>•</span>
                          <span>Impact: {insight.impact}</span>
                          <span>•</span>
                          <span>{insight.readTime}</span>
                        </div>
                        
                        <div className="pt-2 border-t border-gray-100">
                          <div className="text-xs text-gray-500 mb-1">Cited Research</div>
                          <div className="text-xs text-gray-600 font-medium truncate">{insight.citedArticle.split(' - ')[0]}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-3"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-24">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Award className="h-5 w-5 mr-2" />
              About AIMYA
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Pioneering the 
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Future of Asset Ownership</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We're building the future of asset ownership by combining the power of artificial intelligence with the transparency 
              of blockchain technology. AIMYA is not just another investment platform—we're creating a new paradigm where anyone 
              can own fractional pieces of real-world assets.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Left Column - Vision & Innovation */}
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h3>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Imagine a world where you can own a piece of a solar farm in Arizona, a luxury apartment in Manhattan, or a data center in Silicon Valley—all with the click of a button. That's the future we're building at AIMYA.
                </p>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  We're democratizing access to institutional-grade investments by breaking down the barriers that have traditionally kept these opportunities out of reach for individual investors.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-gray-900">Core Innovation Pillars</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">AI-Powered Asset Valuation & Risk Assessment</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">Smart Contract Automation & Compliance</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700">Real-Time Market Intelligence & Predictions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Why Choose AIMYA */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
              <h4 className="text-2xl font-bold mb-6">Why Choose AIMYA?</h4>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                  <div>
                    <h5 className="font-semibold text-white mb-2">AI-Native Architecture</h5>
                    <p className="text-blue-100 text-sm">Built from the ground up with machine learning at its core, not as an afterthought. Our AI continuously learns and adapts to market conditions.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                  <div>
                    <h5 className="font-semibold text-white mb-2">Web3-First Design</h5>
                    <p className="text-blue-100 text-sm">Leveraging the latest blockchain innovations including zero-knowledge proofs, layer-2 scaling, and cross-chain interoperability.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                  <div>
                    <h5 className="font-semibold text-white mb-2">Institutional-Grade Security</h5>
                    <p className="text-blue-100 text-sm">Multi-signature wallets, cold storage integration, and regular security audits by leading blockchain security firms.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>



          {/* Values Section */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Our Core Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Transparency First</h4>
                <p className="text-gray-600 text-sm">Every transaction, every decision, every algorithm is open and verifiable on the blockchain.</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Innovation Driven</h4>
                <p className="text-gray-600 text-sm">We're not just following trends—we're creating them through cutting-edge AI and blockchain research.</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Community Powered</h4>
                <p className="text-gray-600 text-sm">Our success is built on the trust and collaboration of our global investor community.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Leaders Section */}
      <section className="py-32 bg-gradient-to-br from-white via-gray-50 to-blue-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-3"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-24">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-blue-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Shield className="h-5 w-5 mr-2" />
              Industry Recognition
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
              Trusted by 
              <span className="bg-gradient-to-r from-gray-600 to-blue-600 bg-clip-text text-transparent"> Global Financial Leaders</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We're proud to partner with the world's most respected financial institutions and technology companies. 
              These partnerships validate our commitment to building the future of digital finance with institutional-grade standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 p-4 shadow-sm border border-gray-100">
                <img 
                  src="https://logo.clearbit.com/blackrock.com" 
                  alt="BlackRock" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="font-semibold text-gray-900 mb-2">BlackRock</div>
              <div className="text-sm text-gray-500">Asset Management</div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 p-4 shadow-sm border border-gray-100">
                <img 
                  src="https://logo.clearbit.com/coinbase.com" 
                  alt="Coinbase" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="font-semibold text-gray-900 mb-2">Coinbase</div>
              <div className="text-sm text-gray-500">Cryptocurrency Exchange</div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 p-4 shadow-sm border border-gray-100">
                <img 
                  src="https://logo.clearbit.com/binance.com" 
                  alt="Binance" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="font-semibold text-gray-900 mb-2">Binance</div>
              <div className="text-sm text-gray-500">Cryptocurrency Exchange</div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 p-4 shadow-sm border border-gray-100">
                <img 
                  src="https://logo.clearbit.com/circle.com" 
                  alt="Circle" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="font-semibold text-gray-900 mb-2">Circle</div>
              <div className="text-sm text-gray-500">Digital Currency</div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 p-4 shadow-sm border border-gray-100">
                <img 
                  src="https://logo.clearbit.com/tether.to" 
                  alt="Tether" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="font-semibold text-gray-900 mb-2">Tether</div>
              <div className="text-sm text-gray-500">Stablecoin</div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 p-4 shadow-sm border border-gray-100">
                <img 
                  src="https://logo.clearbit.com/jpmorganchase.com" 
                  alt="JPMorgan Chase" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="font-semibold text-gray-900 mb-2">JPMorgan Chase</div>
              <div className="text-sm text-gray-500">Investment Banking</div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 p-4 shadow-sm border border-gray-100">
                <img 
                  src="https://logo.clearbit.com/goldmansachs.com" 
                  alt="Goldman Sachs" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="font-semibold text-gray-900 mb-2">Goldman Sachs</div>
              <div className="text-sm text-gray-500">Investment Banking</div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 p-4 shadow-sm border border-gray-100">
                <img 
                  src="https://logo.clearbit.com/morganstanley.com" 
                  alt="Morgan Stanley" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="font-semibold text-gray-900 mb-2">Morgan Stanley</div>
              <div className="text-sm text-gray-500">Investment Banking</div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 p-4 shadow-sm border border-gray-100">
                <img 
                  src="https://logo.clearbit.com/visa.com" 
                  alt="Visa" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="font-semibold text-gray-900 mb-2">Visa</div>
              <div className="text-sm text-gray-500">Payment Technology</div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 p-4 shadow-sm border border-gray-100">
                <img 
                  src="https://logo.clearbit.com/mastercard.com" 
                  alt="Mastercard" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="font-semibold text-gray-900 mb-2">Mastercard</div>
              <div className="text-sm text-gray-500">Payment Technology</div>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 p-4 shadow-sm border border-gray-100">
                <img 
                  src="https://logo.clearbit.com/paypal.com" 
                  alt="PayPal" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="font-semibold text-gray-900 mb-2">PayPal</div>
              <div className="text-sm text-gray-500">Digital Payments</div>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 p-4 shadow-sm border border-gray-100">
                <img 
                  src="https://logo.clearbit.com/stripe.com" 
                  alt="Stripe" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div className="font-semibold text-gray-900 mb-2">Stripe</div>
              <div className="text-sm text-gray-500">Payment Infrastructure</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-24">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-400 to-indigo-400 text-blue-900 rounded-full text-sm font-semibold mb-6 shadow-lg">
              <MessageSquare className="h-5 w-5 mr-2" />
              Get in Touch
            </div>
            <h2 className="text-5xl font-bold text-white mb-8 leading-tight">
              Ready to Start Your 
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"> Investment Journey?</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Have questions about our platform or need assistance with your investments? Our dedicated team is ready to help. 
              Get personalized support and expert guidance to maximize your investment potential.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Office Location</h4>
                      <p className="text-gray-600">San Francisco, CA</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Email Support</h4>
                      <p className="text-gray-600">support@aimya.com</p>
                      <p className="text-sm text-gray-500">We typically respond within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">How do I get started with investing?</h4>
                    <p className="text-gray-600 text-sm">Create an account, complete KYC verification, and start browsing our available assets.</p>
                  </div>
                  <div className="border-b border-gray-100 pb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">What types of assets can I invest in?</h4>
                    <p className="text-gray-600 text-sm">We offer diverse real-world assets including renewable energy, real estate, infrastructure, and commodities.</p>
                  </div>
                  <div className="border-b border-gray-100 pb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">How secure is my investment?</h4>
                    <p className="text-gray-600 text-sm">We use bank-grade security and blockchain technology to ensure the safety of your investments.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">How does AI help with investment decisions?</h4>
                    <p className="text-gray-600 text-sm">Our AI analyzes market trends, risk factors, and asset performance to provide personalized investment recommendations and portfolio optimization strategies.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
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
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
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
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
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
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white resize-none"
                    placeholder="Please describe your inquiry in detail..."
                  ></textarea>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="newsletter"
                    name="newsletter"
                    checked={formData.newsletter}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="newsletter" className="text-sm text-gray-600">
                    I would like to receive updates about new investment opportunities and platform features
                  </label>
                </div>

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-green-800">{submitMessage}</p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-red-800">{submitMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By submitting this form, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold mb-6 shadow-lg border border-white/30">
            <Rocket className="h-5 w-5 mr-2" />
            Join the Future of Investing
          </div>
          <h2 className="text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            Your Investment Future 
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"> Starts Here</span>
          </h2>
          <p className="text-2xl lg:text-3xl text-blue-100 mb-16 max-w-5xl mx-auto leading-relaxed font-medium">
            Don't wait for the future of finance—be part of it. Our AI-powered platform is already helping investors 
            discover new opportunities and build diversified portfolios. Take the first step toward financial freedom today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-20">
            <a href="/signup">
              <button className="group inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-16 bg-white hover:bg-gray-50 text-blue-600 font-bold px-12 py-5 text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                <Users className="mr-3 h-7 w-7 group-hover:scale-110 transition-transform" />
                Start Investing Today
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </a>
            <a href="/login">
              <button className="group inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-16 bg-transparent hover:bg-white/10 text-white font-bold px-12 py-5 text-xl rounded-2xl border-2 border-white hover:border-white/80 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <Shield className="mr-3 h-7 w-7 group-hover:scale-110 transition-transform" />
                Access Your Portfolio
              </button>
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                <Rocket className="h-10 w-10 text-blue-200 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-3">Lightning-Fast Setup</h3>
              <p className="text-blue-200">Get started in minutes with our streamlined onboarding process and instant verification</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                <Lock className="h-10 w-10 text-blue-200 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-3">Bank-Grade Security</h3>
              <p className="text-blue-200">Your investments are protected by institutional-grade security and regulatory compliance</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                <Award className="h-10 w-10 text-blue-200 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold mb-3">Proven Excellence</h3>
              <p className="text-blue-200">Trusted by thousands of investors worldwide with a track record of success</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <h3 className="text-2xl font-bold ml-4">AIMYA</h3>
              </div>
              <p className="text-gray-300 mb-8 max-w-2xl text-lg leading-relaxed">
                Welcome to the future of asset investment. We're building a world where anyone can access institutional-grade 
                investments through the power of AI and blockchain technology. Join our community of forward-thinking investors.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors group">
                  <Twitter className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors group">
                  <Linkedin className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors group">
                  <Github className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors group">
                  <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors group">
                  <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors group">
                  <Mail className="h-6 w-6 group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-6">Quick Navigation</h4>
              <ul className="space-y-4">
                <li><a href="/" className="text-gray-300 hover:text-white transition-colors group flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Home
                </a></li>
                <li><a href="#features" className="text-gray-300 hover:text-white transition-colors group flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Features
                </a></li>
                <li><a href="#assets" className="text-gray-300 hover:text-white transition-colors group flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Browse Assets
                </a></li>
                <li><a href="#ai-copilot" className="text-gray-300 hover:text-white transition-colors group flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  AI Copilot
                </a></li>
                <li><a href="#about" className="text-gray-300 hover:text-white transition-colors group flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  About Us
                </a></li>
                <li><a href="#contact" className="text-gray-300 hover:text-white transition-colors group flex items-center">
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Contact
                </a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-12">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 mb-6 md:mb-0">
                <p className="text-lg">© 2025 AIMYA. All rights reserved.</p>
                <p className="text-sm mt-2">Empowering investors through AI and blockchain technology</p>
              </div>
              <div className="flex space-x-8">
                <a href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  Contact Us
                </a>
                <a href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  Terms of Service
                </a>
                <a href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Enhanced CSS for animations and effects */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
        
        .hover\\:shadow-3xl:hover {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}



