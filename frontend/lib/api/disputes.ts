import { apiClient } from './client';

// ============================================
// TYPE DEFINITIONS (Match backend DTOs exactly)
// ============================================

export enum DisputeType {
  AUTHOR_DISPUTE = 'AUTHOR_DISPUTE',
  AUTHOR_COMPLAINT = 'AUTHOR_COMPLAINT',
  READER_COMPLAINT = 'READER_COMPLAINT',
  REVIEW_QUALITY = 'REVIEW_QUALITY',
  PAYMENT_ISSUE = 'PAYMENT_ISSUE',
  SERVICE_ISSUE = 'SERVICE_ISSUE',
  POLICY_VIOLATION = 'POLICY_VIOLATION',
  OTHER = 'OTHER',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  ESCALATED = 'ESCALATED',
  REJECTED = 'REJECTED',
}

export enum DisputePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AppealStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface CreateDisputeDto {
  type: DisputeType;
  description: string;
  priority?: DisputePriority;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface ResolveDisputeDto {
  resolution: string;
  status?: DisputeStatus.RESOLVED | DisputeStatus.REJECTED;
}

export interface EscalateDisputeDto {
  reason: string;
}

export interface UpdateDisputeStatusDto {
  status: DisputeStatus;
  adminNotes?: string;
}

export interface FileAppealDto {
  reason: string;
}

export interface ResolveAppealDto {
  approved: boolean;
  resolution: string;
}

export interface SlaStats {
  totalWithSla: number;
  breached: number;
  complianceRate: number;
  averageResponseTimeHours: number;
  byPriority: {
    priority: string;
    total: number;
    breached: number;
    complianceRate: number;
  }[];
}

export interface DisputeResponse {
  id: string;
  userId: string;
  userRole: string;
  type: DisputeType;
  description: string;
  status: DisputeStatus;
  priority: DisputePriority;
  relatedEntityType?: string;
  relatedEntityId?: string;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  escalatedBy?: string;
  escalatedAt?: string;
  escalationReason?: string;
  adminNotes?: string;
  // SLA tracking fields
  firstResponseAt?: string;
  firstResponseBy?: string;
  slaDeadline?: string;
  slaBreached: boolean;
  // Appeal fields
  appealedAt?: string;
  appealReason?: string;
  appealStatus?: AppealStatus;
  appealResolvedBy?: string;
  appealResolvedAt?: string;
  appealResolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DisputeStats {
  total: number;
  open: number;
  inProgress: number;
  escalated: number;
  resolved: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export interface GetDisputesQuery {
  status?: DisputeStatus;
  type?: DisputeType;
  priority?: DisputePriority;
  userId?: string;
}

// ============================================
// API CLIENT METHODS
// ============================================

export const disputesApi = {
  /**
   * Create a new dispute
   */
  async createDispute(data: CreateDisputeDto): Promise<DisputeResponse> {
    const response = await apiClient.post<DisputeResponse>('/admin/disputes', data);
    return response.data;
  },

  /**
   * Get all disputes with optional filters
   */
  async getDisputes(query?: GetDisputesQuery): Promise<DisputeResponse[]> {
    const params = new URLSearchParams();
    if (query?.status) params.append('status', query.status);
    if (query?.type) params.append('type', query.type);
    if (query?.priority) params.append('priority', query.priority);
    if (query?.userId) params.append('userId', query.userId);

    const response = await apiClient.get<DisputeResponse[]>(
      `/admin/disputes${params.toString() ? `?${params.toString()}` : ''}`,
    );
    return response.data;
  },

  /**
   * Get all open disputes
   */
  async getOpenDisputes(): Promise<DisputeResponse[]> {
    const response = await apiClient.get<DisputeResponse[]>('/admin/disputes/open');
    return response.data;
  },

  /**
   * Get dispute statistics
   */
  async getDisputeStats(): Promise<DisputeStats> {
    const response = await apiClient.get<DisputeStats>('/admin/disputes/stats');
    return response.data;
  },

  /**
   * Get dispute by ID
   */
  async getDisputeById(disputeId: string): Promise<DisputeResponse> {
    const response = await apiClient.get<DisputeResponse>(`/admin/disputes/${disputeId}`);
    return response.data;
  },

  /**
   * Resolve a dispute
   */
  async resolveDispute(disputeId: string, data: ResolveDisputeDto): Promise<DisputeResponse> {
    const response = await apiClient.put<DisputeResponse>(
      `/admin/disputes/${disputeId}/resolve`,
      data,
    );
    return response.data;
  },

  /**
   * Escalate a dispute
   */
  async escalateDispute(disputeId: string, data: EscalateDisputeDto): Promise<DisputeResponse> {
    const response = await apiClient.put<DisputeResponse>(
      `/admin/disputes/${disputeId}/escalate`,
      data,
    );
    return response.data;
  },

  /**
   * Update dispute status
   */
  async updateDisputeStatus(
    disputeId: string,
    data: UpdateDisputeStatusDto,
  ): Promise<DisputeResponse> {
    const response = await apiClient.put<DisputeResponse>(
      `/admin/disputes/${disputeId}/status`,
      data,
    );
    return response.data;
  },

  /**
   * Get disputes by user
   */
  async getDisputesByUser(userId: string): Promise<DisputeResponse[]> {
    const response = await apiClient.get<DisputeResponse[]>(`/admin/disputes/user/${userId}`);
    return response.data;
  },

  /**
   * Get SLA compliance statistics
   */
  async getSlaStats(): Promise<SlaStats> {
    const response = await apiClient.get<SlaStats>('/admin/disputes/sla/stats');
    return response.data;
  },

  /**
   * File an appeal on a resolved dispute (one per issue)
   */
  async fileAppeal(disputeId: string, data: FileAppealDto): Promise<DisputeResponse> {
    const response = await apiClient.post<DisputeResponse>(
      `/admin/disputes/${disputeId}/appeal`,
      data,
    );
    return response.data;
  },

  /**
   * Resolve an appeal (admin only)
   */
  async resolveAppeal(disputeId: string, data: ResolveAppealDto): Promise<DisputeResponse> {
    const response = await apiClient.put<DisputeResponse>(
      `/admin/disputes/${disputeId}/appeal/resolve`,
      data,
    );
    return response.data;
  },
};
