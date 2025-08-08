import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AuthExceptionFilter } from './auth/auth-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);

  // Enable CORS with more robust configuration
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

  // Parse CORS origins - handle both single origin and comma-separated list
  let corsOrigins: string[] | boolean;
  if (corsOrigin === '*' || corsOrigin === 'true') {
    corsOrigins = true; // Allow all origins
  } else {
    corsOrigins = corsOrigin
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);
  }

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AuthExceptionFilter());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Job Application Manager API')
    .setDescription(
      'A comprehensive API for managing job applications, companies, and interview events',
    )
    .setVersion('1.0')
    .addTag('Users', 'User management endpoints')
    .addTag('Companies', 'Company management endpoints')
    .addTag('Applications', 'Job application management endpoints')
    .addTag('Events', 'Application event management endpoints')
    .addTag('Notes', 'Application notes management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Server is running on port ${port}`);
  console.log(
    `📚 API Documentation available at http://localhost:${port}/api-docs`,
  );
  console.log(`🏥 Health check available at http://localhost:${port}/health`);
  console.log(
    `🌐 CORS configured for origins: ${Array.isArray(corsOrigins) ? corsOrigins.join(', ') : 'ALL'}`,
  );
}

bootstrap();
