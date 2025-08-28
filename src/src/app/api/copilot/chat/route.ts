import { NextRequest, NextResponse } from 'next/server';
import { CopilotService } from '@/lib/copilot-service';
import { rateLimit } from '@/lib/rate-limit';
import { validateRequest } from '@/lib/validation';

// Rate limiting: 10 requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || 'anonymous';
    const { success } = await limiter.check(identifier, 10);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Validate request
    const body = await request.json();
    const validation = validateRequest(body, {
      message: 'required|string|max:1000',
      context: 'object',
      'context.portfolioId': 'optional|string',
      'context.assetId': 'optional|string',
      'context.userId': 'optional|string',
      'context.sessionId': 'required|string',
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.errors },
        { status: 400 }
      );
    }

    const { message, context } = body;

    // Initialize copilot service
    const copilotService = new CopilotService();

    // Process the message through the copilot
    const response = await copilotService.processMessage(message, context);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Copilot chat error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
