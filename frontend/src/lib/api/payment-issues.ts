import { apiClient } from './client';

// ============================================
// TYPE DEFINITIONS (Match backend DTOs exactly)
// ============================================

export enum PaymentIssueType {
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_DISPUTE = 'PAYMENT_DISPUTE',
  REFUND_REQUEST = 'REFUND_REQUEST',
  PAYOUT_ISSUE = 'PAYOUT_ISSUE',
  DUPLICATE_PAYMENT = 'DUPLICATE_PAYMENT',
  CREDIT_MISMATCH = 'CREDIT_MISMATCH',
  OTHER = 'OTHER',
}

export enum PaymentIssueStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
}

export enum PaymentIssueAction {
  REFUNDED = 'REFUNDED',
  CORRECTED = 'CORRECTED',
  RECONCILED = 'RECONCILED',
  CREDITED = 'CREDITED',
  NO_ACTION = 'NO_ACTION',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
  PENDING_STRIPE = 'PENDING_STRIPE',
}

export enum PaymentIssuePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface CreatePaymentIssueDto {
  type: PaymentIssueType;
  userId: string;
  amount: number;
  currency?: string;
  description: string;
  stripePaymentId?: string;
  priority?: PaymentIssuePriority;
}

export interface ResolvePaymentIssueDto {
  resolution: string;
  action: PaymentIssueAction;
  stripeRefundId?: string;
}

export interface ProcessRefundDto {
  amount: number;
  reason: string;
}

export interface UpdatePaymentIssueStatusDto {
  status: PaymentIssueStatus;
  adminNotes?: string;
}

export interface PaymentIssueResponse {
  id: string;
  userId: string;
  userRole: string;
  type: PaymentIssueType;
  amount: number;
  currency: string;
  description: string;
  stripePaymentId?: string;
  stripeRefundId?: string;
  status: PaymentIssueStatus;
  priority: PaymentIssuePriority;
  resolution?: string;
  actionTaken?: PaymentIssueAction;
  resolvedBy?: string;
  resolvedAt?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentIssueStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  totalAmount: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface GetPaymentIssuesQuery {
  status?: PaymentIssueStatus;
  type?: PaymentIssueType;
  priority?: PaymentIssuePriority;
  userId?: string;
}

// ============================================
// API CLIENT METHODS
// ============================================

export const paymentIssuesApi = {
  /**
   * Create a new payment issue
   */
  async createPaymentIssue(data: CreatePaymentIssueDto): Promise<PaymentIssueResponse> {
    const response = await apiClient.post<PaymentIssueResponse>('/admin/payment-issues', data);
    return response.data;
  },

  /**
   * Get all payment issues with optional filters
   */
  async getPaymentIssues(query?: GetPaymentIssuesQuery): Promise<PaymentIssueResponse[]> {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.type) params.append('type', query.type);
    if (query?.priority) params.append('priority', query.priority);
    if (query?.userId) params.append('userId', query.userId);

    const response = await apiClient.get<PaymentIssueResponse[]>(
      `/admin/payment-issues${params.toString() ? `?${params.toString()}` : ''}`,
    );
    return response.data;
  },

  /**
   * Get all open payment issues
   */
  async getOpenPaymentIssues(): Promise<PaymentIssueResponse[]> {
    const response = await apiClient.get<PaymentIssueResponse[]>('/admin/payment-issues/open');
    return response.data;
  },

  /**
   * Get payment issue statistics
   */
  async getPaymentIssueStats(): Promise<PaymentIssueStats> {
    const response = await apiClient.get<PaymentIssueStats>('/admin/payment-issues/stats');
    return response.data;
  },

  /**
   * Get payment issue by ID
   */
  async getPaymentIssueById(issueId: string): Promise<PaymentIssueResponse> {
    const response = await apiClient.get<PaymentIssueResponse>(`/admin/payment-issues/${issueId}`);
    return response.data;
  },

  /**
   * Resolve a payment issue
   */
  async resolvePaymentIssue(
    issueId: string,
    data: ResolvePaymentIssueDto,
  ): Promise<PaymentIssueResponse> {
    const response = await apiClient.put<PaymentIssueResponse>(
      `/admin/payment-issues/${issueId}/resolve`,
      data,
    );
    return response.data;
  },

  /**
   * Process a refund for a payment issue
   */
  async processRefund(issueId: string, data: ProcessRefundDto): Promise<PaymentIssueResponse> {
    const response = await apiClient.put<PaymentIssueResponse>(
      `/admin/payment-issues/${issueId}/refund`,
      data,
    );
    return response.data;
  },

  /**
   * Reconcile a payment issue
   */
  async reconcilePayment(issueId: string, notes: string): Promise<PaymentIssueResponse> {
    const response = await apiClient.put<PaymentIssueResponse>(
      `/admin/payment-issues/${issueId}/reconcile`,
      { notes },
    );
    return response.data;
  },

  /**
   * Update payment issue status
   */
  async updatePaymentIssueStatus(
    issueId: string,
    data: UpdatePaymentIssueStatusDto,
  ): Promise<PaymentIssueResponse> {
    const response = await apiClient.put<PaymentIssueResponse>(
      `/admin/payment-issues/${issueId}/status`,
      data,
    );
    return response.data;
  },
};
