import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  readersApi,
  ReaderProfile,
  CreateReaderProfileRequest,
  UpdateReaderProfileRequest,
  AddAmazonProfileRequest,
  ReaderStats,
} from '@/lib/api/readers';
import { useLoading } from '@/components/providers/LoadingProvider';
import { toast } from 'sonner';

export function useReaderProfile() {
  const queryClient = useQueryClient();
  const { startLoading, stopLoading } = useLoading();

  // Get reader profile
  const {
    data: profile,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
    error,
  } = useQuery({
    queryKey: ['reader-profile'],
    queryFn: readersApi.getProfile,
    staleTime: 1000 * 60, // 1 minute
    retry: false,
  });

  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: (data: CreateReaderProfileRequest) => {
      startLoading('Creating profile...');
      return readersApi.createProfile(data);
    },
    onSuccess: () => {
      stopLoading();
      queryClient.invalidateQueries({ queryKey: ['reader-profile'] });
      toast.success('Profile created successfully!');
    },
    onError: (error: any) => {
      stopLoading();
      const message = error.response?.data?.message || 'Failed to create profile';
      toast.error(message);
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateReaderProfileRequest) => {
      startLoading('Updating profile...');
      return readersApi.updateProfile(data);
    },
    onSuccess: () => {
      stopLoading();
      queryClient.invalidateQueries({ queryKey: ['reader-profile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      stopLoading();
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    },
  });

  // Add Amazon profile mutation
  const addAmazonProfileMutation = useMutation({
    mutationFn: (data: AddAmazonProfileRequest) => {
      startLoading('Adding Amazon profile...');
      return readersApi.addAmazonProfile(data);
    },
    onSuccess: () => {
      stopLoading();
      queryClient.invalidateQueries({ queryKey: ['reader-profile'] });
      toast.success('Amazon profile added successfully!');
    },
    onError: (error: any) => {
      stopLoading();
      const message = error.response?.data?.message || 'Failed to add Amazon profile';
      toast.error(message);
    },
  });

  // Remove Amazon profile mutation
  const removeAmazonProfileMutation = useMutation({
    mutationFn: (profileId: string) => {
      startLoading('Removing Amazon profile...');
      return readersApi.removeAmazonProfile(profileId);
    },
    onSuccess: () => {
      stopLoading();
      queryClient.invalidateQueries({ queryKey: ['reader-profile'] });
      toast.success('Amazon profile removed successfully!');
    },
    onError: (error: any) => {
      stopLoading();
      const message = error.response?.data?.message || 'Failed to remove Amazon profile';
      toast.error(message);
    },
  });

  return {
    profile,
    isLoadingProfile,
    hasProfile: !!profile && !error,
    refetchProfile,
    createProfile: createProfileMutation.mutate,
    isCreating: createProfileMutation.isPending,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    addAmazonProfile: addAmazonProfileMutation.mutate,
    isAddingAmazonProfile: addAmazonProfileMutation.isPending,
    removeAmazonProfile: removeAmazonProfileMutation.mutate,
    isRemovingAmazonProfile: removeAmazonProfileMutation.isPending,
  };
}

export function useReaderStats() {
  const { data: stats, isLoading: isLoadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['reader-stats'],
    queryFn: readersApi.getStats,
    staleTime: 1000 * 30, // 30 seconds
  });

  return {
    stats,
    isLoadingStats,
    refetchStats,
  };
}
