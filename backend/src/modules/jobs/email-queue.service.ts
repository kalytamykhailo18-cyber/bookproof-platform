import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';
import { EmailType, Language } from '@prisma/client';
import { EmailVariables } from '@modules/email/email-template.service';
import { SendEmailJobData } from './processors/email-sender.processor';

/**
 * Email Queue Service
 *
 * Provides methods to enqueue email sending jobs
 * All emails should go through this service for:
 * - Async processing (non-blocking)
 * - Automatic retries on failure
 * - Rate limiting and throttling
 * - Better error handling
 */
@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(
    @InjectQueue('email-queue') private emailQueue: Queue<SendEmailJobData>,
  ) {}

  /**
   * Add email to queue for async sending
   */
  async sendEmail(
    to: string,
    type: EmailType,
    variables: EmailVariables,
    userId?: string,
    language: Language = Language.EN,
    options?: JobsOptions,
  ): Promise<string> {
    try {
      const job = await this.emailQueue.add(
        'send-email',
        {
          to,
          type,
          variables,
          userId,
          language,
        },
        {
          // Default options (can be overridden)
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          ...options,
        },
      );

      this.logger.log(
        `Enqueued email ${type} to ${to} (Job ID: ${job.id})`,
      );

      return job.id!;
    } catch (error) {
      this.logger.error(
        `Failed to enqueue email ${type} to ${to}:`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Send high-priority email (processed immediately)
   */
  async sendUrgentEmail(
    to: string,
    type: EmailType,
    variables: EmailVariables,
    userId?: string,
    language: Language = Language.EN,
  ): Promise<string> {
    return this.sendEmail(to, type, variables, userId, language, {
      priority: 1, // Highest priority
      attempts: 5, // More retries for urgent emails
    });
  }

  /**
   * Send scheduled email (delayed sending)
   */
  async sendScheduledEmail(
    to: string,
    type: EmailType,
    variables: EmailVariables,
    sendAt: Date,
    userId?: string,
    language: Language = Language.EN,
  ): Promise<string> {
    const delay = sendAt.getTime() - Date.now();

    if (delay < 0) {
      throw new Error('Scheduled time must be in the future');
    }

    return this.sendEmail(to, type, variables, userId, language, {
      delay,
    });
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.emailQueue.getWaitingCount(),
      this.emailQueue.getActiveCount(),
      this.emailQueue.getCompletedCount(),
      this.emailQueue.getFailedCount(),
      this.emailQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }

  /**
   * Get job status by ID
   */
  async getJobStatus(jobId: string) {
    const job = await this.emailQueue.getJob(jobId);

    if (!job) {
      return null;
    }

    const state = await job.getState();

    return {
      id: job.id,
      state,
      data: job.data,
      attemptsMade: job.attemptsMade,
      progress: job.progress,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn,
      failedReason: job.failedReason,
    };
  }

  /**
   * Retry failed job
   */
  async retryFailedJob(jobId: string): Promise<void> {
    const job = await this.emailQueue.getJob(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    await job.retry();
    this.logger.log(`Retrying failed job ${jobId}`);
  }

  /**
   * Clear completed jobs (admin maintenance)
   */
  async clearCompletedJobs(): Promise<void> {
    await this.emailQueue.clean(86400000, 1000, 'completed'); // 24 hours, keep 1000
    this.logger.log('Cleared old completed jobs');
  }

  /**
   * Clear failed jobs (admin maintenance)
   */
  async clearFailedJobs(): Promise<void> {
    await this.emailQueue.clean(604800000, 5000, 'failed'); // 7 days, keep 5000
    this.logger.log('Cleared old failed jobs');
  }

  /**
   * Pause queue (admin action)
   */
  async pauseQueue(): Promise<void> {
    await this.emailQueue.pause();
    this.logger.warn('Email queue PAUSED');
  }

  /**
   * Resume queue (admin action)
   */
  async resumeQueue(): Promise<void> {
    await this.emailQueue.resume();
    this.logger.log('Email queue RESUMED');
  }

  /**
   * Drain queue (remove all waiting jobs)
   */
  async drainQueue(): Promise<void> {
    await this.emailQueue.drain();
    this.logger.warn('Email queue DRAINED (all waiting jobs removed)');
  }
}
