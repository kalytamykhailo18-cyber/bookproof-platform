import { IsString, IsInt, IsBoolean, Min, Max, IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    description: 'Internal feedback text (anonymized for author report)',
    example: 'Great book with engaging characters and plot twists.',
  })
  @IsString()
  @IsNotEmpty()
  internalFeedback: string;

  @ApiProperty({
    description: 'Confirmation that review was published on Amazon',
    example: true,
  })
  @IsBoolean()
  publishedOnAmazon: boolean;
}
