import { IsEmail, IsString, IsEnum, IsOptional, IsArray, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Admin levels per requirements.md Section 1.3:
 * - SUPER_ADMIN: Full access to everything
 * - REGULAR_ADMIN: Cannot create other admins, cannot access financial settings
 */
export enum AdminLevel {
  SUPER_ADMIN = 'SUPER_ADMIN',
  REGULAR_ADMIN = 'REGULAR_ADMIN',
}

/**
 * Available admin permissions for granular access control
 */
export enum AdminPermission {
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_CAMPAIGNS = 'MANAGE_CAMPAIGNS',
  MANAGE_REVIEWS = 'MANAGE_REVIEWS',
  MANAGE_READERS = 'MANAGE_READERS',
  MANAGE_AUTHORS = 'MANAGE_AUTHORS',
  MANAGE_AFFILIATES = 'MANAGE_AFFILIATES',
  MANAGE_CLOSERS = 'MANAGE_CLOSERS',
  MANAGE_COUPONS = 'MANAGE_COUPONS',
  PROCESS_PAYOUTS = 'PROCESS_PAYOUTS',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
  MANAGE_ADMINS = 'MANAGE_ADMINS', // Super admin only
  MANAGE_FINANCIALS = 'MANAGE_FINANCIALS', // Super admin only
}

/**
 * DTO for creating admin accounts by Super Admin
 * Per requirements.md Section 1.3
 */
export class CreateAdminDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Admin email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiPropertyOptional({
    example: 'SecurePassword123!',
    description: 'Password (if not provided, a temporary password will be generated)',
  })
  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password?: string;

  @ApiProperty({
    example: 'John Admin',
    description: 'Full name of the admin',
  })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty({
    enum: AdminLevel,
    example: AdminLevel.REGULAR_ADMIN,
    description: 'Admin level (SUPER_ADMIN or REGULAR_ADMIN)',
  })
  @IsEnum(AdminLevel)
  adminLevel: AdminLevel;

  @ApiPropertyOptional({
    enum: AdminPermission,
    isArray: true,
    example: [AdminPermission.MANAGE_USERS, AdminPermission.MANAGE_CAMPAIGNS],
    description: 'Specific permissions for this admin',
  })
  @IsArray()
  @IsOptional()
  @IsEnum(AdminPermission, { each: true })
  permissions?: AdminPermission[];
}

/**
 * Response DTO for admin creation
 */
export class CreateAdminResponseDto {
  @ApiProperty({ example: 'adm_123abc' })
  adminProfileId: string;

  @ApiProperty({ example: 'usr_123abc' })
  userId: string;

  @ApiProperty({ example: 'admin@example.com' })
  email: string;

  @ApiProperty({ example: 'John Admin' })
  name: string;

  @ApiProperty({ example: true })
  temporaryPasswordSent: boolean;

  @ApiProperty({ example: true })
  welcomeEmailSent: boolean;

  @ApiProperty({ enum: AdminLevel })
  adminLevel: AdminLevel;

  @ApiProperty({ isArray: true, enum: AdminPermission })
  permissions: AdminPermission[];
}
