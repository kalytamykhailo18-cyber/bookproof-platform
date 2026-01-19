import { Module, Global } from '@nestjs/common';
import { CaptchaService } from '../services/captcha.service';

/**
 * CAPTCHA Module
 *
 * Global module providing CAPTCHA verification service.
 * Uses Google reCAPTCHA v3 for invisible bot protection.
 */
@Global()
@Module({
  providers: [CaptchaService],
  exports: [CaptchaService],
})
export class CaptchaModule {}
