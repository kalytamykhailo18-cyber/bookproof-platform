import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '@common/prisma/prisma.module';

/**
 * Notifications Module
 *
 * Handles in-app notifications for all user types:
 * - Authors: Campaign updates, payments
 * - Readers: Assignments, deadlines, payments
 * - Admins: Reviews pending, issues, system alerts
 * - Affiliates: Referrals, commissions
 */
@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
