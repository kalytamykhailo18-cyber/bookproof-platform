import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  authApi,
  CreateCloserRequest,
  CreateCloserResponse,
  CreateAdminRequest,
  CreateAdminResponse,
  UnlockAccountRequest,
  UnlockAccountResponse,
} from '@/lib/api/auth';
import { apiClient } from '@/lib/api/client';

// ============================================
// TYPES FOR LISTING CLOSERS AND ADMINS
// ============================================

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

// ============================================
// API FUNCTIONS FOR LISTING
// ============================================

async function fetchClosers(): Promise<CloserListItem[]> {
  const response = await apiClient.get<CloserListItem[]>('/admin/team/closers');
  return response.data;
}

async function fetchAdmins(): Promise<AdminListItem[]> {
  const response = await apiClient.get<AdminListItem[]>('/admin/team/admins');
  return response.data;
}

// ============================================
// HOOKS - LIST CLOSERS
// ============================================

export function useClosersList() {
  return useQuery({
    queryKey: ['admin', 'team', 'closers'],
    queryFn: fetchClosers,
    staleTime: 5 * 60 * 1000, // 5 minutes // 30 seconds
  });
}

// ============================================
// HOOKS - LIST ADMINS
// ============================================

export function useAdminsList() {
  return useQuery({
    queryKey: ['admin', 'team', 'admins'],
    queryFn: fetchAdmins,
    staleTime: 5 * 60 * 1000, // 5 minutes // 30 seconds
  });
}

// ============================================
// HOOKS - CREATE CLOSER
// ============================================

export function useCreateCloser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCloserRequest) => authApi.createCloser(data),
    onSuccess: (response: CreateCloserResponse) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'team', 'closers'] });
      toast.success(`Closer account created for ${response.email}`, {
        description: response.temporaryPasswordSent
          ? 'Temporary password sent via email'
          : 'Account created successfully',
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create closer account';
      toast.error('Error', { description: message });
    },
  });
}

// ============================================
// HOOKS - CREATE ADMIN
// ============================================

export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdminRequest) => authApi.createAdmin(data),
    onSuccess: (response: CreateAdminResponse) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'team', 'admins'] });
      toast.success(`Admin account created for ${response.email}`, {
        description: response.temporaryPasswordSent
          ? 'Temporary password sent via email'
          : 'Account created successfully',
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to create admin account';
      toast.error('Error', { description: message });
    },
  });
}

// ============================================
// HOOKS - UNLOCK ACCOUNT
// ============================================

export function useUnlockAccount() {
  return useMutation({
    mutationFn: (data: UnlockAccountRequest) => authApi.unlockAccount(data),
    onSuccess: (response: UnlockAccountResponse) => {
      if (response.wasLocked) {
        toast.success('Account unlocked successfully');
      } else {
        toast.info('Account was not locked');
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Failed to unlock account';
      toast.error('Error', { description: message });
    },
  });
}
