import { apiClient } from './client';

// ============================================
// TYPE DEFINITIONS (Match backend DTOs exactly)
// ============================================

export interface ExtendDeadlineDto {
  extensionHours: number;
  reason: string;
  notes?: string;
}

export interface ReassignReaderDto {
  targetBookId: string;
  reason: string;
  notes?: string;
}

export interface BulkReassignDto {
  assignmentIds: string[];
  targetBookId: string;
  reason: string;
  notes?: string;
}

export interface CancelAssignmentDto {
  reason: string;
  refundCredits?: boolean;
  notes?: string;
}

export interface CorrectAssignmentErrorDto {
  errorType: 'WRONG_FORMAT' | 'WRONG_BOOK' | 'DUPLICATE' | 'MISSING_CREDITS' | 'OTHER';
  correctionAction: string;
  description: string;
  notes?: string;
}

export interface BulkReassignResultDto {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  results: Array<{
    assignmentId: string;
    success: boolean;
    error?: string;
  }>;
}

export interface AssignmentExceptionDto {
  id: string;
  bookId: string;
  bookTitle: string;
  readerProfileId: string;
  readerName: string;
  exceptionType: string;
  reason: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
}

// ============================================
// API CLIENT METHODS
// ============================================

export const adminExceptionsApi = {
  /**
   * Extend assignment deadline
   */
  async extendDeadline(assignmentId: string, data: ExtendDeadlineDto): Promise<unknown> {
    const response = await apiClient.post(
      `/admin/assignments/${assignmentId}/extend-deadline`,
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
   * Bulk reassign multiple assignments
   */
  async bulkReassign(data: BulkReassignDto): Promise<BulkReassignResultDto> {
    const response = await apiClient.post<BulkReassignResultDto>(
      `/admin/assignments/bulk-reassign`,
      data,
    );
    return response.data;
  },

  /**
   * Cancel assignment
   */
  async cancelAssignment(assignmentId: string, data: CancelAssignmentDto): Promise<unknown> {
    const response = await apiClient.post(`/admin/assignments/${assignmentId}/cancel`, data);
    return response.data;
  },

  /**
   * Correct assignment error
   */
  async correctError(assignmentId: string, data: CorrectAssignmentErrorDto): Promise<unknown> {
    const response = await apiClient.post(`/admin/assignments/${assignmentId}/correct-error`, data);
    return response.data;
  },

  /**
   * Get assignment exceptions
   */
  async getExceptions(
    bookId?: string,
    readerProfileId?: string,
    limit?: number,
  ): Promise<AssignmentExceptionDto[]> {
    const params = new URLSearchParams();
    if (bookId) params.append('bookId', bookId);
    if (readerProfileId) params.append('readerProfileId', readerProfileId);
    if (limit) params.append('limit', limit.toString());

    const response = await apiClient.get<AssignmentExceptionDto[]>(
      `/admin/assignments/exceptions?${params.toString()}`,
    );
    return response.data;
  },
};
