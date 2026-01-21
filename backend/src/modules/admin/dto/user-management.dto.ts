import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

/**
 * DTO for banning a user (permanent)
 */
export class BanUserDto {
  @ApiProperty({
    description: 'Reason for banning the user',
    example: 'Repeated violations of terms of service',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for unbanning a user
 */
export class UnbanUserDto {
  @ApiProperty({
    description: 'Reason for unbanning the user',
    example: 'Ban appeal approved after review',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for changing a user's role
 */
export class ChangeUserRoleDto {
  @ApiProperty({
    description: 'New role for the user',
    enum: UserRole,
    example: 'AUTHOR',
  })
  @IsEnum(UserRole)
  newRole: UserRole;

  @ApiProperty({
    description: 'Reason for the role change',
    example: 'User requested to become an author',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

/**
 * DTO for admin-initiated password reset
 */
export class AdminResetPasswordDto {
  @ApiPropertyOptional({
    description: 'Whether to send reset email to user',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  sendEmail?: boolean;

  @ApiPropertyOptional({
    description: 'Reason for the password reset',
    example: 'User reported account compromise',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * DTO for email verification status update
 */
export class UpdateEmailVerificationDto {
  @ApiProperty({
    description: 'Set email verification status',
    example: true,
  })
  @IsBoolean()
  verified: boolean;

  @ApiPropertyOptional({
    description: 'Reason for the verification status change',
    example: 'Manual verification by support team',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * DTO for admin-initiated email to user
 */
export class SendUserEmailDto {
  @ApiProperty({
    description: 'Email subject',
    example: 'Important notification from BookProof',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject: string;

  @ApiProperty({
    description: 'Email message body (plain text)',
    example: 'Dear user, we wanted to inform you about...',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  message: string;
}

/**
 * DTO for editing user profile (admin override)
 */
export class AdminEditUserProfileDto {
  @ApiPropertyOptional({
    description: 'User full name',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'User email',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'User phone number',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'User country',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    description: 'Company name',
  })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({
    description: 'Reason for the profile edit',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * Response DTO for user management operations
 */
export class UserManagementResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty()
  isBanned: boolean;

  @ApiPropertyOptional()
  bannedAt?: Date;

  @ApiPropertyOptional()
  banReason?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
