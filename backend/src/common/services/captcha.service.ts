import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * reCAPTCHA v3 Response interface
 */
interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

/**
 * CAPTCHA Service
 *
 * Handles Google reCAPTCHA v3 verification for bot protection.
 * reCAPTCHA v3 is invisible to users and returns a risk score.
 *
 * Score interpretation:
 * - 1.0: Very likely human
 * - 0.0: Very likely bot
 * - Default threshold: 0.5
 */
@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);
  private readonly enabled: boolean;
  private readonly secretKey: string;
  private readonly minScore: number;
  private readonly verifyUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('captcha.enabled', false);
    this.secretKey = this.configService.get<string>('captcha.secretKey', '');
    this.minScore = this.configService.get<number>('captcha.minScore', 0.5);
    this.verifyUrl = this.configService.get<string>(
      'captcha.verifyUrl',
      'https://www.google.com/recaptcha/api/siteverify',
    );

    if (this.enabled && !this.secretKey) {
      this.logger.warn('CAPTCHA is enabled but RECAPTCHA_SECRET_KEY is not set. CAPTCHA will be bypassed.');
    }
  }

  /**
   * Verify a reCAPTCHA token
   *
   * @param token - The reCAPTCHA token from the client
   * @param expectedAction - Optional expected action name for verification
   * @param remoteIp - Optional client IP for additional verification
   * @returns Promise<boolean> - True if verification passed
   * @throws BadRequestException if verification fails and CAPTCHA is required
   */
  async verify(token: string | undefined, expectedAction?: string, remoteIp?: string): Promise<boolean> {
    // If CAPTCHA is disabled or no secret key, skip verification
    if (!this.enabled || !this.secretKey) {
      return true;
    }

    // If no token provided when CAPTCHA is enabled, reject
    if (!token) {
      this.logger.warn('CAPTCHA token missing in request');
      throw new BadRequestException('CAPTCHA verification required');
    }

    try {
      const params = new URLSearchParams({
        secret: this.secretKey,
        response: token,
      });

      if (remoteIp) {
        params.append('remoteip', remoteIp);
      }

      const response = await fetch(this.verifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const data: RecaptchaResponse = await response.json();

      if (!data.success) {
        this.logger.warn('CAPTCHA verification failed', {
          errors: data['error-codes'],
        });
        throw new BadRequestException('CAPTCHA verification failed');
      }

      // Verify score meets minimum threshold
      if (data.score !== undefined && data.score < this.minScore) {
        this.logger.warn('CAPTCHA score too low', {
          score: data.score,
          minScore: this.minScore,
        });
        throw new BadRequestException('CAPTCHA verification failed: suspicious activity detected');
      }

      // Verify action matches if expected action provided
      if (expectedAction && data.action !== expectedAction) {
        this.logger.warn('CAPTCHA action mismatch', {
          expected: expectedAction,
          received: data.action,
        });
        throw new BadRequestException('CAPTCHA verification failed: action mismatch');
      }

      this.logger.debug('CAPTCHA verification successful', {
        score: data.score,
        action: data.action,
      });

      return true;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      this.logger.error('CAPTCHA verification error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // On network/system errors, fail open in development, closed in production
      const nodeEnv = this.configService.get<string>('app.nodeEnv', 'development');
      if (nodeEnv === 'production') {
        throw new BadRequestException('CAPTCHA verification failed');
      }

      this.logger.warn('CAPTCHA verification bypassed due to system error (non-production)');
      return true;
    }
  }

  /**
   * Check if CAPTCHA is currently enabled
   */
  isEnabled(): boolean {
    return this.enabled && !!this.secretKey;
  }
}
