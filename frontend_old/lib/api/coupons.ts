import { apiClient } from './client';

// Enums
export enum CouponType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_ADDON = 'FREE_ADDON',
}

export enum CouponAppliesTo {
  CREDITS = 'CREDITS',
  KEYWORD_RESEARCH = 'KEYWORD_RESEARCH',
  ALL = 'ALL',
}

// DTOs
export interface CreateCouponDto {
  code: string;
  type: CouponType;
  appliesTo: CouponAppliesTo;
  discountPercent?: number;
  discountAmount?: number;
  minimumPurchase?: number;
  minimumCredits?: number;
  maxUses?: number;
  maxUsesPerUser: number;
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
  purpose?: string;
}

export interface UpdateCouponDto {
  type?: CouponType;
  appliesTo?: CouponAppliesTo;
  discountPercent?: number;
  discountAmount?: number;
  minimumPurchase?: number;
  minimumCredits?: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  isActive?: boolean;
  validFrom?: string;
  validUntil?: string;
  purpose?: string;
}

export interface ValidateCouponDto {
  code: string;
  purchaseAmount?: number;
  credits?: number;
}

export interface CouponResponseDto {
  id: string;
  code: string;
  type: CouponType;
  appliesTo: CouponAppliesTo;
  discountPercent?: number;
  discountAmount?: number;
  minimumPurchase?: number;
  minimumCredits?: number;
  maxUses?: number;
  maxUsesPerUser: number;
  currentUses: number;
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
  createdBy: string;
  purpose?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidationResponseDto {
  valid: boolean;
  coupon?: CouponResponseDto;
  error?: string;
  discountAmount?: number;
  finalPrice?: number;
}

export interface CouponUsageDto {
  id: string;
  couponId: string;
  userId: string;
  userEmail: string;
  discountApplied: number;
  usedAt: string;
  creditPurchaseId?: string;
  keywordResearchId?: string;
}

export interface CouponUsageStatsDto {
  couponId: string;
  code: string;
  totalUses: number;
  uniqueUsers: number;
  totalDiscountGiven: number;
  totalRevenue: number;
  usageByDate: Record<string, number>;
  recentUsages: CouponUsageDto[];
}

export interface ManualApplyCouponDto {
  couponCode: string;
  userId: string;
  creditPurchaseId?: string;
  keywordResearchId?: string;
  adminNote?: string;
}

// API Client
export const couponsApi = {
  /**
   * Create a new coupon (Admin only)
   */
  create: async (data: CreateCouponDto): Promise<CouponResponseDto> => {
    const response = await apiClient.post<CouponResponseDto>('/coupons', data);
    return response.data;
  },

  /**
   * Get all coupons (Admin only)
   */
  getAll: async (filters?: {
    isActive?: boolean;
    appliesTo?: CouponAppliesTo;
  }): Promise<CouponResponseDto[]> => {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) {
      params.append('isActive', String(filters.isActive));
    }
    if (filters?.appliesTo) {
      params.append('appliesTo', filters.appliesTo);
    }

    const response = await apiClient.get<CouponResponseDto[]>(`/coupons?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a coupon by ID (Admin only)
   */
  getById: async (id: string): Promise<CouponResponseDto> => {
    const response = await apiClient.get<CouponResponseDto>(`/coupons/${id}`);
    return response.data;
  },

  /**
   * Update a coupon (Admin only)
   */
  update: async (id: string, data: UpdateCouponDto): Promise<CouponResponseDto> => {
    const response = await apiClient.put<CouponResponseDto>(`/coupons/${id}`, data);
    return response.data;
  },

  /**
   * Delete a coupon (Admin only)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/coupons/${id}`);
  },

  /**
   * Validate a coupon
   */
  validate: async (data: ValidateCouponDto): Promise<CouponValidationResponseDto> => {
    const response = await apiClient.post<CouponValidationResponseDto>('/coupons/validate', data);
    return response.data;
  },

  /**
   * Get coupon usage statistics (Admin only)
   */
  getUsageStats: async (id: string): Promise<CouponUsageStatsDto> => {
    const response = await apiClient.get<CouponUsageStatsDto>(`/coupons/${id}/usage`);
    return response.data;
  },

  /**
   * Manually apply a coupon (Admin only)
   */
  manualApply: async (data: ManualApplyCouponDto): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/coupons/manual-apply', data);
    return response.data;
  },
};
