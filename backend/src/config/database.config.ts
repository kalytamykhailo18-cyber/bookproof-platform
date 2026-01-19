import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_DATABASE_URL,
}));
