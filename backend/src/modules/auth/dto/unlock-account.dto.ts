import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for admin to unlock a locked account
 * Per requirements.md Section 1.1: Admin can manually unlock accounts
 */
export class UnlockAccountDto {
  @ApiProperty({
    description: 'Email of the account to unlock',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiPropertyOptional({
    description: 'Reason for unlocking the account (for audit log)',
    example: 'User verified identity via support call',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class UnlockAccountResponseDto {
  @ApiProperty({
    description: 'Confirmation message',
    example: 'Account unlocked successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Whether the account was locked',
    example: true,
  })
  wasLocked: boolean;
}
