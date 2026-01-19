import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getReports,
  getCampaignReport,
  regenerateCampaignReport,
  downloadCampaignReport,
  CampaignReport,
} from '@/lib/api/reports';

export function useReports() {
  return useQuery<CampaignReport[]>({
    queryKey: ['reports'],
    queryFn: getReports,
  });
}

export function useCampaignReport(bookId: string | null) {
  return useQuery<CampaignReport>({
    queryKey: ['report', bookId],
    queryFn: () => getCampaignReport(bookId!),
    enabled: !!bookId,
  });
}

export function useRegenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId: string) => regenerateCampaignReport(bookId),
    onSuccess: (data, bookId) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report', bookId] });
      toast.success('Report regenerated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to regenerate report');
    },
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: (bookId: string) => downloadCampaignReport(bookId),
    onSuccess: (data) => {
      // Open download URL in new tab
      window.open(data.url, '_blank');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to download report');
    },
  });
}
