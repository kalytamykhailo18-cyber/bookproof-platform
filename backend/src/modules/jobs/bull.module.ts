import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailSenderProcessor } from './processors/email-sender.processor';
import { EmailQueueService } from './email-queue.service';

/**
 * BullMQ Module
 *
 * Configures BullMQ for background job processing
 * Uses Redis (Upstash) for queue storage
 *
 * Queues:
 * - email-queue: Async email sending with retries
 */
@Global()
@Module({
  imports: [
    // Register BullMQ root module with Redis connection
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('redis.url'),
          token: configService.get<string>('redis.token'),
        },
      }),
      inject: [ConfigService],
    }),

    // Register email queue
    BullModule.registerQueue({
      name: 'email-queue',
      defaultJobOptions: {
        attempts: 3, // Retry up to 3 times
        backoff: {
          type: 'exponential',
          delay: 2000, // Start with 2 second delay, doubles each retry
        },
        removeOnComplete: {
          age: 86400, // Remove completed jobs after 24 hours
          count: 1000, // Keep last 1000 completed jobs
        },
        removeOnFail: {
          age: 604800, // Remove failed jobs after 7 days
          count: 5000, // Keep last 5000 failed jobs
        },
      },
    }),
    // EmailModule is @Global, no need to import it here
  ],
  providers: [EmailSenderProcessor, EmailQueueService],
  exports: [BullModule, EmailQueueService],
})
export class BullQueueModule {}
