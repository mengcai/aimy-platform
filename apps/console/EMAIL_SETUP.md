# Email Setup Guide for AIMYA Contact Form

This guide explains how to set up real email functionality for the contact form to send emails to `cal.ericcai@gmail.com`.

## Current Setup

The contact form is currently configured to log submissions to the console (development mode). To enable real email sending, you need to configure one of the supported email providers.

## Supported Email Providers

### 1. SendGrid (Recommended for Production)

1. **Sign up for SendGrid**: Go to [sendgrid.com](https://sendgrid.com) and create an account
2. **Get API Key**: Navigate to Settings > API Keys and create a new API key
3. **Install Package**: Run `npm install @sendgrid/mail`
4. **Update Configuration**: Modify `src/lib/email-service.ts`:

```typescript
export const defaultEmailService = new EmailService({
  provider: 'sendgrid',
  apiKey: 'YOUR_SENDGRID_API_KEY',
  fromEmail: 'noreply@aimya.com', // Your verified sender email
  toEmail: 'cal.ericcai@gmail.com'
});
```

5. **Uncomment SendGrid Implementation**: In the email service, uncomment and configure the SendGrid code.

### 2. Mailgun

1. **Sign up for Mailgun**: Go to [mailgun.com](https://mailgun.com)
2. **Get API Key**: Find your API key in the dashboard
3. **Install Package**: Run `npm install mailgun.js`
4. **Update Configuration**: Similar to SendGrid setup

### 3. Nodemailer (SMTP)

1. **Install Package**: Run `npm install nodemailer`
2. **Configure SMTP**: Set up with your email provider's SMTP settings
3. **Update Configuration**: Add SMTP credentials

## Environment Variables

For security, store your API keys in environment variables:

```bash
# .env.local
SENDGRID_API_KEY=your_api_key_here
MAILGUN_API_KEY=your_api_key_here
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Testing

1. **Development**: The form currently logs to console
2. **Production**: Test with real email provider
3. **Check Console**: Look for the email submission logs

## Current Status

✅ **Form Validation**: Working  
✅ **API Endpoint**: Created at `/api/contact`  
✅ **Email Service**: Framework ready  
✅ **Console Logging**: Working (shows submissions to cal.ericcai@gmail.com)  
⏳ **Real Email**: Configure email provider for production  

## Next Steps

1. Choose an email provider (SendGrid recommended)
2. Follow the setup instructions above
3. Test with real email sending
4. Monitor email delivery to cal.ericcai@gmail.com

## Support

If you need help setting up email providers or encounter issues, check the provider's documentation or contact their support team.
