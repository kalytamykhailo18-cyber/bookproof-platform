import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  adminUsersApi,
  UserManagementResponse,
  BanUserData,
  UnbanUserData,
  ChangeUserRoleData,
  AdminResetPasswordData,
  UpdateEmailVerificationData,
  SendUserEmailData,
  AdminEditUserProfileData,
  UserAuditLogResponse,
} from '@/lib/api/admin-users';

// ============================================
// QUERY HOOKS
// ============================================

/**
 * Get user details by ID
 */
export function useUserDetails(userId: string) {
  return useQuery<UserManagementResponse>({
    queryKey: ['admin', 'users', userId],
    queryFn: () => adminUsersApi.getUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get user audit log
 */
export function useUserAuditLog(userId: string, page = 1, limit = 50) {
  return useQuery<UserAuditLogResponse>({
    queryKey: ['admin', 'users', userId, 'audit-log', page, limit],
    queryFn: () => adminUsersApi.getUserAuditLog(userId, page, limit),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================
// MUTATION HOOKS
// ============================================

/**
 * Ban user mutation
 */
export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: BanUserData }) =>
      adminUsersApi.banUser(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'readers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'authors'] });
      toast.success('User has been permanently banned');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to ban user');
    },
  });
}

/**
 * Unban user mutation
 */
export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UnbanUserData }) =>
      adminUsersApi.unbanUser(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'readers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'authors'] });
      toast.success('User has been unbanned');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unban user');
    },
  });
}

/**
 * Change user role mutation
 */
export function useChangeUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: ChangeUserRoleData }) =>
      adminUsersApi.changeUserRole(userId, data),
    onSuccess: (result, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'readers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'authors'] });
      toast.success(`User role changed to ${result.role}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change user role');
    },
  });
}

/**
 * Reset user password mutation
 */
export function useResetUserPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: AdminResetPasswordData }) =>
      adminUsersApi.resetUserPassword(userId, data),
    onSuccess: (result, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
      toast.success(result.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    },
  });
}

/**
 * Update email verification mutation
 */
export function useUpdateEmailVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateEmailVerificationData }) =>
      adminUsersApi.updateEmailVerification(userId, data),
    onSuccess: (result, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'readers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'authors'] });
      toast.success(`Email ${result.emailVerified ? 'verified' : 'unverified'} successfully`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update email verification');
    },
  });
}

/**
 * Send email to user mutation
 */
export function useSendUserEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: SendUserEmailData }) =>
      adminUsersApi.sendEmailToUser(userId, data),
    onSuccess: (result, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId, 'audit-log'] });
      toast.success(result.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send email');
    },
  });
}

/**
 * Edit user profile mutation
 */
export function useEditUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: AdminEditUserProfileData }) =>
      adminUsersApi.editUserProfile(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', userId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'readers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'authors'] });
      toast.success('User profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user profile');
    },
  });
}
