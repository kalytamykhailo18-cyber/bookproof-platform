import { Module, Global } from '@nestjs/common';
import { QueueService } from './queue.service';
import { WeeklyDistributionProcessor } from './processors/weekly-distribution.processor';
import { MaterialReleaseProcessor } from './processors/material-release.processor';
import { DeadlineCheckerProcessor } from './processors/deadline-checker.processor';
import { CampaignCompletionProcessor } from './processors/campaign-completion.processor';
import { CreditExpirationProcessor } from './processors/credit-expiration.processor';
import { AmazonMonitorProcessor } from './processors/amazon-monitor.processor';
import { PrismaModule } from '@common/prisma/prisma.module';
import { ReportsModule } from '@modules/reports/reports.module';
import { ReviewsModule } from '@modules/reviews/reviews.module';

@Global()
@Module({
  imports: [
    PrismaModule, // EmailModule is @Global, no need to import it here
    ReportsModule,
    ReviewsModule,
  ],
  providers: [
    QueueService,
    WeeklyDistributionProcessor,
    MaterialReleaseProcessor,
    DeadlineCheckerProcessor,
    CampaignCompletionProcessor,
    CreditExpirationProcessor,
    AmazonMonitorProcessor,
  ],
  exports: [QueueService],
})
export class QueueModule {}
