import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Language, TargetMarket } from '@prisma/client';

export class CreateKeywordResearchDto {
  @ApiPropertyOptional({
    description: 'Book ID this research is for (optional for standalone purchases)',
    example: 'clxxx...',
  })
  @IsOptional()
  @IsString()
  bookId?: string;

  @ApiProperty({
    description: 'Book title (max 200 characters)',
    example: 'The Complete Guide to Self-Publishing',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  bookTitle: string;

  @ApiPropertyOptional({
    description: 'Book subtitle (max 200 characters)',
    example: 'A Step-by-Step Guide for Authors',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  bookSubtitle?: string;

  @ApiProperty({
    description: 'Book genre',
    example: 'Non-Fiction',
  })
  @IsString()
  @IsNotEmpty()
  genre: string;

  @ApiProperty({
    description: 'Book category',
    example: 'Business & Money > Marketing',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    description: 'Book description',
    example: 'A comprehensive guide for authors who want to self-publish...',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Target audience description',
    example: 'Aspiring authors, self-publishers, indie writers',
  })
  @IsString()
  @IsNotEmpty()
  targetAudience: string;

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

  @ApiProperty({
    description: 'Book language',
    enum: Language,
    example: Language.EN,
  })
  @IsEnum(Language)
  bookLanguage: Language;

  @ApiProperty({
    description: 'Target Amazon marketplace for keyword optimization',
    enum: TargetMarket,
    example: TargetMarket.US,
  })
  @IsEnum(TargetMarket)
  targetMarket: TargetMarket;

  @ApiPropertyOptional({
    description: 'Additional notes or context',
    example: 'Focus on keywords for Amazon KDP optimization',
  })
  @IsOptional()
  @IsString()
  additionalNotes?: string;

  @ApiPropertyOptional({
    description: 'Coupon code to apply',
    example: 'KEYWORDS20',
  })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({
    description: 'Use pending keyword research credit from credit checkout purchase',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  usePendingCredit?: boolean;
}
