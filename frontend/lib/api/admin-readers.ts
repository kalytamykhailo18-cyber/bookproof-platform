import { apiClient } from './client';
import { ContentPreference } from './readers';

// ============================================
// TYPE DEFINITIONS (Match backend DTOs exactly)
// ============================================

export interface AdminReaderListItemDto {
  id: string;
  userId: string;
  email: string;
  name: string;
  country: string;
  language: string;
  contentPreference: ContentPreference;
  walletBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  reviewsCompleted: number;
  reviewsExpired: number;
  reviewsRejected: number;
  reliabilityScore: number;
  completionRate: number;
  isActive: boolean;
  isFlagged: boolean;
  flagReason?: string;
  amazonProfilesCount: number;
  verifiedAmazonProfiles: number;
  createdAt: string;
  lastActiveAt?: string;
}

export interface AdminReaderDetailDto extends AdminReaderListItemDto {
  preferredGenres: string[];
  amazonProfiles: {
    id: string;
    profileUrl: string;
    profileName?: string;
    isVerified: boolean;
    verifiedAt?: string;
    createdAt: string;
  }[];
  recentAssignments: {
    id: string;
    bookId: string;
    bookTitle: string;
    format: string;
    status: string;
    assignedAt: string;
    submittedAt?: string;
    deadline?: string;
  }[];
  payoutHistory: {
    id: string;
    amount: number;
    status: string;
    paymentMethod: string;
    requestedAt: string;
    processedAt?: string;
  }[];
  walletTransactions: {
    id: string;
    amount: number;
    type: string;
    description: string;
    createdAt: string;
  }[];
  adminNotes: {
    id: string;
    content: string;
    createdBy: string;
    createdByName: string;
    createdAt: string;
  }[];
}

export interface AdminReaderStatsDto {
  totalReaders: number;
  activeReaders: number;
  suspendedReaders: number;
  flaggedReaders: number;
  newReadersThisMonth: number;
  totalWalletBalance: number;
  pendingPayouts: number;
  averageReliabilityScore: number;
  averageCompletionRate: number;
}

export interface SuspendReaderDto {
  reason: string;
  notes?: string;
}

export interface UnsuspendReaderDto {
  reason: string;
  notes?: string;
}

export interface AdjustWalletDto {
  amount: number; // Positive for addition, negative for deduction
  reason: string;
  notes?: string;
}

export interface FlagReaderDto {
  reason: string;
  notes?: string;
}

export interface UnflagReaderDto {
  reason: string;
  notes?: string;
}

export interface AddAdminNoteDto {
  content: string;
}

export interface AdminReaderFilters {
  search?: string;
  status?: 'all' | 'active' | 'suspended' | 'flagged';
  contentPreference?: ContentPreference | 'all';
  minReliabilityScore?: number;
  hasVerifiedAmazon?: boolean;
  limit?: number;
  offset?: number;
}

// ============================================
// API CLIENT METHODS
// ============================================

export const adminReadersApi = {
  /**
   * Get all readers with filters
   */
  async getAllReaders(filters?: AdminReaderFilters): Promise<AdminReaderListItemDto[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.contentPreference && filters.contentPreference !== 'all') {
      params.append('contentPreference', filters.contentPreference);
    }
    if (filters?.minReliabilityScore !== undefined) {
      params.append('minReliabilityScore', filters.minReliabilityScore.toString());
    }
    if (filters?.hasVerifiedAmazon !== undefined) {
      params.append('hasVerifiedAmazon', filters.hasVerifiedAmazon.toString());
    }
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await apiClient.get<AdminReaderListItemDto[]>(
      `/admin/readers?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Get reader stats for admin dashboard
   */
  async getReaderStats(): Promise<AdminReaderStatsDto> {
    const response = await apiClient.get<AdminReaderStatsDto>('/admin/readers/stats');
    return response.data;
  },

  /**
   * Get reader details by ID
   */
  async getReaderDetails(readerProfileId: string): Promise<AdminReaderDetailDto> {
    const response = await apiClient.get<AdminReaderDetailDto>(`/admin/readers/${readerProfileId}`);
    return response.data;
  },

  /**
   * Suspend a reader
   */
  async suspendReader(
    readerProfileId: string,
    data: SuspendReaderDto,
  ): Promise<AdminReaderDetailDto> {
    const response = await apiClient.post<AdminReaderDetailDto>(
      `/admin/readers/${readerProfileId}/suspend`,
      data,
    );
    return response.data;
  },

  /**
   * Unsuspend a reader
   */
  async unsuspendReader(
    readerProfileId: string,
    data: UnsuspendReaderDto,
  ): Promise<AdminReaderDetailDto> {
    const response = await apiClient.post<AdminReaderDetailDto>(
      `/admin/readers/${readerProfileId}/unsuspend`,
      data,
    );
    return response.data;
  },

  /**
   * Adjust reader wallet balance
   */
  async adjustWallet(
    readerProfileId: string,
    data: AdjustWalletDto,
  ): Promise<AdminReaderDetailDto> {
    const response = await apiClient.post<AdminReaderDetailDto>(
      `/admin/readers/${readerProfileId}/adjust-wallet`,
      data,
    );
    return response.data;
  },

  /**
   * Flag a reader for issues
   */
  async flagReader(readerProfileId: string, data: FlagReaderDto): Promise<AdminReaderDetailDto> {
    const response = await apiClient.post<AdminReaderDetailDto>(
      `/admin/readers/${readerProfileId}/flag`,
      data,
    );
    return response.data;
  },

  /**
   * Remove flag from reader
   */
  async unflagReader(
    readerProfileId: string,
    data: UnflagReaderDto,
  ): Promise<AdminReaderDetailDto> {
    const response = await apiClient.post<AdminReaderDetailDto>(
      `/admin/readers/${readerProfileId}/unflag`,
      data,
    );
    return response.data;
  },

  /**
   * Update admin notes for reader
   */
  async updateAdminNotes(
    readerProfileId: string,
    data: { adminNotes: string },
  ): Promise<AdminReaderDetailDto> {
    const response = await apiClient.patch<AdminReaderDetailDto>(
      `/admin/readers/${readerProfileId}/notes`,
      data,
    );
    return response.data;
  },

  /**
   * Verify Amazon profile manually
   */
  async verifyAmazonProfile(
    readerProfileId: string,
    amazonProfileId: string,
  ): Promise<AdminReaderDetailDto> {
    const response = await apiClient.post<AdminReaderDetailDto>(
      `/admin/readers/${readerProfileId}/amazon-profiles/${amazonProfileId}/verify`,
    );
    return response.data;
  },

  /**
   * Get reader review history
   */
  async getReaderReviewHistory(
    readerProfileId: string,
    limit?: number,
    offset?: number,
  ): Promise<{
    reviews: {
      id: string;
      bookId: string;
      bookTitle: string;
      rating: number;
      status: string;
      submittedAt: string;
      validatedAt?: string;
    }[];
    total: number;
  }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const response = await apiClient.get(
      `/admin/readers/${readerProfileId}/reviews?${params.toString()}`,
    );
    return response.data;
  },
};
