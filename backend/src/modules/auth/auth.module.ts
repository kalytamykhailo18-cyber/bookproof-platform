import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { PrismaModule } from '@common/prisma/prisma.module';
import { CacheModule } from '@common/cache/cache.module';
import { CaptchaModule } from '@common/captcha/captcha.module';
import { EmailModule } from '@modules/email/email.module';
import { TrackingModule } from '@modules/affiliates/tracking.module';

/**
 * Auth Module
 *
 * Handles authentication and authorization.
 * Imports TrackingModule (not AffiliatesModule) to prevent circular dependency.
 *
 * TrackingModule provides TrackingService for affiliate attribution tracking.
 * CacheModule provides CacheService for account lockout tracking.
 * CaptchaModule provides CaptchaService for bot protection.
 */
@Module({
  imports: [
    PrismaModule,
    CacheModule,
    CaptchaModule,
    PassportModule,
    EmailModule,
    TrackingModule, // Direct import - no forwardRef needed!
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn') || '7d',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
