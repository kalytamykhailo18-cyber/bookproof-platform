import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { adminExceptionsApi } from '@/lib/api/admin-exceptions';
import type {
  ExtendDeadlineDto,
  ReassignReaderDto,
  BulkReassignDto,
  CancelAssignmentDto,
  CorrectAssignmentErrorDto,
} from '@/lib/api/admin-exceptions';

export function useAdminExceptions() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get assignment exceptions
  const useExceptions = (bookId?: string, readerProfileId?: string, limit?: number) =>
    useQuery({
      queryKey: ['assignment-exceptions', bookId, readerProfileId, limit],
      queryFn: () => adminExceptionsApi.getExceptions(bookId, readerProfileId, limit),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });

  // Extend deadline mutation
  const extendDeadline = useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: ExtendDeadlineDto }) =>
      adminExceptionsApi.extendDeadline(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-exceptions'] });
      toast.success('Deadline extended successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to extend deadline');
    },
  });

  // Reassign reader mutation
  const reassignReader = useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: ReassignReaderDto }) =>
      adminExceptionsApi.reassignReader(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-exceptions'] });
      toast.success('Reader reassigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reassign reader');
    },
  });

  // Bulk reassign mutation
  const bulkReassign = useMutation({
    mutationFn: (data: BulkReassignDto) => adminExceptionsApi.bulkReassign(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['assignment-exceptions'] });
      toast.success(
        `Bulk reassignment completed: ${result.successCount} succeeded, ${result.failureCount} failed`,
      );
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to perform bulk reassignment');
    },
  });

  // Cancel assignment mutation
  const cancelAssignment = useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: CancelAssignmentDto }) =>
      adminExceptionsApi.cancelAssignment(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-exceptions'] });
      toast.success('Assignment cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel assignment');
    },
  });

  // Correct error mutation
  const correctError = useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: CorrectAssignmentErrorDto }) =>
      adminExceptionsApi.correctError(assignmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-exceptions'] });
      toast.success('Error corrected successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to correct error');
    },
  });

  return {
    useExceptions,
    extendDeadline,
    reassignReader,
    bulkReassign,
    cancelAssignment,
    correctError,
  };
}
