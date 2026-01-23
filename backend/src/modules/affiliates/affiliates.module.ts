import { Module } from '@nestjs/common';
import { AffiliatesController } from './affiliates.controller';
import { AffiliatesService } from './affiliates.service';
import { AffiliatePayoutService } from './services/payout.service';
import { MarketingMaterialsService } from './services/marketing-materials.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { TrackingModule } from './tracking.module';
import { CommissionModule } from './commission.module';
import { EmailModule } from '@modules/email/email.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';

/**
 * Affiliates Module
 *
 * Handles main affiliate management (dashboard, profile, payouts, marketing materials).
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
    NotificationsModule, // For in-app notifications (Section 13.2)
  ],
  controllers: [AffiliatesController],
  providers: [
    AffiliatesService,
    AffiliatePayoutService,
    MarketingMaterialsService,
  ],
  exports: [
    AffiliatesService,
    AffiliatePayoutService,
    MarketingMaterialsService,
    TrackingModule, // Re-export for convenience
    CommissionModule, // Re-export for convenience
  ],
})
export class AffiliatesModule {}
