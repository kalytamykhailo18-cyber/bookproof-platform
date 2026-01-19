import { apiClient } from './client';

// Types matching backend DTOs
export interface PackageTier {
  id: string;
  name: string;
  credits: number;
  basePrice: number;
  currency: string;
  validityDays: number;
  description?: string;
  isActive: boolean;
  isPopular?: boolean;
  displayOrder: number;
  features?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditPurchase {
  id: string;
  authorProfileId: string;
  credits: number;
  amountPaid: number;
  currency: string;
  validityDays: number;
  purchaseDate: Date;
  activationWindowExpiresAt: Date;
  activated: boolean;
  activatedAt?: Date;
  paymentStatus: string;
  discountApplied?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditBalance {
  totalCreditsPurchased: number;
  totalCreditsUsed: number;
  availableCredits: number;
  activePurchases: number;
  expiringCredits: number;
  nextExpirationDate?: Date;
}

export interface PurchaseCreditRequest {
  packageTierId: string;
  couponCode?: string;
  includeKeywordResearch?: boolean;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

export const creditsApi = {
  /**
   * Get all active package tiers
   */
  getPackageTiers: async (): Promise<PackageTier[]> => {
    const response = await apiClient.get<PackageTier[]>('/credits/packages');
    return response.data;
  },

  /**
   * Get credit balance for authenticated author
   */
  getCreditBalance: async (): Promise<CreditBalance> => {
    const response = await apiClient.get<CreditBalance>('/credits/balance');
    return response.data;
  },

  /**
   * Get purchase history for authenticated author
   */
  getPurchaseHistory: async (): Promise<CreditPurchase[]> => {
    const response = await apiClient.get<CreditPurchase[]>('/credits/purchases');
    return response.data;
  },

  /**
   * Create Stripe checkout session for credit purchase
   */
  createCheckoutSession: async (data: PurchaseCreditRequest): Promise<CheckoutSessionResponse> => {
    const response = await apiClient.post<CheckoutSessionResponse>('/credits/checkout', data);
    return response.data;
  },
};
