import { useQuery } from '@tanstack/react-query';
import {
  getActivityLogs,
  getActivityLogStats,
  getErrorLogs,
  getEmailLogs,
  getEmailLogStats,
  GetActivityLogsParams,
  GetErrorLogsParams,
  GetEmailLogsParams,
} from '@/lib/api/logs';

// Activity Logs Hooks
export const useActivityLogs = (params?: GetActivityLogsParams) => {
  return useQuery({
    queryKey: ['activityLogs', params],
    queryFn: () => getActivityLogs(params),
  });
};

export const useActivityLogStats = () => {
  return useQuery({
    queryKey: ['activityLogStats'],
    queryFn: () => getActivityLogStats(),
  });
};

// Error Logs Hooks
export const useErrorLogs = (params?: GetErrorLogsParams) => {
  return useQuery({
    queryKey: ['errorLogs', params],
    queryFn: () => getErrorLogs(params),
  });
};

// Email Logs Hooks
export const useEmailLogs = (params?: GetEmailLogsParams) => {
  return useQuery({
    queryKey: ['emailLogs', params],
    queryFn: () => getEmailLogs(params),
  });
};

export const useEmailLogStats = () => {
  return useQuery({
    queryKey: ['emailLogStats'],
    queryFn: () => getEmailLogStats(),
  });
};
