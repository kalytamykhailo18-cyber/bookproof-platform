import { apiClient } from './client';

// Types matching backend DTOs
export enum UserRole {
  AUTHOR = 'AUTHOR',
  READER = 'READER',
  ADMIN = 'ADMIN',
  CLOSER = 'CLOSER',
  AFFILIATE = 'AFFILIATE',
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'AUTHOR' | 'READER' | 'AFFILIATE';
  companyName?: string; // Optional company name (primarily for authors)
  preferredLanguage: 'EN' | 'PT' | 'ES'; // Required per requirements.md Section 1.2
  preferredCurrency?: string;
  phone?: string;
  country: string; // Required for all users
  termsAccepted: boolean; // Required: must be true to register
  marketingConsent?: boolean; // Optional marketing consent checkbox
  contentPreference?: 'EBOOK' | 'AUDIOBOOK' | 'BOTH'; // Required for readers
  amazonProfileLinks?: string[]; // Optional Amazon profile URLs for readers (max 3)
  // Affiliate-specific fields (Section 1.5)
  websiteUrl?: string; // Required for affiliates
  socialMediaUrls?: string; // Optional, comma-separated
  promotionPlan?: string; // Required for affiliates (50-1000 chars)
  estimatedReach?: string; // Optional
  preferredSlug?: string; // Optional custom referral slug
  paypalEmail?: string; // Optional PayPal email for payments
  captchaToken?: string; // reCAPTCHA v3 token for bot protection
}

export interface LoginRequest {
  email: string;
  password: string;
  captchaToken?: string; // reCAPTCHA v3 token for bot protection
  rememberMe?: boolean; // Per requirements.md Section 1.1: extends session to 7 days
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'AUTHOR' | 'READER' | 'ADMIN' | 'CLOSER' | 'AFFILIATE';
  preferredLanguage: 'EN' | 'PT' | 'ES';
  preferredCurrency: string;
  emailVerified: boolean;
  photo?: string;
  country?: string;
  termsAccepted?: boolean; // For authors - whether they've accepted terms of service
  accountCreatedByCloser?: boolean; // For authors - whether account was created by Closer
  adminRole?: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'SUPPORT'; // For admin users only (Section 5.1, 5.5)
  adminPermissions?: string[]; // Granular permissions for admins
}

export interface AuthResponse {
  accessToken: string;
  user: UserData;
}

export interface MessageResponse {
  message: string;
}

export interface RequestPasswordResetRequest {
  email: string;
  captchaToken?: string; // reCAPTCHA v3 token for bot protection (Section 15.2)
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// =============================================
// Admin Creation Types (Section 1.3)
// =============================================

/**
 * Admin levels per requirements.md Section 1.3:
 * - SUPER_ADMIN: Full access to everything
 * - REGULAR_ADMIN: Cannot create other admins, cannot access financial settings
 */
export enum AdminLevel {
  SUPER_ADMIN = 'SUPER_ADMIN',
  REGULAR_ADMIN = 'REGULAR_ADMIN',
}

/**
 * Available admin permissions for granular access control
 */
export enum AdminPermission {
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_CAMPAIGNS = 'MANAGE_CAMPAIGNS',
  MANAGE_REVIEWS = 'MANAGE_REVIEWS',
  MANAGE_READERS = 'MANAGE_READERS',
  MANAGE_AUTHORS = 'MANAGE_AUTHORS',
  MANAGE_AFFILIATES = 'MANAGE_AFFILIATES',
  MANAGE_CLOSERS = 'MANAGE_CLOSERS',
  MANAGE_COUPONS = 'MANAGE_COUPONS',
  PROCESS_PAYOUTS = 'PROCESS_PAYOUTS',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  MANAGE_SETTINGS = 'MANAGE_SETTINGS',
  MANAGE_ADMINS = 'MANAGE_ADMINS', // Super admin only
  MANAGE_FINANCIALS = 'MANAGE_FINANCIALS', // Super admin only
}

/**
 * Request to create admin account (Super Admin only)
 */
export interface CreateAdminRequest {
  email: string;
  password?: string; // If not provided, temporary password will be generated
  name: string;
  adminLevel: AdminLevel;
  permissions?: AdminPermission[];
}

/**
 * Response from admin creation
 */
export interface CreateAdminResponse {
  adminProfileId: string;
  userId: string;
  email: string;
  name: string;
  temporaryPasswordSent: boolean;
  welcomeEmailSent: boolean;
  adminLevel: AdminLevel;
  permissions: AdminPermission[];
}

// =============================================
// Closer Creation Types (Section 1.4)
// =============================================

/**
 * Request to create closer account (Admin only)
 */
export interface CreateCloserRequest {
  email: string;
  password?: string; // If not provided, temporary password will be generated
  name: string;
  commissionRate?: number; // Default 0%
  isActive?: boolean; // Default true
}

/**
 * Response from closer creation
 */
export interface CreateCloserResponse {
  closerProfileId: string;
  userId: string;
  email: string;
  name: string;
  temporaryPasswordSent: boolean;
  welcomeEmailSent: boolean;
  commissionRate: number;
  isActive: boolean;
}

// =============================================
// Unlock Account Types (Section 1.1)
// =============================================

/**
 * Request to unlock a locked account (Admin only)
 */
export interface UnlockAccountRequest {
  email: string;
  reason?: string;
}

/**
 * Response from unlock account
 */
export interface UnlockAccountResponse {
  message: string;
  wasLocked: boolean;
}

/**
 * Change Password Request (Section 15.1)
 * For authenticated users to change their password
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Auth API functions
export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  verifyEmail: async (token: string): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/auth/verify-email', { token });
    return response.data;
  },

  requestPasswordReset: async (data: RequestPasswordResetRequest): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/auth/request-password-reset', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/auth/reset-password', data);
    return response.data;
  },

  getProfile: async (): Promise<UserData> => {
    const response = await apiClient.get<UserData>('/auth/me');
    return response.data;
  },

  acceptTerms: async (): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/auth/accept-terms');
    return response.data;
  },

  // =============================================
  // Admin-only endpoints (Section 1.3, 1.4, 1.1)
  // =============================================

  /**
   * Create admin account (Super Admin only)
   * Per requirements.md Section 1.3
   */
  createAdmin: async (data: CreateAdminRequest): Promise<CreateAdminResponse> => {
    const response = await apiClient.post<CreateAdminResponse>('/auth/admin/create-admin', data);
    return response.data;
  },

  /**
   * Create closer account (Admin only)
   * Per requirements.md Section 1.4
   */
  createCloser: async (data: CreateCloserRequest): Promise<CreateCloserResponse> => {
    const response = await apiClient.post<CreateCloserResponse>('/auth/admin/create-closer', data);
    return response.data;
  },

  /**
   * Unlock a locked account (Admin only)
   * Per requirements.md Section 1.1
   */
  unlockAccount: async (data: UnlockAccountRequest): Promise<UnlockAccountResponse> => {
    const response = await apiClient.post<UnlockAccountResponse>(
      '/auth/admin/unlock-account',
      data,
    );
    return response.data;
  },

  /**
   * Change password for authenticated user
   * Per requirements.md Section 15.1
   */
  changePassword: async (data: ChangePasswordRequest): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/auth/change-password', data);
    return response.data;
  },
};
