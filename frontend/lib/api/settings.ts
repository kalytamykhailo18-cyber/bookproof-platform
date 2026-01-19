import { apiClient } from './client';

// ============================================
// TYPE DEFINITIONS (Match backend DTOs exactly)
// ============================================

export interface SettingResponse {
  id: string;
  category: string;
  key: string;
  value: string;
  dataType: string;
  description?: string;
  isPublic: boolean;
  isEditable: boolean;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KeywordPricingResponse {
  price: number;
  currency: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface PricingSettingsResponse {
  keywordResearch: KeywordPricingResponse;
}

export interface UpdateSettingData {
  value: string;
  reason?: string;
}

export interface UpdateKeywordPricingData {
  price: number;
  reason?: string;
}

export interface KeywordResearchFeatureStatusResponse {
  enabled: boolean;
  updatedAt: string;
  updatedBy?: string;
}

export interface UpdateKeywordResearchFeatureData {
  enabled: boolean;
  reason?: string;
}

// ============================================
// API CLIENT METHODS
// ============================================

export const settingsApi = {
  // Admin endpoints
  async getAllSettings(): Promise<SettingResponse[]> {
    const response = await apiClient.get<SettingResponse[]>('/settings/admin/all');
    return response.data;
  },

  async getSettingsByCategory(category: string): Promise<SettingResponse[]> {
    const response = await apiClient.get<SettingResponse[]>(`/settings/admin/category/${category}`);
    return response.data;
  },

  async updateSetting(key: string, data: UpdateSettingData): Promise<SettingResponse> {
    const response = await apiClient.put<SettingResponse>(`/settings/admin/${key}`, data);
    return response.data;
  },

  async getPricingSettings(): Promise<PricingSettingsResponse> {
    const response = await apiClient.get<PricingSettingsResponse>('/settings/admin/pricing');
    return response.data;
  },

  async getKeywordResearchPricing(): Promise<KeywordPricingResponse> {
    const response = await apiClient.get<KeywordPricingResponse>(
      '/settings/admin/pricing/keyword-research',
    );
    return response.data;
  },

  async updateKeywordResearchPricing(
    data: UpdateKeywordPricingData,
  ): Promise<KeywordPricingResponse> {
    const response = await apiClient.put<KeywordPricingResponse>(
      '/settings/admin/pricing/keyword-research',
      data,
    );
    return response.data;
  },

  // Feature toggle endpoints (Admin only)
  async getKeywordResearchFeatureStatus(): Promise<KeywordResearchFeatureStatusResponse> {
    const response = await apiClient.get<KeywordResearchFeatureStatusResponse>(
      '/settings/admin/features/keyword-research',
    );
    return response.data;
  },

  async updateKeywordResearchFeature(
    data: UpdateKeywordResearchFeatureData,
  ): Promise<KeywordResearchFeatureStatusResponse> {
    const response = await apiClient.put<KeywordResearchFeatureStatusResponse>(
      '/settings/admin/features/keyword-research',
      data,
    );
    return response.data;
  },

  // Public endpoints (for author checkout display)
  async getPublicKeywordResearchPricing(): Promise<KeywordPricingResponse> {
    const response = await apiClient.get<KeywordPricingResponse>(
      '/settings/pricing/keyword-research',
    );
    return response.data;
  },

  async getPublicKeywordResearchFeatureStatus(): Promise<{ enabled: boolean }> {
    const response = await apiClient.get<{ enabled: boolean }>(
      '/settings/features/keyword-research',
    );
    return response.data;
  },
};
