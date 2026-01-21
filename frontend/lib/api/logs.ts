import { client } from './client';

export enum LogSeverity {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export enum UserRole {
  READER = 'READER',
  AUTHOR = 'AUTHOR',
  ADMIN = 'ADMIN',
}

export interface ActivityLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  userRole: UserRole | null;
  action: string;
  entity: string;
  entityId: string | null;
  changes: string | null;
  description: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  severity: LogSeverity;
  createdAt: string;
}

export interface ActivityLogsResponse {
  logs: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetActivityLogsParams {
  action?: string;
  entity?: string;
  entityId?: string;
  userId?: string;
  userRole?: UserRole;
  severity?: LogSeverity;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ErrorLogsResponse {
  logs: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetErrorLogsParams {
  severity?: LogSeverity;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export enum EmailStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
}

export interface EmailLog {
  id: string;
  email: string; // Backend returns 'email' not 'recipientEmail'
  subject: string;
  type: string; // Backend returns 'type' not 'emailType'
  status: EmailStatus;
  sentAt: string | null;
  deliveredAt: string | null;
  error: string | null; // Backend returns 'error' not 'errorMessage'
  providerMessageId: string | null; // Backend returns 'providerMessageId' not 'externalId'
  createdAt: string;
}

export interface EmailLogsResponse {
  logs: EmailLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetEmailLogsParams {
  status?: EmailStatus;
  recipientEmail?: string;
  emailType?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface ActivityLogStats {
  totalLogs: number;
  criticalLogs: number;
  errorLogs: number;
  warningLogs: number;
  recentLogs: number;
}

export interface EmailLogStats {
  totalEmails: number;
  sentEmails: number;
  deliveredEmails: number;
  failedEmails: number;
  pendingEmails: number;
}

/**
 * Get activity logs with filtering and pagination
 */
export const getActivityLogs = (params?: GetActivityLogsParams): Promise<ActivityLogsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.action) queryParams.append('action', params.action);
  if (params?.entity) queryParams.append('entity', params.entity);
  if (params?.entityId) queryParams.append('entityId', params.entityId);
  if (params?.userId) queryParams.append('userId', params.userId);
  if (params?.userRole) queryParams.append('userRole', params.userRole);
  if (params?.severity) queryParams.append('severity', params.severity);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const query = queryParams.toString();
  return client.get(`/admin/logs/activity${query ? `?${query}` : ''}`);
};

/**
 * Get error logs (ERROR and CRITICAL severity)
 */
export const getErrorLogs = (params?: GetErrorLogsParams): Promise<ErrorLogsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.severity) queryParams.append('severity', params.severity);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const query = queryParams.toString();
  return client.get(`/admin/logs/errors${query ? `?${query}` : ''}`);
};

/**
 * Get email logs with delivery status tracking
 */
export const getEmailLogs = (params?: GetEmailLogsParams): Promise<EmailLogsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.status) queryParams.append('status', params.status);
  if (params?.recipientEmail) queryParams.append('recipientEmail', params.recipientEmail);
  if (params?.emailType) queryParams.append('emailType', params.emailType);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
  if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const query = queryParams.toString();
  return client.get(`/admin/logs/emails${query ? `?${query}` : ''}`);
};

/**
 * Get activity log statistics
 */
export const getActivityLogStats = (): Promise<ActivityLogStats> =>
  client.get('/admin/logs/activity/stats');

/**
 * Get email log statistics
 */
export const getEmailLogStats = (): Promise<EmailLogStats> => client.get('/admin/logs/emails/stats');
