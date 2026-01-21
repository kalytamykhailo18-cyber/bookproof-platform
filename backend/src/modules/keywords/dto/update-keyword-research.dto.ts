import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Language, TargetMarket } from '@prisma/client';

/**
 * DTO for updating keyword research (only allowed for PENDING status)
 */
export class UpdateKeywordResearchDto {
  @ApiPropertyOptional({
    description: 'Book title',
    example: 'The Complete Guide to Self-Publishing',
  })
  @IsOptional()
  @IsString()
  bookTitle?: string;

  @ApiPropertyOptional({
    description: 'Book genre',
    example: 'Non-Fiction',
  })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({
    description: 'Book category',
    example: 'Business & Money > Marketing',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Book description',
    example: 'A comprehensive guide for authors who want to self-publish...',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Target audience description',
    example: 'Aspiring authors, self-publishers, indie writers',
  })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiPropertyOptional({
    description: 'Competing books (titles or ASINs)',
    example: 'Book Marketing Made Easy, APE: Author Publisher Entrepreneur',
  })
  @IsOptional()
  @IsString()
  competingBooks?: string;

  @ApiPropertyOptional({
    description: 'Specific keywords author wants to include',
    example: 'self-publishing, book marketing, Amazon KDP',
  })
  @IsOptional()
  @IsString()
  specificKeywords?: string;

  @ApiPropertyOptional({
    description: 'Book language',
    enum: Language,
    example: Language.EN,
  })
  @IsOptional()
  @IsEnum(Language)
  bookLanguage?: Language;

  @ApiPropertyOptional({
    description: 'Target Amazon marketplace for keyword optimization',
    enum: TargetMarket,
    example: TargetMarket.US,
  })
  @IsOptional()
  @IsEnum(TargetMarket)
  targetMarket?: TargetMarket;

  @ApiPropertyOptional({
    description: 'Additional notes or context',
    example: 'Focus on keywords for Amazon KDP optimization',
  })
  @IsOptional()
  @IsString()
  additionalNotes?: string;
}
