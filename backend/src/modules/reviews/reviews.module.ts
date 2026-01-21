import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ValidationService } from './validation.service';
import { IssueManagementService } from './issue-management.service';
import { AmazonMonitoringService } from './amazon-monitoring.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, EmailModule, NotificationsModule, AuditModule],
  controllers: [ReviewsController],
  providers: [
    ReviewsService,
    ValidationService,
    IssueManagementService,
    AmazonMonitoringService,
  ],
  exports: [
    ReviewsService,
    ValidationService,
    IssueManagementService,
    AmazonMonitoringService,
  ],
})
export class ReviewsModule {}
