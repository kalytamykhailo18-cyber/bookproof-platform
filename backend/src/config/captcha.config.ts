import { registerAs } from '@nestjs/config';

/**
 * CAPTCHA Configuration
 *
 * Supports Google reCAPTCHA v3 for invisible bot protection.
 * reCAPTCHA v3 returns a score (0.0 - 1.0) indicating likelihood of human vs bot.
 *
 * Environment variables:
 * - RECAPTCHA_SECRET_KEY: Server-side secret key from Google reCAPTCHA console
 * - RECAPTCHA_SITE_KEY: Client-side site key (for frontend reference)
 * - RECAPTCHA_ENABLED: Set to 'true' to enable CAPTCHA verification
 * - RECAPTCHA_MIN_SCORE: Minimum score threshold (default 0.5, range 0.0-1.0)
 */
export default registerAs('captcha', () => ({
  enabled: process.env.RECAPTCHA_ENABLED === 'true',
  secretKey: process.env.RECAPTCHA_SECRET_KEY || '',
  siteKey: process.env.RECAPTCHA_SITE_KEY || '',
  minScore: parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5'),
  verifyUrl: 'https://www.google.com/recaptcha/api/siteverify',
}));
