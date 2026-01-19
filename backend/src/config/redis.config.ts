import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
  queueConcurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),
  queueMaxRetries: parseInt(process.env.QUEUE_MAX_RETRIES || '3', 10),
}));
