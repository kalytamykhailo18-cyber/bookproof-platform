import { registerAs } from '@nestjs/config';

export default registerAs('sentry', () => ({
  dsn: process.env.SENTRY_DSN,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT || 'bookproof',
  tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
  replaysSampleRate: parseFloat(process.env.SENTRY_REPLAYS_SAMPLE_RATE || '0.1'),
}));
