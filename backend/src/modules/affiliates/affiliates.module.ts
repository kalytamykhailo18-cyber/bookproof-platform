import { Module } from '@nestjs/common';
import { AffiliatesController } from './affiliates.controller';
import { AffiliatesService } from './affiliates.service';
import { AffiliatePayoutService } from './services/payout.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { TrackingModule } from './tracking.module';
import { CommissionModule } from './commission.module';
import { EmailModule } from '@modules/email/email.module';

/**
 * Affiliates Module
 *
 * Handles main affiliate management (dashboard, profile, payouts).
 * Imports TrackingModule and CommissionModule for internal use.
 *
 * NOTE: AuthModule and CreditsModule should import TrackingModule
 * and CommissionModule directly, NOT this module.
 * This prevents circular dependencies.
 */
@Module({
  imports: [
    PrismaModule,
    TrackingModule, // For affiliate tracking functionality
    CommissionModule, // For commission management
    EmailModule, // For sending email notifications
  ],
  controllers: [AffiliatesController],
  providers: [
    AffiliatesService,
    AffiliatePayoutService,
  ],
  exports: [
    AffiliatesService,
    AffiliatePayoutService,
    TrackingModule, // Re-export for convenience
    CommissionModule, // Re-export for convenience
  ],
})
export class AffiliatesModule {}
