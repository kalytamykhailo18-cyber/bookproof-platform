'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  exportUserData,
  deleteAccount,
  cancelAccountDeletion,
  updateConsent,
  getUserConsents,
  type DeleteAccountRequest,
  type UpdateConsentRequest,
  type DataExportResponse,
  type ConsentResponse,
} from '@/lib/api/users';

/**
 * React Hook for User GDPR Operations
 *
 * Provides methods for:
 * - Data export (requirements.md Section 15.3)
 * - Account deletion (requirements.md Section 15.3)
 * - Consent management
 */
export function useUserData() {
  const queryClient = useQueryClient();

  // Export user data
  const exportDataMutation = useMutation({
    mutationFn: exportUserData,
    onSuccess: (data: DataExportResponse) => {
      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bookproof-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully', {
        description: 'Your data has been downloaded as a JSON file',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to export data', {
        description: error.message || 'Please try again later',
      });
    },
  });

  // Delete account
  const deleteAccountMutation = useMutation({
    mutationFn: (request: DeleteAccountRequest) => deleteAccount(request),
    onSuccess: (data) => {
      toast.success('Account deletion scheduled', {
        description: `Your account will be deleted on ${new Date(data.scheduledDeletionDate).toLocaleDateString()}. You can cancel within ${data.gracePeriodDays} days.`,
        duration: 10000,
      });
      // Invalidate all user-related queries
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      toast.error('Failed to delete account', {
        description: error.message || 'Please try again later',
      });
    },
  });

  // Cancel account deletion
  const cancelDeletionMutation = useMutation({
    mutationFn: cancelAccountDeletion,
    onSuccess: (data) => {
      toast.success('Account deletion cancelled', {
        description: data.message,
      });
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => {
      toast.error('Failed to cancel deletion', {
        description: error.message || 'Please try again later',
      });
    },
  });

  // Update consent
  const updateConsentMutation = useMutation({
    mutationFn: (request: UpdateConsentRequest) => updateConsent(request),
    onSuccess: (data: ConsentResponse) => {
      toast.success('Consent updated', {
        description: `${data.consentType} consent ${data.granted ? 'granted' : 'withdrawn'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['user-consents'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to update consent', {
        description: error.message || 'Please try again later',
      });
    },
  });

  // Get consents query
  const {
    data: consents,
    isLoading: isLoadingConsents,
    error: consentsError,
  } = useQuery<ConsentResponse[], Error>({
    queryKey: ['user-consents'],
    queryFn: getUserConsents,
    staleTime: 60000, // 1 minute
  });

  return {
    // Export data
    exportData: exportDataMutation.mutate,
    isExporting: exportDataMutation.isPending,

    // Delete account
    deleteAccount: deleteAccountMutation.mutate,
    isDeletingAccount: deleteAccountMutation.isPending,

    // Cancel deletion
    cancelDeletion: cancelDeletionMutation.mutate,
    isCancellingDeletion: cancelDeletionMutation.isPending,

    // Consent management
    updateConsent: updateConsentMutation.mutate,
    isUpdatingConsent: updateConsentMutation.isPending,
    consents,
    isLoadingConsents,
    consentsError,
  };
}
