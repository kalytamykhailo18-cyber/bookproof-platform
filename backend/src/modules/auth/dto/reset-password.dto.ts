import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsStrongPassword } from '@common/decorators/strong-password.decorator';

export class RequestPasswordResetDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'reCAPTCHA v3 token for bot protection (Section 15.2)',
    example: '03AGdBq24...',
  })
  @IsOptional()
  @IsString()
  captchaToken?: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123resettoken' })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'NewSecurePassword123!',
    description: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
    minLength: 8,
  })
  @IsString()
  @IsStrongPassword()
  newPassword: string;
}

/**
 * Change Password DTO (Section 15.1)
 * For authenticated users to change their password
 */
export class ChangePasswordDto {
  @ApiProperty({
    example: 'CurrentPassword123!',
    description: 'Current password for verification',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'NewSecurePassword123!',
    description: 'New password must be at least 8 characters with uppercase, lowercase, number, and special character',
    minLength: 8,
  })
  @IsString()
  @IsStrongPassword()
  newPassword: string;
}
