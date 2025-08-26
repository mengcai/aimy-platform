import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for asset creation
const AssetCreationSchema = z.object({
  assetBasics: z.object({
    name: z.string().min(1, 'Asset name is required'),
    description: z.string().min(1, 'Asset description is required'),
    assetType: z.string().min(1, 'Asset type is required'),
    sector: z.string().min(1, 'Sector is required'),
    location: z.string().min(1, 'Location is required'),
    documents: z.array(z.any()).min(1, 'At least one document is required'),
    estimatedValue: z.number().positive('Estimated value must be positive'),
    currency: z.string().min(1, 'Currency is required'),
  }),
  legalWrapper: z.object({
    jurisdiction: z.string().min(1, 'Jurisdiction is required'),
    regulatoryFramework: z.array(z.string()).min(1, 'At least one regulatory framework is required'),
    regD: z.boolean(),
    regS: z.boolean(),
    mica: z.boolean(),
    hkSandbox: z.boolean(),
    legalOpinion: z.any().nullable(),
    complianceDocuments: z.array(z.any()),
  }),
  tokenTerms: z.object({
    tokenName: z.string().min(1, 'Token name is required'),
    tokenSymbol: z.string().min(1, 'Token symbol is required'),
    totalSupply: z.number().positive('Total supply must be positive'),
    initialPrice: z.number().positive('Initial price must be positive'),
    lockupPeriod: z.number().min(0, 'Lockup period cannot be negative'),
    transferRestrictions: z.array(z.string()),
    complianceRules: z.array(z.string()),
    kycRequired: z.boolean(),
    amlRequired: z.boolean(),
  }),
  pricingAI: z.object({
    cashflows: z.array(z.object({
      date: z.string(),
      amount: z.number().positive(),
      type: z.enum(['revenue', 'dividend', 'interest', 'rental', 'other']),
      description: z.string(),
    })).min(1, 'At least one cashflow is required'),
    aiValuation: z.number().positive('AI valuation must be positive'),
    riskScore: z.number().min(1, 'Risk score must be at least 1').max(100, 'Risk score cannot exceed 100'),
    yieldForecast: z.number().min(0, 'Yield forecast cannot be negative'),
    marketAnalysis: z.string(),
    aiConfidence: z.number().min(1, 'AI confidence must be at least 1').max(100, 'AI confidence cannot exceed 100'),
  }),
  offeringSetup: z.object({
    minimumTicket: z.number().positive('Minimum ticket must be positive'),
    maximumTicket: z.number().positive('Maximum ticket must be positive'),
    kycRequirements: z.array(z.string()).min(1, 'At least one KYC requirement is required'),
    amlRequirements: z.array(z.string()),
    accreditedInvestorOnly: z.boolean(),
    lockupPeriod: z.number().min(0, 'Lockup period cannot be negative'),
    distributionSchedule: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = AssetCreationSchema.parse(body);

    // TODO: In production, this would connect to a real PostgreSQL database
    // For now, we'll simulate the database operation
    
    // Simulate database connection and insertion
    const assetId = `ASSET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate saving to database
    const assetRecord = {
      id: assetId,
      ...validatedData,
      status: 'pending_deployment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      issuerId: 'mock_issuer_id', // In production, this would come from authentication
      version: '1.0.0',
    };

    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // TODO: In production, implement actual database operations:
    // 1. Connect to PostgreSQL
    // 2. Insert asset configuration
    // 3. Handle document uploads to MinIO
    // 4. Create audit trail
    // 5. Send notifications

    console.log('Asset configuration saved:', assetRecord);

    return NextResponse.json({
      success: true,
      assetId,
      message: 'Asset configuration saved successfully',
      data: {
        assetId,
        status: 'pending_deployment',
        nextSteps: [
          'Deploy smart contracts',
          'Create primary offering',
          'Publish to investor portal'
        ]
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Asset creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create asset configuration'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    message: 'Use POST to create assets'
  }, { status: 405 });
}

