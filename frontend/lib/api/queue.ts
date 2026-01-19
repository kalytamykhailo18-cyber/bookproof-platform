import { apiClient } from './client';
import { BookFormat, Language } from './campaigns';

// Re-export for convenience
export { BookFormat, Language };

// Types matching backend DTOs
export enum AssignmentStatus {
  WAITING = 'WAITING',
  SCHEDULED = 'SCHEDULED',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  VALIDATED = 'VALIDATED',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  REASSIGNED = 'REASSIGNED',
}

export interface AssignmentBook {
  id: string;
  title: string;
  authorName: string;
  genre: string;
  coverImageUrl?: string;
  synopsis: string;
  synopsisFileUrl?: string;
  availableFormats: BookFormat;
}

/**
 * Reader-facing Assignment type
 *
 * IMPORTANT: Per Rule 2 - "Buffer is completely invisible to authors"
 * This also applies to readers - they should NOT know if they are a buffer assignment.
 * The isBufferAssignment field is intentionally NOT included here.
 */
export interface Assignment {
  id: string;
  bookId: string;
  book: AssignmentBook;
  readerProfileId: string;
  status: AssignmentStatus;
  formatAssigned: BookFormat;
  creditsValue: number;
  queuePosition?: number;
  scheduledWeek?: number;
  scheduledDate?: Date;
  materialsReleasedAt?: Date;
  deadlineAt?: Date;
  hoursRemaining?: number;
  // NOTE: isBufferAssignment intentionally NOT included per Rule 2
  ebookFileUrl?: string;
  audioBookStreamUrl?: string;
  ebookDownloadedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailableCampaign {
  id: string;
  title: string;
  authorName: string;
  synopsis: string;
  language: Language;
  genre: string;
  category: string;
  coverImageUrl?: string;
  availableFormats: BookFormat;
  // NOTE: targetReviews, totalReviewsDelivered, reviewsPerWeek removed
  // Per requirement: "Readers cannot see total campaign scope or author information"
  status: string;
  hasApplied: boolean;
  estimatedQueuePosition?: number;
  estimatedWeek?: number;
  pageCount?: number;
  audioBookDuration?: number;
  createdAt: Date;
}

export interface ApplyToCampaignRequest {
  bookId: string;
  formatPreference?: BookFormat;
  amazonProfileId?: string;
}

export const queueApi = {
  /**
   * Get all available campaigns for readers
   */
  getAvailableCampaigns: async (): Promise<AvailableCampaign[]> => {
    const response = await apiClient.get<AvailableCampaign[]>('/queue/available-campaigns');
    return response.data;
  },

  /**
   * Apply to campaign (enters WAITING status)
   */
  applyToCampaign: async (data: ApplyToCampaignRequest): Promise<Assignment> => {
    const response = await apiClient.post<Assignment>('/queue/apply', data);
    return response.data;
  },

  /**
   * Get all my assignments
   */
  getMyAssignments: async (): Promise<Assignment[]> => {
    const response = await apiClient.get<Assignment[]>('/queue/my-assignments');
    return response.data;
  },

  /**
   * Get assignment details by ID
   */
  getAssignment: async (assignmentId: string): Promise<Assignment> => {
    const response = await apiClient.get<Assignment>(`/queue/assignments/${assignmentId}`);
    return response.data;
  },

  /**
   * Withdraw from assignment (only if WAITING or SCHEDULED)
   */
  withdrawFromAssignment: async (assignmentId: string): Promise<void> => {
    await apiClient.delete(`/queue/assignments/${assignmentId}/withdraw`);
  },

  /**
   * Track ebook download and mark assignment as IN_PROGRESS
   */
  trackEbookDownload: async (assignmentId: string): Promise<void> => {
    await apiClient.post(`/queue/assignments/${assignmentId}/track-ebook-download`);
  },

  /**
   * Track audiobook access and mark assignment as IN_PROGRESS
   */
  trackAudiobookAccess: async (assignmentId: string): Promise<void> => {
    await apiClient.post(`/queue/assignments/${assignmentId}/track-audiobook-access`);
  },
};
