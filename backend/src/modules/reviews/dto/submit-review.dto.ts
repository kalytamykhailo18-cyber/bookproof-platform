import { IsString, IsInt, IsBoolean, Min, Max, MinLength, MaxLength, IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for review submission
 * Per Section 3.6 - Review Submission Form:
 * - Review text must be 20+ characters minimum, 2000 characters maximum
 * - Star rating must be 1-5
 * - Reader must agree to Amazon TOS compliance
 * - Reader must confirm review guidelines acknowledgement
 * - Reader must confirm review is published on Amazon
 */
export class SubmitReviewDto {
  @ApiProperty({
    description: 'Amazon review link (only visible to admin)',
    example: 'https://www.amazon.com/review/R123ABC456DEF',
  })
  @IsUrl()
  @IsNotEmpty()
  amazonReviewLink: string;

  @ApiProperty({
    description: 'Internal star rating (1-5 stars)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  internalRating: number;

  @ApiProperty({
    description: 'Internal feedback text (anonymized for author report). 20-2000 characters required.',
    example: 'Great book with engaging storyline!',
    minLength: 20,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20, { message: 'Review feedback must be at least 20 characters' })
  @MaxLength(2000, { message: 'Review feedback cannot exceed 2000 characters' })
  internalFeedback: string;

  @ApiProperty({
    description: 'Confirmation that review was published on Amazon',
    example: true,
  })
  @IsBoolean()
  publishedOnAmazon: boolean;

  @ApiProperty({
    description: 'Agreement to Amazon Terms of Service compliance',
    example: true,
  })
  @IsBoolean()
  agreedToAmazonTos: boolean;

  @ApiProperty({
    description: 'Acknowledgement of review guidelines',
    example: true,
  })
  @IsBoolean()
  acknowledgedGuidelines: boolean;
}
