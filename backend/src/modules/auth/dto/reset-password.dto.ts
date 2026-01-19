import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '@common/decorators/strong-password.decorator';

export class RequestPasswordResetDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;
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
