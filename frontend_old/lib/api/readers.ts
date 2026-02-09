import { apiClient } from './client';

// Types matching backend DTOs
export enum ContentPreference {
  EBOOK = 'EBOOK',
  AUDIOBOOK = 'AUDIOBOOK',
  BOTH = 'BOTH',
}

export interface AmazonProfile {
  id: string;
  profileUrl: string;
  profileName?: string;
  isVerified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
}

export interface ReaderProfile {
  id: string;
  userId: string;
  contentPreference: ContentPreference;
  amazonProfiles: AmazonProfile[];
  walletBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  reviewsCompleted: number;
  reviewsExpired: number;
  reviewsRejected: number;
  averageInternalRating?: number;
  reliabilityScore?: number;
  completionRate?: number;
  reviewsRemovedByAmazon: number;
  removalRate?: number;
  isActive: boolean;
  isFlagged: boolean;
  flagReason?: string;
  preferredGenres: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReaderProfileRequest {
  contentPreference: ContentPreference;
  amazonProfiles?: string[];
  preferredGenres?: string[];
}

export interface UpdateReaderProfileRequest {
  contentPreference?: ContentPreference;
  preferredGenres?: string[];
}

export interface AddAmazonProfileRequest {
  profileUrl: string;
}

export interface ReaderStats {
  totalAssignments: number;
  waitingAssignments: number;
  scheduledAssignments: number;
  activeAssignments: number;
  inProgressAssignments: number;
  submittedAssignments: number;
  completedAssignments: number;
  expiredAssignments: number;
  walletBalance: number;
  totalEarned: number;
  pendingEarnings: number;
  reliabilityScore: number;
  completionRate: number;
  pendingPayouts: number;
}

export const readersApi = {
  /**
   * Create or update reader profile
   */
  createProfile: async (data: CreateReaderProfileRequest): Promise<ReaderProfile> => {
    const response = await apiClient.post<ReaderProfile>('/readers/profile', data);
    return response.data;
  },

  /**
   * Get current reader profile
   */
  getProfile: async (): Promise<ReaderProfile> => {
    const response = await apiClient.get<ReaderProfile>('/readers/profile');
    return response.data;
  },

  /**
   * Update reader profile
   */
  updateProfile: async (data: UpdateReaderProfileRequest): Promise<ReaderProfile> => {
    const response = await apiClient.put<ReaderProfile>('/readers/profile', data);
    return response.data;
  },

  /**
   * Get reader statistics
   */
  getStats: async (): Promise<ReaderStats> => {
    const response = await apiClient.get<ReaderStats>('/readers/stats');
    return response.data;
  },

  /**
   * Add Amazon profile (max 3)
   */
  addAmazonProfile: async (data: AddAmazonProfileRequest): Promise<AmazonProfile> => {
    const response = await apiClient.post<AmazonProfile>('/readers/amazon-profiles', data);
    return response.data;
  },

  /**
   * Remove Amazon profile
   */
  removeAmazonProfile: async (profileId: string): Promise<void> => {
    await apiClient.delete(`/readers/amazon-profiles/${profileId}`);
  },
};
