import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi, Review, PendingReviewsStats, ReviewIssue, SubmitReviewRequest, ValidateReviewRequest, BulkValidateReviewsRequest, CreateIssueRequest, ResolveIssueRequest, MarkAsRemovedRequest } from '@/lib/api/reviews';
import { toast } from 'sonner';
import { useLoading } from '@/components/providers/LoadingProvider';
import { useNavigate, useParams } from 'react-router-dom';

/**
 * Hook for reader review operations
 */
export function useReviewSubmission(assignmentId: string) {
  const queryClient = useQueryClient();
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  // Get review for assignment
  const {
    data: review,
    isLoading: isLoadingReview,
    refetch: refetchReview,
  } = useQuery({
    queryKey: ['review-assignment', assignmentId],
    queryFn: () => reviewsApi.getReviewByAssignment(assignmentId),
    staleTime: 5 * 60 * 1000, // 5 minutes // 30 seconds
  });

  // Submit review mutation
  // Note: Does NOT auto-redirect - let the page component show success state
  const submitReviewMutation = useMutation({
    mutationFn: (data: SubmitReviewRequest) => {
      startLoading('Submitting review...');
      return reviewsApi.submitReview(assignmentId, data);
    },
    onSuccess: () => {
      stopLoading();
      queryClient.invalidateQueries({ queryKey: ['review-assignment', assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['my-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['my-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['reader-stats'] });
      toast.success('Review submitted successfully! It will be validated by our team.');
      // Let the page component handle navigation after showing success state
    },
    onError: (error: any) => {
      stopLoading();
      const message = error.response?.data?.message || 'Failed to submit review';
      toast.error(message);
    },
  });

  return {
    review,
    isLoadingReview,
    refetchReview,
    submitReview: submitReviewMutation.mutate,
    isSubmitting: submitReviewMutation.isPending,
    isSubmitSuccess: submitReviewMutation.isSuccess,
  };
}

/**
 * Hook for fetching all reader reviews
 */
export function useMyReviews() {
  const {
    data: reviews,
    isLoading: isLoadingReviews,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: reviewsApi.getMyReviews,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    reviews,
    isLoadingReviews,
    refetchReviews,
  };
}

/**
 * Hook for admin validation panel
 */
export function useAdminValidation() {
  const queryClient = useQueryClient();
  const { startLoading, stopLoading } = useLoading();

  // Get pending reviews
  const {
    data: pendingReviews,
    isLoading: isLoadingPending,
    isFetching: isFetchingPending,
    refetch: refetchPending,
  } = useQuery({
    queryKey: ['pending-reviews'],
    queryFn: reviewsApi.getPendingReviews,
    staleTime: 1000 * 15, // 15 seconds
  });

  // Get pending reviews stats
  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['pending-reviews-stats'],
    queryFn: reviewsApi.getPendingReviewsStats,
    staleTime: 5 * 60 * 1000, // 5 minutes // 30 seconds
  });

  // Validate review mutation with optimistic update
  const validateReviewMutation = useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: ValidateReviewRequest }) => {
      startLoading('Validating review...');
      return reviewsApi.validateReview(reviewId, data);
    },
    // Optimistic update: immediately remove the review from the pending list
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['pending-reviews'] });

      // Snapshot the previous value
      const previousPendingReviews = queryClient.getQueryData<Review[]>(['pending-reviews']);

      // Optimistically remove the review from the list
      if (previousPendingReviews) {
        queryClient.setQueryData<Review[]>(
          ['pending-reviews'],
          previousPendingReviews.filter((review) => review.id !== variables.reviewId)
        );
      }

      // Return context with the snapshot for rollback
      return { previousPendingReviews };
    },
    onSuccess: (_, variables) => {
      stopLoading();
      // Invalidate to sync with server (but keep optimistic data)
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['pending-reviews-stats'] });
      queryClient.invalidateQueries({ queryKey: ['review', variables.reviewId] });

      const actionMessages = {
        APPROVE: 'Review approved and compensation issued!',
        REJECT: 'Review rejected and reassignment triggered.',
        FLAG: 'Review flagged for issues.',
        REQUEST_RESUBMISSION: 'Resubmission requested from reader.',
      };

      toast.success(actionMessages[variables.data.action] || 'Review validated successfully');
    },
    onError: (error: any, _, context) => {
      stopLoading();
      // Rollback to previous data on error
      if (context?.previousPendingReviews) {
        queryClient.setQueryData(['pending-reviews'], context.previousPendingReviews);
      }
      const message = error.response?.data?.message || 'Failed to validate review';
      toast.error(message);
    },
  });

  // Bulk validate mutation with optimistic update
  const bulkValidateMutation = useMutation({
    mutationFn: (data: BulkValidateReviewsRequest) => {
      startLoading(`Validating ${data.reviewIds.length} reviews...`);
      return reviewsApi.bulkValidateReviews(data);
    },
    // Optimistic update: immediately remove the reviews from the pending list
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['pending-reviews'] });

      // Snapshot the previous value
      const previousPendingReviews = queryClient.getQueryData<Review[]>(['pending-reviews']);

      // Optimistically remove all selected reviews from the list
      if (previousPendingReviews) {
        queryClient.setQueryData<Review[]>(
          ['pending-reviews'],
          previousPendingReviews.filter((review) => !variables.reviewIds.includes(review.id))
        );
      }

      return { previousPendingReviews };
    },
    onSuccess: (results) => {
      stopLoading();
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['pending-reviews-stats'] });
      toast.success(`Successfully validated ${results.length} reviews`);
    },
    onError: (error: any, _, context) => {
      stopLoading();
      // Rollback on error
      if (context?.previousPendingReviews) {
        queryClient.setQueryData(['pending-reviews'], context.previousPendingReviews);
      }
      const message = error.response?.data?.message || 'Failed to bulk validate reviews';
      toast.error(message);
    },
  });

  return {
    pendingReviews,
    isLoadingPending,
    isFetchingPending,
    refetchPending,
    stats,
    isLoadingStats,
    refetchStats,
    validateReview: validateReviewMutation.mutate,
    isValidating: validateReviewMutation.isPending,
    bulkValidate: bulkValidateMutation.mutate,
    isBulkValidating: bulkValidateMutation.isPending,
  };
}

/**
 * Hook for issue management
 */
export function useIssueManagement() {
  const queryClient = useQueryClient();
  const { startLoading, stopLoading } = useLoading();

  // Get open issues
  const {
    data: openIssues,
    isLoading: isLoadingIssues,
    refetch: refetchIssues,
  } = useQuery({
    queryKey: ['open-issues'],
    queryFn: reviewsApi.getOpenIssues,
    staleTime: 5 * 60 * 1000, // 5 minutes // 30 seconds
  });

  // Create issue mutation
  const createIssueMutation = useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: CreateIssueRequest }) => {
      startLoading('Creating issue...');
      return reviewsApi.createIssue(reviewId, data);
    },
    onSuccess: () => {
      stopLoading();
      queryClient.invalidateQueries({ queryKey: ['open-issues'] });
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
      toast.success('Issue created successfully');
    },
    onError: (error: any) => {
      stopLoading();
      const message = error.response?.data?.message || 'Failed to create issue';
      toast.error(message);
    },
  });

  // Resolve issue mutation
  const resolveIssueMutation = useMutation({
    mutationFn: ({ issueId, data }: { issueId: string; data: ResolveIssueRequest }) => {
      startLoading('Resolving issue...');
      return reviewsApi.resolveIssue(issueId, data);
    },
    onSuccess: () => {
      stopLoading();
      queryClient.invalidateQueries({ queryKey: ['open-issues'] });
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });
      toast.success('Issue resolved successfully');
    },
    onError: (error: any) => {
      stopLoading();
      const message = error.response?.data?.message || 'Failed to resolve issue';
      toast.error(message);
    },
  });

  return {
    openIssues,
    isLoadingIssues,
    refetchIssues,
    createIssue: createIssueMutation.mutate,
    isCreatingIssue: createIssueMutation.isPending,
    resolveIssue: resolveIssueMutation.mutate,
    isResolvingIssue: resolveIssueMutation.isPending,
  };
}

/**
 * Hook for Amazon monitoring
 */
export function useAmazonMonitoring() {
  const queryClient = useQueryClient();
  const { startLoading, stopLoading } = useLoading();

  // Get active monitors
  const {
    data: activeMonitors,
    isLoading: isLoadingMonitors,
    refetch: refetchMonitors,
  } = useQuery({
    queryKey: ['active-monitors'],
    queryFn: reviewsApi.getActiveMonitors,
    staleTime: 1000 * 60, // 1 minute
  });

  // Get monitoring stats
  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['monitoring-stats'],
    queryFn: reviewsApi.getMonitoringStats,
    staleTime: 1000 * 60, // 1 minute
  });

  // Mark as removed mutation
  const markAsRemovedMutation = useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: string; data: MarkAsRemovedRequest }) => {
      startLoading('Marking review as removed...');
      return reviewsApi.markAsRemovedByAmazon(reviewId, data);
    },
    onSuccess: (result) => {
      stopLoading();
      queryClient.invalidateQueries({ queryKey: ['active-monitors'] });
      queryClient.invalidateQueries({ queryKey: ['monitoring-stats'] });
      queryClient.invalidateQueries({ queryKey: ['pending-reviews'] });

      // Use the message from backend which includes replacement status details
      if (result.replacementEligible) {
        toast.success(result.message);
      } else {
        toast.info(result.message);
      }
    },
    onError: (error: any) => {
      stopLoading();
      const message = error.response?.data?.message || 'Failed to mark review as removed';
      toast.error(message);
    },
  });

  return {
    activeMonitors,
    isLoadingMonitors,
    refetchMonitors,
    stats,
    isLoadingStats,
    refetchStats,
    markAsRemoved: markAsRemovedMutation.mutate,
    isMarkingAsRemoved: markAsRemovedMutation.isPending,
  };
}

/**
 * Hook to get a single review by ID
 */
export function useReview(reviewId: string | null) {
  const {
    data: review,
    isLoading: isLoadingReview,
    refetch: refetchReview,
  } = useQuery({
    queryKey: ['review', reviewId],
    queryFn: () => reviewsApi.getReviewById(reviewId!),
    enabled: !!reviewId,
    staleTime: 5 * 60 * 1000, // 5 minutes // 30 seconds
  });

  return {
    review,
    isLoadingReview,
    refetchReview,
  };
}
