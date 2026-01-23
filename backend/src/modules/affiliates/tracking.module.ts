import { Module } from '@nestjs/common';
import { TrackingService } from './services/tracking.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';

/**
 * Tracking Module
 *
 * Handles affiliate click tracking and attribution.
 * Used by AuthModule to track user registrations via affiliate links.
 *
 * Separated from main AffiliatesModule to prevent circular dependencies.
 */
@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}
