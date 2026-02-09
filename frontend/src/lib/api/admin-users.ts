import { apiClient } from './client';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface UserManagementResponse {
  id: string;
  email: string;
  name: string;
  role: 'AUTHOR' | 'READER' | 'ADMIN' | 'CLOSER' | 'AFFILIATE';
  isActive: boolean;
  emailVerified: boolean;
  isBanned: boolean;
  bannedAt?: string;
  banReason?: string;
  createdAt: string;
  updatedAt: string;
  authorProfile?: any;
  readerProfile?: any;
  adminProfile?: any;
  closerProfile?: any;
  affiliateProfile?: any;
}

export interface BanUserData {
  reason: string;
  notes?: string;
}

export interface UnbanUserData {
  reason: string;
  notes?: string;
}

export interface ChangeUserRoleData {
  newRole: 'AUTHOR' | 'READER' | 'CLOSER' | 'AFFILIATE';
  reason: string;
}

export interface AdminResetPasswordData {
  sendEmail?: boolean;
  reason?: string;
}

export interface AdminResetPasswordResponse {
  success: boolean;
  message: string;
  resetToken?: string;
}

export interface UpdateEmailVerificationData {
  verified: boolean;
  reason?: string;
}

export interface SendUserEmailData {
  subject: string;
  message: string;
}

export interface AdminEditUserProfileData {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  companyName?: string;
  reason?: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  entity: string;
  entityId?: string;
  changes?: any;
  description?: string;
  ipAddress?: string;
  severity: string;
  createdAt: string;
}

export interface UserAuditLogResponse {
  logs: AuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// API CLIENT METHODS
// ============================================

export const adminUsersApi = {
  /**
   * Get user details by ID
   */
  async getUser(userId: string): Promise<UserManagementResponse> {
    const response = await apiClient.get<UserManagementResponse>(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Ban a user (permanent)
   */
  async banUser(userId: string, data: BanUserData): Promise<UserManagementResponse> {
    const response = await apiClient.post<UserManagementResponse>(`/admin/users/${userId}/ban`, data);
    return response.data;
  },

  /**
   * Unban a user
   */
  async unbanUser(userId: string, data: UnbanUserData): Promise<UserManagementResponse> {
    const response = await apiClient.post<UserManagementResponse>(`/admin/users/${userId}/unban`, data);
    return response.data;
  },

  /**
   * Change user role
   */
  async changeUserRole(userId: string, data: ChangeUserRoleData): Promise<UserManagementResponse> {
    const response = await apiClient.post<UserManagementResponse>(`/admin/users/${userId}/change-role`, data);
    return response.data;
  },

  /**
   * Reset user password (admin-initiated)
   */
  async resetUserPassword(userId: string, data: AdminResetPasswordData): Promise<AdminResetPasswordResponse> {
    const response = await apiClient.post<AdminResetPasswordResponse>(`/admin/users/${userId}/reset-password`, data);
    return response.data;
  },

  /**
   * Update email verification status
   */
  async updateEmailVerification(userId: string, data: UpdateEmailVerificationData): Promise<UserManagementResponse> {
    const response = await apiClient.patch<UserManagementResponse>(`/admin/users/${userId}/verify-email`, data);
    return response.data;
  },

  /**
   * Send email to user
   */
  async sendEmailToUser(userId: string, data: SendUserEmailData): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(`/admin/users/${userId}/send-email`, data);
    return response.data;
  },

  /**
   * Edit user profile (admin override)
   */
  async editUserProfile(userId: string, data: AdminEditUserProfileData): Promise<UserManagementResponse> {
    const response = await apiClient.patch<UserManagementResponse>(`/admin/users/${userId}/profile`, data);
    return response.data;
  },

  /**
   * Get user audit log
   */
  async getUserAuditLog(userId: string, page = 1, limit = 50): Promise<UserAuditLogResponse> {
    const response = await apiClient.get<UserAuditLogResponse>(`/admin/users/${userId}/audit-log`, {
      params: { page, limit },
    });
    return response.data;
  },
};
