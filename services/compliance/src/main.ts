import { NestFactory } from '@nestjs/core';
import { ComplianceModule } from './compliance.module';

async function bootstrap() {
  const app = await NestFactory.create(ComplianceModule);
  
  // CORS configuration
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3005'],
    credentials: true,
  });

  const port = process.env.PORT || 3002;

  await app.listen(port);
  console.log(`🚀 AIMY Compliance Service running on port ${port}`);
  console.log(`📚 Health check available at http://localhost:${port}/health`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start compliance service:', error);
  process.exit(1);
});
