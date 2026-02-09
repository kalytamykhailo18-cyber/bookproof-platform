import { apiClient } from './client';

// Enums
export enum Language {
  EN = 'EN',
  ES = 'ES',
  PT = 'PT',
}

export enum TargetMarket {
  US = 'US',
  BR = 'BR',
}

export enum KeywordResearchStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

// DTOs
export interface CreateKeywordResearchDto {
  bookId?: string; // Optional for standalone purchases
  bookTitle: string;
  bookSubtitle?: string; // Optional subtitle (max 200 chars)
  genre: string;
  category: string;
  description: string;
  targetAudience: string;
  competingBooks?: string;
  specificKeywords?: string;
  bookLanguage: Language;
  targetMarket: TargetMarket;
  additionalNotes?: string;
  couponCode?: string;
  usePendingCredit?: boolean; // Use pending credit from credit checkout purchase
}

export interface UpdateKeywordResearchDto {
  bookTitle?: string;
  bookSubtitle?: string; // Optional subtitle (max 200 chars)
  genre?: string;
  category?: string;
  description?: string;
  targetAudience?: string;
  competingBooks?: string;
  specificKeywords?: string;
  bookLanguage?: Language;
  targetMarket?: TargetMarket;
  additionalNotes?: string;
}

export interface UsageGuideline {
  location: string;
  instruction: string;
  examples: string[];
}

export interface KdpSuggestions {
  backendKeywords: string[];
  instructions?: string;
}

export interface KeywordResearchResponseDto {
  id: string;
  authorProfileId: string;
  bookId?: string; // Optional for standalone purchases
  bookTitle: string;
  bookSubtitle?: string; // Optional subtitle (max 200 chars)
  genre: string;
  category: string;
  description: string;
  targetAudience: string;
  competingBooks?: string;
  specificKeywords?: string;
  bookLanguage: Language;
  targetMarket: TargetMarket;
  additionalNotes?: string;
  primaryKeywords?: string[];
  secondaryKeywords?: string[];
  longTailKeywords?: string[];
  usageGuidelines?: UsageGuideline[];
  kdpSuggestions?: KdpSuggestions;
  pdfUrl?: string;
  pdfFileName?: string;
  pdfGeneratedAt?: Date;
  status: KeywordResearchStatus;
  processingStartedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  price: number;
  paid: boolean;
  paidAt?: Date;
  couponId?: string;
  emailedAt?: Date;
  emailDelivered: boolean;
  downloadCount: number;
  lastDownloadedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface KeywordResearchListItemDto {
  id: string;
  bookTitle: string;
  status: KeywordResearchStatus;
  price: number;
  paid: boolean;
  pdfUrl?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface CreateKeywordResearchCheckoutDto {
  successUrl: string;
  cancelUrl: string;
}

export interface KeywordResearchCheckoutResponseDto {
  sessionId: string;
  checkoutUrl: string;
  keywordResearchId: string;
  amount: number;
  currency: string;
}

// API Client
export const keywordsApi = {
  /**
   * Create keyword research order (Author only)
   */
  create: async (data: CreateKeywordResearchDto): Promise<KeywordResearchResponseDto> => {
    const response = await apiClient.post<KeywordResearchResponseDto>('/keyword-research', data);
    return response.data;
  },

  /**
   * Get all keyword research orders for current author (Author only)
   */
  getAllForAuthor: async (): Promise<KeywordResearchListItemDto[]> => {
    const response = await apiClient.get<KeywordResearchListItemDto[]>('/keyword-research');
    return response.data;
  },

  /**
   * Get all keyword research orders (Admin only)
   */
  getAllForAdmin: async (): Promise<KeywordResearchListItemDto[]> => {
    const response = await apiClient.get<KeywordResearchListItemDto[]>(
      '/keyword-research/admin/all',
    );
    return response.data;
  },

  /**
   * Get keyword research details by ID (Author/Admin)
   */
  getById: async (id: string): Promise<KeywordResearchResponseDto> => {
    const response = await apiClient.get<KeywordResearchResponseDto>(`/keyword-research/${id}`);
    return response.data;
  },

  /**
   * Download PDF (Author/Admin)
   */
  downloadPdf: async (id: string): Promise<{ url: string }> => {
    const response = await apiClient.get<{ url: string }>(`/keyword-research/${id}/download`);
    return response.data;
  },

  /**
   * Update keyword research (Author only, PENDING status only)
   */
  update: async (
    id: string,
    data: UpdateKeywordResearchDto,
  ): Promise<KeywordResearchResponseDto> => {
    const response = await apiClient.patch<KeywordResearchResponseDto>(
      `/keyword-research/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * Regenerate keywords and PDF (Admin only)
   */
  regenerate: async (id: string): Promise<KeywordResearchResponseDto> => {
    const response = await apiClient.post<KeywordResearchResponseDto>(
      `/keyword-research/${id}/regenerate`,
    );
    return response.data;
  },

  /**
   * Create checkout session for keyword research payment (Author only)
   */
  createCheckout: async (
    id: string,
    data: CreateKeywordResearchCheckoutDto,
  ): Promise<KeywordResearchCheckoutResponseDto> => {
    const response = await apiClient.post<KeywordResearchCheckoutResponseDto>(
      `/keyword-research/${id}/checkout`,
      data,
    );
    return response.data;
  },
};
