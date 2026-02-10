import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsIn,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

/**
 * Request DTO for updating a closer account
 * All fields optional for partial updates
 */
export class UpdateCloserDto {
  @ApiPropertyOptional({ example: 'John Closer', minLength: 2, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'closer@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 10.0, minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  commissionEnabled?: boolean;
}

/**
 * Request DTO for updating an admin account
 * All fields optional for partial updates
 */
export class UpdateAdminDto {
  @ApiPropertyOptional({ example: 'Jane Admin', minLength: 2, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'admin@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'] })
  @IsOptional()
  @IsIn(['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'])
  role?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['MANAGE_USERS', 'MANAGE_CAMPAIGNS'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

/**
 * Request DTO for toggling active status
 */
export class ToggleActiveDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;
}

/**
 * Response DTO for listing closer accounts
 * Per requirements.md Section 1.4
 */
export class CloserListItemDto {
  @ApiProperty({ example: 'cls_123abc' })
  id: string;

  @ApiProperty({ example: 'usr_123abc' })
  userId: string;

  @ApiProperty({ example: 'closer@example.com' })
  email: string;

  @ApiProperty({ example: 'John Closer' })
  name: string;

  @ApiProperty({ example: 10.0, description: 'Commission rate percentage (0-100)' })
  commissionRate: number;

  @ApiProperty({ example: true })
  commissionEnabled: boolean;

  @ApiProperty({ example: 500.0, description: 'Total commission earned' })
  commissionEarned: number;

  @ApiProperty({ example: 200.0, description: 'Total commission paid out' })
  commissionPaid: number;

  @ApiProperty({ example: 5000.0, description: 'Total sales value' })
  totalSales: number;

  @ApiProperty({ example: 10 })
  totalClients: number;

  @ApiProperty({ example: 15 })
  totalPackagesSold: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-20T14:00:00Z' })
  updatedAt: Date;
}

/**
 * Response DTO for listing admin accounts
 * Per requirements.md Section 1.3
 */
export class AdminListItemDto {
  @ApiProperty({ example: 'adm_123abc' })
  id: string;

  @ApiProperty({ example: 'usr_123abc' })
  userId: string;

  @ApiProperty({ example: 'admin@example.com' })
  email: string;

  @ApiProperty({ example: 'Jane Admin' })
  name: string;

  @ApiProperty({ enum: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'] })
  role: string;

  @ApiProperty({ type: [String], example: ['MANAGE_USERS', 'MANAGE_CAMPAIGNS'] })
  permissions: string[];

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-20T14:00:00Z' })
  updatedAt: Date;
}
