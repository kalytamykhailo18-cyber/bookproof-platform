import { useQuery } from '@tanstack/react-query';
import {
  getActivityLogs,
  getErrorLogs,
  getEmailLogs,
  getActivityLogStats,
  getEmailLogStats,
  GetActivityLogsParams,
  GetErrorLogsParams,
  GetEmailLogsParams,
} from '@/lib/api/logs';

/**
 * Hook to fetch activity logs with filtering and pagination
 */
export const useActivityLogs = (params?: GetActivityLogsParams) => {
  return useQuery({
    queryKey: ['activityLogs', params],
    queryFn: () => getActivityLogs(params),
  });
};

/**
 * Hook to fetch error logs
 */
export const useErrorLogs = (params?: GetErrorLogsParams) => {
  return useQuery({
    queryKey: ['errorLogs', params],
    queryFn: () => getErrorLogs(params),
  });
};

/**
 * Hook to fetch email logs
 */
export const useEmailLogs = (params?: GetEmailLogsParams) => {
  return useQuery({
    queryKey: ['emailLogs', params],
    queryFn: () => getEmailLogs(params),
  });
};

/**
 * Hook to fetch activity log statistics
 */
export const useActivityLogStats = () => {
  return useQuery({
    queryKey: ['activityLogStats'],
    queryFn: getActivityLogStats,
  });
};

/**
 * Hook to fetch email log statistics
 */
export const useEmailLogStats = () => {
  return useQuery({
    queryKey: ['emailLogStats'],
    queryFn: getEmailLogStats,
  });
};
