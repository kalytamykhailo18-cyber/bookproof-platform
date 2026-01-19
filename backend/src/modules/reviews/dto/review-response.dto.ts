import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReviewStatus {
  PENDING_SUBMISSION = 'PENDING_SUBMISSION',
  SUBMITTED = 'SUBMITTED',
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED',
  REMOVED_BY_AMAZON = 'REMOVED_BY_AMAZON',
}

export class BookInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  authorName: string;

  @ApiProperty()
  asin: string;

  @ApiPropertyOptional()
  coverImageUrl?: string;
}

export class ReaderInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  reliabilityScore?: number;

  @ApiPropertyOptional()
  completionRate?: number;
}

export class AmazonProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  profileUrl: string;

  @ApiPropertyOptional()
  profileName?: string;

  @ApiProperty()
  isVerified: boolean;
}

/**
 * Reader-facing issue DTO - limited information
 * Per Privacy Rules: Readers should not see internal admin notes
 */
export class ReaderIssueDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: 'High-level issue type' })
  issueType: string;

  @ApiProperty({ description: 'Reader-facing description (sanitized)' })
  description: string;

  @ApiProperty({ description: 'Issue status' })
  status: string;

  @ApiProperty({ description: 'Whether resubmission is requested' })
  resubmissionRequested: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

/**
 * Admin-facing issue DTO - full information
 * Contains internal notes, resolution details, admin identifiers
 */
export class ReviewIssueDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  issueType: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  severity: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  resolution?: string;

  @ApiPropertyOptional()
  resolvedBy?: string;

  @ApiPropertyOptional()
  resolvedAt?: Date;

  @ApiProperty()
  readerNotified: boolean;

  @ApiProperty()
  resubmissionRequested: boolean;

  @ApiProperty()
  reassignmentTriggered: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ReviewResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  readerAssignmentId: string;

  @ApiProperty({ type: () => BookInfoDto })
  book: BookInfoDto;

  @ApiProperty({ type: () => ReaderInfoDto })
  reader: ReaderInfoDto;

  @ApiPropertyOptional({ type: () => AmazonProfileDto })
  amazonProfile?: AmazonProfileDto;

  @ApiProperty({
    description: 'Amazon review link (ONLY visible to admin, never to author)',
  })
  amazonReviewLink: string;

  @ApiProperty()
  internalRating: number;

  @ApiProperty()
  internalFeedback: string;

  @ApiProperty()
  publishedOnAmazon: boolean;

  @ApiProperty()
  completedContent: boolean;

  @ApiPropertyOptional()
  percentageCompleted?: number;

  @ApiProperty({ enum: ReviewStatus })
  status: ReviewStatus;

  @ApiPropertyOptional()
  validatedAt?: Date;

  @ApiPropertyOptional()
  validatedBy?: string;

  @ApiProperty()
  hasIssue: boolean;

  @ApiPropertyOptional()
  issueType?: string;

  @ApiPropertyOptional()
  issueNotes?: string;

  @ApiProperty({ type: () => [ReviewIssueDto] })
  issues: ReviewIssueDto[];

  @ApiProperty()
  removedByAmazon: boolean;

  @ApiPropertyOptional()
  removalDetectedAt?: Date;

  @ApiPropertyOptional()
  removalDate?: Date;

  @ApiProperty()
  replacementEligible: boolean;

  @ApiProperty()
  replacementProvided: boolean;

  @ApiPropertyOptional()
  replacementReviewId?: string;

  @ApiProperty()
  compensationPaid: boolean;

  @ApiPropertyOptional()
  compensationAmount?: number;

  @ApiPropertyOptional()
  compensationPaidAt?: Date;

  @ApiPropertyOptional()
  submittedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

/**
 * Reader-facing Review Response DTO
 *
 * PRIVACY PROTECTION: Per requirements.md Privacy and Security Rules:
 * - Readers can only see their OWN review data
 * - Readers cannot see other readers' information
 * - Internal admin validation notes are NOT exposed
 * - Amazon profile URLs are included (it's the reader's own profile)
 *
 * This DTO excludes:
 * - Other reader's information (only includes reader's own data)
 * - Admin validation notes
 * - Internal severity flags
 * - Replacement/reassignment admin data
 */
export class ReaderReviewResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  readerAssignmentId: string;

  @ApiProperty({ type: () => BookInfoDto, description: 'Book information (public data only)' })
  book: BookInfoDto;

  @ApiProperty({ description: 'Amazon review link (reader own review)' })
  amazonReviewLink: string;

  @ApiProperty({ description: 'Reader internal rating (1-5)' })
  internalRating: number;

  @ApiProperty({ description: 'Reader internal feedback' })
  internalFeedback: string;

  @ApiProperty({ description: 'Whether review is published on Amazon' })
  publishedOnAmazon: boolean;

  @ApiProperty({ description: 'Whether content was completed' })
  completedContent: boolean;

  @ApiPropertyOptional({ description: 'Completion percentage' })
  percentageCompleted?: number;

  @ApiProperty({ enum: ReviewStatus, description: 'Review status' })
  status: ReviewStatus;

  @ApiPropertyOptional({ description: 'When review was validated' })
  validatedAt?: Date;

  @ApiProperty({ description: 'Whether review has an active issue' })
  hasIssue: boolean;

  @ApiPropertyOptional({ description: 'Issue type (if any)' })
  issueType?: string;

  @ApiProperty({ type: () => [ReaderIssueDto], description: 'Issues (limited info for reader)' })
  issues: ReaderIssueDto[];

  @ApiProperty({ description: 'Whether review was removed by Amazon' })
  removedByAmazon: boolean;

  @ApiProperty({ description: 'Whether compensation was paid' })
  compensationPaid: boolean;

  @ApiPropertyOptional({ description: 'Compensation amount (if paid)' })
  compensationAmount?: number;

  @ApiPropertyOptional({ description: 'When compensation was paid' })
  compensationPaidAt?: Date;

  @ApiPropertyOptional({ description: 'When review was submitted' })
  submittedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PendingReviewsStatsDto {
  @ApiProperty()
  totalPending: number;

  @ApiProperty()
  totalSubmitted: number;

  @ApiProperty()
  totalValidated: number;

  @ApiProperty()
  totalRejected: number;

  @ApiProperty()
  totalFlagged: number;

  @ApiProperty()
  totalRemovedByAmazon: number;
}

// ============================================
// AMAZON MONITORING RESPONSE DTOS
// ============================================

/**
 * DTO for a single review monitor item
 * Flattened structure for frontend consumption
 */
export class ReviewMonitorDto {
  @ApiProperty({ description: 'Monitor record ID' })
  id: string;

  @ApiProperty({ description: 'Associated review ID' })
  reviewId: string;

  @ApiProperty({ description: 'Book title' })
  bookTitle: string;

  @ApiProperty({ description: 'Reader name' })
  readerName: string;

  @ApiProperty({ description: 'Monitoring start date (ISO string)' })
  monitoringStartDate: string;

  @ApiProperty({ description: 'Monitoring end date (ISO string)' })
  monitoringEndDate: string;

  @ApiPropertyOptional({ description: 'Last checked timestamp (ISO string)' })
  lastChecked?: string;

  @ApiProperty({ description: 'Monitor status' })
  status: string;

  @ApiProperty({ description: 'Whether review still exists on Amazon' })
  stillExistsOnAmazon: boolean;

  @ApiProperty({ description: 'Amazon review link for manual verification' })
  amazonReviewLink: string;
}

/**
 * DTO for monitoring statistics
 */
export class MonitoringStatsDto {
  @ApiProperty({ description: 'Number of active monitors' })
  totalActive: number;

  @ApiProperty({ description: 'Total reviews removed by Amazon' })
  totalRemoved: number;

  @ApiProperty({ description: 'Monitors completed (14-day period passed)' })
  totalCompleted: number;

  @ApiProperty({ description: 'Removals within 14-day guarantee (replacement eligible)' })
  removedWithin14Days: number;

  @ApiProperty({ description: 'Removals after 14-day guarantee (no replacement)' })
  removedAfter14Days: number;

  @ApiProperty({ description: 'Removal rate as percentage' })
  removalRate: number;
}

/**
 * DTO for mark as removed response
 */
export class MarkAsRemovedResponseDto {
  @ApiProperty({ description: 'Whether operation succeeded' })
  success: boolean;

  @ApiProperty({ description: 'Whether review is eligible for replacement (within 14 days)' })
  replacementEligible: boolean;

  @ApiProperty({ description: 'Number of days since review was validated' })
  daysSinceValidation: number;

  @ApiProperty({ description: 'Whether a replacement reader was assigned' })
  replacementAssigned: boolean;

  @ApiProperty({ description: 'Human-readable message about the outcome' })
  message: string;
}
