import { apiClient } from './client';

export interface PayoutPaymentDetails {
  // PayPal
  paypalEmail?: string;

  // Bank Transfer
  accountNumber?: string;
  routingNumber?: string;
  bankName?: string;
  accountHolderName?: string;

  // Wise
  wiseEmail?: string;

  // Crypto
  walletAddress?: string;
  network?: string;
}

export interface RequestPayoutData {
  amount: number;
  paymentMethod: 'PayPal' | 'Bank Transfer' | 'Wise' | 'Crypto';
  paymentDetails: PayoutPaymentDetails;
  notes?: string;
}

export interface PayoutResponse {
  id: string;
  readerProfileId: string;
  amount: number;
  status:
    | 'REQUESTED'
    | 'PENDING_REVIEW'
    | 'APPROVED'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'REJECTED'
    | 'CANCELLED';
  paymentMethod: string;
  paymentDetails?: PayoutPaymentDetails;
  processedBy?: string;
  processedAt?: string;
  rejectionReason?: string;
  notes?: string;
  transactionId?: string;
  paidAt?: string;
  requestedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovePayoutData {
  notes?: string;
}

export interface RejectPayoutData {
  reason: string;
}

export interface CompletePayoutData {
  transactionId: string;
  notes?: string;
}

// Wallet Transaction types
export type WalletTransactionType = 'EARNING' | 'PAYOUT' | 'ADJUSTMENT' | 'BONUS' | 'REVERSAL';

export interface WalletTransaction {
  id: string;
  readerProfileId: string;
  reviewId?: string;
  amount: number;
  type: WalletTransactionType;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  performedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface WalletSummary {
  walletBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingPayouts: number;
  transactions: WalletTransaction[];
}

// Reader endpoints
export const requestPayout = async (data: RequestPayoutData): Promise<PayoutResponse> => {
  const response = await apiClient.post<PayoutResponse>('/payouts/request', data);
  return response.data;
};

export const getMyPayouts = async (): Promise<PayoutResponse[]> => {
  const response = await apiClient.get<PayoutResponse[]>('/payouts/my-payouts');
  return response.data;
};

export const getWalletTransactions = async (): Promise<WalletTransaction[]> => {
  const response = await apiClient.get<WalletTransaction[]>('/payouts/transactions');
  return response.data;
};

export const getWalletSummary = async (): Promise<WalletSummary> => {
  const response = await apiClient.get<WalletSummary>('/payouts/wallet-summary');
  return response.data;
};

// Admin endpoints
export const getPendingPayouts = async (): Promise<PayoutResponse[]> => {
  const response = await apiClient.get<PayoutResponse[]>('/payouts/pending');
  return response.data;
};

export const getAllPayouts = async (): Promise<PayoutResponse[]> => {
  const response = await apiClient.get<PayoutResponse[]>('/payouts/all');
  return response.data;
};

export const approvePayout = async (
  id: string,
  data: ApprovePayoutData,
): Promise<PayoutResponse> => {
  const response = await apiClient.post<PayoutResponse>(`/payouts/${id}/approve`, data);
  return response.data;
};

export const rejectPayout = async (id: string, data: RejectPayoutData): Promise<PayoutResponse> => {
  const response = await apiClient.post<PayoutResponse>(`/payouts/${id}/reject`, data);
  return response.data;
};

export const completePayout = async (
  id: string,
  data: CompletePayoutData,
): Promise<PayoutResponse> => {
  const response = await apiClient.post<PayoutResponse>(`/payouts/${id}/complete`, data);
  return response.data;
};
