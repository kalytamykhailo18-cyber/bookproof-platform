import { apiClient } from './client';

// Enums
export enum PaymentMethod {
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WISE = 'WISE',
  CRYPTO = 'CRYPTO',
}

export enum CommissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum PayoutRequestStatus {
  REQUESTED = 'REQUESTED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum PayoutAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  COMPLETE = 'COMPLETE',
}

export enum MarketingMaterialType {
  BANNER_IMAGE = 'BANNER_IMAGE',
  SOCIAL_POST = 'SOCIAL_POST',
  EMAIL_TEMPLATE = 'EMAIL_TEMPLATE',
  PROMOTIONAL_COPY = 'PROMOTIONAL_COPY',
  VIDEO = 'VIDEO',
  INFOGRAPHIC = 'INFOGRAPHIC',
  LANDING_PAGE_TEMPLATE = 'LANDING_PAGE_TEMPLATE',
}

export enum Language {
  EN = 'EN',
  PT = 'PT',
  ES = 'ES',
}

// DTOs
export interface RegisterAffiliateDto {
  websiteUrl: string;
  socialMediaUrls?: string;
  promotionPlan: string;
  estimatedReach?: string;
  customSlug?: string;
}

export interface ApproveAffiliateDto {
  approve: boolean;
  rejectionReason?: string;
  commissionRate?: number;
}

export interface TrackClickDto {
  referralCode: string;
  landingPage?: string;
  refererUrl?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface RequestPayoutDto {
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDetails: string;
  notes?: string;
}

export interface ProcessPayoutDto {
  action: PayoutAction;
  rejectionReason?: string;
  transactionId?: string;
  notes?: string;
}

// Response DTOs
export interface AffiliateStatsDto {
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalEarnings: number;
  pendingEarnings: number;
  approvedEarnings: number;
  paidEarnings: number;
  totalReferrals: number;
  activeReferrals: number;
}

export interface AffiliateProfileResponseDto {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  referralCode: string;
  customSlug?: string;
  commissionRate: number;
  lifetimeCommission: boolean;
  isActive: boolean;
  isApproved: boolean;
  approvedAt?: Date;
  websiteUrl?: string;
  socialMediaUrls?: string;
  promotionPlan?: string;
  estimatedReach?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  stats?: AffiliateStatsDto;
}

export interface AffiliateListItemDto {
  id: string;
  userEmail: string;
  userName: string;
  referralCode: string;
  commissionRate: number;
  totalEarnings: number;
  approvedEarnings: number;
  totalClicks: number;
  totalConversions: number;
  isApproved: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface CommissionResponseDto {
  id: string;
  affiliateProfileId: string;
  creditPurchaseId: string;
  referredAuthorId: string;
  purchaseAmount: number;
  commissionAmount: number;
  commissionRate: number;
  status: CommissionStatus;
  pendingUntil?: Date;
  approvedAt?: Date;
  paidAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommissionListItemDto {
  id: string;
  purchaseAmount: number;
  commissionAmount: number;
  status: CommissionStatus;
  createdAt: Date;
  approvedAt?: Date;
}

export interface PayoutResponseDto {
  id: string;
  affiliateProfileId: string;
  amount: number;
  status: PayoutRequestStatus;
  paymentMethod: string;
  paymentDetailsMasked?: string;
  processedBy?: string;
  processedAt?: Date;
  rejectionReason?: string;
  notes?: string;
  transactionId?: string;
  paidAt?: Date;
  requestedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  // Nested data included for admin payouts list
  affiliateProfile?: {
    user?: {
      id: string;
      email: string;
      name: string;
    };
  };
}

export interface PayoutListItemDto {
  id: string;
  amount: number;
  status: PayoutRequestStatus;
  paymentMethod: string;
  requestedAt: Date;
  processedAt?: Date;
  paidAt?: Date;
}

// Marketing Materials DTOs
export interface MarketingMaterialResponseDto {
  id: string;
  title: string;
  description?: string;
  type: MarketingMaterialType;
  fileUrl?: string;
  thumbnailUrl?: string;
  content?: string;
  language: Language;
  isActive: boolean;
  displayOrder: number;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMarketingMaterialDto {
  title: string;
  description?: string;
  type: MarketingMaterialType;
  fileUrl?: string;
  thumbnailUrl?: string;
  content?: string;
  language: Language;
  displayOrder?: number;
}

export interface UpdateMarketingMaterialDto {
  title?: string;
  description?: string;
  type?: MarketingMaterialType;
  fileUrl?: string;
  thumbnailUrl?: string;
  content?: string;
  language?: Language;
  isActive?: boolean;
  displayOrder?: number;
}

export interface GetMarketingMaterialsQueryDto {
  type?: MarketingMaterialType;
  language?: Language;
  includeInactive?: boolean;
}

// API Client
export const affiliatesApi = {
  // Public/Authenticated endpoints
  register: async (data: RegisterAffiliateDto): Promise<AffiliateProfileResponseDto> => {
    const response = await apiClient.post<AffiliateProfileResponseDto>(
      '/affiliates/register',
      data,
    );
    return response.data;
  },

  trackClick: async (data: TrackClickDto): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      '/affiliates/track-click',
      data,
    );
    return response.data;
  },

  // Affiliate endpoints
  getMe: async (): Promise<AffiliateProfileResponseDto> => {
    const response = await apiClient.get<AffiliateProfileResponseDto>('/affiliates/me');
    return response.data;
  },

  getStats: async (): Promise<AffiliateStatsDto> => {
    const response = await apiClient.get<AffiliateStatsDto>('/affiliates/stats');
    return response.data;
  },

  getReferralLink: async (): Promise<{ referralLink: string }> => {
    const response = await apiClient.get<{ referralLink: string }>('/affiliates/referral-link');
    return response.data;
  },

  getCommissions: async (status?: CommissionStatus): Promise<CommissionResponseDto[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get<CommissionResponseDto[]>('/affiliates/commissions', {
      params,
    });
    return response.data;
  },

  requestPayout: async (data: RequestPayoutDto): Promise<PayoutResponseDto> => {
    const response = await apiClient.post<PayoutResponseDto>('/affiliates/payouts/request', data);
    return response.data;
  },

  getPayouts: async (): Promise<PayoutResponseDto[]> => {
    const response = await apiClient.get<PayoutResponseDto[]>('/affiliates/payouts');
    return response.data;
  },

  // Admin endpoints
  getAllForAdmin: async (): Promise<AffiliateListItemDto[]> => {
    const response = await apiClient.get<AffiliateListItemDto[]>('/affiliates/admin/all');
    return response.data;
  },

  getByIdForAdmin: async (id: string): Promise<AffiliateProfileResponseDto> => {
    const response = await apiClient.get<AffiliateProfileResponseDto>(`/affiliates/admin/${id}`);
    return response.data;
  },

  approveAffiliate: async (
    id: string,
    data: ApproveAffiliateDto,
  ): Promise<AffiliateProfileResponseDto> => {
    const response = await apiClient.put<AffiliateProfileResponseDto>(
      `/affiliates/admin/${id}/approve`,
      data,
    );
    return response.data;
  },

  getCommissionsForAdmin: async (
    id: string,
    status?: CommissionStatus,
  ): Promise<CommissionResponseDto[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get<CommissionResponseDto[]>(
      `/affiliates/admin/${id}/commissions`,
      { params },
    );
    return response.data;
  },

  getAllPayoutsForAdmin: async (status?: PayoutRequestStatus): Promise<PayoutResponseDto[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get<PayoutResponseDto[]>('/affiliates/admin/payouts/all', {
      params,
    });
    return response.data;
  },

  processPayout: async (id: string, data: ProcessPayoutDto): Promise<PayoutResponseDto> => {
    const response = await apiClient.put<PayoutResponseDto>(
      `/affiliates/admin/payouts/${id}/process`,
      data,
    );
    return response.data;
  },

  toggleAffiliateActive: async (id: string): Promise<AffiliateProfileResponseDto> => {
    const response = await apiClient.put<AffiliateProfileResponseDto>(
      `/affiliates/admin/${id}/toggle-active`,
    );
    return response.data;
  },

  updateCommissionRate: async (
    id: string,
    commissionRate: number,
  ): Promise<AffiliateProfileResponseDto> => {
    const response = await apiClient.put<AffiliateProfileResponseDto>(
      `/affiliates/admin/${id}/commission-rate`,
      { commissionRate },
    );
    return response.data;
  },

  // Marketing Materials endpoints (Affiliate)
  getMarketingMaterials: async (
    query?: GetMarketingMaterialsQueryDto,
  ): Promise<MarketingMaterialResponseDto[]> => {
    const response = await apiClient.get<MarketingMaterialResponseDto[]>(
      '/affiliates/marketing-materials',
      { params: query },
    );
    return response.data;
  },

  getMarketingMaterialById: async (id: string): Promise<MarketingMaterialResponseDto> => {
    const response = await apiClient.get<MarketingMaterialResponseDto>(
      `/affiliates/marketing-materials/${id}`,
    );
    return response.data;
  },

  trackMaterialDownload: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/affiliates/marketing-materials/${id}/track-download`,
    );
    return response.data;
  },

  // Marketing Materials endpoints (Admin)
  getMarketingMaterialsForAdmin: async (
    query?: GetMarketingMaterialsQueryDto,
  ): Promise<MarketingMaterialResponseDto[]> => {
    const response = await apiClient.get<MarketingMaterialResponseDto[]>(
      '/affiliates/admin/marketing-materials',
      { params: query },
    );
    return response.data;
  },

  getMarketingMaterialsStats: async (): Promise<{
    totalMaterials: number;
    activeMaterials: number;
    totalDownloads: number;
    byType: Record<MarketingMaterialType, number>;
    byLanguage: Record<Language, number>;
  }> => {
    const response = await apiClient.get('/affiliates/admin/marketing-materials/stats');
    return response.data;
  },

  createMarketingMaterial: async (
    data: CreateMarketingMaterialDto,
  ): Promise<MarketingMaterialResponseDto> => {
    const response = await apiClient.post<MarketingMaterialResponseDto>(
      '/affiliates/admin/marketing-materials',
      data,
    );
    return response.data;
  },

  updateMarketingMaterial: async (
    id: string,
    data: UpdateMarketingMaterialDto,
  ): Promise<MarketingMaterialResponseDto> => {
    const response = await apiClient.put<MarketingMaterialResponseDto>(
      `/affiliates/admin/marketing-materials/${id}`,
      data,
    );
    return response.data;
  },

  toggleMarketingMaterialActive: async (id: string): Promise<MarketingMaterialResponseDto> => {
    const response = await apiClient.put<MarketingMaterialResponseDto>(
      `/affiliates/admin/marketing-materials/${id}/toggle-active`,
    );
    return response.data;
  },

  deleteMarketingMaterial: async (id: string): Promise<void> => {
    await apiClient.delete(`/affiliates/admin/marketing-materials/${id}`);
  },
};
