import { registerAs } from '@nestjs/config';

/**
 * JWT Configuration
 *
 * Per requirements.md Section 15.1:
 * - Session timeout: 24 hours (configurable)
 * - Sessions invalidated on password change (via tokenVersion)
 */
export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || '24h', // Changed from 7d to 24h per requirements
}));
