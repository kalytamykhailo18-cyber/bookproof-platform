import { apiClient } from './client';

// Upload progress callback type
export type UploadProgressCallback = (progress: number) => void;

// Types matching backend DTOs
export enum BookFormat {
  EBOOK = 'EBOOK',
  AUDIOBOOK = 'AUDIOBOOK',
  BOTH = 'BOTH',
}

export enum Language {
  EN = 'EN',
  PT = 'PT',
  ES = 'ES',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CreateCampaignRequest {
  title: string;
  authorName: string;
  asin: string;
  amazonLink: string;
  synopsis: string;
  language: Language;
  genre: string;
  secondaryGenre?: string; // Optional per Section 2.3
  category: string;
  availableFormats: BookFormat;
  targetReviews: number;
  amazonCouponCode?: string;
  requireVerifiedPurchase?: boolean;
  pageCount?: number;
  wordCount?: number;
  seriesName?: string;
  seriesNumber?: number;
  readingInstructions?: string;

  // Landing page fields - Milestone 2.2
  slug?: string;
  landingPageEnabled?: boolean;
  landingPageLanguages?: Language[];
  titleEN?: string;
  titlePT?: string;
  titleES?: string;
  synopsisEN?: string;
  synopsisPT?: string;
  synopsisES?: string;
}

export interface UpdateCampaignRequest extends Partial<CreateCampaignRequest> {}

export interface ActivateCampaignRequest {
  creditsToAllocate: number;
}

/**
 * Author-facing Campaign type
 *
 * IMPORTANT: Per Rule 2 - "Buffer is completely invisible to authors"
 * This type does NOT include:
 * - overBookingEnabled
 * - overBookingPercent
 * - totalAssignedReaders
 *
 * These fields are only available via admin-specific endpoints.
 */
export interface Campaign {
  id: string;
  authorProfileId: string;
  title: string;
  authorName: string;
  asin: string;
  isbn?: string;
  amazonLink: string;
  synopsis: string;
  language: Language;
  genre: string;
  secondaryGenre?: string; // Optional per Section 2.3
  category: string;
  publishedDate?: Date;
  pageCount?: number;
  wordCount?: number;
  seriesName?: string;
  seriesNumber?: number;
  availableFormats: BookFormat;
  ebookFileUrl?: string;
  ebookFileName?: string;
  ebookFileSize?: number;
  audioBookFileUrl?: string;
  audioBookFileName?: string;
  audioBookFileSize?: number;
  audioBookDuration?: number;
  coverImageUrl?: string;
  synopsisFileUrl?: string;
  synopsisFileName?: string;
  creditsAllocated: number;
  creditsUsed: number;
  creditsRemaining: number;
  targetReviews: number;
  reviewsPerWeek: number;
  weeklyDistribution?: boolean;
  currentWeek?: number;
  status: CampaignStatus;
  campaignStartDate?: Date;
  campaignEndDate?: Date;
  expectedEndDate?: Date;
  amazonCouponCode?: string;
  requireVerifiedPurchase?: boolean;
  // NOTE: Buffer fields (overBookingEnabled, overBookingPercent, totalAssignedReaders)
  // are intentionally NOT included per Rule 2 - invisible to authors
  totalReviewsDelivered: number;
  totalReviewsValidated: number;
  totalReviewsRejected: number;
  totalReviewsExpired: number;
  totalReviewsPending: number;
  averageInternalRating?: number;
  manualDistributionOverride?: boolean;
  distributionPausedAt?: Date;
  distributionResumedAt?: Date;
  readingInstructions?: string;

  // Landing page fields - Milestone 2.2
  slug?: string;
  landingPageEnabled?: boolean;
  landingPageLanguages?: Language[];
  publicUrls?: Record<string, string>; // { EN: 'https://...', PT: '...' }
  titleEN?: string;
  titlePT?: string;
  titleES?: string;
  synopsisEN?: string;
  synopsisPT?: string;
  synopsisES?: string;
  totalPublicViews?: number;
  totalENViews?: number;
  totalPTViews?: number;
  totalESViews?: number;
  totalUniqueVisitors?: number;
  uniqueENVisitors?: number;
  uniquePTVisitors?: number;
  uniqueESVisitors?: number;
  lastViewedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const campaignsApi = {
  /**
   * Create new campaign in DRAFT status
   */
  createCampaign: async (data: CreateCampaignRequest): Promise<Campaign> => {
    const response = await apiClient.post<Campaign>('/campaigns', data);
    return response.data;
  },

  /**
   * Get all campaigns for authenticated author
   */
  getCampaigns: async (): Promise<Campaign[]> => {
    const response = await apiClient.get<Campaign[]>('/campaigns');
    return response.data;
  },

  /**
   * Get campaign by ID
   */
  getCampaign: async (id: string): Promise<Campaign> => {
    const response = await apiClient.get<Campaign>(`/campaigns/${id}`);
    return response.data;
  },

  /**
   * Update campaign (DRAFT only)
   */
  updateCampaign: async (id: string, data: UpdateCampaignRequest): Promise<Campaign> => {
    const response = await apiClient.put<Campaign>(`/campaigns/${id}`, data);
    return response.data;
  },

  /**
   * Delete campaign (DRAFT only)
   */
  deleteCampaign: async (id: string): Promise<void> => {
    await apiClient.delete(`/campaigns/${id}`);
  },

  /**
   * Activate campaign and allocate credits
   */
  activateCampaign: async (id: string, data: ActivateCampaignRequest): Promise<Campaign> => {
    const response = await apiClient.post<Campaign>(`/campaigns/${id}/activate`, data);
    return response.data;
  },

  /**
   * Pause an active campaign
   */
  pauseCampaign: async (id: string): Promise<Campaign> => {
    const response = await apiClient.post<Campaign>(`/campaigns/${id}/pause`);
    return response.data;
  },

  /**
   * Resume a paused campaign
   */
  resumeCampaign: async (id: string): Promise<Campaign> => {
    const response = await apiClient.post<Campaign>(`/campaigns/${id}/resume`);
    return response.data;
  },

  /**
   * Upload ebook file with progress tracking
   */
  uploadEbook: async (
    id: string,
    file: File,
    onProgress?: UploadProgressCallback,
  ): Promise<Campaign> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<Campaign>(`/campaigns/${id}/files/ebook`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress
        ? (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              onProgress(percentCompleted);
            }
          }
        : undefined,
    });
    return response.data;
  },

  /**
   * Upload audiobook file with progress tracking
   * Supports large files up to 500MB
   */
  uploadAudiobook: async (
    id: string,
    file: File,
    onProgress?: UploadProgressCallback,
  ): Promise<Campaign> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<Campaign>(`/campaigns/${id}/files/audiobook`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Extended timeout for large audiobook files (10 minutes)
      timeout: 600000,
      onUploadProgress: onProgress
        ? (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              onProgress(percentCompleted);
            }
          }
        : undefined,
    });
    return response.data;
  },

  /**
   * Upload cover image with progress tracking
   */
  uploadCover: async (
    id: string,
    file: File,
    onProgress?: UploadProgressCallback,
  ): Promise<Campaign> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<Campaign>(`/campaigns/${id}/files/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress
        ? (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              onProgress(percentCompleted);
            }
          }
        : undefined,
    });
    return response.data;
  },

  /**
   * Upload synopsis PDF document with progress tracking
   *
   * Per requirements: Synopsis can be PDF or text (max 3 pages).
   * This uploads the optional PDF version alongside the text synopsis.
   */
  uploadSynopsis: async (
    id: string,
    file: File,
    onProgress?: UploadProgressCallback,
  ): Promise<Campaign> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<Campaign>(`/campaigns/${id}/files/synopsis`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress
        ? (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total,
              );
              onProgress(percentCompleted);
            }
          }
        : undefined,
    });
    return response.data;
  },
};

// ===============================================
// PUBLIC CAMPAIGNS API - Milestone 2.2 & 2.3
// ===============================================

/**
 * Public Campaign interface (for public landing pages)
 */
export interface PublicCampaign {
  id: string;
  title: string;
  authorName: string;
  synopsis: string;
  genre: string;
  category: string;
  availableFormats: BookFormat;
  coverImageUrl?: string;
  pageCount?: number;
  audiobookDurationMinutes?: number;
  seriesName?: string;
  seriesNumber?: number;
  status: CampaignStatus;
  slug: string;
  viewingLanguage: Language;
  availableLanguages: Language[];
  amazonLink: string;
  asin?: string;
  readingInstructions?: string;
  // Availability information - Milestone 2.2
  totalSpots: number;
  spotsTaken: number;
  spotsRemaining: number;
  acceptingRegistrations: boolean;
}

export const publicCampaignsApi = {
  /**
   * Get public campaign by slug and language
   * No authentication required
   */
  getPublicCampaign: async (slug: string, language: string): Promise<PublicCampaign> => {
    const response = await apiClient.get<PublicCampaign>(`/public/campaigns/${slug}/${language}`);
    return response.data;
  },

  /**
   * Track view on campaign landing page
   * No authentication required
   */
  trackView: async (slug: string, language: Language): Promise<void> => {
    await apiClient.post(`/public/campaigns/${slug}/track-view`, { language });
  },
};
