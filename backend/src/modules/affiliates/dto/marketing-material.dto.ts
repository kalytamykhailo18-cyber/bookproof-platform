import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, Min, IsUrl } from 'class-validator';
import { MarketingMaterialType, Language } from '@prisma/client';

/**
 * Response DTO for a single marketing material
 */
export class MarketingMaterialResponseDto {
  @ApiProperty({ description: 'Material ID' })
  id: string;

  @ApiProperty({ description: 'Title' })
  title: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiProperty({ description: 'Material type', enum: MarketingMaterialType })
  type: MarketingMaterialType;

  @ApiPropertyOptional({ description: 'File URL for downloadable materials' })
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL for preview' })
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Text content for copy/paste materials' })
  content?: string;

  @ApiProperty({ description: 'Language', enum: Language })
  language: Language;

  @ApiProperty({ description: 'Whether the material is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Display order' })
  displayOrder: number;

  @ApiProperty({ description: 'Download count' })
  downloadCount: number;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}

/**
 * DTO for creating a new marketing material (Admin only)
 */
export class CreateMarketingMaterialDto {
  @ApiProperty({ description: 'Title', example: 'Facebook Banner 1200x628' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Material type', enum: MarketingMaterialType })
  @IsEnum(MarketingMaterialType)
  type: MarketingMaterialType;

  @ApiPropertyOptional({ description: 'File URL' })
  @IsOptional()
  @IsUrl()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Text content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: 'Language', enum: Language, default: Language.EN })
  @IsEnum(Language)
  language: Language = Language.EN;

  @ApiPropertyOptional({ description: 'Display order', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

/**
 * DTO for updating a marketing material (Admin only)
 */
export class UpdateMarketingMaterialDto {
  @ApiPropertyOptional({ description: 'Title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Material type', enum: MarketingMaterialType })
  @IsOptional()
  @IsEnum(MarketingMaterialType)
  type?: MarketingMaterialType;

  @ApiPropertyOptional({ description: 'File URL' })
  @IsOptional()
  @IsUrl()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL' })
  @IsOptional()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Text content' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Language', enum: Language })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

/**
 * Query DTO for filtering marketing materials
 */
export class GetMarketingMaterialsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by type', enum: MarketingMaterialType })
  @IsOptional()
  @IsEnum(MarketingMaterialType)
  type?: MarketingMaterialType;

  @ApiPropertyOptional({ description: 'Filter by language', enum: Language })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiPropertyOptional({ description: 'Include inactive materials', default: false })
  @IsOptional()
  @IsBoolean()
  includeInactive?: boolean;
}
