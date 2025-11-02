import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('apiPrefix') || 'api';
  const apiVersion = configService.get<string>('apiVersion') || 'v1';
  const port = configService.get<number>('port') || 3000;
  const corsOrigin = configService.get<string>('cors.origin') || 'http://localhost:3001';
  const corsConfig = {
    origin: corsOrigin === '*'
      ? true
      : typeof corsOrigin === 'string'
        ? corsOrigin.split(',').map(o => o.trim())
        : corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsConfig);

  app.setGlobalPrefix(`${apiPrefix}/${apiVersion}`);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('ExpenseTracker API')
    .setDescription(
      'API documentation for ExpenseTracker - A student expense management system',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Users', 'User profile management')
    .addTag('Categories', 'Expense category management')
    .addTag('Expenses', 'Expense tracking and management')
    .addTag('Budgets', 'Budget planning and tracking')
    .addTag('Statistics', 'Analytics and reporting')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`🌐 Network: http://192.168.1.6:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`🔗 API Prefix: ${apiPrefix}/${apiVersion}`);
}

bootstrap();
