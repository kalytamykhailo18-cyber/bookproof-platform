import { registerAs } from '@nestjs/config';

export default registerAs('r2', () => ({
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  endpoint: process.env.R2_ENDPOINT,
  bucket: process.env.R2_BUCKET || 'bookproof-files',
  region: process.env.R2_REGION || 'auto',
  publicBaseUrl: process.env.R2_PUBLIC_BASE_URL,
  maxEbookSizeMb: parseInt(process.env.MAX_EBOOK_SIZE_MB || '100', 10),
  maxAudiobookSizeMb: parseInt(process.env.MAX_AUDIOBOOK_SIZE_MB || '500', 10),
  audiobookAccessDuration: parseInt(
    process.env.AUDIOBOOK_ACCESS_DURATION || '604800',
    10,
  ), // 7 days
}));
