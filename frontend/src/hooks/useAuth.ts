import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  authApi,
  RegisterRequest,
  LoginRequest,
  UserData,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '@/lib/api/auth';
import { tokenManager } from '@/lib/api/client';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate, useParams } from 'react-router-dom';
import { useLoading } from '@/components/providers/LoadingProvider';
import { toast } from 'sonner';

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { setUser, clearUser, user, isAuthenticated } = useAuthStore();
  const { startLoading, stopLoading } = useLoading();

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => {
      startLoading('Creating your account...');
      return authApi.register(data);
    },
    onSuccess: (response) => {
      stopLoading();
      tokenManager.setToken(response.accessToken);
      setUser(response.user);
      queryClient.setQueryData(['user'], response.user);

      // If email is not verified, redirect to verification required page
      if (!response.user.emailVerified) {
        navigate(`/${locale}/verify-email-required`);
      } else {
        // Email already verified (dev mode), redirect to role-based dashboard
        switch (response.user.role) {
          case 'AUTHOR':
            navigate(`/${locale}/author`);
            break;
          case 'READER':
            navigate(`/${locale}/reader`);
            break;
          case 'AFFILIATE':
            navigate(`/${locale}/affiliate/dashboard`);
            break;
          default:
            navigate(`/${locale}`);
        }
      }
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Registration error:', error);
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => {
      startLoading('Signing you in...');
      return authApi.login(data);
    },
    onSuccess: (response) => {
      stopLoading();
      tokenManager.setToken(response.accessToken);
      setUser(response.user);
      queryClient.setQueryData(['user'], response.user);

      // Redirect based on role
      switch (response.user.role) {
        case 'AUTHOR':
          navigate(`/${locale}/author`);
          break;
        case 'READER':
          navigate(`/${locale}/reader`);
          break;
        case 'ADMIN':
          navigate(`/${locale}/admin/dashboard`);
          break;
        case 'CLOSER':
          navigate(`/${locale}/closer`);
          break;
        case 'AFFILIATE':
          navigate(`/${locale}/affiliate/dashboard`);
          break;
        default:
          navigate(`/${locale}`);
      }
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Login error:', error);
    },
  });

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: (token: string) => {
      startLoading('Verifying your email...');
      return authApi.verifyEmail(token);
    },
    onSuccess: () => {
      stopLoading();
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Email verification error:', error);
    },
  });

  // Request password reset mutation
  const requestPasswordResetMutation = useMutation({
    mutationFn: (data: RequestPasswordResetRequest) => {
      startLoading('Sending reset link...');
      return authApi.requestPasswordReset(data);
    },
    onSuccess: () => {
      stopLoading();
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Password reset request error:', error);
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordRequest) => {
      startLoading('Resetting your password...');
      return authApi.resetPassword(data);
    },
    onSuccess: () => {
      stopLoading();
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Password reset error:', error);
    },
  });

  // Change password mutation (Section 15.1)
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => {
      startLoading('Changing your password...');
      return authApi.changePassword(data);
    },
    onSuccess: () => {
      stopLoading();
      // Clear user session since all tokens are invalidated
      tokenManager.clearToken();
      clearUser();
      queryClient.clear();
      navigate(`/${locale}/login`);
      toast.success('Password changed successfully. Please log in with your new password.');
    },
    onError: (error: any) => {
      stopLoading();
      console.error('Password change error:', error);
    },
  });

  // Get current user profile query
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    isError: isProfileError,
  } = useQuery({
    queryKey: ['user'],
    queryFn: authApi.getProfile,
    enabled: isAuthenticated && !!tokenManager.getToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes - don't refetch if data is fresh
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Handle profile data changes
  useEffect(() => {
    if (profileData) {
      setUser(profileData);
    }
  }, [profileData, setUser]);

  // Handle profile errors
  useEffect(() => {
    if (isProfileError) {
      clearUser();
      tokenManager.clearToken();
    }
  }, [isProfileError, clearUser]);

  // Logout function
  const logout = () => {
    tokenManager.clearToken();
    clearUser();
    queryClient.clear();
    navigate(`/${locale}/login`);
    toast.success('Logged out successfully');
  };

  return {
    user: (user || profileData) as UserData | undefined,
    isAuthenticated,
    isLoadingProfile,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    verifyEmail: verifyEmailMutation.mutate,
    verifyEmailAsync: verifyEmailMutation.mutateAsync,
    isVerifyingEmail: verifyEmailMutation.isPending,
    verifyEmailError: verifyEmailMutation.error,
    requestPasswordReset: requestPasswordResetMutation.mutate,
    requestPasswordResetAsync: requestPasswordResetMutation.mutateAsync,
    isRequestingReset: requestPasswordResetMutation.isPending,
    requestResetError: requestPasswordResetMutation.error,
    resetPassword: resetPasswordMutation.mutate,
    resetPasswordAsync: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
    resetPasswordError: resetPasswordMutation.error,
    changePassword: changePasswordMutation.mutate,
    changePasswordAsync: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    changePasswordError: changePasswordMutation.error,
    logout,
  };
}
