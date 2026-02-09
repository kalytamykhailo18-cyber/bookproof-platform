import { apiClient } from './client';

// ============================================
// TYPE DEFINITIONS (Match backend DTOs exactly)
// ============================================

export interface SuspendAuthorDto {
  reason: string;
  notes?: string;
}

export interface UnsuspendAuthorDto {
  reason: string;
  notes?: string;
}

export interface UpdateAuthorNotesDto {
  adminNotes: string;
}

// ============================================
// API CLIENT METHODS
// ============================================

export const adminAuthorsApi = {
  /**
   * Suspend an author
   */
  async suspendAuthor(authorProfileId: string, data: SuspendAuthorDto): Promise<any> {
    const response = await apiClient.post(
      `/admin/authors/${authorProfileId}/suspend`,
      data,
    );
    return response.data;
  },

  /**
   * Unsuspend an author
   */
  async unsuspendAuthor(authorProfileId: string, data: UnsuspendAuthorDto): Promise<any> {
    const response = await apiClient.post(
      `/admin/authors/${authorProfileId}/unsuspend`,
      data,
    );
    return response.data;
  },

  /**
   * Update admin notes for author
   */
  async updateAdminNotes(authorProfileId: string, data: UpdateAuthorNotesDto): Promise<any> {
    const response = await apiClient.patch(
      `/admin/authors/${authorProfileId}/notes`,
      data,
    );
    return response.data;
  },
};
