import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Update a system setting
 */
export class UpdateSettingDto {
  @ApiProperty({ description: 'Setting value' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ description: 'Reason for the change' })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * Update keyword research pricing
 */
export class UpdateKeywordPricingDto {
  @ApiProperty({ description: 'Keyword research price in USD', example: 49.99 })
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(9999.99)
  price: number;

  @ApiPropertyOptional({ description: 'Reason for the price change' })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * Response DTO for system setting
 */
export class SettingResponseDto {
  @ApiProperty({ description: 'Setting ID' })
  id: string;

  @ApiProperty({ description: 'Setting category' })
  category: string;

  @ApiProperty({ description: 'Setting key' })
  key: string;

  @ApiProperty({ description: 'Setting value' })
  value: string;

  @ApiProperty({ description: 'Data type of value' })
  dataType: string;

  @ApiPropertyOptional({ description: 'Description of the setting' })
  description?: string;

  @ApiProperty({ description: 'Is publicly visible' })
  isPublic: boolean;

  @ApiProperty({ description: 'Can be edited' })
  isEditable: boolean;

  @ApiPropertyOptional({ description: 'Last updated by admin user ID' })
  updatedBy?: string;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;
}

/**
 * Response DTO for keyword research pricing
 */
export class KeywordPricingResponseDto {
  @ApiProperty({ description: 'Current price in USD' })
  price: number;

  @ApiProperty({ description: 'Currency code' })
  currency: string;

  @ApiProperty({ description: 'Last updated date' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Last updated by admin' })
  updatedBy?: string;
}

/**
 * Response DTO for review payment rates
 */
export class ReviewPaymentRatesDto {
  @ApiProperty({ description: 'Payment rate for ebook reviews in USD', example: 1.00 })
  ebookRate: number;

  @ApiProperty({ description: 'Payment rate for audiobook reviews in USD', example: 2.00 })
  audiobookRate: number;

  @ApiProperty({ description: 'Currency code', example: 'USD' })
  currency: string;

  @ApiProperty({ description: 'Last updated date' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Last updated by admin' })
  updatedBy?: string;
}

/**
 * DTO for updating review payment rates
 */
export class UpdateReviewPaymentRatesDto {
  @ApiPropertyOptional({ description: 'Ebook review payment rate', example: 1.00 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(999.99)
  ebookRate?: number;

  @ApiPropertyOptional({ description: 'Audiobook review payment rate', example: 2.00 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(999.99)
  audiobookRate?: number;

  @ApiPropertyOptional({ description: 'Reason for the change' })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * Response DTO for all pricing settings
 */
export class PricingSettingsResponseDto {
  @ApiProperty({ description: 'Keyword research pricing' })
  keywordResearch: KeywordPricingResponseDto;

  @ApiProperty({ description: 'Review payment rates' })
  reviewPaymentRates: ReviewPaymentRatesDto;
}

/**
 * DTO for updating keyword research feature toggle
 */
export class UpdateKeywordResearchFeatureDto {
  @ApiProperty({ description: 'Enable or disable keyword research feature', example: true })
  @IsBoolean()
  @Type(() => Boolean)
  enabled: boolean;

  @ApiPropertyOptional({ description: 'Reason for the change' })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * Response DTO for keyword research feature status
 */
export class KeywordResearchFeatureStatusDto {
  @ApiProperty({ description: 'Whether keyword research feature is enabled' })
  enabled: boolean;

  @ApiProperty({ description: 'Last updated date' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Last updated by admin' })
  updatedBy?: string;
}
