import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

/**
 * DTO for pausing a campaign
 */
export class PauseCampaignDto {
  @ApiProperty({
    description: 'Reason for pausing the campaign',
    example: 'Author requested temporary pause for review strategy adjustment',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for resuming a campaign
 */
export class ResumeCampaignDto {
  @ApiProperty({
    description: 'Reason for resuming the campaign',
    example: 'Strategy adjustment completed, resuming review distribution',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for adjusting weekly distribution
 */
export class AdjustWeeklyDistributionDto {
  @ApiProperty({
    description: 'New number of reviews per week',
    example: 15,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  reviewsPerWeek: number;

  @ApiProperty({
    description: 'Reason for manual distribution override',
    example: 'Campaign deadline approaching, increasing distribution speed',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for manual credit addition to author
 */
export class AddCreditsDto {
  @ApiProperty({
    description: 'Number of credits to add',
    example: 50,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  creditsToAdd: number;

  @ApiProperty({
    description: 'Reason for credit addition',
    example: 'Compensation for system error that caused delays',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for manual credit removal from author
 */
export class RemoveCreditsDto {
  @ApiProperty({
    description: 'Number of credits to remove',
    example: 25,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  creditsToRemove: number;

  @ApiProperty({
    description: 'Reason for credit removal',
    example: 'Duplicate purchase correction',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for manual credit allocation to specific campaign
 */
export class AllocateCreditsDto {
  @ApiProperty({
    description: 'Number of credits to allocate to this campaign',
    example: 100,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  creditsToAllocate: number;

  @ApiProperty({
    description: 'Reason for manual credit allocation',
    example: 'Campaign extension approved by management',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for overriding overbooking percentage
 */
export class AdjustOverbookingDto {
  @ApiProperty({
    description: 'New overbooking percentage (0-100)',
    example: 30,
    minimum: 0,
    maximum: 100,
  })
  @IsInt()
  @Min(0)
  overBookingPercent: number;

  @ApiProperty({
    description: 'Enable or disable overbooking',
    example: true,
  })
  @IsBoolean()
  overBookingEnabled: boolean;

  @ApiProperty({
    description: 'Reason for overbooking adjustment',
    example: 'Higher reader dropout rate observed, increasing buffer',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * Response DTO for campaign health status
 */
export class CampaignHealthDto {
  @ApiProperty({ description: 'Campaign status', example: 'on-track' })
  status: 'on-track' | 'delayed' | 'issues' | 'ahead-of-schedule';

  @ApiProperty({ description: 'Completion percentage', example: 67.5 })
  completionPercentage: number;

  @ApiProperty({ description: 'Weeks elapsed', example: 4 })
  weeksElapsed: number;

  @ApiProperty({ description: 'Total planned weeks', example: 6 })
  totalPlannedWeeks: number;

  @ApiProperty({ description: 'Reviews delivered so far', example: 54 })
  reviewsDelivered: number;

  @ApiProperty({ description: 'Reviews expected at this point', example: 60 })
  reviewsExpected: number;

  @ApiProperty({ description: 'Target total reviews', example: 100 })
  targetReviews: number;

  @ApiProperty({ description: 'Variance from expected (+/-)', example: -6 })
  variance: number;

  @ApiProperty({ description: 'Projected completion date', example: '2024-03-15' })
  projectedCompletionDate: string;

  @ApiProperty({ description: 'Expected completion date', example: '2024-03-10' })
  expectedCompletionDate: string;

  @ApiProperty({ description: 'Days ahead or behind schedule', example: -5 })
  daysOffSchedule: number;
}

/**
 * Response DTO for author list item (admin view)
 */
export class AuthorListItemDto {
  @ApiProperty({ description: 'Author profile ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Author email' })
  email: string;

  @ApiProperty({ description: 'Author name' })
  name: string;

  @ApiProperty({ description: 'Total credits purchased', example: 500 })
  totalCreditsPurchased: number;

  @ApiProperty({ description: 'Total credits used', example: 350 })
  totalCreditsUsed: number;

  @ApiProperty({ description: 'Available credits', example: 150 })
  availableCredits: number;

  @ApiProperty({ description: 'Active campaigns count', example: 2 })
  activeCampaigns: number;

  @ApiProperty({ description: 'Total campaigns count', example: 5 })
  totalCampaigns: number;

  @ApiProperty({ description: 'Account created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Account verified status' })
  isVerified: boolean;
}

/**
 * Nested DTOs for CampaignAnalytics to match frontend expectations
 */
export class CampaignInfoDto {
  @ApiProperty({ description: 'Campaign ID' })
  id: string;

  @ApiProperty({ description: 'Book title' })
  title: string;

  @ApiProperty({ description: 'Current status' })
  status: string;

  @ApiProperty({ description: 'Target reviews' })
  targetReviews: number;
}

export class CampaignProgressDto {
  @ApiProperty({ description: 'Reviews delivered' })
  reviewsDelivered: number;

  @ApiProperty({ description: 'Reviews validated' })
  reviewsValidated: number;

  @ApiProperty({ description: 'Reviews rejected' })
  reviewsRejected: number;

  @ApiProperty({ description: 'Reviews expired' })
  reviewsExpired: number;

  @ApiProperty({ description: 'Completion percentage' })
  completionPercentage: number;
}

export class CampaignDistributionDto {
  @ApiProperty({ description: 'Reviews per week' })
  reviewsPerWeek: number;

  @ApiProperty({ description: 'Current week number' })
  currentWeek: number;

  @ApiProperty({ description: 'Total weeks' })
  totalWeeks: number;

  @ApiProperty({ description: 'Manual override active' })
  manualOverride: boolean;
}

export class CampaignPerformanceDto {
  @ApiProperty({ description: 'Average rating' })
  averageRating: number;

  @ApiProperty({ description: 'On-time delivery rate' })
  onTimeDeliveryRate: number;

  @ApiProperty({ description: 'Validation rate' })
  validationRate: number;
}

export class CampaignTimelineDto {
  @ApiProperty({ description: 'Start date' })
  startDate: string;

  @ApiProperty({ description: 'Expected end date' })
  expectedEndDate: string;

  @ApiProperty({ description: 'Projected end date' })
  projectedEndDate: string;
}

/**
 * Response DTO for campaign analytics (nested structure for frontend)
 */
export class CampaignAnalyticsDto {
  @ApiProperty({ description: 'Campaign basic info', type: CampaignInfoDto })
  campaign: CampaignInfoDto;

  @ApiProperty({ description: 'Progress metrics', type: CampaignProgressDto })
  progress: CampaignProgressDto;

  @ApiProperty({ description: 'Distribution settings', type: CampaignDistributionDto })
  distribution: CampaignDistributionDto;

  @ApiProperty({ description: 'Performance metrics', type: CampaignPerformanceDto })
  performance: CampaignPerformanceDto;

  @ApiProperty({ description: 'Timeline info', type: CampaignTimelineDto })
  timeline: CampaignTimelineDto;
}

/**
 * Response DTO for credit transaction (admin view)
 */
export class CreditTransactionDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: string;

  @ApiProperty({ description: 'Author profile ID' })
  authorProfileId: string;

  @ApiProperty({ description: 'Book ID (if related to a campaign)', required: false })
  bookId?: string;

  @ApiProperty({ description: 'Book title (if related to a campaign)', required: false })
  bookTitle?: string;

  @ApiProperty({ description: 'Amount (positive for addition, negative for deduction)' })
  amount: number;

  @ApiProperty({
    description: 'Transaction type',
    enum: ['PURCHASE', 'SUBSCRIPTION_RENEWAL', 'ALLOCATION', 'DEDUCTION', 'REFUND', 'MANUAL_ADJUSTMENT', 'EXPIRATION', 'BONUS'],
  })
  type: string;

  @ApiProperty({ description: 'Transaction description' })
  description: string;

  @ApiProperty({ description: 'Balance after transaction' })
  balanceAfter: number;

  @ApiProperty({ description: 'Admin who performed the action (for manual adjustments)', required: false })
  performedBy?: string;

  @ApiProperty({ description: 'Admin name (if available)', required: false })
  performedByName?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  notes?: string;

  @ApiProperty({ description: 'Transaction date' })
  createdAt: Date;
}

/**
 * Response DTO for credit transaction history (admin view)
 */
export class CreditTransactionHistoryDto {
  @ApiProperty({ description: 'Author profile ID' })
  authorProfileId: string;

  @ApiProperty({ description: 'Author name' })
  authorName: string;

  @ApiProperty({ description: 'Author email' })
  authorEmail: string;

  @ApiProperty({ description: 'Current available credits' })
  availableCredits: number;

  @ApiProperty({ description: 'Total credits purchased (lifetime)' })
  totalCreditsPurchased: number;

  @ApiProperty({ description: 'Total credits used' })
  totalCreditsUsed: number;

  @ApiProperty({ description: 'Transaction history', type: [CreditTransactionDto] })
  transactions: CreditTransactionDto[];

  @ApiProperty({ description: 'Total number of transactions' })
  totalTransactions: number;
}

/**
 * DTO for updating campaign settings (admin-only, for active campaigns)
 */
export class UpdateCampaignSettingsDto {
  @ApiPropertyOptional({
    description: 'New campaign end date',
    example: '2024-06-30',
  })
  @IsOptional()
  campaignEndDate?: Date;

  @ApiPropertyOptional({
    description: 'New target review count',
    example: 150,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  targetReviews?: number;

  @ApiPropertyOptional({
    description: 'New reviews per week',
    example: 20,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  reviewsPerWeek?: number;

  @ApiPropertyOptional({
    description: 'Updated book synopsis',
  })
  @IsOptional()
  @IsString()
  synopsis?: string;

  @ApiProperty({
    description: 'Reason for settings change',
    example: 'Author requested extension due to book launch delay',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for transferring credits between campaigns (correcting allocation)
 */
export class TransferCreditsDto {
  @ApiProperty({
    description: 'Source campaign (book) ID to transfer credits FROM',
  })
  @IsString()
  @IsNotEmpty()
  fromBookId: string;

  @ApiProperty({
    description: 'Target campaign (book) ID to transfer credits TO',
  })
  @IsString()
  @IsNotEmpty()
  toBookId: string;

  @ApiProperty({
    description: 'Number of credits to transfer',
    example: 25,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  creditsToTransfer: number;

  @ApiProperty({
    description: 'Reason for credit transfer/correction',
    example: 'Incorrect allocation during campaign setup, moving credits to correct campaign',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for force completing a campaign (Section 5.3)
 */
export class ForceCompleteCampaignDto {
  @ApiProperty({
    description: 'Reason for force completing the campaign',
    example: 'Author requested early completion due to book release',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Whether to refund unused credits to author',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  refundUnusedCredits?: boolean;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for manually granting material access to a reader (Section 5.3)
 */
export class ManualGrantAccessDto {
  @ApiProperty({
    description: 'Reader profile ID to grant access',
  })
  @IsString()
  @IsNotEmpty()
  readerProfileId: string;

  @ApiProperty({
    description: 'Reason for manual access grant',
    example: 'Priority reviewer, bypassing normal queue',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Format preference (ebook or audiobook)',
    default: 'ebook',
  })
  @IsString()
  @IsOptional()
  preferredFormat?: string;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for removing a reader from a campaign (Section 5.3)
 */
export class RemoveReaderFromCampaignDto {
  @ApiProperty({
    description: 'Assignment ID to remove',
  })
  @IsString()
  @IsNotEmpty()
  assignmentId: string;

  @ApiProperty({
    description: 'Reason for removing the reader',
    example: 'Reader violated terms of service',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Whether to notify the reader',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  notifyReader?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to refund the credit',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  refundCredit?: boolean;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
