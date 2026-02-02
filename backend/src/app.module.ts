import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { appProviders } from '@common/providers/app.providers';

// Configuration
import appConfig from '@config/app.config';
import databaseConfig from '@config/database.config';
import jwtConfig from '@config/jwt.config';
import stripeConfig from '@config/stripe.config';
import r2Config from '@config/r2.config';
import redisConfig from '@config/redis.config';
import emailConfig from '@config/email.config';
import sentryConfig from '@config/sentry.config';
import corsConfig from '@config/cors.config';
import businessConfig from '@config/business.config';
import captchaConfig from '@config/captcha.config';

// Core modules
import { PrismaModule } from '@common/prisma/prisma.module';
import { CacheModule } from '@common/cache/cache.module';
import { FilesModule } from '@modules/files/files.module';
import { QueueModule } from '@modules/jobs/queue.module';
import { BullQueueModule } from '@modules/jobs/bull.module';
import { EmailModule } from '@modules/email/email.module';
import { AuthModule } from '@modules/auth/auth.module';
import { LandingPagesModule } from '@modules/landing-pages/landing-pages.module';
import { CreditsModule } from '@modules/credits/credits.module';
import { CampaignsModule } from '@modules/campaigns/campaigns.module';
import { PaymentsModule } from '@modules/payments/payments.module';
import { ReadersModule } from '@modules/readers/readers.module';
import { QueueAssignmentsModule } from '@modules/queue/queue-assignments.module';
import { CouponsModule } from '@modules/coupons/coupons.module';
import { KeywordsModule } from '@modules/keywords/keywords.module';
import { AffiliatesModule } from '@modules/affiliates/affiliates.module';
import { ReportsModule } from '@modules/reports/reports.module';
import { WalletModule } from '@modules/wallet/wallet.module';
import { AuditModule } from '@modules/audit/audit.module';
import { DashboardModule } from '@modules/dashboard/dashboard.module';
import { ReviewsModule } from '@modules/reviews/reviews.module';
import { AdminModule } from '@modules/admin/admin.module';
import { SettingsModule } from '@modules/settings/settings.module';
import { ClosersModule } from '@modules/closers/closers.module';
import { RealtimeModule } from '@modules/realtime/realtime.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { UsersModule } from '@modules/users/users.module';

@Module({
  imports: [
    // Configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        stripeConfig,
        r2Config,
        redisConfig,
        emailConfig,
        sentryConfig,
        corsConfig,
        businessConfig,
        captchaConfig,
      ],
    }),

    // Event-driven architecture (prevents circular dependencies)
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),

    // Logging with Pino - includes sensitive data redaction
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  translateTime: 'HH:MM:ss Z',
                  ignore: 'pid,hostname',
                },
              }
            : undefined,
        level: process.env.LOG_LEVEL || 'info',
        // Redact sensitive fields from logs
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body.password',
            'req.body.newPassword',
            'req.body.oldPassword',
            'req.body.passwordHash',
            'req.body.token',
            'req.body.accessToken',
            'req.body.refreshToken',
            'req.body.apiKey',
            'req.body.secret',
            'req.body.cvv',
            'req.body.cvc',
            'req.body.cardNumber',
            'res.body.accessToken',
            'res.body.token',
            '*.password',
            '*.passwordHash',
            '*.token',
            '*.accessToken',
            '*.secret',
          ],
          censor: '[REDACTED]',
        },
        serializers: {
          req: (req: unknown) => ({
            method: (req as { method: string }).method,
            url: (req as { url: string }).url,
          }),
          res: (res: unknown) => ({
            statusCode: (res as { statusCode: number }).statusCode,
          }),
        },
      },
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      },
    ]),

    // Task scheduling
    ScheduleModule.forRoot(),

    // Core infrastructure
    PrismaModule,
    CacheModule,
    FilesModule,
    QueueModule.forRoot(),
    BullQueueModule.forRoot(),
    EmailModule,
    AuditModule,

    // Feature modules
    AuthModule,
    UsersModule, // GDPR compliance (requirements.md Section 15.3)
    LandingPagesModule,
    CreditsModule,
    CampaignsModule,
    PaymentsModule,
    ReadersModule,
    QueueAssignmentsModule,
    CouponsModule,
    KeywordsModule,
    AffiliatesModule,
    ReportsModule,
    WalletModule,
    DashboardModule,
    ReviewsModule,
    AdminModule,
    SettingsModule,
    ClosersModule,
    RealtimeModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, ...appProviders],
})
export class AppModule {}
