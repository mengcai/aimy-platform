import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ComplianceModule } from './compliance.module';

async function bootstrap() {
  const app = await NestFactory.create(ComplianceModule);
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS configuration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AIMY Compliance Service')
    .setDescription('KYC/AML compliance engine with rule-based decision making')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('kyc', 'KYC applicant management')
    .addTag('screening', 'Sanctions and AML screening')
    .addTag('rules', 'Compliance rule engine')
    .addTag('cases', 'Case management and decisions')
    .addTag('webhooks', 'Webhook endpoints for compliance checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3002);

  await app.listen(port);
  console.log(`🚀 AIMY Compliance Service running on port ${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start compliance service:', error);
  process.exit(1);
});
