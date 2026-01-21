import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { LogSeverity } from '@prisma/client';
import {
  GetActivityLogsQueryDto,
  ActivityLogsResponseDto,
  ActivityLogDto,
  GetErrorLogsQueryDto,
  ErrorLogsResponseDto,
  GetEmailLogsQueryDto,
  EmailLogsResponseDto,
  EmailLogDto,
} from '../dto/logs.dto';

/**
 * Service for retrieving and managing system logs (admin monitoring)
 */
@Injectable()
export class LogsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get activity logs with filtering and pagination
   */
  async getActivityLogs(query: GetActivityLogsQueryDto): Promise<ActivityLogsResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (query.action) {
      where.action = { contains: query.action, mode: 'insensitive' };
    }

    if (query.entity) {
      where.entity = { equals: query.entity, mode: 'insensitive' };
    }

    if (query.entityId) {
      where.entityId = query.entityId;
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.userRole) {
      where.userRole = query.userRole;
    }

    if (query.severity) {
      where.severity = query.severity;
    }

    if (query.search) {
      where.description = { contains: query.search, mode: 'insensitive' };
    }

    // Date range filters
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) {
        where.createdAt.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.createdAt.lte = new Date(query.dateTo);
      }
    }

    // Execute queries in parallel
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      logs: logs as ActivityLogDto[],
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Get error logs (severity ERROR or CRITICAL)
   */
  async getErrorLogs(query: GetErrorLogsQueryDto): Promise<ErrorLogsResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      severity: query.severity || { in: [LogSeverity.ERROR, LogSeverity.CRITICAL] },
    };

    if (query.search) {
      where.description = { contains: query.search, mode: 'insensitive' };
    }

    // Date range filters
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) {
        where.createdAt.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.createdAt.lte = new Date(query.dateTo);
      }
    }

    // Execute queries in parallel
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      logs: logs as ActivityLogDto[],
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Get email logs with filtering and pagination
   */
  async getEmailLogs(query: GetEmailLogsQueryDto): Promise<EmailLogsResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.recipientEmail) {
      where.email = { contains: query.recipientEmail, mode: 'insensitive' };
    }

    if (query.emailType) {
      where.type = { contains: query.emailType, mode: 'insensitive' };
    }

    if (query.search) {
      where.OR = [
        { subject: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Date range filters
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) {
        where.createdAt.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.createdAt.lte = new Date(query.dateTo);
      }
    }

    // Execute queries in parallel
    const [logs, total] = await Promise.all([
      this.prisma.emailLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.emailLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      logs: logs as EmailLogDto[],
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Get activity log statistics for dashboard
   */
  async getActivityLogStats() {
    const [totalLogs, criticalLogs, errorLogs, warningLogs, recentLogs] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.count({ where: { severity: LogSeverity.CRITICAL } }),
      this.prisma.auditLog.count({ where: { severity: LogSeverity.ERROR } }),
      this.prisma.auditLog.count({ where: { severity: LogSeverity.WARNING } }),
      this.prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    return {
      totalLogs,
      criticalLogs,
      errorLogs,
      warningLogs,
      recentLogs,
    };
  }

  /**
   * Get email log statistics for dashboard
   */
  async getEmailLogStats() {
    const [totalEmails, sentEmails, deliveredEmails, failedEmails, pendingEmails] =
      await Promise.all([
        this.prisma.emailLog.count(),
        this.prisma.emailLog.count({ where: { status: 'SENT' } }),
        this.prisma.emailLog.count({ where: { status: 'DELIVERED' } }),
        this.prisma.emailLog.count({ where: { status: 'FAILED' } }),
        this.prisma.emailLog.count({ where: { status: 'PENDING' } }),
      ]);

    return {
      totalEmails,
      sentEmails,
      deliveredEmails,
      failedEmails,
      pendingEmails,
    };
  }
}
