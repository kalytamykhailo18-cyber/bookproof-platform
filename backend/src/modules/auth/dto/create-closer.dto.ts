import { IsEmail, IsString, IsOptional, IsBoolean, IsNumber, MaxLength, MinLength, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating closer accounts by Admin
 * Per requirements.md Section 1.4
 *
 * Closer Restrictions:
 * - Cannot change their own commission rate
 * - Cannot access any admin features
 * - Cannot see other closers' data
 */
export class CreateCloserDto {
  @ApiProperty({
    example: 'closer@example.com',
    description: 'Closer email address',
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
    example: 'John Closer',
    description: 'Full name of the closer',
  })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiPropertyOptional({
    example: 10.0,
    description: 'Commission rate percentage (default 0%)',
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Commission rate cannot be negative' })
  @Max(100, { message: 'Commission rate cannot exceed 100%' })
  commissionRate?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the closer account is active (default true)',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

/**
 * Response DTO for closer creation
 */
export class CreateCloserResponseDto {
  @ApiProperty({ example: 'cls_123abc' })
  closerProfileId: string;

  @ApiProperty({ example: 'usr_123abc' })
  userId: string;

  @ApiProperty({ example: 'closer@example.com' })
  email: string;

  @ApiProperty({ example: 'John Closer' })
  name: string;

  @ApiProperty({ example: true })
  temporaryPasswordSent: boolean;

  @ApiProperty({ example: true })
  welcomeEmailSent: boolean;

  @ApiProperty({ example: 10.0 })
  commissionRate: number;

  @ApiProperty({ example: true })
  isActive: boolean;
}
