import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { ClosersModule } from '../closers/closers.module';
import { CampaignControlsService } from './services/campaign-controls.service';
import { ExceptionHandlingService } from './services/exception-handling.service';
import { DisputeService } from './services/dispute.service';
import { PaymentIssueService } from './services/payment-issue.service';
import { ReaderBehaviorService } from './services/reader-behavior.service';
import { TeamManagementService } from './services/team-management.service';
import { LogsService } from './services/logs.service';
import { ReaderManagementService } from './services/reader-management.service';
import { AuthorManagementService } from './services/author-management.service';
import { UserManagementService } from './services/user-management.service';
import { CampaignControlsController } from './controllers/campaign-controls.controller';
import { ExceptionHandlingController } from './controllers/exception-handling.controller';
import { DisputeController } from './controllers/dispute.controller';
import { PaymentIssueController } from './controllers/payment-issue.controller';
import { ReaderBehaviorController } from './controllers/reader-behavior.controller';
import { TeamManagementController } from './controllers/team-management.controller';
import { LogsController } from './controllers/logs.controller';
import { ReaderManagementController } from './controllers/reader-management.controller';
import { AuthorManagementController } from './controllers/author-management.controller';
import { PackageApprovalController } from './controllers/package-approval.controller';
import { UserManagementController } from './controllers/user-management.controller';

@Module({
  imports: [
    PrismaModule, // AuditService is @Global, no need to import or provide it
    EmailModule, // For sending notifications on admin actions
    ClosersModule, // For package approval service
  ],
  controllers: [
    CampaignControlsController,
    ExceptionHandlingController,
    DisputeController,
    PaymentIssueController,
    ReaderBehaviorController,
    TeamManagementController,
    LogsController,
    ReaderManagementController,
    AuthorManagementController,
    PackageApprovalController, // Super Admin package approval
    UserManagementController, // User management (Section 5.2)
  ],
  providers: [
    CampaignControlsService,
    ExceptionHandlingService,
    DisputeService,
    PaymentIssueService,
    ReaderBehaviorService,
    TeamManagementService,
    LogsService,
    ReaderManagementService,
    AuthorManagementService,
    UserManagementService,
  ],
  exports: [
    CampaignControlsService,
    ExceptionHandlingService,
    DisputeService,
    PaymentIssueService,
    ReaderBehaviorService,
    TeamManagementService,
    LogsService,
    ReaderManagementService,
    AuthorManagementService,
    UserManagementService,
  ],
})
export class AdminModule {}
