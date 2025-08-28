'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Building, 
  DollarSign, 
  Shield, 
  Globe,
  Send,
  Bot,
  Lightbulb,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

export default function AICopilotPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'ai', message: string, timestamp: Date}>>([]);
  const [userInput, setUserInput] = useState('');

  const aiInsights = [
    {
      id: 1,
      title: 'Solar Energy Market Growth',
      description: 'Strong growth expected in solar energy sector due to government incentives and technological advances.',
      asset: 'Solar Farm Alpha',
      confidence: 0.85,
      category: 'market_analysis'
    },
    {
      id: 2,
      title: 'Real Estate Market Trends',
      description: 'Commercial real estate showing resilience with increasing demand for mixed-use developments.',
      asset: 'Real Estate Fund Beta',
      confidence: 0.78,
      category: 'market_analysis'
    },
    {
      id: 3,
      title: 'Infrastructure Investment Opportunities',
      description: 'Government infrastructure spending creating opportunities in transportation and utilities.',
      asset: 'Infrastructure Bonds Gamma',
      confidence: 0.92,
      category: 'investment_opportunity'
    },
    {
      id: 4,
      title: 'Commodity Price Forecast',
      description: 'Commodity prices expected to stabilize with supply chain improvements and demand normalization.',
      asset: 'Commodity Trading Delta',
      confidence: 0.73,
      category: 'market_analysis'
    },
    {
      id: 5,
      title: 'Tech Startup Valuation Trends',
      description: 'AI and fintech startups showing strong valuation growth despite market volatility.',
      asset: 'Tech Startup Epsilon',
      confidence: 0.81,
      category: 'investment_opportunity'
    },
    {
      id: 6,
      title: 'Healthcare Sector Outlook',
      description: 'Healthcare facilities benefiting from increased investment in medical infrastructure.',
      asset: 'Healthcare Facility Zeta',
      confidence: 0.87,
      category: 'market_analysis'
    }
  ];

  const quickTopics = [
    { id: 'portfolio_optimization', title: 'Portfolio Optimization', icon: Target, description: 'Get AI-powered recommendations for your investment portfolio' },
    { id: 'market_analysis', title: 'Market Analysis', icon: BarChart3, description: 'Deep dive into current market trends and opportunities' },
    { id: 'risk_assessment', title: 'Risk Assessment', icon: Shield, description: 'Evaluate investment risks and get mitigation strategies' },
    { id: 'yield_optimization', title: 'Yield Optimization', icon: TrendingUp, description: 'Maximize returns with AI-driven yield strategies' },
    { id: 'asset_allocation', title: 'Asset Allocation', icon: Building, description: 'Get personalized asset allocation recommendations' },
    { id: 'investment_timing', title: 'Investment Timing', icon: Zap, description: 'Learn about optimal timing for different investment types' }
  ];

  const getAIResponse = (topic: string, userMessage?: string): string => {
    const responses: { [key: string]: string } = {
      'portfolio_optimization': `Based on your current portfolio, here are my AI-powered recommendations:

1. **Diversification**: Your portfolio is well-diversified across renewable energy (40%), real estate (35%), and infrastructure (25%). Consider adding exposure to emerging markets or commodities for better balance.

2. **Risk-Adjusted Returns**: Your current yield of 7.2% is above market average. To optimize further, consider:
   - Increasing allocation to Solar Farm Alpha (currently 8.5% yield)
   - Adding exposure to healthcare sector (Healthcare Facility Zeta shows 9.1% yield)
   - Rebalancing quarterly to maintain optimal ratios

3. **Liquidity Management**: Keep 15-20% in liquid assets for opportunities and emergencies.

4. **Tax Optimization**: Consider tax-loss harvesting strategies for underperforming positions.

Would you like me to create a detailed rebalancing plan or analyze specific assets?`,
      
      'market_analysis': `Here's my comprehensive market analysis for Q1 2025:

**Renewable Energy Sector** 🌞
- Solar energy continues strong growth (+18% YoY)
- Government incentives driving adoption
- Supply chain improvements reducing costs
- **Recommendation**: Increase exposure to solar assets

**Real Estate Market** 🏢
- Commercial real estate showing resilience
- Mixed-use developments in high demand
- Urban migration trends supporting growth
- **Recommendation**: Maintain current allocation

**Infrastructure** 🏗️
- Government spending at record levels
- Transportation and utilities projects expanding
- **Recommendation**: Consider increasing allocation

**Technology Sector** 💻
- AI and fintech leading growth
- Valuations becoming more reasonable
- **Recommendation**: Selective investment in proven models

**Overall Market Sentiment**: Bullish with caution on inflation and interest rates.`,
      
      'risk_assessment': `Here's your comprehensive risk assessment:

**Current Portfolio Risk Level: MODERATE** (Risk Score: 6.2/10)

**Risk Factors Identified:**
1. **Concentration Risk**: 40% in renewable energy sector
   - Mitigation: Diversify into other sectors
   
2. **Interest Rate Risk**: Infrastructure bonds sensitive to rate changes
   - Mitigation: Consider floating-rate instruments
   
3. **Geographic Risk**: 65% US-focused investments
   - Mitigation: Add international exposure
   
4. **Liquidity Risk**: Some assets have limited trading
   - Mitigation: Maintain cash reserves

**Risk Mitigation Strategies:**
- Implement stop-loss orders on volatile positions
- Regular portfolio rebalancing
- Dollar-cost averaging for new investments
- Consider hedging strategies for large positions

**Recommended Actions:**
1. Reduce renewable energy exposure to 30%
2. Add 15% international diversification
3. Increase cash position to 20%
4. Implement quarterly risk reviews`,
      
      'yield_optimization': `Here's your yield optimization strategy:

**Current Portfolio Yield: 7.2%**
**Target Yield: 8.5-9.0%**

**High-Yield Opportunities:**
1. **Healthcare Facility Zeta**: 9.1% yield
   - Current allocation: 0%
   - Recommended: 15-20%
   
2. **AI Technology Lambda**: 8.8% yield
   - Current allocation: 0%
   - Recommended: 10-15%
   
3. **IntelliPro Group**: 8.2% yield
   - Current allocation: 0%
   - Recommended: 10%

**Yield Enhancement Strategies:**
1. **Sector Rotation**: Move from lower-yield infrastructure (5.8%) to higher-yield healthcare (9.1%)
2. **Dividend Reinvestment**: Automatically reinvest dividends for compound growth
3. **Yield Farming**: Use stablecoins to earn additional yield on cash positions
4. **Covered Call Strategies**: Generate income from existing positions

**Implementation Timeline:**
- Week 1-2: Research and due diligence
- Week 3-4: Execute rebalancing trades
- Month 2: Monitor performance and adjust
- Month 3: Full portfolio review`,
      
      'asset_allocation': `Here's your personalized asset allocation recommendation:

**Current Allocation vs. Recommended:**

**Renewable Energy: 40% → 30%**
- Solar Farm Alpha: 20% → 15%
- Renewable Energy Eta: 20% → 15%

**Real Estate: 35% → 30%**
- Real Estate Fund Beta: 20% → 15%
- Real Estate Portfolio Theta: 15% → 15%

**Infrastructure: 25% → 20%**
- Infrastructure Bonds Gamma: 15% → 10%
- Infrastructure Fund Iota: 10% → 10%

**NEW: Healthcare: 0% → 15%**
- Healthcare Facility Zeta: 0% → 15%

**NEW: Technology: 0% → 5%**
- AI Technology Lambda: 0% → 5%

**Cash & Liquidity: 0% → 20%**
- For opportunities and emergencies

**Allocation Benefits:**
- Reduced sector concentration risk
- Improved yield potential (7.2% → 8.1%)
- Better diversification across asset classes
- Enhanced liquidity for opportunities`,
      
      'investment_timing': `Here's my investment timing analysis:

**Optimal Entry Points by Sector:**

**Renewable Energy** 🌞
- **Best Time**: Q2-Q3 (tax season, summer energy demand)
- **Current Status**: Good entry point
- **Strategy**: Dollar-cost average over 3 months

**Real Estate** 🏢
- **Best Time**: Q4-Q1 (year-end tax planning)
- **Current Status**: Fair entry point
- **Strategy**: Wait for Q4 opportunities

**Infrastructure** 🏗️
- **Best Time**: Q1-Q2 (government budget cycles)
- **Current Status**: Excellent entry point
- **Strategy**: Invest now, government spending increasing

**Healthcare** 🏥
- **Best Time**: Q3-Q4 (earnings season)
- **Current Status**: Good entry point
- **Strategy**: Invest now, sector showing strength

**Technology** 💻
- **Best Time**: Q1-Q2 (earnings season, innovation cycles)
- **Current Status**: Fair entry point
- **Strategy**: Wait for Q1 earnings, then invest

**Overall Market Timing:**
- **Current**: Good time for infrastructure and healthcare
- **Next 3 months**: Focus on renewable energy
- **Next 6 months**: Real estate opportunities
- **Next 12 months**: Technology sector recovery`
    };

    if (userMessage) {
      // Handle custom user questions
      const lowerMessage = userMessage.toLowerCase();
      if (lowerMessage.includes('yield') || lowerMessage.includes('return')) {
        return responses['yield_optimization'];
      } else if (lowerMessage.includes('risk') || lowerMessage.includes('safe')) {
        return responses['risk_assessment'];
      } else if (lowerMessage.includes('portfolio') || lowerMessage.includes('allocation')) {
        return responses['portfolio_optimization'];
      } else if (lowerMessage.includes('market') || lowerMessage.includes('trend')) {
        return responses['market_analysis'];
      } else if (lowerMessage.includes('timing') || lowerMessage.includes('when')) {
        return responses['investment_timing'];
      } else {
        return `I understand you're asking about "${userMessage}". Let me provide you with relevant insights:

Based on your question, here are some key points to consider:

1. **Market Context**: Current market conditions are favorable for strategic investments
2. **Risk Management**: Always consider your risk tolerance and investment timeline
3. **Diversification**: Spread investments across different sectors and asset types
4. **Professional Advice**: Consider consulting with a financial advisor for personalized guidance

Would you like me to elaborate on any specific aspect of your question?`;
      }
    }

    return responses[topic] || 'I apologize, but I need more context to provide a helpful response. Could you please rephrase your question or select a specific topic?';
  };

  const handleTopicClick = (topicId: string) => {
    setSelectedTopic(topicId);
    const response = getAIResponse(topicId);
    setChatHistory(prev => [...prev, 
      { type: 'ai', message: response, timestamp: new Date() }
    ]);
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    // Add user message
    setChatHistory(prev => [...prev, 
      { type: 'user', message: userInput, timestamp: new Date() }
    ]);
    
    // Get AI response
    const response = getAIResponse('', userInput);
    setChatHistory(prev => [...prev, 
      { type: 'ai', message: response, timestamp: new Date() }
    ]);
    
    setUserInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Copilot</h1>
              <p className="mt-2 text-lg text-gray-600">
                Get AI-powered investment insights and personalized recommendations
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Sparkles className="h-4 w-4 mr-2" />
                Ask AI
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Topics */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Topics</h3>
              <div className="space-y-3">
                {quickTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicClick(topic.id)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <topic.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{topic.title}</h4>
                        <p className="text-sm text-gray-600">{topic.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
              <div className="space-y-4">
                {aiInsights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-blue-900">{insight.title}</h4>
                      <Badge variant="info" className="text-xs">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-700 mb-2">{insight.description}</p>
                    <p className="text-xs text-blue-600">Asset: {insight.asset}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bot className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">AI Investment Assistant</h3>
                    <p className="text-sm text-gray-600">Ask me anything about investments</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Click on a topic or ask a question to get started</p>
                  </div>
                ) : (
                  chatHistory.map((message, index) => (
                    <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        <p className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about investments, portfolio, or market trends..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Button onClick={handleSendMessage} disabled={!userInput.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
