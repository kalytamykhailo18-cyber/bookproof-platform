import { Module } from '@nestjs/common';
import { TrackingService } from './services/tracking.service';
import { PrismaModule } from '@common/prisma/prisma.module';

/**
 * Tracking Module
 *
 * Handles affiliate click tracking and attribution.
 * Used by AuthModule to track user registrations via affiliate links.
 *
 * Separated from main AffiliatesModule to prevent circular dependencies.
 */
@Module({
  imports: [PrismaModule],
  providers: [TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}
