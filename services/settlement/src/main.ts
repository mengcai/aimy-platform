import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SettlementModule } from './settlement.module';

async function bootstrap() {
  const app = await NestFactory.create(SettlementModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AIMY Settlement Service')
    .setDescription('Comprehensive payout and distribution management for RWA tokenization')
    .setVersion('1.0.0')
    .addTag('Settlement', 'Core settlement operations')
    .addTag('Payouts', 'Payout execution and management')
    .addTag('Wallets', 'Investor wallet management')
    .addTag('Distributions', 'Distribution lifecycle management')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'settlement',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  const port = process.env.SETTLEMENT_SERVICE_PORT || 3003;
  const host = process.env.SETTLEMENT_SERVICE_HOST || '0.0.0.0';

  await app.listen(port, host);

  console.log(`🚀 AIMY Settlement Service is running on: http://${host}:${port}`);
  console.log(`📚 API Documentation available at: http://${host}:${port}/api/docs`);
  console.log(`🏥 Health check available at: http://${host}:${port}/health`);
}

bootstrap().catch((error) => {
  console.error('Failed to start Settlement Service:', error);
  process.exit(1);
});
