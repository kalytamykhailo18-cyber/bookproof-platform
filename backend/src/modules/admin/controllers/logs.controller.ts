import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { LogsService } from '../services/logs.service';
import {
  GetActivityLogsQueryDto,
  ActivityLogsResponseDto,
  GetErrorLogsQueryDto,
  ErrorLogsResponseDto,
  GetEmailLogsQueryDto,
  EmailLogsResponseDto,
} from '../dto/logs.dto';

/**
 * Admin logs controller for system monitoring
 * Provides access to activity logs, error logs, and email logs
 */
@ApiTags('Admin Logs')
@ApiBearerAuth()
@Controller('admin/logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class LogsController {
  constructor(private logsService: LogsService) {}

  /**
   * Get activity logs with filtering and pagination
   */
  @Get('activity')
  @ApiOperation({
    summary: 'Get activity logs',
    description: 'Retrieve paginated activity logs with various filters (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Activity logs retrieved successfully',
    type: ActivityLogsResponseDto,
  })
  async getActivityLogs(@Query() query: GetActivityLogsQueryDto): Promise<ActivityLogsResponseDto> {
    return this.logsService.getActivityLogs(query);
  }

  /**
   * Get error logs (ERROR and CRITICAL severity)
   */
  @Get('errors')
  @ApiOperation({
    summary: 'Get error logs',
    description: 'Retrieve paginated error logs (severity ERROR or CRITICAL) with filters (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Error logs retrieved successfully',
    type: ErrorLogsResponseDto,
  })
  async getErrorLogs(@Query() query: GetErrorLogsQueryDto): Promise<ErrorLogsResponseDto> {
    return this.logsService.getErrorLogs(query);
  }

  /**
   * Get email logs with delivery status tracking
   */
  @Get('emails')
  @ApiOperation({
    summary: 'Get email logs',
    description: 'Retrieve paginated email logs with delivery status tracking (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Email logs retrieved successfully',
    type: EmailLogsResponseDto,
  })
  async getEmailLogs(@Query() query: GetEmailLogsQueryDto): Promise<EmailLogsResponseDto> {
    return this.logsService.getEmailLogs(query);
  }

  /**
   * Get activity log statistics
   */
  @Get('activity/stats')
  @ApiOperation({
    summary: 'Get activity log statistics',
    description: 'Retrieve statistics about activity logs for dashboard (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Activity log statistics retrieved successfully',
  })
  async getActivityLogStats() {
    return this.logsService.getActivityLogStats();
  }

  /**
   * Get email log statistics
   */
  @Get('emails/stats')
  @ApiOperation({
    summary: 'Get email log statistics',
    description: 'Retrieve statistics about email logs for dashboard (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Email log statistics retrieved successfully',
  })
  async getEmailLogStats() {
    return this.logsService.getEmailLogStats();
  }
}
