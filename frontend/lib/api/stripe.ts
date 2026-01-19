import { apiClient } from './client';

// ============================================
// TYPE DEFINITIONS - PAYMENTS
// ============================================

export interface CreateCheckoutSessionDto {
  packageTierId: string;
  couponCode?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponseDto {
  sessionId: string;
  checkoutUrl: string;
  package: {
    name: string;
    credits: number;
    price: number;
    currency: string;
  };
  coupon?: {
    code: string;
    discountAmount: number;
    discountPercent?: number;
  };
  finalAmount: number;
}

export interface PaymentTransactionDto {
  id: string;
  authorProfileId: string;
  package: {
    id: string;
    name: string;
    credits: number;
  };
  amountPaid: number;
  currency: string;
  paymentStatus: string;
  stripePaymentId: string;
  credits: number;
  validityDays: number;
  activationWindowExpiresAt: string;
  coupon?: {
    code: string;
    discountApplied: number;
  };
  purchaseDate: string;
  activated: boolean;
  activatedAt?: string;
}

export interface InvoiceResponseDto {
  id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  createdAt: string;
  paidAt?: string;
  pdfUrl?: string;
  description?: string;
}

// ============================================
// TYPE DEFINITIONS - CUSTOM PACKAGES (PUBLIC)
// ============================================

export interface CustomPackagePublicDto {
  packageName: string;
  description?: string;
  credits: number;
  price: number;
  currency: string;
  validityDays: number;
  specialTerms?: string;
  clientName: string;
  clientEmail: string;
  clientCompany?: string;
  status: string;
  expiresAt?: string;
  isExpired: boolean;
}

export interface CreateCustomPackageCheckoutDto {
  successUrl: string;
  cancelUrl: string;
}

export interface CustomPackageCheckoutResponseDto {
  sessionId: string;
  checkoutUrl: string;
  package: {
    name: string;
    credits: number;
    price: number;
    currency: string;
  };
}

// ============================================
// TYPE DEFINITIONS - SUBSCRIPTIONS
// ============================================

export interface CreateSubscriptionPlanDto {
  planName: string;
  creditsPerMonth: number;
  pricePerMonth: number;
  currency: string;
  description?: string;
}

export interface CreateSubscriptionCheckoutDto {
  stripePriceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface SubscriptionCheckoutResponseDto {
  sessionId: string;
  checkoutUrl: string;
  plan: {
    name: string;
    creditsPerMonth: number;
    pricePerMonth: number;
    currency: string;
  };
}

export interface SubscriptionDetailsDto {
  id: string;
  authorProfileId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  planName: string;
  creditsPerMonth: number;
  pricePerMonth: number;
  currency: string;
  totalCreditsAllocated: number;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  endedAt?: string;
  createdAt: string;
  nextBillingDate: string;
  daysUntilBilling: number;
}

export interface CancelSubscriptionDto {
  cancelImmediately: boolean;
  cancellationReason?: string;
}

export interface SubscriptionCancellationResponseDto {
  subscriptionId: string;
  success: boolean;
  canceledImmediately: boolean;
  creditsValidUntil: string;
  message: string;
}

export interface BillingHistoryItem {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: string;
  invoiceUrl?: string;
}

export interface SubscriptionManagementDto {
  subscription: SubscriptionDetailsDto;
  status: {
    id: string;
    status: string;
    statusDisplay: string;
    isActive: boolean;
    requiresAction: boolean;
    actionMessage?: string;
  };
  billingHistory: BillingHistoryItem[];
  availableActions: {
    canCancel: boolean;
    canUpdatePaymentMethod: boolean;
    canResume: boolean;
  };
}

// ============================================
// API CLIENT METHODS - PAYMENTS
// ============================================

export const stripePaymentsApi = {
  /**
   * Create Stripe checkout session for one-time payment
   */
  async createCheckout(data: CreateCheckoutSessionDto): Promise<CheckoutSessionResponseDto> {
    const response = await apiClient.post<CheckoutSessionResponseDto>(
      '/payments/checkout/create',
      data,
    );
    return response.data;
  },

  /**
   * Get payment transactions
   */
  async getTransactions(): Promise<PaymentTransactionDto[]> {
    const response = await apiClient.get<PaymentTransactionDto[]>('/payments/transactions');
    return response.data;
  },

  /**
   * Get single payment transaction
   */
  async getTransaction(transactionId: string): Promise<PaymentTransactionDto> {
    const response = await apiClient.get<PaymentTransactionDto>(
      `/payments/transactions/${transactionId}`,
    );
    return response.data;
  },

  /**
   * Get invoice for purchase
   */
  async getInvoice(creditPurchaseId: string): Promise<InvoiceResponseDto> {
    const response = await apiClient.get<InvoiceResponseDto>(
      `/payments/invoice/${creditPurchaseId}`,
    );
    return response.data;
  },
};

// ============================================
// API CLIENT METHODS - SUBSCRIPTIONS
// ============================================

export const stripeSubscriptionsApi = {
  /**
   * Create subscription plan (Admin only)
   */
  async createPlan(data: CreateSubscriptionPlanDto): Promise<SubscriptionDetailsDto> {
    const response = await apiClient.post<SubscriptionDetailsDto>('/subscriptions/plans', data);
    return response.data;
  },

  /**
   * Create subscription checkout session
   */
  async createCheckout(
    data: CreateSubscriptionCheckoutDto,
  ): Promise<SubscriptionCheckoutResponseDto> {
    const response = await apiClient.post<SubscriptionCheckoutResponseDto>(
      '/subscriptions/checkout/create',
      data,
    );
    return response.data;
  },

  /**
   * Get my active subscription
   */
  async getMySubscription(): Promise<SubscriptionManagementDto> {
    const response = await apiClient.get<SubscriptionManagementDto>(
      '/subscriptions/my-subscription',
    );
    return response.data;
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    data: CancelSubscriptionDto,
  ): Promise<SubscriptionCancellationResponseDto> {
    const response = await apiClient.post<SubscriptionCancellationResponseDto>(
      `/subscriptions/${subscriptionId}/cancel`,
      data,
    );
    return response.data;
  },

  /**
   * Get subscription details
   */
  async getSubscriptionDetails(subscriptionId: string): Promise<SubscriptionDetailsDto> {
    const response = await apiClient.get<SubscriptionDetailsDto>(
      `/subscriptions/${subscriptionId}`,
    );
    return response.data;
  },

  /**
   * Get subscription management details
   */
  async getSubscriptionManagement(subscriptionId: string): Promise<SubscriptionManagementDto> {
    const response = await apiClient.get<SubscriptionManagementDto>(
      `/subscriptions/${subscriptionId}/management`,
    );
    return response.data;
  },
};

// ============================================
// API CLIENT METHODS - CUSTOM PACKAGES (PUBLIC)
// ============================================

export const customPackageApi = {
  /**
   * Get custom package details by token (public - no auth)
   */
  async getByToken(token: string): Promise<CustomPackagePublicDto> {
    const response = await apiClient.get<CustomPackagePublicDto>(
      `/payments/custom-package/${token}`,
    );
    return response.data;
  },

  /**
   * Create checkout session for custom package (public - no auth)
   */
  async createCheckout(
    token: string,
    data: CreateCustomPackageCheckoutDto,
  ): Promise<CustomPackageCheckoutResponseDto> {
    const response = await apiClient.post<CustomPackageCheckoutResponseDto>(
      `/payments/custom-package/${token}/checkout`,
      data,
    );
    return response.data;
  },
};

// Combined export
export const stripeApi = {
  payments: stripePaymentsApi,
  subscriptions: stripeSubscriptionsApi,
  customPackage: customPackageApi,
};
