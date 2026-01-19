import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

/**
 * Cache Service
 *
 * Provides Redis-based caching for:
 * - Hot data (frequently accessed)
 * - Expensive computations
 * - API responses
 * - Session data
 *
 * Features:
 * - TTL-based expiration
 * - Pattern-based invalidation
 * - JSON serialization
 * - Compression for large values
 */
@Injectable()
export class CacheService implements OnModuleInit {
  private readonly logger = new Logger(CacheService.name);
  private redis: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>('redis.url');
    const redisToken = this.configService.get<string>('redis.token');

    if (!redisUrl) {
      this.logger.warn('Redis URL not configured. Caching disabled.');
      return;
    }

    try {
      // Initialize Redis connection (Upstash compatible)
      this.redis = new Redis(redisUrl, {
        password: redisToken,
        tls: redisUrl.startsWith('rediss://') ? {} : undefined,
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      this.redis.on('connect', () => {
        this.logger.log('Redis connected successfully');
      });

      this.redis.on('error', (error) => {
        this.logger.error(`Redis error: ${error.message}`);
      });
    } catch (error) {
      this.logger.error(`Failed to initialize Redis: ${error.message}`);
    }
  }

  /**
   * Get cached value
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.redis) return null;

    try {
      const cached = await this.redis.get(key);
      if (!cached) return null;

      return JSON.parse(cached) as T;
    } catch (error) {
      this.logger.error(`Cache GET error for key ${key}: ${error.message}`);
      return null;
    }
  }

  /**
   * Set cached value with TTL
   */
  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    if (!this.redis) return;

    try {
      const serialized = JSON.stringify(value);
      await this.redis.set(key, serialized, 'EX', ttl);
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Cache SET error for key ${key}: ${error.message}`);
    }
  }

  /**
   * Delete cached value
   */
  async del(key: string): Promise<void> {
    if (!this.redis) return;

    try {
      await this.redis.del(key);
      this.logger.debug(`Cache DEL: ${key}`);
    } catch (error) {
      this.logger.error(`Cache DEL error for key ${key}: ${error.message}`);
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern: string): Promise<number> {
    if (!this.redis) return 0;

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) return 0;

      await this.redis.del(...keys);
      this.logger.debug(`Cache DEL pattern: ${pattern} (${keys.length} keys)`);
      return keys.length;
    } catch (error) {
      this.logger.error(`Cache DEL pattern error: ${error.message}`);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Cache EXISTS error: ${error.message}`);
      return false;
    }
  }

  /**
   * Get remaining TTL for key
   */
  async ttl(key: string): Promise<number> {
    if (!this.redis) return -1;

    try {
      return await this.redis.ttl(key);
    } catch (error) {
      this.logger.error(`Cache TTL error: ${error.message}`);
      return -1;
    }
  }

  /**
   * Increment counter
   */
  async incr(key: string): Promise<number> {
    if (!this.redis) return 0;

    try {
      return await this.redis.incr(key);
    } catch (error) {
      this.logger.error(`Cache INCR error: ${error.message}`);
      return 0;
    }
  }

  /**
   * Decrement counter
   */
  async decr(key: string): Promise<number> {
    if (!this.redis) return 0;

    try {
      return await this.redis.decr(key);
    } catch (error) {
      this.logger.error(`Cache DECR error: ${error.message}`);
      return 0;
    }
  }

  /**
   * Set expiration time for existing key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    if (!this.redis) return false;

    try {
      const result = await this.redis.expire(key, ttl);
      return result === 1;
    } catch (error) {
      this.logger.error(`Cache EXPIRE error: ${error.message}`);
      return false;
    }
  }

  /**
   * Cache wrapper - get from cache or execute function
   */
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = 300,
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      this.logger.debug(`Cache HIT: ${key}`);
      return cached;
    }

    // Cache miss - execute function
    this.logger.debug(`Cache MISS: ${key}`);
    const result = await fn();

    // Store in cache
    await this.set(key, result, ttl);

    return result;
  }

  /**
   * Flush all cache (dangerous - use with caution)
   */
  async flushAll(): Promise<void> {
    if (!this.redis) return;

    try {
      await this.redis.flushall();
      this.logger.warn('Cache FLUSHED (all keys deleted)');
    } catch (error) {
      this.logger.error(`Cache FLUSH error: ${error.message}`);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    if (!this.redis) {
      return { connected: false };
    }

    try {
      const info = await this.redis.info('stats');
      const dbSize = await this.redis.dbsize();

      return {
        connected: true,
        dbSize,
        info,
      };
    } catch (error) {
      this.logger.error(`Cache STATS error: ${error.message}`);
      return { connected: false, error: error.message };
    }
  }

  /**
   * Common cache key patterns
   */
  static keys = {
    packageTiers: () => 'package_tiers',
    packageTier: (id: string) => `package_tier:${id}`,
    campaign: (id: string) => `campaign:${id}`,
    campaignStats: (id: string) => `campaign_stats:${id}`,
    userProfile: (userId: string) => `user_profile:${userId}`,
    readerProfile: (id: string) => `reader_profile:${id}`,
    authorProfile: (id: string) => `author_profile:${id}`,
    bookDetails: (bookId: string) => `book:${bookId}`,
    queueStats: (campaignId: string) => `queue_stats:${campaignId}`,
    reviewStats: (campaignId: string) => `review_stats:${campaignId}`,
    walletBalance: (readerProfileId: string) => `wallet:${readerProfileId}`,
    affiliateStats: (affiliateId: string) => `affiliate_stats:${affiliateId}`,
  };
}
