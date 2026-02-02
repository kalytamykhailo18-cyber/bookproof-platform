import { Module, Global, forwardRef, DynamicModule, Logger } from '@nestjs/common';
import { QueueService } from './queue.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { ReportsModule } from '@modules/reports/reports.module';
import { ReviewsModule } from '@modules/reviews/reviews.module';
import { KeywordsModule } from '@modules/keywords/keywords.module';

@Global()
@Module({})
export class QueueModule {
  private static readonly logger = new Logger(QueueModule.name);

  static forRoot(): DynamicModule {
    const redisEnabled = process.env.REDIS_ENABLED === 'true';

    const baseModule = {
      module: QueueModule,
      imports: [
        PrismaModule,
        NotificationsModule,
        ReportsModule,
        ReviewsModule,
        forwardRef(() => KeywordsModule),
      ],
      providers: [QueueService],
      exports: [QueueService],
    };

    if (!redisEnabled) {
      this.logger.warn('Redis disabled via REDIS_ENABLED=false. Queue processors disabled.');
      return baseModule;
    }

    // Only import processors when Redis is enabled
    const { WeeklyDistributionProcessor } = require('./processors/weekly-distribution.processor');
    const { MaterialReleaseProcessor } = require('./processors/material-release.processor');
    const { DeadlineCheckerProcessor } = require('./processors/deadline-checker.processor');
    const { CampaignCompletionProcessor } = require('./processors/campaign-completion.processor');
    const { CreditExpirationProcessor } = require('./processors/credit-expiration.processor');
    const { AmazonMonitorProcessor } = require('./processors/amazon-monitor.processor');
    const { KeywordGenerationProcessor } = require('./processors/keyword-generation.processor');

    return {
      ...baseModule,
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
    };
  }
}
