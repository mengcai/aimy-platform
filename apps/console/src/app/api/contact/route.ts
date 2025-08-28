import { NextRequest, NextResponse } from 'next/server';
import { defaultEmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, subject, message, newsletter } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email using the email service
    const emailSent = await defaultEmailService.sendContactForm({
      firstName,
      lastName,
      email,
      subject,
      message,
      newsletter
    });

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Message sent successfully',
        recipient: 'cal.ericcai@gmail.com'
      });
    } else {
      throw new Error('Failed to send email');
    }

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
