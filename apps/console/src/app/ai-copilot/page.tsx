'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  Target, 
  BarChart3, 
  Shield, 
  Coins, 
  Building, 
  Zap, 
  MessageCircle,
  Send,
  ArrowRight,
  Sparkles
} from 'lucide-react';

// Mock AI insights data
const aiInsights = [
  {
    id: 1,
    category: 'Market Analysis',
    title: 'Renewable Energy Sector Growth',
    description: 'Solar and wind investments showing strong upward momentum with 15% year-over-year growth.',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 2,
    category: 'Risk Assessment',
    title: 'Real Estate Market Stability',
    description: 'Commercial real estate showing resilience with stable yields and low volatility.',
    icon: Shield,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 3,
    category: 'Investment Opportunity',
    title: 'Infrastructure Bonds',
    description: 'Government-backed infrastructure projects offer attractive risk-adjusted returns.',
    icon: Building,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 4,
    category: 'Technology Trends',
    title: 'AI in Investment Management',
    description: 'Machine learning algorithms improving portfolio optimization and risk management.',
    icon: Zap,
    color: 'from-orange-500 to-red-500'
  }
];

// Quick topics for users to explore
const quickTopics = [
  'Market trends for renewable energy',
  'Risk assessment for real estate investments',
  'Portfolio diversification strategies',
  'AI-powered investment recommendations',
  'Blockchain technology in finance',
  'Sustainable investment opportunities'
];

export default function AICopilotPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'ai', message: string}>>([]);
  const [userInput, setUserInput] = useState('');

  // Mock AI response function
  const getAIResponse = (topic: string) => {
    const responses: { [key: string]: string } = {
      'Market trends for renewable energy': 'The renewable energy sector is experiencing unprecedented growth with solar investments up 23% and wind energy up 18% year-over-year. Key drivers include government incentives, declining technology costs, and increasing corporate demand for clean energy. We recommend focusing on utility-scale solar projects and offshore wind developments for optimal returns.',
      'Risk assessment for real estate investments': 'Real estate investments offer stable returns but require careful risk assessment. Key factors include location analysis, market cycle timing, and property type diversification. Commercial real estate in tech hubs shows strong fundamentals, while residential markets vary by region. Consider REITs for liquidity and professional management.',
      'Portfolio diversification strategies': 'Effective portfolio diversification involves spreading investments across different asset classes, sectors, and geographies. For RWA investments, we recommend: 40% real estate, 30% infrastructure, 20% renewable energy, and 10% commodities. This allocation provides stability while capturing growth opportunities.',
      'AI-powered investment recommendations': 'Our AI system analyzes thousands of data points including market trends, economic indicators, and asset performance to generate personalized recommendations. The system considers your risk tolerance, investment goals, and market conditions to suggest optimal asset allocations and timing.',
      'Blockchain technology in finance': 'Blockchain technology is revolutionizing finance through tokenization, smart contracts, and decentralized finance (DeFi). RWA tokenization enables fractional ownership of high-value assets, making them accessible to smaller investors. Smart contracts automate compliance and reduce administrative costs.',
      'Sustainable investment opportunities': 'Sustainable investments are outperforming traditional assets with 12% average returns vs 8% for conventional investments. Focus areas include renewable energy, green infrastructure, sustainable agriculture, and clean technology. These sectors benefit from regulatory support and growing consumer demand.'
    };
    
    return responses[topic] || 'I can provide insights on various investment topics. Please ask me about market trends, risk assessment, portfolio strategies, or any specific investment area you\'re interested in.';
  };

  const handleTopicClick = (topic: string) => {
    setSelectedTopic(topic);
    const aiResponse = getAIResponse(topic);
    
    setChatHistory([
      { type: 'user', message: topic },
      { type: 'ai', message: aiResponse }
    ]);
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    const newMessage = { type: 'user' as const, message: userInput };
    const aiResponse = getAIResponse(userInput);
    
    setChatHistory(prev => [
      ...prev,
      newMessage,
      { type: 'ai', message: aiResponse }
    ]);
    
    setUserInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
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
              <a href="/ai-copilot" className="text-blue-600 font-medium">AI Copilot</a>
              <a href="/about" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">About</a>
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
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Sparkles className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            AI Investment Copilot
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Get AI-powered insights, market analysis, and personalized investment recommendations powered by advanced language models.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Quick Topics & AI Insights */}
          <div className="space-y-8">
            {/* Quick Topics */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Topics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickTopics.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => handleTopicClick(topic)}
                    className="text-left p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-sm font-medium text-gray-700 hover:text-blue-700"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest AI Insights</h2>
              <div className="space-y-6">
                {aiInsights.map((insight) => {
                  const Icon = insight.icon;
                  return (
                    <div key={insight.id} className="p-6 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${insight.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-blue-600 font-medium mb-1">{insight.category}</div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
                          <p className="text-gray-600 leading-relaxed">{insight.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Chat Interface */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Chat with AI Copilot</h2>
            
            {/* Chat History */}
            <div className="h-96 overflow-y-auto mb-6 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Start a conversation by clicking on a topic or typing your question below.</p>
                </div>
              ) : (
                chatHistory.map((message, index) => (
                  <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md p-4 rounded-2xl ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="flex space-x-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about investments, market trends, or portfolio strategies..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!userInput.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl transition-colors flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Send</span>
              </button>
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
              <a href="/signup">
                <button className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Unlock Full AI Features
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </a>
              <p className="text-sm text-gray-500 mt-3">
                Sign up for complete access to advanced AI analysis and portfolio recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to experience AI-powered investing?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join thousands of investors who are already using AI to make smarter investment decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/signup">
                <button className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
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
