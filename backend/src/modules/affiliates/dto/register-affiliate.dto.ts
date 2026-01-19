import { IsString, IsNotEmpty, IsOptional, IsUrl, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterAffiliateDto {
  @ApiProperty({
    description: 'Website URL of the affiliate',
    example: 'https://www.mybookblog.com',
  })
  @IsUrl({}, { message: 'Please provide a valid URL' })
  @IsNotEmpty()
  websiteUrl: string;

  @ApiPropertyOptional({
    description: 'Social media URLs (comma-separated)',
    example: 'https://twitter.com/bookblogger,https://instagram.com/bookreviews',
  })
  @IsOptional()
  @IsString()
  socialMediaUrls?: string;

  @ApiProperty({
    description: 'How the affiliate plans to promote BookProof',
    example: 'I will write blog posts, create YouTube reviews, and share on social media with my 10K followers',
  })
  @IsString()
  @IsNotEmpty()
  promotionPlan: string;

  @ApiPropertyOptional({
    description: 'Estimated reach (audience size)',
    example: '10,000+ monthly visitors',
  })
  @IsOptional()
  @IsString()
  estimatedReach?: string;

  @ApiPropertyOptional({
    description: 'Desired custom slug for vanity URL (optional)',
    example: 'bookblogger',
  })
  @IsOptional()
  @IsString()
  customSlug?: string;
}
