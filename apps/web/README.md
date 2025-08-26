# AIMY Investor Portal (Web App)

The main investor-facing web application for the AIMY platform, providing a modern, responsive interface for asset discovery, portfolio management, and AI-powered investment insights.

## Purpose

This application serves as the primary investor interface, enabling:
- **Asset Discovery**: Browse and research available tokenized assets
- **Portfolio Management**: Real-time portfolio tracking and management
- **Investment Tools**: AI-powered investment recommendations and analysis
- **Compliance Dashboard**: Regulatory compliance status and reporting
- **Document Management**: Secure document upload and verification
- **Real-time Updates**: Live portfolio and market data updates

## Architecture Mapping

### Asset Input Layer
- **Asset Browsing**: View available assets with filtering and search
- **Asset Details**: Comprehensive asset information and documentation
- **AI Insights**: AI-powered asset analysis and recommendations

### AI Valuation & Scoring Engine
- **Valuation Display**: Real-time asset valuations and AI confidence scores
- **Risk Assessment**: Visual risk scoring and factor breakdown
- **Yield Prediction**: AI-powered yield forecasts and projections
- **Portfolio Analytics**: AI-driven portfolio optimization suggestions

### Fractionalization & Tokenization Layer
- **Token Information**: Security token details and compliance status
- **Fractional Ownership**: Visual representation of fractional ownership
- **Token Economics**: Yield distribution and reinvestment options

### Compliance & KYC/AML Module
- **KYC Status**: Real-time KYC verification status
- **Compliance Dashboard**: Regulatory compliance overview
- **Document Verification**: Identity and address verification status
- **Regulatory Reporting**: Compliance report access

### Settlement & Payments
- **Payment Methods**: Multiple payment option management
- **Transaction History**: Complete payment and settlement history
- **Dividend Tracking**: Dividend distribution and reinvestment
- **Fiat Integration**: Traditional banking integration status

### Liquidity & Trading
- **Trading Interface**: Buy/sell security tokens
- **Market Data**: Real-time pricing and volume information
- **Order Management**: Order history and status tracking
- **Liquidity Information**: Available liquidity and trading pairs

### Investor Portal
- **User Dashboard**: Personalized investment overview
- **Portfolio Analytics**: Performance metrics and analysis
- **Investment History**: Complete transaction and performance history
- **Reporting Tools**: Custom reports and analytics

## Technology Stack

### Frontend Framework
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components

### State Management
- **React Query**: Server state management
- **Zustand**: Client state management
- **React Hook Form**: Form handling and validation

### UI/UX Features
- **Framer Motion**: Smooth animations and micro-interactions
- **Recharts**: Data visualization and charts
- **date-fns**: Date manipulation utilities
- **Lucide Icons**: Beautiful icon library

### Authentication
- **NextAuth.js**: Authentication and authorization
- **JWT Tokens**: Secure session management
- **Role-based Access**: Investor-specific permissions

## Key Features

### Asset Discovery
- **Advanced Filtering**: Filter by asset type, location, risk level, yield
- **Search Functionality**: Full-text search across asset metadata
- **AI Recommendations**: Personalized asset suggestions
- **Comparison Tools**: Side-by-side asset comparison

### Portfolio Management
- **Real-time Tracking**: Live portfolio value updates
- **Performance Analytics**: Historical performance analysis
- **Asset Allocation**: Visual portfolio breakdown
- **Rebalancing Tools**: Portfolio optimization suggestions

### Investment Tools
- **AI Insights**: Machine learning-powered investment recommendations
- **Risk Assessment**: Comprehensive risk analysis tools
- **Yield Forecasting**: AI-powered yield predictions
- **Market Analysis**: Real-time market data and trends

### Compliance Features
- **KYC Dashboard**: Complete KYC status overview
- **Document Management**: Secure document upload and storage
- **Regulatory Updates**: Real-time compliance requirement updates
- **Audit Trail**: Complete transaction and compliance history

## Project Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (dashboard)/       # Dashboard routes
│   │   ├── assets/            # Asset-related pages
│   │   ├── portfolio/         # Portfolio management
│   │   ├── compliance/        # Compliance dashboard
│   │   └── settings/          # User settings
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── forms/            # Form components
│   │   ├── charts/           # Data visualization
│   │   └── layout/           # Layout components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   ├── services/             # API service layer
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
├── tailwind.config.js        # Tailwind CSS configuration
├── next.config.js            # Next.js configuration
└── package.json              # Dependencies and scripts
```

## Development

### Prerequisites
- **Node.js**: Version 20 or higher
- **pnpm**: Package manager
- **Docker**: For local development environment

### Setup
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.sample .env.local
# Edit .env.local with your configuration

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3001

# External Services
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
NEXT_PUBLIC_PLAID_PUBLISHABLE_KEY=your-plaid-key
```

## Testing

### Test Types
- **Unit Tests**: Component and utility testing
- **Integration Tests**: API integration testing
- **E2E Tests**: End-to-end user flow testing
- **Visual Tests**: UI component visual regression testing

### Test Commands
```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run specific test file
pnpm test -- --testPathPattern=AssetCard.test.tsx
```

## Deployment

### Build Process
```bash
# Install dependencies
pnpm install

# Build application
pnpm build

# Start production server
pnpm start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t aimy-web .

# Run container
docker run -p 3001:3000 aimy-web
```

### Environment-specific Builds
- **Development**: Hot reload, debug tools, development APIs
- **Staging**: Production-like environment, staging APIs
- **Production**: Optimized build, production APIs, CDN integration

## Performance Optimization

### Frontend Optimization
- **Code Splitting**: Dynamic imports for route-based code splitting
- **Image Optimization**: Next.js Image component with WebP support
- **Bundle Analysis**: Webpack bundle analyzer for optimization
- **Lazy Loading**: Component and route lazy loading

### Caching Strategy
- **Static Generation**: Pre-rendered static pages
- **Incremental Static Regeneration**: Dynamic content with static benefits
- **Service Worker**: Offline support and caching
- **CDN Integration**: Global content delivery

### Monitoring
- **Performance Metrics**: Core Web Vitals monitoring
- **Error Tracking**: Real-time error monitoring and reporting
- **User Analytics**: User behavior and performance analytics
- **A/B Testing**: Feature flag and experimentation framework

## Security Features

### Authentication & Authorization
- **Multi-factor Authentication**: SMS, email, hardware token support
- **Session Management**: Secure JWT token handling
- **Role-based Access**: Investor-specific permissions and restrictions
- **API Security**: Rate limiting and request validation

### Data Protection
- **Input Validation**: Comprehensive input sanitization
- **XSS Protection**: Cross-site scripting prevention
- **CSRF Protection**: Cross-site request forgery protection
- **Content Security Policy**: Strict CSP headers

### Privacy Compliance
- **GDPR Compliance**: European data protection compliance
- **Data Minimization**: Minimal data collection and storage
- **User Consent**: Explicit consent management
- **Data Portability**: User data export capabilities

## Accessibility

### WCAG Compliance
- **WCAG AA**: Level AA accessibility compliance
- **Screen Reader Support**: Full screen reader compatibility
- **Keyboard Navigation**: Complete keyboard-only navigation
- **Color Contrast**: High contrast color schemes

### Inclusive Design
- **Responsive Design**: Mobile-first responsive design
- **Touch-friendly**: Touch-optimized interface elements
- **Font Scaling**: Adjustable font sizes and zoom support
- **Alternative Text**: Comprehensive image and icon descriptions

## Contributing

### Development Guidelines
1. **Code Style**: Follow ESLint and Prettier configuration
2. **Type Safety**: Maintain strict TypeScript usage
3. **Component Design**: Use shadcn/ui design system
4. **Testing**: Ensure comprehensive test coverage
5. **Documentation**: Update documentation for new features

### Pull Request Process
1. **Feature Branch**: Create feature branch from main
2. **Development**: Implement feature with tests
3. **Code Review**: Submit PR for review
4. **Testing**: Ensure all tests pass
5. **Merge**: Merge after approval and CI checks

## Support & Documentation

### Resources
- **Component Library**: shadcn/ui documentation
- **Next.js Docs**: Framework documentation
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe JavaScript

### Getting Help
- **GitHub Issues**: Bug reports and feature requests
- **Discord Community**: Developer community and support
- **Documentation**: Comprehensive platform documentation
- **API Reference**: Complete API documentation
