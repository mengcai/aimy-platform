import { RAGService } from './rag-service';
import { PortfolioService } from './portfolio-service';
import { AssetService } from './asset-service';
import { AIService } from './ai-service';
import { SafetyGuard } from './safety-guard';
import { PromptTemplate } from './prompt-template';

interface ChatContext {
  portfolioId?: string;
  assetId?: string;
  userId?: string;
  sessionId: string;
}

interface ChatResponse {
  content: string;
  sources?: Array<{
    title: string;
    url: string;
    type: 'asset_doc' | 'ai_report' | 'portfolio' | 'market_data';
    relevance: number;
  }>;
  metadata?: {
    assetId?: string;
    riskLevel?: 'low' | 'medium' | 'high';
    confidence?: number;
    disclaimer?: string;
  };
}

interface IntentAnalysis {
  intent: 'portfolio_analysis' | 'asset_risk' | 'ai_report' | 'payout_schedule' | 'order_guide' | 'general_question';
  confidence: number;
  entities: {
    assetId?: string;
    portfolioId?: string;
    timeframe?: string;
    riskType?: string;
  };
  requiresPortfolioAccess: boolean;
  requiresAssetAccess: boolean;
}

export class CopilotService {
  private ragService: RAGService;
  private portfolioService: PortfolioService;
  private assetService: AssetService;
  private aiService: AIService;
  private safetyGuard: SafetyGuard;
  private promptTemplate: PromptTemplate;

  constructor() {
    this.ragService = new RAGService();
    this.portfolioService = new PortfolioService();
    this.assetService = new AssetService();
    this.aiService = new AIService();
    this.safetyGuard = new SafetyGuard();
    this.promptTemplate = new PromptTemplate();
  }

  async processMessage(message: string, context: ChatContext): Promise<ChatResponse> {
    try {
      // 1. Safety check - prevent prompt injection and harmful content
      const safetyCheck = await this.safetyGuard.validateMessage(message);
      if (!safetyCheck.safe) {
        return {
          content: `I cannot process that request. ${safetyCheck.reason}`,
          metadata: {
            disclaimer: 'This response was blocked by safety filters.',
          },
        };
      }

      // 2. Analyze user intent
      const intent = await this.analyzeIntent(message, context);
      
      // 3. Gather relevant context and data
      const contextData = await this.gatherContext(intent, context);
      
      // 4. Perform RAG search for relevant information
      const searchResults = await this.ragService.search(message, contextData);
      
      // 5. Generate response using AI
      const response = await this.generateResponse(message, intent, contextData, searchResults);
      
      // 6. Apply final safety checks
      const finalSafetyCheck = await this.safetyGuard.validateResponse(response.content);
      if (!finalSafetyCheck.safe) {
        return {
          content: 'I apologize, but I cannot provide that response due to safety concerns. Please rephrase your question.',
          metadata: {
            disclaimer: 'This response was blocked by safety filters.',
          },
        };
      }

      return response;

    } catch (error) {
      console.error('Error processing message:', error);
      
      return {
        content: 'I apologize, but I encountered an error while processing your request. Please try again or contact support if the issue persists.',
        metadata: {
          disclaimer: 'This is an error message, not financial advice.',
        },
      };
    }
  }

  private async analyzeIntent(message: string, context: ChatContext): Promise<IntentAnalysis> {
    const intentPrompt = this.promptTemplate.getIntentAnalysisPrompt(message, context);
    
    try {
      const response = await this.aiService.analyzeIntent(intentPrompt);
      
      return {
        intent: response.intent,
        confidence: response.confidence,
        entities: response.entities,
        requiresPortfolioAccess: response.requiresPortfolioAccess,
        requiresAssetAccess: response.requiresAssetAccess,
      };
    } catch (error) {
      // Fallback to keyword-based intent analysis
      return this.fallbackIntentAnalysis(message, context);
    }
  }

  private fallbackIntentAnalysis(message: string, context: ChatContext): IntentAnalysis {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('portfolio') || lowerMessage.includes('risk profile')) {
      return {
        intent: 'portfolio_analysis',
        confidence: 0.8,
        entities: {},
        requiresPortfolioAccess: true,
        requiresAssetAccess: false,
      };
    }
    
    if (lowerMessage.includes('asset') && lowerMessage.includes('risk')) {
      return {
        intent: 'asset_risk',
        confidence: 0.7,
        entities: { assetId: context.assetId },
        requiresPortfolioAccess: false,
        requiresAssetAccess: true,
      };
    }
    
    if (lowerMessage.includes('ai') && lowerMessage.includes('report')) {
      return {
        intent: 'ai_report',
        confidence: 0.9,
        entities: {},
        requiresPortfolioAccess: false,
        requiresAssetAccess: false,
      };
    }
    
    if (lowerMessage.includes('payout') || lowerMessage.includes('distribution')) {
      return {
        intent: 'payout_schedule',
        confidence: 0.8,
        entities: {},
        requiresPortfolioAccess: true,
        requiresAssetAccess: false,
      };
    }
    
    if (lowerMessage.includes('order') || lowerMessage.includes('trade')) {
      return {
        intent: 'order_guide',
        confidence: 0.7,
        entities: {},
        requiresPortfolioAccess: false,
        requiresAssetAccess: false,
      };
    }
    
    return {
      intent: 'general_question',
      confidence: 0.5,
      entities: {},
      requiresPortfolioAccess: false,
      requiresAssetAccess: false,
    };
  }

  private async gatherContext(intent: IntentAnalysis, context: ChatContext) {
    const contextData: any = {
      sessionId: context.sessionId,
      timestamp: new Date().toISOString(),
    };

    try {
      // Gather portfolio data if needed
      if (intent.requiresPortfolioAccess && context.portfolioId) {
        const portfolio = await this.portfolioService.getPortfolio(context.portfolioId);
        contextData.portfolio = portfolio;
      }

      // Gather asset data if needed
      if (intent.requiresAssetAccess && context.assetId) {
        const asset = await this.assetService.getAsset(context.assetId);
        contextData.asset = asset;
      }

      // Gather AI insights if available
      if (intent.intent === 'ai_report' || intent.intent === 'asset_risk') {
        const aiInsights = await this.aiService.getInsights(context.assetId);
        contextData.aiInsights = aiInsights;
      }

      // Gather payout schedule if needed
      if (intent.intent === 'payout_schedule') {
        const payouts = await this.portfolioService.getUpcomingPayouts(context.portfolioId);
        contextData.payouts = payouts;
      }

    } catch (error) {
      console.warn('Error gathering context:', error);
      // Continue with partial context
    }

    return contextData;
  }

  private async generateResponse(
    message: string,
    intent: IntentAnalysis,
    contextData: any,
    searchResults: any[]
  ): Promise<ChatResponse> {
    const prompt = this.promptTemplate.getResponsePrompt(message, intent, contextData, searchResults);
    
    try {
      const aiResponse = await this.aiService.generateResponse(prompt);
      
      // Process and format the response
      const response = this.formatResponse(aiResponse, intent, searchResults);
      
      // Add appropriate disclaimers based on intent
      response.metadata = {
        ...response.metadata,
        disclaimer: this.getDisclaimer(intent),
      };
      
      return response;
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback to template-based response
      return this.generateFallbackResponse(intent, contextData, searchResults);
    }
  }

  private formatResponse(aiResponse: any, intent: IntentAnalysis, searchResults: any[]) {
    const sources = searchResults.map(result => ({
      title: result.title || 'Document',
      url: result.url || '#',
      type: result.type || 'asset_doc',
      relevance: result.relevance || 0.5,
    }));

    let riskLevel: 'low' | 'medium' | 'high' | undefined;
    let confidence: number | undefined;

    // Extract risk and confidence from AI response if available
    if (aiResponse.metadata?.riskLevel) {
      riskLevel = aiResponse.metadata.riskLevel;
    }
    
    if (aiResponse.metadata?.confidence) {
      confidence = aiResponse.metadata.confidence;
    }

    return {
      content: aiResponse.content,
      sources,
      metadata: {
        riskLevel,
        confidence,
      },
    };
  }

  private generateFallbackResponse(intent: IntentAnalysis, contextData: any, searchResults: any[]) {
    const templates = {
      portfolio_analysis: 'I can help you analyze your portfolio risk profile. Based on your current holdings, I can provide insights into diversification, sector exposure, and risk metrics. Would you like me to focus on any specific aspect?',
      asset_risk: 'I can help you understand the risk profile of this asset. This includes analyzing market volatility, liquidity, regulatory factors, and historical performance. What specific risk factors would you like me to explain?',
      ai_report: 'I can provide a summary of the AI transparency report, including model performance metrics, data quality indicators, and confidence levels. Which aspects would you like me to focus on?',
      payout_schedule: 'I can show you upcoming scheduled payouts and distributions. This includes dividend payments, interest distributions, and other income streams. Would you like me to show the next payout or a longer schedule?',
      order_guide: 'I can walk you through the process of placing an order, including order types, slippage protection, and best practices. Which type of order would you like to learn about?',
      general_question: 'I\'m here to help you with questions about your investments, the AIMY platform, and AI-powered insights. How can I assist you today?',
    };

    return {
      content: templates[intent.intent] || templates.general_question,
      sources: searchResults.slice(0, 3).map(result => ({
        title: result.title || 'Document',
        url: result.url || '#',
        type: result.type || 'asset_doc',
        relevance: result.relevance || 0.5,
      })),
      metadata: {
        confidence: 0.6,
      },
    };
  }

  private getDisclaimer(intent: IntentAnalysis): string {
    const baseDisclaimer = 'This information is for educational purposes only and should not be considered financial advice.';
    
    const intentDisclaimers = {
      portfolio_analysis: `${baseDisclaimer} Portfolio analysis is based on available data and should not be the sole basis for investment decisions.`,
      asset_risk: `${baseDisclaimer} Risk assessment is based on historical data and current market conditions, which may not predict future performance.`,
      ai_report: `${baseDisclaimer} AI insights are based on statistical models and should be used as one of many tools in your investment analysis.`,
      payout_schedule: `${baseDisclaimer} Payout schedules are subject to change based on asset performance and market conditions.`,
      order_guide: `${baseDisclaimer} Trading involves risk, and you should understand the implications before placing orders.`,
      general_question: baseDisclaimer,
    };

    return intentDisclaimers[intent.intent] || baseDisclaimer;
  }
}
