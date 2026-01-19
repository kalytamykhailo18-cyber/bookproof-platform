'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  adminReadersApi,
  AdminReaderFilters,
  SuspendReaderDto,
  UnsuspendReaderDto,
  AdjustWalletDto,
  FlagReaderDto,
  UnflagReaderDto,
  AddAdminNoteDto,
} from '@/lib/api/admin-readers';

export function useAdminReaders() {
  const queryClient = useQueryClient();

  // Get all readers with filters
  const useAllReaders = (filters?: AdminReaderFilters) =>
    useQuery({
      queryKey: ['admin-readers', filters],
      queryFn: () => adminReadersApi.getAllReaders(filters),
      staleTime: 30000,
    });

  // Get reader stats
  const useReaderStats = () =>
    useQuery({
      queryKey: ['admin-reader-stats'],
      queryFn: () => adminReadersApi.getReaderStats(),
      staleTime: 30000,
    });

  // Get reader details
  const useReaderDetails = (readerProfileId: string) =>
    useQuery({
      queryKey: ['admin-reader', readerProfileId],
      queryFn: () => adminReadersApi.getReaderDetails(readerProfileId),
      staleTime: 30000,
      enabled: !!readerProfileId,
    });

  // Get reader review history
  const useReaderReviewHistory = (readerProfileId: string, limit?: number, offset?: number) =>
    useQuery({
      queryKey: ['admin-reader-reviews', readerProfileId, limit, offset],
      queryFn: () => adminReadersApi.getReaderReviewHistory(readerProfileId, limit, offset),
      staleTime: 30000,
      enabled: !!readerProfileId,
    });

  // Suspend reader mutation
  const suspendReader = useMutation({
    mutationFn: ({ readerProfileId, data }: { readerProfileId: string; data: SuspendReaderDto }) =>
      adminReadersApi.suspendReader(readerProfileId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-readers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reader', variables.readerProfileId] });
      queryClient.invalidateQueries({ queryKey: ['admin-reader-stats'] });
      toast.success('Reader suspended successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to suspend reader');
    },
  });

  // Unsuspend reader mutation
  const unsuspendReader = useMutation({
    mutationFn: ({ readerProfileId, data }: { readerProfileId: string; data: UnsuspendReaderDto }) =>
      adminReadersApi.unsuspendReader(readerProfileId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-readers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reader', variables.readerProfileId] });
      queryClient.invalidateQueries({ queryKey: ['admin-reader-stats'] });
      toast.success('Reader unsuspended successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unsuspend reader');
    },
  });

  // Adjust wallet mutation
  const adjustWallet = useMutation({
    mutationFn: ({ readerProfileId, data }: { readerProfileId: string; data: AdjustWalletDto }) =>
      adminReadersApi.adjustWallet(readerProfileId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-readers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reader', variables.readerProfileId] });
      toast.success('Wallet adjusted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to adjust wallet');
    },
  });

  // Flag reader mutation
  const flagReader = useMutation({
    mutationFn: ({ readerProfileId, data }: { readerProfileId: string; data: FlagReaderDto }) =>
      adminReadersApi.flagReader(readerProfileId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-readers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reader', variables.readerProfileId] });
      queryClient.invalidateQueries({ queryKey: ['admin-reader-stats'] });
      toast.success('Reader flagged successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to flag reader');
    },
  });

  // Unflag reader mutation
  const unflagReader = useMutation({
    mutationFn: ({ readerProfileId, data }: { readerProfileId: string; data: UnflagReaderDto }) =>
      adminReadersApi.unflagReader(readerProfileId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-readers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reader', variables.readerProfileId] });
      queryClient.invalidateQueries({ queryKey: ['admin-reader-stats'] });
      toast.success('Reader unflagged successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unflag reader');
    },
  });

  // Add admin note mutation
  const addAdminNote = useMutation({
    mutationFn: ({ readerProfileId, data }: { readerProfileId: string; data: AddAdminNoteDto }) =>
      adminReadersApi.addAdminNote(readerProfileId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reader', variables.readerProfileId] });
      toast.success('Note added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add note');
    },
  });

  // Delete admin note mutation
  const deleteAdminNote = useMutation({
    mutationFn: ({ readerProfileId, noteId }: { readerProfileId: string; noteId: string }) =>
      adminReadersApi.deleteAdminNote(readerProfileId, noteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reader', variables.readerProfileId] });
      toast.success('Note deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete note');
    },
  });

  // Verify Amazon profile mutation
  const verifyAmazonProfile = useMutation({
    mutationFn: ({
      readerProfileId,
      amazonProfileId,
    }: {
      readerProfileId: string;
      amazonProfileId: string;
    }) => adminReadersApi.verifyAmazonProfile(readerProfileId, amazonProfileId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reader', variables.readerProfileId] });
      toast.success('Amazon profile verified successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to verify Amazon profile');
    },
  });

  return {
    useAllReaders,
    useReaderStats,
    useReaderDetails,
    useReaderReviewHistory,
    suspendReader,
    unsuspendReader,
    adjustWallet,
    flagReader,
    unflagReader,
    addAdminNote,
    deleteAdminNote,
    verifyAmazonProfile,
  };
}
