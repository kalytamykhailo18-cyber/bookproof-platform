import { apiClient } from './client';

// Types matching backend DTOs

export interface CloserListItem {
  id: string;
  userId: string;
  email: string;
  name: string;
  commissionRate: number;
  commissionEnabled: boolean;
  commissionEarned: number;
  commissionPaid: number;
  totalSales: number;
  totalClients: number;
  totalPackagesSold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminListItem {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'SUPPORT';
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCloserRequest {
  name?: string;
  email?: string;
  commissionRate?: number;
  commissionEnabled?: boolean;
}

export interface UpdateAdminRequest {
  name?: string;
  email?: string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'SUPPORT';
  permissions?: string[];
}

export interface ToggleActiveRequest {
  isActive: boolean;
}

/**
 * API client for team management (Closers and Admins)
 */
export const teamApi = {
  // Closer endpoints
  getAllClosers: async (): Promise<CloserListItem[]> => {
    const response = await apiClient.get<CloserListItem[]>('/admin/team/closers');
    return response.data;
  },

  getCloserById: async (id: string): Promise<CloserListItem> => {
    const response = await apiClient.get<CloserListItem>(`/admin/team/closers/${id}`);
    return response.data;
  },

  updateCloser: async (id: string, data: UpdateCloserRequest): Promise<CloserListItem> => {
    const response = await apiClient.patch<CloserListItem>(`/admin/team/closers/${id}`, data);
    return response.data;
  },

  toggleCloserActive: async (id: string, data: ToggleActiveRequest): Promise<CloserListItem> => {
    const response = await apiClient.patch<CloserListItem>(
      `/admin/team/closers/${id}/toggle-active`,
      data,
    );
    return response.data;
  },

  // Admin endpoints
  getAllAdmins: async (): Promise<AdminListItem[]> => {
    const response = await apiClient.get<AdminListItem[]>('/admin/team/admins');
    return response.data;
  },

  getAdminById: async (id: string): Promise<AdminListItem> => {
    const response = await apiClient.get<AdminListItem>(`/admin/team/admins/${id}`);
    return response.data;
  },

  updateAdmin: async (id: string, data: UpdateAdminRequest): Promise<AdminListItem> => {
    const response = await apiClient.patch<AdminListItem>(`/admin/team/admins/${id}`, data);
    return response.data;
  },

  toggleAdminActive: async (id: string, data: ToggleActiveRequest): Promise<AdminListItem> => {
    const response = await apiClient.patch<AdminListItem>(
      `/admin/team/admins/${id}/toggle-active`,
      data,
    );
    return response.data;
  },
};
