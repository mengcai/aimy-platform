interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: 'asset_analysis' | 'portfolio_insights' | 'compliance' | 'risk_assessment' | 'general';
  template: string;
  variables: string[];
  examples: PromptExample[];
  version: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

interface PromptExample {
  input: string;
  output: string;
  context?: Record<string, any>;
}

interface PromptContext {
  userId: string;
  portfolioContext?: any;
  assetContext?: any;
  complianceContext?: any;
  riskContext?: any;
  marketContext?: any;
  userPreferences?: any;
}

interface PromptResponse {
  content: string;
  sources: PromptSource[];
  confidence: number;
  disclaimer: string;
  metadata: Record<string, any>;
}

interface PromptSource {
  type: 'asset_document' | 'portfolio_data' | 'ai_insight' | 'market_data' | 'compliance_report';
  id: string;
  title: string;
  url?: string;
  relevance: number;
  excerpt?: string;
}

export class PromptTemplateService {
  private templates: PromptTemplate[] = [];
  private systemPrompt: string;

  constructor() {
    this.initializeTemplates();
    this.systemPrompt = this.generateSystemPrompt();
  }

  async generatePrompt(
    templateName: string,
    context: PromptContext,
    variables: Record<string, any> = {}
  ): Promise<string> {
    try {
      console.log('Generating prompt:', { templateName, context: Object.keys(context) });

      const template = this.templates.find(t => t.name === templateName && t.isActive);
      if (!template) {
        throw new Error(`Template not found: ${templateName}`);
      }

      // Validate required variables
      const missingVariables = template.variables.filter(v => !(v in variables));
      if (missingVariables.length > 0) {
        throw new Error(`Missing required variables: ${missingVariables.join(', ')}`);
      }

      // Replace variables in template
      let prompt = template.template;
      template.variables.forEach(variable => {
        const value = variables[variable];
        if (value !== undefined) {
          prompt = prompt.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), String(value));
        }
      });

      // Add context information
      prompt = this.enrichPromptWithContext(prompt, context);

      console.log('Prompt generated successfully');
      return prompt;
    } catch (error) {
      console.error('Failed to generate prompt:', error);
      throw new Error(`Failed to generate prompt: ${error.message}`);
    }
  }

  async getTemplate(templateName: string): Promise<PromptTemplate | null> {
    try {
      console.log('Getting template:', templateName);

      const template = this.templates.find(t => t.name === templateName);
      
      if (template) {
        console.log('Template retrieved successfully');
        return template;
      } else {
        console.log('Template not found');
        return null;
      }
    } catch (error) {
      console.error('Failed to get template:', error);
      return null;
    }
  }

  async listTemplates(category?: string): Promise<PromptTemplate[]> {
    try {
      console.log('Listing templates:', { category });

      let templates = this.templates.filter(t => t.isActive);

      if (category) {
        templates = templates.filter(t => t.category === category);
      }

      console.log(`Found ${templates.length} templates`);
      return templates;
    } catch (error) {
      console.error('Failed to list templates:', error);
      return [];
    }
  }

  async createTemplate(template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PromptTemplate> {
    try {
      console.log('Creating new template:', template.name);

      const newTemplate: PromptTemplate = {
        ...template,
        id: this.generateTemplateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.templates.push(newTemplate);

      console.log('Template created successfully');
      return newTemplate;
    } catch (error) {
      console.error('Failed to create template:', error);
      throw new Error(`Failed to create template: ${error.message}`);
    }
  }

  async updateTemplate(templateId: string, updates: Partial<PromptTemplate>): Promise<PromptTemplate | null> {
    try {
      console.log('Updating template:', templateId);

      const templateIndex = this.templates.findIndex(t => t.id === templateId);
      if (templateIndex === -1) {
        throw new Error('Template not found');
      }

      this.templates[templateIndex] = {
        ...this.templates[templateIndex],
        ...updates,
        updatedAt: new Date(),
      };

      console.log('Template updated successfully');
      return this.templates[templateIndex];
    } catch (error) {
      console.error('Failed to update template:', error);
      return null;
    }
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      console.log('Deleting template:', templateId);

      const templateIndex = this.templates.findIndex(t => t.id === templateId);
      if (templateIndex === -1) {
        throw new Error('Template not found');
      }

      this.templates.splice(templateIndex, 1);

      console.log('Template deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete template:', error);
      return false;
    }
  }

  getSystemPrompt(): string {
    return this.systemPrompt;
  }

  private initializeTemplates(): void {
    this.templates = [
      {
        id: 'asset-analysis-001',
        name: 'Asset Risk Analysis',
        description: 'Analyze the risk profile of a specific asset based on portfolio context and market conditions',
        category: 'asset_analysis',
        template: `Analyze the risk profile of {{assetSymbol}} ({{assetName}}) based on the following context:

Portfolio Context:
- Total Portfolio Value: {{portfolioValue}}
- Asset Allocation: {{assetAllocation}}%
- Risk Tolerance: {{riskTolerance}}
- Investment Horizon: {{investmentHorizon}}

Asset Context:
- Current Value: {{currentValue}}
- Asset Type: {{assetType}}
- Sector: {{sector}}
- Risk Score: {{riskScore}}

Please provide:
1. Risk assessment summary
2. Key risk factors
3. Risk mitigation recommendations
4. Portfolio impact analysis

Remember: This is for informational purposes only and should not be considered as financial advice.`,
        variables: ['assetSymbol', 'assetName', 'portfolioValue', 'assetAllocation', 'riskTolerance', 'investmentHorizon', 'currentValue', 'assetType', 'sector', 'riskScore'],
        examples: [
          {
            input: 'Analyze SOLAR token risk',
            output: 'SOLAR token shows moderate risk with strong fundamentals...',
            context: { assetSymbol: 'SOLAR', assetName: 'Solar Farm Token' }
          }
        ],
        version: '1.0',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isActive: true,
      },
      {
        id: 'portfolio-insights-001',
        name: 'Portfolio Diversification Analysis',
        description: 'Analyze portfolio diversification and provide optimization recommendations',
        category: 'portfolio_insights',
        template: `Analyze the diversification of the portfolio with the following characteristics:

Portfolio Overview:
- Total Value: {{totalValue}}
- Number of Assets: {{assetCount}}
- Primary Sectors: {{primarySectors}}
- Risk Profile: {{riskProfile}}

Current Allocation:
{{allocationBreakdown}}

Please provide:
1. Diversification assessment
2. Sector concentration analysis
3. Risk distribution evaluation
4. Optimization recommendations
5. New asset suggestions

Focus on maintaining the target risk profile while improving diversification.`,
        variables: ['totalValue', 'assetCount', 'primarySectors', 'riskProfile', 'allocationBreakdown'],
        examples: [
          {
            input: 'Analyze portfolio diversification',
            output: 'Your portfolio shows good diversification across sectors...',
            context: { totalValue: 50000, assetCount: 5 }
          }
        ],
        version: '1.0',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isActive: true,
      },
      {
        id: 'compliance-check-001',
        name: 'Compliance Status Review',
        description: 'Review compliance status and identify any required actions',
        category: 'compliance',
        template: `Review the compliance status for user {{userId}}:

Current Status:
- KYC Status: {{kycStatus}}
- AML Status: {{amlStatus}}
- Sanctions Status: {{sanctionsStatus}}
- Last Screening: {{lastScreening}}
- Next Review: {{nextReview}}

Portfolio Assets:
{{assetList}}

Please provide:
1. Compliance status summary
2. Required actions and deadlines
3. Risk assessment
4. Recommendations for maintaining compliance

Focus on regulatory requirements and best practices.`,
        variables: ['userId', 'kycStatus', 'amlStatus', 'sanctionsStatus', 'lastScreening', 'nextReview', 'assetList'],
        examples: [
          {
            input: 'Check compliance status',
            output: 'Your compliance status is generally good...',
            context: { userId: 'user123', kycStatus: 'approved' }
          }
        ],
        version: '1.0',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isActive: true,
      },
      {
        id: 'risk-assessment-001',
        name: 'Portfolio Risk Assessment',
        description: 'Comprehensive risk assessment of the entire portfolio',
        category: 'risk_assessment',
        template: `Conduct a comprehensive risk assessment for the portfolio:

Portfolio Details:
- Total Value: {{totalValue}}
- Risk Tolerance: {{riskTolerance}}
- Investment Horizon: {{investmentHorizon}}
- Liquidity Needs: {{liquidityNeeds}}

Asset Breakdown:
{{assetBreakdown}}

Market Context:
- Current Market Conditions: {{marketConditions}}
- Economic Outlook: {{economicOutlook}}
- Regulatory Environment: {{regulatoryEnvironment}}

Please provide:
1. Overall risk score and level
2. Risk factor analysis
3. Stress test scenarios
4. Risk mitigation strategies
5. Monitoring recommendations`,
        variables: ['totalValue', 'riskTolerance', 'investmentHorizon', 'liquidityNeeds', 'assetBreakdown', 'marketConditions', 'economicOutlook', 'regulatoryEnvironment'],
        examples: [
          {
            input: 'Assess portfolio risk',
            output: 'Your portfolio has a moderate risk profile...',
            context: { totalValue: 50000, riskTolerance: 'moderate' }
          }
        ],
        version: '1.0',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isActive: true,
      },
      {
        id: 'general-help-001',
        name: 'General Investment Help',
        description: 'General questions about investments and portfolio management',
        category: 'general',
        template: `Provide helpful information about {{topic}} in the context of the user's portfolio:

User Context:
- Portfolio Value: {{portfolioValue}}
- Risk Profile: {{riskProfile}}
- Investment Experience: {{experienceLevel}}

Question: {{question}}

Please provide:
1. Clear explanation of the concept
2. How it relates to their portfolio
3. Relevant examples
4. Educational resources
5. Important considerations

Remember: Provide educational information only, not specific investment advice.`,
        variables: ['topic', 'portfolioValue', 'riskProfile', 'experienceLevel', 'question'],
        examples: [
          {
            input: 'Explain diversification',
            output: 'Diversification is a risk management strategy...',
            context: { topic: 'diversification', portfolioValue: 50000 }
          }
        ],
        version: '1.0',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isActive: true,
      },
    ];
  }

  private generateSystemPrompt(): string {
    return `You are AIMY Copilot, an AI assistant for the AIMY Real-World Asset (RWA) tokenization platform. Your role is to help users understand their investments, portfolio, and the RWA ecosystem.

IMPORTANT GUIDELINES:
1. NEVER provide financial advice or investment recommendations
2. Always base responses on available data and context
3. Always cite sources and provide links when possible
4. Be transparent about limitations and uncertainties
5. Focus on education and information, not advice
6. Maintain professional, institutional tone
7. Prioritize accuracy and clarity

CAPABILITIES:
- Portfolio analysis and insights
- Asset risk assessment
- Compliance status review
- Market trend analysis
- Educational content about RWAs
- Document and data interpretation

RESPONSE FORMAT:
- Clear, structured responses
- Source citations with links
- Relevant disclaimers
- Actionable insights (not advice)
- Risk factor identification
- Educational explanations

SAFETY:
- No financial advice
- No price predictions
- No buy/sell recommendations
- No guarantees or promises
- Always include appropriate disclaimers

Remember: You are an educational and informational tool, not a financial advisor.`;
  }

  private enrichPromptWithContext(prompt: string, context: PromptContext): string {
    let enrichedPrompt = prompt;

    // Add portfolio context if available
    if (context.portfolioContext) {
      enrichedPrompt += `\n\nPortfolio Context:\n${JSON.stringify(context.portfolioContext, null, 2)}`;
    }

    // Add asset context if available
    if (context.assetContext) {
      enrichedPrompt += `\n\nAsset Context:\n${JSON.stringify(context.assetContext, null, 2)}`;
    }

    // Add compliance context if available
    if (context.complianceContext) {
      enrichedPrompt += `\n\nCompliance Context:\n${JSON.stringify(context.complianceContext, null, 2)}`;
    }

    // Add risk context if available
    if (context.riskContext) {
      enrichedPrompt += `\n\nRisk Context:\n${JSON.stringify(context.riskContext, null, 2)}`;
    }

    // Add market context if available
    if (context.marketContext) {
      enrichedPrompt += `\n\nMarket Context:\n${JSON.stringify(context.marketContext, null, 2)}`;
    }

    // Add user preferences if available
    if (context.userPreferences) {
      enrichedPrompt += `\n\nUser Preferences:\n${JSON.stringify(context.userPreferences, null, 2)}`;
    }

    return enrichedPrompt;
  }

  private generateTemplateId(): string {
    return `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Method to get service statistics
  getServiceStats(): {
    totalTemplates: number;
    activeTemplates: number;
    categories: string[];
    totalExamples: number;
  } {
    const categories = [...new Set(this.templates.map(t => t.category))];
    const totalExamples = this.templates.reduce((sum, t) => sum + t.examples.length, 0);

    return {
      totalTemplates: this.templates.length,
      activeTemplates: this.templates.filter(t => t.isActive).length,
      categories,
      totalExamples,
    };
  }

  // Method to check if service is initialized
  isInitialized(): boolean {
    return this.templates.length > 0;
  }

  // Method to validate template variables
  validateTemplateVariables(template: string, variables: string[]): {
    isValid: boolean;
    missingVariables: string[];
    extraVariables: string[];
  } {
    const templateVariables = template.match(/\{\{(\w+)\}\}/g)?.map(v => v.replace(/\{\{|\}\}/g, '')) || [];
    const uniqueTemplateVariables = [...new Set(templateVariables)];

    const missingVariables = uniqueTemplateVariables.filter(v => !variables.includes(v));
    const extraVariables = variables.filter(v => !uniqueTemplateVariables.includes(v));

    return {
      isValid: missingVariables.length === 0,
      missingVariables,
      extraVariables,
    };
  }
}
