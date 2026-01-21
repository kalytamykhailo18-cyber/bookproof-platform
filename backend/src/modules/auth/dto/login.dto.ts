import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';
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

  @ApiPropertyOptional({
    description: 'Remember me option - extends session to 7 days (default: 24 hours)',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}
