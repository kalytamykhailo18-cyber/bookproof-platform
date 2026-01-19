import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsInt,
  IsBoolean,
  IsOptional,
  IsUrl,
  IsNotEmpty,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { BookFormat, Language } from '@prisma/client';

// Custom validator for Amazon URL
@ValidatorConstraint({ name: 'isAmazonUrl', async: false })
class IsAmazonUrlConstraint implements ValidatorConstraintInterface {
  validate(url: string, args: ValidationArguments): boolean {
    if (!url) return false;
    try {
      const parsedUrl = new URL(url);
      // Check if the domain is an Amazon domain (any country)
      const amazonDomains = [
        'amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.fr', 'amazon.it',
        'amazon.es', 'amazon.ca', 'amazon.com.au', 'amazon.co.jp', 'amazon.in',
        'amazon.com.mx', 'amazon.com.br', 'amazon.nl', 'amazon.ae', 'amazon.sg',
        'amazon.se', 'amazon.pl', 'amazon.com.tr', 'amazon.sa', 'amazon.eg',
      ];
      const hostname = parsedUrl.hostname.replace('www.', '');
      return amazonDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain));
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Amazon link must be a valid Amazon URL (e.g., https://www.amazon.com/dp/B001234567)';
  }
}

export class CreateCampaignDto {
  @ApiProperty({ description: 'Book title' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'Author name as appears on book' })
  @IsString()
  @IsNotEmpty({ message: 'Author name is required' })
  @MaxLength(255)
  authorName: string;

  @ApiProperty({ description: 'Amazon ASIN (10 alphanumeric characters)', example: 'B001234567' })
  @IsString()
  @Matches(/^[A-Z0-9]{10}$/, {
    message: 'ASIN must be exactly 10 alphanumeric characters (e.g., B001234567)',
  })
  asin: string;

  @ApiProperty({ description: 'Amazon product link', example: 'https://www.amazon.com/dp/B001234567' })
  @IsUrl()
  @Validate(IsAmazonUrlConstraint)
  amazonLink: string;

  @ApiProperty({ description: 'Book synopsis (max 3 pages / ~7500 characters)' })
  @IsString()
  @MinLength(10, {
    message: 'Synopsis must be at least 10 characters',
  })
  @MaxLength(7500, {
    message: 'Synopsis must not exceed 7500 characters (approximately 3 pages)',
  })
  synopsis: string;

  @ApiProperty({ enum: Language, description: 'Book language' })
  @IsEnum(Language)
  language: Language;

  @ApiProperty({ description: 'Book genre' })
  @IsString()
  @IsNotEmpty({ message: 'Genre is required' })
  @MaxLength(100)
  genre: string;

  @ApiProperty({ description: 'Book category' })
  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  @MaxLength(100)
  category: string;

  @ApiProperty({ enum: BookFormat, description: 'Book format' })
  @IsEnum(BookFormat)
  availableFormats: BookFormat;

  @ApiProperty({ description: 'Target number of reviews' })
  @IsInt()
  @Min(25)
  @Max(1000)
  targetReviews: number;

  @ApiProperty({ description: 'Amazon coupon code', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  amazonCouponCode?: string;

  @ApiProperty({ description: 'Require verified purchase', required: false })
  @IsBoolean()
  @IsOptional()
  requireVerifiedPurchase?: boolean;

  @ApiProperty({ description: 'Page count', required: false })
  @IsInt()
  @IsOptional()
  @Min(1)
  pageCount?: number;

  @ApiProperty({ description: 'Word count', required: false })
  @IsInt()
  @IsOptional()
  @Min(1)
  wordCount?: number;

  @ApiProperty({ description: 'Series name', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  seriesName?: string;

  @ApiProperty({ description: 'Series number', required: false })
  @IsInt()
  @IsOptional()
  @Min(1)
  seriesNumber?: number;

  @ApiProperty({ description: 'Reading instructions for reviewers (optional)', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(2000, { message: 'Reading instructions must not exceed 2000 characters' })
  readingInstructions?: string;
}
