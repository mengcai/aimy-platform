// Email service for sending contact form submissions
// This service can be configured to work with various email providers

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  newsletter: boolean;
}

export interface EmailServiceConfig {
  provider: 'sendgrid' | 'mailgun' | 'nodemailer' | 'console';
  apiKey?: string;
  domain?: string;
  fromEmail?: string;
  toEmail: string;
}

export class EmailService {
  private config: EmailServiceConfig;

  constructor(config: EmailServiceConfig) {
    this.config = config;
  }

  async sendContactForm(data: ContactFormData): Promise<boolean> {
    try {
      switch (this.config.provider) {
        case 'console':
          return this.sendToConsole(data);
        case 'sendgrid':
          return this.sendViaSendGrid(data);
        case 'mailgun':
          return this.sendViaMailgun(data);
        case 'nodemailer':
          return this.sendViaNodemailer(data);
        default:
          throw new Error(`Unsupported email provider: ${this.config.provider}`);
      }
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  private async sendToConsole(data: ContactFormData): Promise<boolean> {
    // For development/testing - just log to console
    console.log('📧 CONTACT FORM SUBMISSION');
    console.log('========================');
    console.log(`From: ${data.firstName} ${data.lastName} <${data.email}>`);
    console.log(`Subject: ${data.subject}`);
    console.log(`Message: ${data.message}`);
    console.log(`Newsletter: ${data.newsletter ? 'Yes' : 'No'}`);
    console.log(`To: ${this.config.toEmail}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('========================');
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  }

  private async sendViaSendGrid(data: ContactFormData): Promise<boolean> {
    // Implementation for SendGrid
    // You would need to install @sendgrid/mail package
    console.log('SendGrid email service not implemented yet');
    return false;
  }

  private async sendViaMailgun(data: ContactFormData): Promise<boolean> {
    // Implementation for Mailgun
    console.log('Mailgun email service not implemented yet');
    return false;
  }

  private async sendViaNodemailer(data: ContactFormData): Promise<boolean> {
    // Implementation for Nodemailer (SMTP)
    console.log('Nodemailer email service not implemented yet');
    return false;
  }
}

// Default email service configuration
export const defaultEmailService = new EmailService({
  provider: 'console', // Change to 'sendgrid', 'mailgun', or 'nodemailer' for production
  toEmail: 'support@aimya.ai'
});
