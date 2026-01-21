import { apiClient } from './client';

/**
 * User GDPR API Client
 *
 * Provides methods for GDPR compliance features:
 * - Data export (requirements.md Section 15.3)
 * - Data deletion (requirements.md Section 15.3)
 * - Consent management
 */

// Types matching backend DTOs

export enum ConsentType {
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  PERSONALIZATION = 'personalization',
}

export interface PersonalInfo {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  phone?: string;
  country?: string;
  preferredLanguage: string;
  preferredCurrency?: string;
  createdAt: string;
  emailVerified: boolean;
  emailVerifiedAt?: string;
}

export interface AuthorProfile {
  totalCreditsPurchased: number;
  totalCreditsUsed: number;
  availableCredits: number;
  campaigns: Array<{
    id: string;
    bookTitle: string;
    status: string;
    createdAt: string;
  }>;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    date: string;
    description: string;
  }>;
}

export interface ReaderProfile {
  contentPreference: string;
  completedReviews: number;
  walletBalance: number;
  assignments: Array<{
    id: string;
    bookTitle: string;
    status: string;
    accessGrantedAt?: string;
    submittedAt?: string;
  }>;
  amazonProfiles: Array<{
    profileUrl: string;
    isVerified: boolean;
  }>;
}

export interface AffiliateProfile {
  referralCode: string;
  totalClicks: number;
  totalConversions: number;
  totalCommissionEarned: number;
  commissions: Array<{
    amount: number;
    status: string;
    date: string;
  }>;
}

export interface ConsentRecord {
  type: string;
  accepted: boolean;
  acceptedAt?: string;
  withdrawnAt?: string;
}

export interface ActivityLogEntry {
  action: string;
  timestamp: string;
  ipAddress?: string;
}

export interface DataExportResponse {
  personalInfo: PersonalInfo;
  authorProfile?: AuthorProfile;
  readerProfile?: ReaderProfile;
  affiliateProfile?: AffiliateProfile;
  consents: ConsentRecord[];
  activityLog: ActivityLogEntry[];
  exportMetadata: {
    generatedAt: string;
    format: string;
    version: string;
  };
}

export interface DeleteAccountRequest {
  confirmationPhrase: string;
  reason?: string;
}

export interface DeleteAccountResponse {
  message: string;
  scheduledDeletionDate: string;
  gracePeriodDays: number;
}

export interface UpdateConsentRequest {
  consentType: ConsentType;
  granted: boolean;
}

export interface ConsentResponse {
  consentType: ConsentType;
  granted: boolean;
  updatedAt: string;
  grantedAt?: string;
  withdrawnAt?: string;
}

export enum Language {
  EN = 'EN',
  PT = 'PT',
  ES = 'ES',
}

export interface UpdateLanguageRequest {
  preferredLanguage: Language;
}

export interface UpdateLanguageResponse {
  message: string;
  preferredLanguage: Language;
}

export interface LanguageResponse {
  preferredLanguage: Language;
}

// API methods

/**
 * Export all user data (GDPR compliance)
 */
export const exportUserData = async (): Promise<DataExportResponse> => {
  const { data } = await apiClient.get<DataExportResponse>('/users/me/export-data');
  return data;
};

/**
 * Request account deletion (GDPR compliance)
 * Includes 30-day grace period
 */
export const deleteAccount = async (request: DeleteAccountRequest): Promise<DeleteAccountResponse> => {
  const { data } = await apiClient.delete<DeleteAccountResponse>('/users/me/account', {
    data: request,
  });
  return data;
};

/**
 * Cancel pending account deletion
 */
export const cancelAccountDeletion = async (): Promise<{ message: string }> => {
  const { data } = await apiClient.post<{ message: string }>('/users/me/cancel-deletion');
  return data;
};

/**
 * Update consent preferences
 */
export const updateConsent = async (request: UpdateConsentRequest): Promise<ConsentResponse> => {
  const { data } = await apiClient.post<ConsentResponse>('/users/me/consent', request);
  return data;
};

/**
 * Get all consent statuses
 */
export const getUserConsents = async (): Promise<ConsentResponse[]> => {
  const { data } = await apiClient.get<ConsentResponse[]>('/users/me/consents');
  return data;
};

/**
 * Get user's current language preference
 *
 * Per requirements.md Section 7.4
 */
export const getLanguage = async (): Promise<LanguageResponse> => {
  const { data } = await apiClient.get<LanguageResponse>('/users/me/language');
  return data;
};

/**
 * Update user's preferred language
 *
 * Per requirements.md Section 7.4:
 * - User can change language in settings
 * - Interface updates immediately
 */
export const updateLanguage = async (request: UpdateLanguageRequest): Promise<UpdateLanguageResponse> => {
  const { data } = await apiClient.patch<UpdateLanguageResponse>('/users/me/language', request);
  return data;
};
