import { registerAs } from '@nestjs/config';

export default registerAs('email', () => ({
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@bookproof.app',
    fromName: process.env.RESEND_FROM_NAME || 'BookProof',
  },
  adminEmail: process.env.ADMIN_EMAIL || 'admin@bookproof.app',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@bookproof.app',
}));
