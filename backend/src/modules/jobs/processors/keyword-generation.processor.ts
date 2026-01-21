import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { KeywordsService } from '@modules/keywords/keywords.service';

export interface KeywordGenerationJobData {
  keywordResearchId: string;
}

/**
 * Keyword Generation Processor
 *
 * Processes keyword research generation jobs asynchronously using BullMQ
 * Features:
 * - Automatic retries with exponential backoff
 * - Error logging and tracking
 * - Concurrent processing (up to 2 at once to avoid AI rate limits)
 * - Job progress tracking
 */
@Processor('keyword-generation-queue', {
  concurrency: 2, // Process up to 2 keyword research jobs concurrently
})
export class KeywordGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(KeywordGenerationProcessor.name);

  constructor(private readonly keywordsService: KeywordsService) {
    super();
  }

  /**
   * Process keyword generation job
   */
  async process(job: Job<KeywordGenerationJobData>): Promise<void> {
    const { keywordResearchId } = job.data;

    this.logger.log(
      `Processing keyword generation job ${job.id} for research ${keywordResearchId} (attempt ${job.attemptsMade + 1}/${job.opts.attempts})`,
    );

    try {
      // Update job progress
      await job.updateProgress(10);

      // Process keyword research using KeywordsService
      // This method is already implemented in keywords.service.ts
      await this.keywordsService['processKeywordResearch'](keywordResearchId);

      // Update job progress
      await job.updateProgress(100);

      this.logger.log(
        `Successfully generated keywords for research ${keywordResearchId} (Job ID: ${job.id})`,
      );

      return;
    } catch (error) {
      this.logger.error(
        `Failed to generate keywords for research ${keywordResearchId} (Job ID: ${job.id}):`,
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
  onCompleted(job: Job<KeywordGenerationJobData>) {
    const { keywordResearchId } = job.data;
    this.logger.log(
      `Keyword generation job ${job.id} completed for research ${keywordResearchId}`,
    );
  }

  /**
   * Handle job failure (after all retries exhausted)
   */
  @OnWorkerEvent('failed')
  onFailed(job: Job<KeywordGenerationJobData> | undefined, error: Error) {
    if (!job) {
      this.logger.error('Job failed but job object is undefined');
      return;
    }

    const { keywordResearchId } = job.data;
    this.logger.error(
      `Keyword generation job ${job.id} FAILED after ${job.attemptsMade} attempts for research ${keywordResearchId}`,
      error.stack,
    );

    // Could send alert to admin or log to external monitoring service here
  }

  /**
   * Handle job progress updates
   */
  @OnWorkerEvent('progress')
  onProgress(job: Job<KeywordGenerationJobData>, progress: number) {
    this.logger.debug(
      `Keyword generation job ${job.id} progress: ${progress}%`,
    );
  }

  /**
   * Handle worker errors
   */
  @OnWorkerEvent('error')
  onError(error: Error) {
    this.logger.error('Keyword generation worker error:', error.stack);
  }
}
