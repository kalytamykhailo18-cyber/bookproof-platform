import { apiClient } from './client';

// ============================================
// TYPE DEFINITIONS
// ============================================

export enum RefundReason {
  DIDNT_NEED_CREDITS = 'DIDNT_NEED_CREDITS',
  WRONG_PACKAGE = 'WRONG_PACKAGE',
  ACCIDENTAL_PURCHASE = 'ACCIDENTAL_PURCHASE',
  SERVICE_NOT_AS_EXPECTED = 'SERVICE_NOT_AS_EXPECTED',
  OTHER = 'OTHER',
}

export enum RefundRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PARTIALLY_APPROVED = 'PARTIALLY_APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
}

export interface RefundEligibility {
  isEligible: boolean;
  reason?: string;
  daysSincePurchase: number;
  creditsAmount: number;
  creditsUsed: number;
  creditsRemaining: number;
  originalAmount: number;
  hasActiveCampaigns: boolean;
}

export interface RefundRequest {
  id: string;
  creditPurchaseId: string;
  authorProfileId: string;
  authorName: string;
  authorEmail: string;
  originalAmount: number;
  currency: string;
  creditsAmount: number;
  creditsUsed: number;
  creditsRemaining: number;
  purchaseDate: string;
  daysSincePurchase: number;
  isEligible: boolean;
  ineligibilityReason?: string;
  reason: RefundReason;
  explanation?: string;
  status: RefundRequestStatus;
  adminNotes?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
}

export interface CreateRefundRequestDto {
  creditPurchaseId: string;
  reason: RefundReason;
  explanation?: string;
}

export interface AdminRefundDecisionDto {
  decision: 'approve' | 'approve_partial' | 'reject';
  adminNotes?: string;
  refundAmount?: number;
}

// ============================================
// API CLIENT METHODS
// ============================================

export const refundsApi = {
  /**
   * Check refund eligibility for a purchase
   */
  async checkEligibility(creditPurchaseId: string): Promise<RefundEligibility> {
    const response = await apiClient.get<RefundEligibility>(
      `/refunds/eligibility/${creditPurchaseId}`,
    );
    return response.data;
  },

  /**
   * Create a refund request
   */
  async createRequest(data: CreateRefundRequestDto): Promise<RefundRequest> {
    const response = await apiClient.post<RefundRequest>('/refunds/request', data);
    return response.data;
  },

  /**
   * Get all refund requests for the current author
   */
  async getMyRequests(): Promise<RefundRequest[]> {
    const response = await apiClient.get<RefundRequest[]>('/refunds/requests');
    return response.data;
  },

  /**
   * Get a specific refund request
   */
  async getRequest(requestId: string): Promise<RefundRequest> {
    const response = await apiClient.get<RefundRequest>(`/refunds/requests/${requestId}`);
    return response.data;
  },

  /**
   * Cancel a pending refund request
   */
  async cancelRequest(requestId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(`/refunds/requests/${requestId}`);
    return response.data;
  },

  // ==========================================
  // ADMIN METHODS
  // ==========================================

  /**
   * Get all refund requests (admin)
   */
  async getAllRequests(filters?: {
    status?: RefundRequestStatus;
    limit?: number;
    offset?: number;
  }): Promise<{ requests: RefundRequest[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await apiClient.get<{ requests: RefundRequest[]; total: number }>(
      `/refunds/admin/requests?${params.toString()}`,
    );
    return response.data;
  },

  /**
   * Get a specific refund request (admin)
   */
  async getRequestAdmin(requestId: string): Promise<RefundRequest> {
    const response = await apiClient.get<RefundRequest>(`/refunds/admin/requests/${requestId}`);
    return response.data;
  },

  /**
   * Process a refund request (approve/reject)
   */
  async processRequest(
    requestId: string,
    decision: AdminRefundDecisionDto,
  ): Promise<RefundRequest> {
    const response = await apiClient.patch<RefundRequest>(
      `/refunds/admin/requests/${requestId}`,
      decision,
    );
    return response.data;
  },
};
