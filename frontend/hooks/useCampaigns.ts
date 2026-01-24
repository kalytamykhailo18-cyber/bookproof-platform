'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  campaignsApi,
  Campaign,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  ActivateCampaignRequest,
} from '@/lib/api/campaigns';
import { useLoading } from '@/components/providers/LoadingProvider';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';

// Hook to track upload progress state
export function useUploadProgress() {
  const [uploadProgress, setUploadProgress] = useState<{
    ebook: number | null;
    audiobook: number | null;
    cover: number | null;
    synopsis: number | null;
  }>({
    ebook: null,
    audiobook: null,
    cover: null,
    synopsis: null,
  });

  const resetProgress = useCallback((type: 'ebook' | 'audiobook' | 'cover' | 'synopsis') => {
    setUploadProgress((prev) => ({ ...prev, [type]: null }));
  }, []);

  const updateProgress = useCallback((type: 'ebook' | 'audiobook' | 'cover' | 'synopsis', progress: number) => {
    setUploadProgress((prev) => ({ ...prev, [type]: progress }));
  }, []);

  const resetAllProgress = useCallback(() => {
    setUploadProgress({
      ebook: null,
      audiobook: null,
      cover: null,
      synopsis: null,
    });
  }, []);

  return {
    uploadProgress,
    updateProgress,
    resetProgress,
    resetAllProgress,
  };
}

export function useCampaigns() {
  const queryClient = useQueryClient();
  const { startLoading, stopLoading } = useLoading();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  // Get all campaigns
  const {
    data: campaigns,
    isLoading: isLoadingCampaigns,
    refetch: refetchCampaigns,
  } = useQuery({
    queryKey: ['campaigns'],
    queryFn: campaignsApi.getCampaigns,
    staleTime: 5 * 60 * 1000, // 5 minutes // 30 seconds
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: (data: CreateCampaignRequest) => {
      startLoading('Creating campaign...');
      return campaignsApi.createCampaign(data);
    },
    onSuccess: (newCampaign) => {
      stopLoading();
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign created successfully!');
      router.push(`/${locale}/author/campaigns/${newCampaign.id}`);
    },
    onError: (error: any) => {
      stopLoading();
      const message =
        error.response?.data?.message || 'Failed to create campaign';
      toast.error(message);
    },
  });

  // Update campaign mutation
  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampaignRequest }) => {
      startLoading('Updating campaign...');
      return campaignsApi.updateCampaign(id, data);
    },
    onSuccess: (updatedCampaign) => {
      stopLoading();
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({
        queryKey: ['campaign', updatedCampaign.id],
      });
      toast.success('Campaign updated successfully!');
    },
    onError: (error: any) => {
      stopLoading();
      const message =
        error.response?.data?.message || 'Failed to update campaign';
      toast.error(message);
    },
  });

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: (id: string) => {
      startLoading('Deleting campaign...');
      return campaignsApi.deleteCampaign(id);
    },
    onSuccess: () => {
      stopLoading();
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign deleted successfully!');
      router.push(`/${locale}/author/campaigns`);
    },
    onError: (error: any) => {
      stopLoading();
      const message =
        error.response?.data?.message || 'Failed to delete campaign';
      toast.error(message);
    },
  });

  // Activate campaign mutation
  const activateCampaignMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ActivateCampaignRequest }) => {
      startLoading('Activating campaign...');
      return campaignsApi.activateCampaign(id, data);
    },
    onSuccess: (activatedCampaign) => {
      stopLoading();
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({
        queryKey: ['campaign', activatedCampaign.id],
      });
      queryClient.invalidateQueries({ queryKey: ['credit-balance'] });
      toast.success('Campaign activated successfully!');
    },
    onError: (error: any) => {
      stopLoading();
      const message =
        error.response?.data?.message || 'Failed to activate campaign';
      toast.error(message);
    },
  });

  // Pause campaign mutation
  const pauseCampaignMutation = useMutation({
    mutationFn: (id: string) => {
      startLoading('Pausing campaign...');
      return campaignsApi.pauseCampaign(id);
    },
    onSuccess: (pausedCampaign) => {
      stopLoading();
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({
        queryKey: ['campaign', pausedCampaign.id],
      });
      toast.success('Campaign paused successfully!');
    },
    onError: (error: any) => {
      stopLoading();
      const message =
        error.response?.data?.message || 'Failed to pause campaign';
      toast.error(message);
    },
  });

  // Resume campaign mutation
  const resumeCampaignMutation = useMutation({
    mutationFn: (id: string) => {
      startLoading('Resuming campaign...');
      return campaignsApi.resumeCampaign(id);
    },
    onSuccess: (resumedCampaign) => {
      stopLoading();
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({
        queryKey: ['campaign', resumedCampaign.id],
      });
      toast.success('Campaign resumed successfully!');
    },
    onError: (error: any) => {
      stopLoading();
      const message =
        error.response?.data?.message || 'Failed to resume campaign';
      toast.error(message);
    },
  });

  // Upload ebook mutation with progress callback support
  const uploadEbookMutation = useMutation({
    mutationFn: ({
      id,
      file,
      onProgress,
    }: {
      id: string;
      file: File;
      onProgress?: (progress: number) => void;
    }) => {
      startLoading('Uploading ebook...');
      return campaignsApi.uploadEbook(id, file, onProgress);
    },
    onSuccess: (updatedCampaign) => {
      stopLoading();
      queryClient.invalidateQueries({
        queryKey: ['campaign', updatedCampaign.id],
      });
      toast.success('Ebook uploaded successfully!');
    },
    onError: (error: any) => {
      stopLoading();
      const message =
        error.response?.data?.message || 'Failed to upload ebook';
      toast.error(message);
    },
  });

  // Upload audiobook mutation with progress callback support (for large files up to 500MB)
  const uploadAudiobookMutation = useMutation({
    mutationFn: ({
      id,
      file,
      onProgress,
    }: {
      id: string;
      file: File;
      onProgress?: (progress: number) => void;
    }) => {
      startLoading('Uploading audiobook...');
      return campaignsApi.uploadAudiobook(id, file, onProgress);
    },
    onSuccess: (updatedCampaign) => {
      stopLoading();
      queryClient.invalidateQueries({
        queryKey: ['campaign', updatedCampaign.id],
      });
      toast.success('Audiobook uploaded successfully!');
    },
    onError: (error: any) => {
      stopLoading();
      const message =
        error.response?.data?.message || 'Failed to upload audiobook';
      toast.error(message);
    },
  });

  // Upload cover mutation with progress callback support
  const uploadCoverMutation = useMutation({
    mutationFn: ({
      id,
      file,
      onProgress,
    }: {
      id: string;
      file: File;
      onProgress?: (progress: number) => void;
    }) => {
      startLoading('Uploading cover image...');
      return campaignsApi.uploadCover(id, file, onProgress);
    },
    onSuccess: (updatedCampaign) => {
      stopLoading();
      queryClient.invalidateQueries({
        queryKey: ['campaign', updatedCampaign.id],
      });
      toast.success('Cover image uploaded successfully!');
    },
    onError: (error: any) => {
      stopLoading();
      const message =
        error.response?.data?.message || 'Failed to upload cover image';
      toast.error(message);
    },
  });

  // Upload synopsis mutation with progress callback support
  const uploadSynopsisMutation = useMutation({
    mutationFn: ({
      id,
      file,
      onProgress,
    }: {
      id: string;
      file: File;
      onProgress?: (progress: number) => void;
    }) => {
      startLoading('Uploading synopsis...');
      return campaignsApi.uploadSynopsis(id, file, onProgress);
    },
    onSuccess: (updatedCampaign) => {
      stopLoading();
      queryClient.invalidateQueries({
        queryKey: ['campaign', updatedCampaign.id],
      });
      toast.success('Synopsis uploaded successfully!');
    },
    onError: (error: any) => {
      stopLoading();
      const message =
        error.response?.data?.message || 'Failed to upload synopsis';
      toast.error(message);
    },
  });

  return {
    campaigns,
    isLoadingCampaigns,
    refetchCampaigns,
    createCampaign: createCampaignMutation.mutate,
    isCreating: createCampaignMutation.isPending,
    updateCampaign: updateCampaignMutation.mutate,
    isUpdating: updateCampaignMutation.isPending,
    deleteCampaign: deleteCampaignMutation.mutate,
    isDeleting: deleteCampaignMutation.isPending,
    activateCampaign: activateCampaignMutation.mutate,
    isActivating: activateCampaignMutation.isPending,
    pauseCampaign: pauseCampaignMutation.mutate,
    isPausing: pauseCampaignMutation.isPending,
    resumeCampaign: resumeCampaignMutation.mutate,
    isResuming: resumeCampaignMutation.isPending,
    uploadEbook: uploadEbookMutation.mutate,
    isUploadingEbook: uploadEbookMutation.isPending,
    uploadAudiobook: uploadAudiobookMutation.mutate,
    isUploadingAudiobook: uploadAudiobookMutation.isPending,
    uploadCover: uploadCoverMutation.mutate,
    isUploadingCover: uploadCoverMutation.isPending,
    uploadSynopsis: uploadSynopsisMutation.mutate,
    isUploadingSynopsis: uploadSynopsisMutation.isPending,
  };
}

export function useCampaign(id: string) {
  const {
    data: campaign,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignsApi.getCampaign(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes // 30 seconds
  });

  return {
    campaign,
    isLoading,
    refetch,
  };
}
