import { registerAs } from '@nestjs/config';

export default registerAs('cors', () => ({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: process.env.CORS_CREDENTIALS === 'true',
}));
