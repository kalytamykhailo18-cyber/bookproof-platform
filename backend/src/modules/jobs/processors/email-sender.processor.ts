import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmailService } from '@modules/email/email.service';
import { EmailType, Language } from '@prisma/client';
import { EmailVariables } from '@modules/email/email-template.service';

export interface SendEmailJobData {
  to: string;
  type: EmailType;
  variables: EmailVariables;
  userId?: string;
  language?: Language;
}

/**
 * Email Sender Processor
 *
 * Processes email sending jobs asynchronously using BullMQ
 * Features:
 * - Automatic retries with exponential backoff
 * - Error logging and tracking
 * - Concurrent processing (up to 5 emails at once)
 * - Job progress tracking
 */
@Processor('email-queue', {
  concurrency: 5, // Process up to 5 emails concurrently
})
export class EmailSenderProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailSenderProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  /**
   * Process email sending job
   */
  async process(job: Job<SendEmailJobData>): Promise<void> {
    const { to, type, variables, userId, language = Language.EN } = job.data;

    this.logger.log(
      `Processing email job ${job.id}: ${type} to ${to} (attempt ${job.attemptsMade + 1}/${job.opts.attempts})`,
    );

    try {
      // Update job progress
      await job.updateProgress(10);

      // Send email using EmailService
      await this.emailService.sendTemplatedEmail(to, type, variables, userId, language);

      // Update job progress
      await job.updateProgress(100);

      this.logger.log(
        `Successfully sent email ${type} to ${to} (Job ID: ${job.id})`,
      );

      // Return success (will be stored in job result)
      return;
    } catch (error) {
      this.logger.error(
        `Failed to send email ${type} to ${to} (Job ID: ${job.id}):`,
        error.stack,
      );

      // Throw error to trigger BullMQ retry logic
      throw error;
    }
  }

  /**
   * Handle job completion
   */
  @OnWorkerEvent('completed')
  onCompleted(job: Job<SendEmailJobData>) {
    const { type, to } = job.data;
    this.logger.log(
      `Email job ${job.id} completed: ${type} to ${to}`,
    );
  }

  /**
   * Handle job failure (after all retries exhausted)
   */
  @OnWorkerEvent('failed')
  onFailed(job: Job<SendEmailJobData> | undefined, error: Error) {
    if (!job) {
      this.logger.error('Job failed but job object is undefined');
      return;
    }

    const { type, to } = job.data;
    this.logger.error(
      `Email job ${job.id} FAILED after ${job.attemptsMade} attempts: ${type} to ${to}`,
      error.stack,
    );

    // Could send alert to admin or log to external monitoring service here
  }

  /**
   * Handle job progress updates
   */
  @OnWorkerEvent('progress')
  onProgress(job: Job<SendEmailJobData>, progress: number) {
    this.logger.debug(
      `Email job ${job.id} progress: ${progress}%`,
    );
  }

  /**
   * Handle worker errors
   */
  @OnWorkerEvent('error')
  onError(error: Error) {
    this.logger.error('Worker error:', error.stack);
  }
}
