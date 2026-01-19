import { ApiProperty } from '@nestjs/swagger';
import { BookFormat, Language, CampaignStatus } from '@prisma/client';

/**
 * Author-facing Campaign Response DTO
 *
 * IMPORTANT: Per Rule 2 - "Buffer is completely invisible to authors"
 * This DTO must NOT expose:
 * - overBookingEnabled
 * - overBookingPercent
 * - totalAssignedReaders
 * - isBufferAssignment on individual assignments
 *
 * These fields are only visible to Admin users via admin-specific endpoints.
 */
export class CampaignResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  authorProfileId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  authorName: string;

  @ApiProperty()
  asin: string;

  @ApiProperty({ required: false, description: 'ISBN identifier' })
  isbn?: string;

  @ApiProperty()
  amazonLink: string;

  @ApiProperty()
  synopsis: string;

  @ApiProperty({ enum: Language })
  language: Language;

  @ApiProperty()
  genre: string;

  @ApiProperty()
  category: string;

  @ApiProperty({ required: false, description: 'Publication date of the book' })
  publishedDate?: Date;

  @ApiProperty({ required: false, description: 'Number of pages in ebook' })
  pageCount?: number;

  @ApiProperty({ required: false, description: 'Word count of the book' })
  wordCount?: number;

  @ApiProperty({ required: false, description: 'Series name if part of a series' })
  seriesName?: string;

  @ApiProperty({ required: false, description: 'Book number in the series' })
  seriesNumber?: number;

  @ApiProperty({ enum: BookFormat })
  availableFormats: BookFormat;

  @ApiProperty({ required: false })
  ebookFileUrl?: string;

  @ApiProperty({ required: false })
  ebookFileName?: string;

  @ApiProperty({ required: false, description: 'Ebook file size in bytes' })
  ebookFileSize?: number;

  @ApiProperty({ required: false })
  audioBookFileUrl?: string;

  @ApiProperty({ required: false })
  audioBookFileName?: string;

  @ApiProperty({ required: false, description: 'Audiobook file size in bytes' })
  audioBookFileSize?: number;

  @ApiProperty({ required: false })
  audioBookDuration?: number;

  @ApiProperty({ required: false })
  coverImageUrl?: string;

  @ApiProperty({ required: false, description: 'Synopsis PDF file URL (optional alternative to text synopsis)' })
  synopsisFileUrl?: string;

  @ApiProperty({ required: false, description: 'Synopsis PDF original filename' })
  synopsisFileName?: string;

  @ApiProperty()
  creditsAllocated: number;

  @ApiProperty()
  creditsUsed: number;

  @ApiProperty()
  creditsRemaining: number;

  @ApiProperty()
  targetReviews: number;

  @ApiProperty()
  reviewsPerWeek: number;

  @ApiProperty({ required: false })
  currentWeek?: number;

  @ApiProperty({ enum: CampaignStatus })
  status: CampaignStatus;

  @ApiProperty({ required: false })
  campaignStartDate?: Date;

  @ApiProperty({ required: false })
  campaignEndDate?: Date;

  @ApiProperty({ required: false })
  expectedEndDate?: Date;

  @ApiProperty()
  totalReviewsDelivered: number;

  @ApiProperty()
  totalReviewsValidated: number;

  @ApiProperty()
  totalReviewsRejected: number;

  @ApiProperty()
  totalReviewsExpired: number;

  @ApiProperty()
  totalReviewsPending: number;

  @ApiProperty({ required: false })
  averageInternalRating?: number;

  @ApiProperty({ required: false, description: 'Whether weekly distribution is enabled' })
  weeklyDistribution?: boolean;

  @ApiProperty({ required: false, description: 'Whether distribution has been manually overridden by admin' })
  manualDistributionOverride?: boolean;

  @ApiProperty({ required: false, description: 'When distribution was paused' })
  distributionPausedAt?: Date;

  @ApiProperty({ required: false, description: 'When distribution was resumed' })
  distributionResumedAt?: Date;

  @ApiProperty({ required: false, description: 'Amazon coupon code for verified purchase' })
  amazonCouponCode?: string;

  @ApiProperty({ required: false, description: 'Whether verified purchase is required' })
  requireVerifiedPurchase?: boolean;

  @ApiProperty({ required: false, description: 'Reading instructions for reviewers (optional)' })
  readingInstructions?: string;

  // NOTE: Buffer/overbooking fields intentionally excluded per Rule 2
  // overBookingEnabled, overBookingPercent, totalAssignedReaders are ADMIN-ONLY

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
