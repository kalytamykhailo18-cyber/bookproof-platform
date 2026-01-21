import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

export interface JobData {
  [key: string]: unknown;
}

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);
  private connection: Redis;
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private queueEvents: Map<string, QueueEvents> = new Map();

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get<string>('redis.url');

    if (!redisUrl) {
      this.logger.warn('Redis URL not configured. Background jobs will not work.');
      return;
    }

    this.connection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
    });
  }

  async onModuleInit() {
    if (this.connection) {
      this.logger.log('Redis connection established for BullMQ');
    }
  }

  createQueue(queueName: string): Queue {
    if (this.queues.has(queueName)) {
      return this.queues.get(queueName)!;
    }

    const queue = new Queue(queueName, {
      connection: this.connection as any, // Type assertion needed due to ioredis version mismatch
    });

    this.queues.set(queueName, queue);
    this.logger.log(`Queue created: ${queueName}`);

    return queue;
  }

  createWorker<T extends JobData>(
    queueName: string,
    processor: (job: { data: T }) => Promise<void>,
  ): Worker {
    if (this.workers.has(queueName)) {
      return this.workers.get(queueName)!;
    }

    const concurrency = this.configService.get<number>('redis.queueConcurrency') || 5;

    const worker = new Worker(
      queueName,
      async (job) => {
        this.logger.log(`Processing job ${job.id} from queue ${queueName}`);
        await processor(job as { data: T });
      },
      {
        connection: this.connection as any, // Type assertion needed due to ioredis version mismatch
        concurrency,
      },
    );

    worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} completed in queue ${queueName}`);
    });

    worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} failed in queue ${queueName}:`, err);
    });

    this.workers.set(queueName, worker);
    this.logger.log(`Worker created for queue: ${queueName} with concurrency: ${concurrency}`);

    return worker;
  }

  async addJob(queueName: string, jobName: string, data: JobData, options?: unknown) {
    const queue = this.queues.get(queueName) || this.createQueue(queueName);
    const job = await queue.add(jobName, data, options as Parameters<Queue['add']>[2]);
    this.logger.log(`Job ${job.id} added to queue ${queueName}`);
    return job;
  }

  async addBulkJobs(queueName: string, jobs: { name: string; data: JobData }[]) {
    const queue = this.queues.get(queueName) || this.createQueue(queueName);
    await queue.addBulk(jobs);
    this.logger.log(`${jobs.length} jobs added to queue ${queueName}`);
  }

  async closeAll() {
    for (const [name, worker] of this.workers.entries()) {
      await worker.close();
      this.logger.log(`Worker closed: ${name}`);
    }

    for (const [name, queue] of this.queues.entries()) {
      await queue.close();
      this.logger.log(`Queue closed: ${name}`);
    }

    if (this.connection) {
      await this.connection.quit();
      this.logger.log('Redis connection closed');
    }
  }
}
