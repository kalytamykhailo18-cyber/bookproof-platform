import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { CampaignControlsService } from './services/campaign-controls.service';
import { ExceptionHandlingService } from './services/exception-handling.service';
import { DisputeService } from './services/dispute.service';
import { PaymentIssueService } from './services/payment-issue.service';
import { ReaderBehaviorService } from './services/reader-behavior.service';
import { TeamManagementService } from './services/team-management.service';
import { CampaignControlsController } from './controllers/campaign-controls.controller';
import { ExceptionHandlingController } from './controllers/exception-handling.controller';
import { DisputeController } from './controllers/dispute.controller';
import { PaymentIssueController } from './controllers/payment-issue.controller';
import { ReaderBehaviorController } from './controllers/reader-behavior.controller';
import { TeamManagementController } from './controllers/team-management.controller';

@Module({
  imports: [
    PrismaModule, // AuditService is @Global, no need to import or provide it
    EmailModule, // For sending notifications on admin actions
  ],
  controllers: [
    CampaignControlsController,
    ExceptionHandlingController,
    DisputeController,
    PaymentIssueController,
    ReaderBehaviorController,
    TeamManagementController,
  ],
  providers: [
    CampaignControlsService,
    ExceptionHandlingService,
    DisputeService,
    PaymentIssueService,
    ReaderBehaviorService,
    TeamManagementService,
  ],
  exports: [
    CampaignControlsService,
    ExceptionHandlingService,
    DisputeService,
    PaymentIssueService,
    ReaderBehaviorService,
    TeamManagementService,
  ],
})
export class AdminModule {}
