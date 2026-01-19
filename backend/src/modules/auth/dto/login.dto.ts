import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiPropertyOptional({
    description: 'reCAPTCHA v3 token for bot protection (required when CAPTCHA is enabled)',
    example: '03AGdBq24PBCb...',
  })
  @IsString()
  @IsOptional()
  captchaToken?: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  password: string;
}
