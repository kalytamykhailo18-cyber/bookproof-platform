import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Configure body parser limits for large file uploads (500MB+ for audiobooks)
  // Note: Multipart form data is handled by multer, but we need to increase
  // the raw body limit for proper request handling
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '550mb', extended: true }));

  const configService = app.get(ConfigService);

  // Use Pino logger
  app.useLogger(app.get(Logger));

  // Initialize Sentry for error tracking
  if (configService.get('sentry.dsn')) {
    Sentry.init({
      dsn: configService.get('sentry.dsn'),
      environment: configService.get('app.nodeEnv'),
      tracesSampleRate: configService.get('sentry.tracesSampleRate'),
    });
  }

  // Security - Enhanced Helmet configuration
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for email templates
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:', 'http:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny',
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
    }),
  );

  // CORS - Enhanced configuration
  const corsOrigins = configService.get('cors.origin')?.split(',') || [];
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in whitelist
      if (corsOrigins.includes(origin) || corsOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: configService.get('cors.credentials') !== false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 86400, // 24 hours
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
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Apply JWT guard globally
  const reflector = app.get('Reflector');
  // Guards will be applied at module level via APP_GUARD

  // Swagger API documentation
  if (configService.get('app.nodeEnv') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('BookProof API')
      .setDescription('BookProof MVP - Amazon Review Platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('books', 'Book and campaign management')
      .addTag('campaigns', 'Campaign operations')
      .addTag('readers', 'Reader management')
      .addTag('reviews', 'Review management')
      .addTag('credits', 'Credit system')
      .addTag('payments', 'Payment processing')
      .addTag('files', 'File storage operations')
      .addTag('admin', 'Admin operations')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get('app.port') || 4000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
