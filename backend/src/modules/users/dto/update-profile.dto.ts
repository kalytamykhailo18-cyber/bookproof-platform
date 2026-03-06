import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating user basic profile information
 * Per requirements.md Section 3.10: Reader Profile Settings
 *
 * Editable fields:
 * - Full name
 * - Country
 */
export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'User full name',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: 'United States',
    description: 'User country',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;
}

export class UpdateProfileResponseDto {
  @ApiPropertyOptional()
  message: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  country?: string;
}
