import { Module, Global, forwardRef } from '@nestjs/common';
import { QueueService } from './queue.service';
import { WeeklyDistributionProcessor } from './processors/weekly-distribution.processor';
import { MaterialReleaseProcessor } from './processors/material-release.processor';
import { DeadlineCheckerProcessor } from './processors/deadline-checker.processor';
import { CampaignCompletionProcessor } from './processors/campaign-completion.processor';
import { CreditExpirationProcessor } from './processors/credit-expiration.processor';
import { AmazonMonitorProcessor } from './processors/amazon-monitor.processor';
import { KeywordGenerationProcessor } from './processors/keyword-generation.processor';
import { PrismaModule } from '@common/prisma/prisma.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { ReportsModule } from '@modules/reports/reports.module';
import { ReviewsModule } from '@modules/reviews/reviews.module';
import { KeywordsModule } from '@modules/keywords/keywords.module';

@Global()
@Module({
  imports: [
    PrismaModule, // EmailModule is @Global, no need to import it here
    NotificationsModule,
    ReportsModule,
    ReviewsModule,
    forwardRef(() => KeywordsModule),
  ],
  providers: [
    QueueService,
    WeeklyDistributionProcessor,
    MaterialReleaseProcessor,
    DeadlineCheckerProcessor,
    CampaignCompletionProcessor,
    CreditExpirationProcessor,
    AmazonMonitorProcessor,
    KeywordGenerationProcessor,
  ],
  exports: [QueueService],
})
export class QueueModule {}
