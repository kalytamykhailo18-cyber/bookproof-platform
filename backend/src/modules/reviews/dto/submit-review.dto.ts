import { IsString, IsInt, IsBoolean, Min, Max, MinLength, IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for review submission
 * Per Milestone 4.4 - Review Submission Process:
 * - Review text must be 150+ characters minimum
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
    description: 'Internal feedback text (anonymized for author report). Minimum 150 characters required.',
    example: 'This book had an incredible storyline that kept me engaged from start to finish. The author has a unique way of developing characters that made me feel deeply connected to their journeys.',
    minLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(150, { message: 'Review feedback must be at least 150 characters' })
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
