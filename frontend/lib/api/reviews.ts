import { apiClient } from './client';

// ============================================
// TYPES
// ============================================

export enum ReviewStatus {
  PENDING_SUBMISSION = 'PENDING_SUBMISSION',
  SUBMITTED = 'SUBMITTED',
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  FLAGGED = 'FLAGGED',
  REMOVED_BY_AMAZON = 'REMOVED_BY_AMAZON',
}

export enum ValidationAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  FLAG = 'FLAG',
  REQUEST_RESUBMISSION = 'REQUEST_RESUBMISSION',
}

export enum IssueType {
  // Review issues (from requirements.md)
  INVALID_LINK = 'INVALID_LINK',
  REVIEW_NOT_FOUND = 'REVIEW_NOT_FOUND',
  WRONG_BOOK = 'WRONG_BOOK',
  DUPLICATE = 'DUPLICATE',
  REMOVED_BY_AMAZON = 'REMOVED_BY_AMAZON',
  SUSPICIOUS_CONTENT = 'SUSPICIOUS_CONTENT',
  GUIDELINE_VIOLATION = 'GUIDELINE_VIOLATION',
  PROFILE_MISMATCH = 'PROFILE_MISMATCH',

  // Customer disputes/complaints
  AUTHOR_DISPUTE = 'AUTHOR_DISPUTE',
  AUTHOR_COMPLAINT = 'AUTHOR_COMPLAINT',
  READER_COMPLAINT = 'READER_COMPLAINT',

  // Unusual reader behavior
  UNUSUAL_BEHAVIOR = 'UNUSUAL_BEHAVIOR',
  SUSPECTED_FRAUD = 'SUSPECTED_FRAUD',

  // Payment issues
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_DISPUTE = 'PAYMENT_DISPUTE',
  REFUND_REQUEST = 'REFUND_REQUEST',
  PAYOUT_ISSUE = 'PAYOUT_ISSUE',
  DUPLICATE_PAYMENT = 'DUPLICATE_PAYMENT',

  // Technical errors
  TECHNICAL_ERROR = 'TECHNICAL_ERROR',
  SYSTEM_FAILURE = 'SYSTEM_FAILURE',
  DATA_INCONSISTENCY = 'DATA_INCONSISTENCY',

  OTHER = 'OTHER',
}

export enum IssueSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum IssueResolutionStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
  RESUBMISSION_PENDING = 'RESUBMISSION_PENDING',
}

export interface BookInfo {
  id: string;
  title: string;
  authorName: string;
  asin: string;
  coverImageUrl?: string;
}

/**
 * ADMIN-ONLY: Reader information visible only to admins
 * Per Privacy Rules: Authors and other readers NEVER see this data
 */
export interface ReaderInfo {
  id: string;
  name: string;
  reliabilityScore?: number;
  completionRate?: number;
}

/**
 * ADMIN-ONLY: Amazon profile details visible only to admins
 * Per Privacy Rules: Authors NEVER see reader Amazon profiles
 */
export interface AmazonProfile {
  id: string;
  profileUrl: string;
  profileName?: string;
  isVerified: boolean;
}

/**
 * Reader-facing issue type - limited information
 * Per Privacy Rules: Readers should not see internal admin notes
 */
export interface ReaderIssue {
  id: string;
  issueType: string;
  description: string;
  status: string;
  resubmissionRequested: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ADMIN-ONLY: Full issue details visible only to admins
 * Contains internal notes, resolution details, admin identifiers
 */
export interface ReviewIssue {
  id: string;
  issueType: string;
  description: string;
  severity: string;
  status: string;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
  readerNotified: boolean;
  resubmissionRequested: boolean;
  reassignmentTriggered: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Reader-facing Review type
 *
 * PRIVACY PROTECTION: Per requirements.md Privacy and Security Rules:
 * - Readers can only see their OWN review data
 * - Does NOT include: reader info, amazonProfile, admin notes, replacement tracking
 * - This type is used by reader endpoints: getMyReviews, submitReview, etc.
 */
export interface ReaderReview {
  id: string;
  readerAssignmentId: string;
  book: BookInfo;
  amazonReviewLink: string;
  internalRating: number;
  internalFeedback: string;
  publishedOnAmazon: boolean;
  completedContent: boolean;
  percentageCompleted?: number;
  status: ReviewStatus;
  validatedAt?: Date;
  hasIssue: boolean;
  issueType?: string;
  issues: ReaderIssue[];
  removedByAmazon: boolean;
  compensationPaid: boolean;
  compensationAmount?: number;
  compensationPaidAt?: Date;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ADMIN-ONLY: Full Review type with all fields
 *
 * Contains sensitive data that should NEVER be exposed to authors or other readers:
 * - reader: Reader's personal info (name, reliability score, etc.)
 * - amazonProfile: Reader's Amazon profile URL
 * - amazonReviewLink: Direct link to Amazon review
 * - validatedBy: Admin who validated the review
 * - issueNotes: Internal admin notes
 * - Replacement/reassignment tracking data
 */
export interface Review {
  id: string;
  readerAssignmentId: string;
  book: BookInfo;
  reader: ReaderInfo;
  amazonProfile?: AmazonProfile;
  amazonReviewLink: string;
  internalRating: number;
  internalFeedback: string;
  publishedOnAmazon: boolean;
  completedContent: boolean;
  percentageCompleted?: number;
  status: ReviewStatus;
  validatedAt?: Date;
  validatedBy?: string;
  hasIssue: boolean;
  issueType?: string;
  issueNotes?: string;
  issues: ReviewIssue[];
  removedByAmazon: boolean;
  removalDetectedAt?: Date;
  removalDate?: Date;
  replacementEligible: boolean;
  replacementProvided: boolean;
  replacementReviewId?: string;
  compensationPaid: boolean;
  compensationAmount?: number;
  compensationPaidAt?: Date;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PendingReviewsStats {
  totalPending: number;
  totalSubmitted: number;
  totalValidated: number;
  totalRejected: number;
  totalFlagged: number;
  totalRemovedByAmazon: number;
}

/**
 * Review monitor item - matches backend ReviewMonitorDto
 * Used for displaying active Amazon review monitors
 */
export interface ReviewMonitor {
  id: string;
  reviewId: string;
  bookTitle: string;
  readerName: string;
  monitoringStartDate: string;
  monitoringEndDate: string;
  lastChecked?: string; // Optional - may not have been checked yet
  status: string;
  stillExistsOnAmazon: boolean;
  amazonReviewLink: string;
}

/**
 * Monitoring statistics - matches backend MonitoringStatsDto
 * Used for admin dashboard statistics display
 */
export interface MonitoringStats {
  totalActive: number;
  totalRemoved: number;
  totalCompleted: number;
  removedWithin14Days: number;
  removedAfter14Days: number;
  removalRate: number;
}

// ============================================
// REQUEST TYPES
// ============================================

export interface SubmitReviewRequest {
  amazonReviewLink: string;
  internalRating: number;
  internalFeedback: string;
  publishedOnAmazon: boolean;
  agreedToAmazonTos: boolean;
  acknowledgedGuidelines: boolean;
}

export interface ValidateReviewRequest {
  action: ValidationAction;
  issueType?: IssueType;
  severity?: IssueSeverity;
  notes?: string;
}

export interface BulkValidateReviewsRequest {
  reviewIds: string[];
  action: ValidationAction;
}

export interface CreateIssueRequest {
  issueType: string;
  description: string;
  severity?: string;
}

export interface ResolveIssueRequest {
  status: IssueResolutionStatus;
  resolution: string;
  notifyReader?: boolean;
  requestResubmission?: boolean;
  triggerReassignment?: boolean;
}

export interface MarkAsRemovedRequest {
  removalDate: string;
  notes?: string;
}

/**
 * Response from marking review as removed - matches backend MarkAsRemovedResponseDto
 * Used to inform admin about eligibility and actions taken
 */
export interface MarkAsRemovedResponse {
  success: boolean;
  replacementEligible: boolean;
  daysSinceValidation: number;
  replacementAssigned: boolean;
  message: string;
}

// ============================================
// API METHODS
// ============================================

export const reviewsApi = {
  // ============================================
  // READER ENDPOINTS
  // PRIVACY: All reader endpoints return ReaderReview type
  // which excludes admin-only fields and other readers' information
  // ============================================

  submitReview: async (assignmentId: string, data: SubmitReviewRequest): Promise<ReaderReview> => {
    const response = await apiClient.post<ReaderReview>(
      `/reviews/assignments/${assignmentId}/submit`,
      data,
    );
    return response.data;
  },

  getMyReviews: async (): Promise<ReaderReview[]> => {
    const response = await apiClient.get<ReaderReview[]>('/reviews/my-reviews');
    return response.data;
  },

  getReviewByAssignment: async (assignmentId: string): Promise<ReaderReview | null> => {
    const response = await apiClient.get<ReaderReview | null>(
      `/reviews/assignments/${assignmentId}`,
    );
    return response.data;
  },

  // ============================================
  // ADMIN ENDPOINTS - VALIDATION
  // ADMIN-ONLY: Returns full Review type with all fields
  // ============================================

  getPendingReviews: async (): Promise<Review[]> => {
    const response = await apiClient.get<Review[]>('/reviews/pending');
    return response.data;
  },

  getPendingReviewsStats: async (): Promise<PendingReviewsStats> => {
    const response = await apiClient.get<PendingReviewsStats>('/reviews/pending/stats');
    return response.data;
  },

  validateReview: async (reviewId: string, data: ValidateReviewRequest): Promise<Review> => {
    const response = await apiClient.put<Review>(`/reviews/${reviewId}/validate`, data);
    return response.data;
  },

  bulkValidateReviews: async (data: BulkValidateReviewsRequest): Promise<Review[]> => {
    const response = await apiClient.post<Review[]>('/reviews/bulk-validate', data);
    return response.data;
  },

  getReviewById: async (reviewId: string): Promise<Review> => {
    const response = await apiClient.get<Review>(`/reviews/${reviewId}`);
    return response.data;
  },

  // ADMIN ENDPOINTS - ISSUE MANAGEMENT

  getOpenIssues: async (): Promise<ReviewIssue[]> => {
    const response = await apiClient.get<ReviewIssue[]>('/reviews/issues/open');
    return response.data;
  },

  createIssue: async (reviewId: string, data: CreateIssueRequest): Promise<ReviewIssue> => {
    const response = await apiClient.post<ReviewIssue>(`/reviews/${reviewId}/issues`, data);
    return response.data;
  },

  getReviewIssues: async (reviewId: string): Promise<ReviewIssue[]> => {
    const response = await apiClient.get<ReviewIssue[]>(`/reviews/${reviewId}/issues`);
    return response.data;
  },

  resolveIssue: async (issueId: string, data: ResolveIssueRequest): Promise<ReviewIssue> => {
    const response = await apiClient.put<ReviewIssue>(`/reviews/issues/${issueId}/resolve`, data);
    return response.data;
  },

  getIssueById: async (issueId: string): Promise<ReviewIssue> => {
    const response = await apiClient.get<ReviewIssue>(`/reviews/issues/${issueId}`);
    return response.data;
  },

  // ADMIN ENDPOINTS - AMAZON MONITORING

  getActiveMonitors: async (): Promise<ReviewMonitor[]> => {
    const response = await apiClient.get<ReviewMonitor[]>('/reviews/monitoring/active');
    return response.data;
  },

  getMonitoringStats: async (): Promise<MonitoringStats> => {
    const response = await apiClient.get<MonitoringStats>('/reviews/monitoring/stats');
    return response.data;
  },

  markAsRemovedByAmazon: async (
    reviewId: string,
    data: MarkAsRemovedRequest,
  ): Promise<MarkAsRemovedResponse> => {
    const response = await apiClient.put<MarkAsRemovedResponse>(
      `/reviews/${reviewId}/mark-removed`,
      data,
    );
    return response.data;
  },
};
