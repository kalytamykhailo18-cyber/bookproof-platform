import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating user basic profile information
 * Per requirements.md Section 3.10: Reader Profile Settings
 *
 * Editable fields:
 * - Full name
 * - Country
 * - Phone (required for Brazilian payments)
 * - CPF (required for Brazilian payments)
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

  @ApiPropertyOptional({
    example: '+5511999999999',
    description: 'Phone number (required for Brazilian payments via Pagar.me)',
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    example: '123.456.789-09',
    description: 'Brazilian CPF tax ID (required for Brazilian payments via Pagar.me)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, { message: 'Please provide a valid CPF format' })
  cpf?: string;
}

export class UpdateProfileResponseDto {
  @ApiPropertyOptional()
  message: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  country?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  cpf?: string;
}
