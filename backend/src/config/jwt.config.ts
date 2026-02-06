import { registerAs } from '@nestjs/config';

/**
 * JWT Configuration
 *
 * Per requirements.md Section 15.1:
 * - Session timeout: 24 hours (configurable)
 * - Sessions invalidated on password change (via tokenVersion)
 *
 * Development Mode:
 * - NODE_ENV=development → 30 days expiry (no frequent re-logins)
 * - NODE_ENV=production → 24 hours (secure)
 * - Can be overridden with JWT_EXPIRES_IN env variable
 */
export default registerAs('jwt', () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const defaultExpiry = isDevelopment ? '30d' : '24h';

  return {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || defaultExpiry,
    isDevelopment,
  };
});
