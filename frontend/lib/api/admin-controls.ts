import { apiClient } from './client';

// ============================================
// TYPE DEFINITIONS (Match backend DTOs exactly)
// ============================================

export interface PauseCampaignDto {
  reason: string;
  notes?: string;
}

export interface ResumeCampaignDto {
  reason: string;
  notes?: string;
}

export interface AdjustWeeklyDistributionDto {
  reviewsPerWeek: number;
  reason: string;
  notes?: string;
}

export interface AddCreditsDto {
  creditsToAdd: number;
  reason: string;
  notes?: string;
}

export interface RemoveCreditsDto {
  creditsToRemove: number;
  reason: string;
  notes?: string;
}

export interface AllocateCreditsDto {
  creditsToAllocate: number;
  reason: string;
  notes?: string;
}

export interface AdjustOverbookingDto {
  overBookingEnabled: boolean;
  overBookingPercent: number;
  reason: string;
  notes?: string;
}

export interface UpdateCampaignSettingsDto {
  campaignEndDate?: string;
  targetReviews?: number;
  reviewsPerWeek?: number;
  synopsis?: string;
  reason: string;
  notes?: string;
}

export interface TransferCreditsDto {
  fromBookId: string;
  toBookId: string;
  creditsToTransfer: number;
  reason: string;
  notes?: string;
}

// Reader assignment control DTOs
export interface ExtendDeadlineDto {
  extensionHours: number;
  reason: string;
  notes?: string;
}

export interface ShortenDeadlineDto {
  reductionHours: number;
  reason: string;
  notes?: string;
}

export interface ReassignReaderDto {
  targetBookId: string;
  reason: string;
  notes?: string;
}

export interface CancelAssignmentDto {
  reason: string;
  refundCredits?: boolean;
  notes?: string;
}

// Issue/Exception resolution DTOs
export interface RequestResubmissionDto {
  instructions: string;
  deadlineHours: number;
  adminNotes?: string;
}

export interface CampaignHealthDto {
  status: 'on-track' | 'delayed' | 'issues' | 'ahead-of-schedule';
  completionPercentage: number;
  weeksElapsed: number;
  totalPlannedWeeks: number;
  reviewsDelivered: number;
  reviewsExpected: number;
  targetReviews: number;
  variance: number;
  projectedCompletionDate: string;
  expectedCompletionDate: string;
  daysOffSchedule: number;
}

export interface CampaignAnalyticsDto {
  campaign: {
    id: string;
    title: string;
    status: string;
    targetReviews: number;
  };
  progress: {
    reviewsDelivered: number;
    reviewsValidated: number;
    reviewsRejected: number;
    reviewsExpired: number;
    completionPercentage: number;
  };
  distribution: {
    reviewsPerWeek: number;
    currentWeek: number;
    totalWeeks: number;
    manualOverride: boolean;
  };
  performance: {
    averageRating: number;
    onTimeDeliveryRate: number;
    validationRate: number;
  };
  timeline: {
    startDate: string;
    expectedEndDate: string;
    projectedEndDate: string;
  };
}

export interface AuthorListItemDto {
  id: string;
  userId: string;
  email: string;
  name: string;
  totalCreditsPurchased: number;
  totalCreditsUsed: number;
  availableCredits: number;
  activeCampaigns: number;
  totalCampaigns: number;
  createdAt: string;
  isVerified: boolean;
}

export type CreditTransactionType =
  | 'PURCHASE'
  | 'SUBSCRIPTION_RENEWAL'
  | 'ALLOCATION'
  | 'DEDUCTION'
  | 'REFUND'
  | 'MANUAL_ADJUSTMENT'
  | 'EXPIRATION'
  | 'BONUS';

export interface CreditTransactionDto {
  id: string;
  authorProfileId: string;
  bookId?: string;
  bookTitle?: string;
  amount: number;
  type: CreditTransactionType;
  description: string;
  balanceAfter: number;
  performedBy?: string;
  performedByName?: string;
  notes?: string;
  createdAt: string;
}

export interface CreditTransactionHistoryDto {
  authorProfileId: string;
  authorName: string;
  authorEmail: string;
  availableCredits: number;
  totalCreditsPurchased: number;
  totalCreditsUsed: number;
  transactions: CreditTransactionDto[];
  totalTransactions: number;
}

export interface AllTransactionsResponseDto {
  transactions: CreditTransactionDto[];
  total: number;
}

// ============================================
// API CLIENT METHODS
// ============================================

export const adminControlsApi = {
  /**
   * Pause campaign
   */
  async pauseCampaign(bookId: string, data: PauseCampaignDto): Promise<CampaignAnalyticsDto> {
    const response = await apiClient.post<CampaignAnalyticsDto>(
      `/admin/campaigns/${bookId}/pause`,
      data,
    );
    return response.data;
  },

  /**
   * Resume campaign
   */
  async resumeCampaign(bookId: string, data: ResumeCampaignDto): Promise<CampaignAnalyticsDto> {
    const response = await apiClient.post<CampaignAnalyticsDto>(
      `/admin/campaigns/${bookId}/resume`,
      data,
    );
    return response.data;
  },

  /**
   * Adjust weekly distribution
   */
  async adjustWeeklyDistribution(
    bookId: string,
    data: AdjustWeeklyDistributionDto,
  ): Promise<CampaignAnalyticsDto> {
    const response = await apiClient.put<CampaignAnalyticsDto>(
      `/admin/campaigns/${bookId}/distribution`,
      data,
    );
    return response.data;
  },

  /**
   * Add credits to author manually
   */
  async addCreditsToAuthor(authorProfileId: string, data: AddCreditsDto): Promise<unknown> {
    const response = await apiClient.post(
      `/admin/campaigns/authors/${authorProfileId}/credits/add`,
      data,
    );
    return response.data;
  },

  /**
   * Remove credits from author manually
   */
  async removeCreditsFromAuthor(authorProfileId: string, data: RemoveCreditsDto): Promise<unknown> {
    const response = await apiClient.post(
      `/admin/campaigns/authors/${authorProfileId}/credits/remove`,
      data,
    );
    return response.data;
  },

  /**
   * Allocate credits to campaign
   */
  async allocateCreditsToCampaign(bookId: string, data: AllocateCreditsDto): Promise<unknown> {
    const response = await apiClient.post(`/admin/campaigns/${bookId}/credits/allocate`, data);
    return response.data;
  },

  /**
   * Adjust overbooking percentage
   */
  async adjustOverbooking(bookId: string, data: AdjustOverbookingDto): Promise<unknown> {
    const response = await apiClient.put(`/admin/campaigns/${bookId}/overbooking`, data);
    return response.data;
  },

  /**
   * Get campaign health status
   */
  async getCampaignHealth(bookId: string): Promise<CampaignHealthDto> {
    const response = await apiClient.get<CampaignHealthDto>(`/admin/campaigns/${bookId}/health`);
    return response.data;
  },

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(bookId: string): Promise<CampaignAnalyticsDto> {
    const response = await apiClient.get<CampaignAnalyticsDto>(
      `/admin/campaigns/${bookId}/analytics`,
    );
    return response.data;
  },

  /**
   * Get all campaigns for admin
   */
  async getAllCampaigns(): Promise<CampaignAnalyticsDto[]> {
    const response = await apiClient.get<CampaignAnalyticsDto[]>('/admin/campaigns');
    return response.data;
  },

  /**
   * Get all authors with credit information
   */
  async getAllAuthors(): Promise<AuthorListItemDto[]> {
    const response = await apiClient.get<AuthorListItemDto[]>('/admin/campaigns/authors');
    return response.data;
  },

  /**
   * Get author details by ID
   */
  async getAuthorDetails(authorProfileId: string): Promise<AuthorListItemDto> {
    const response = await apiClient.get<AuthorListItemDto>(
      `/admin/campaigns/authors/${authorProfileId}`,
    );
    return response.data;
  },

  /**
   * Get credit transaction history for a specific author
   */
  async getAuthorTransactionHistory(
    authorProfileId: string,
    limit?: number,
    offset?: number,
  ): Promise<CreditTransactionHistoryDto> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const response = await apiClient.get<CreditTransactionHistoryDto>(
      `/admin/campaigns/authors/${authorProfileId}/transactions?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Get all credit transactions across platform
   */
  async getAllCreditTransactions(
    limit?: number,
    offset?: number,
    type?: CreditTransactionType,
  ): Promise<AllTransactionsResponseDto> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    if (type) params.append('type', type);

    const response = await apiClient.get<AllTransactionsResponseDto>(
      `/admin/campaigns/credits/transactions?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Update campaign settings (for active/paused campaigns)
   */
  async updateCampaignSettings(
    bookId: string,
    data: UpdateCampaignSettingsDto,
  ): Promise<CampaignAnalyticsDto> {
    const response = await apiClient.put<CampaignAnalyticsDto>(
      `/admin/campaigns/${bookId}/settings`,
      data,
    );
    return response.data;
  },

  /**
   * Transfer credits between campaigns (same author)
   */
  async transferCredits(data: TransferCreditsDto): Promise<unknown> {
    const response = await apiClient.post('/admin/campaigns/credits/transfer', data);
    return response.data;
  },

  /**
   * Resume campaign with catch-up logic (extends end date)
   */
  async resumeCampaignWithCatchUp(
    bookId: string,
    data: ResumeCampaignDto,
  ): Promise<CampaignAnalyticsDto> {
    const response = await apiClient.post<CampaignAnalyticsDto>(
      `/admin/campaigns/${bookId}/resume-with-catchup`,
      data,
    );
    return response.data;
  },

  // ============================================
  // READER ASSIGNMENT CONTROLS
  // ============================================

  /**
   * Extend deadline for reader assignment
   */
  async extendDeadline(assignmentId: string, data: ExtendDeadlineDto): Promise<unknown> {
    const response = await apiClient.post(
      `/admin/assignments/${assignmentId}/extend-deadline`,
      data,
    );
    return response.data;
  },

  /**
   * Shorten deadline for reader assignment
   */
  async shortenDeadline(assignmentId: string, data: ShortenDeadlineDto): Promise<unknown> {
    const response = await apiClient.post(
      `/admin/assignments/${assignmentId}/shorten-deadline`,
      data,
    );
    return response.data;
  },

  /**
   * Reassign reader to different book
   */
  async reassignReader(assignmentId: string, data: ReassignReaderDto): Promise<unknown> {
    const response = await apiClient.post(`/admin/assignments/${assignmentId}/reassign`, data);
    return response.data;
  },

  /**
   * Cancel reader assignment
   */
  async cancelAssignment(assignmentId: string, data: CancelAssignmentDto): Promise<unknown> {
    const response = await apiClient.post(`/admin/assignments/${assignmentId}/cancel`, data);
    return response.data;
  },

  /**
   * Get assignment exceptions
   */
  async getAssignmentExceptions(
    bookId?: string,
    readerProfileId?: string,
    limit?: number,
  ): Promise<unknown[]> {
    const params = new URLSearchParams();
    if (bookId) params.append('bookId', bookId);
    if (readerProfileId) params.append('readerProfileId', readerProfileId);
    if (limit) params.append('limit', limit.toString());

    const response = await apiClient.get(`/admin/assignments/exceptions?${params.toString()}`);
    return response.data;
  },

  // ============================================
  // ISSUE/EXCEPTION RESOLUTION CONTROLS
  // ============================================

  /**
   * Request resubmission for review issue
   */
  async requestResubmission(issueId: string, data: RequestResubmissionDto): Promise<unknown> {
    const response = await apiClient.post(`/reviews/issues/${issueId}/request-resubmission`, data);
    return response.data;
  },
};
