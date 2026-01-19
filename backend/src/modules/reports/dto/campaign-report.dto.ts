import { IsNumber, IsOptional, IsString, IsDate, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RatingDistributionDto {
  @ApiProperty({ description: 'Number of 5-star reviews', example: 12 })
  @IsNumber()
  @Min(0)
  fiveStar: number;

  @ApiProperty({ description: 'Number of 4-star reviews', example: 5 })
  @IsNumber()
  @Min(0)
  fourStar: number;

  @ApiProperty({ description: 'Number of 3-star reviews', example: 2 })
  @IsNumber()
  @Min(0)
  threeStar: number;

  @ApiProperty({ description: 'Number of 2-star reviews', example: 1 })
  @IsNumber()
  @Min(0)
  twoStar: number;

  @ApiProperty({ description: 'Number of 1-star reviews', example: 0 })
  @IsNumber()
  @Min(0)
  oneStar: number;
}

export class CampaignDurationDto {
  @ApiProperty({ description: 'Campaign start date' })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ description: 'Campaign end date' })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({ description: 'Total campaign duration in weeks', example: 8 })
  @IsNumber()
  @Min(0)
  totalWeeks: number;
}

export class PerformanceMetricsDto {
  @ApiProperty({ description: 'Percentage of successful reviews delivered', example: 95.5 })
  @IsNumber()
  @Min(0)
  successRate: number;

  @ApiProperty({ description: 'Number of delays encountered during campaign', example: 2 })
  @IsNumber()
  @Min(0)
  delaysEncountered: number;

  @ApiProperty({ description: 'Number of replacement reviews provided', example: 1 })
  @IsNumber()
  @Min(0)
  replacementsProvided: number;
}

export class RatingTrendDto {
  @ApiProperty({ description: 'Week number', example: 1 })
  @IsNumber()
  @Min(1)
  week: number;

  @ApiProperty({ description: 'Average rating for this week', example: 4.5 })
  @IsNumber()
  @Min(0)
  avgRating: number;

  @ApiProperty({ description: 'Number of reviews received this week', example: 3 })
  @IsNumber()
  @Min(0)
  count: number;
}

export class CampaignReportResponseDto {
  @ApiProperty({ description: 'Unique report ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Associated book/campaign ID' })
  @IsString()
  bookId: string;

  @ApiProperty({ description: 'Total number of reviews delivered', example: 20 })
  @IsNumber()
  @Min(0)
  totalReviewsDelivered: number;

  @ApiProperty({ description: 'Total number of reviews validated', example: 20 })
  @IsNumber()
  @Min(0)
  totalReviewsValidated: number;

  @ApiProperty({ description: 'Average internal rating across all reviews', example: 4.5 })
  @IsNumber()
  @Min(0)
  averageRating: number;

  @ApiProperty({ description: 'Rating distribution breakdown', type: () => RatingDistributionDto })
  @ValidateNested()
  @Type(() => RatingDistributionDto)
  ratingDistribution: RatingDistributionDto;

  @ApiPropertyOptional({
    description: 'Rating trends over time (weekly averages)',
    type: () => [RatingTrendDto],
    example: [
      { week: 1, avgRating: 4.5, count: 3 },
      { week: 2, avgRating: 4.2, count: 5 },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => RatingTrendDto)
  @IsOptional()
  ratingTrends?: RatingTrendDto[];

  @ApiProperty({ description: 'Campaign duration information', type: () => CampaignDurationDto })
  @ValidateNested()
  @Type(() => CampaignDurationDto)
  campaignDuration: CampaignDurationDto;

  @ApiProperty({ description: 'Performance metrics', type: () => PerformanceMetricsDto })
  @ValidateNested()
  @Type(() => PerformanceMetricsDto)
  performanceMetrics: PerformanceMetricsDto;

  @ApiPropertyOptional({
    description: 'Anonymized reader feedback (no reader names, protects privacy)',
    type: [String],
    example: ['Great story, engaging characters!', 'Well-written with compelling plot.'],
  })
  @IsString({ each: true })
  @IsOptional()
  anonymousFeedback?: string[];

  @ApiPropertyOptional({ description: 'URL to download the PDF report (signed URL)' })
  @IsString()
  @IsOptional()
  pdfUrl?: string;

  @ApiProperty({ description: 'When the report was generated' })
  @IsDate()
  @Type(() => Date)
  generatedAt: Date;

  @ApiPropertyOptional({ description: 'When the report was emailed to the author' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  emailedAt?: Date;
}

export class RegenerateReportDto {
  // Empty DTO for now - can add options later
}
