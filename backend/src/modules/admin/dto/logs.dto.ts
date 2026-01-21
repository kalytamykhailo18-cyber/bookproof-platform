import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { LogSeverity, UserRole } from '@prisma/client';

/**
 * Query DTO for filtering activity logs
 */
export class GetActivityLogsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by action type (e.g., "campaign.paused", "credits.added")',
    example: 'campaign.paused',
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({
    description: 'Filter by entity type (e.g., "Book", "Review", "User")',
    example: 'Book',
  })
  @IsOptional()
  @IsString()
  entity?: string;

  @ApiPropertyOptional({
    description: 'Filter by entity ID',
    example: 'clxxx123456',
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Filter by user ID (admin who performed action)',
    example: 'clxxx789012',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by user role',
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  @IsOptional()
  @IsEnum(UserRole)
  userRole?: UserRole;

  @ApiPropertyOptional({
    description: 'Filter by severity',
    enum: LogSeverity,
    example: LogSeverity.WARNING,
  })
  @IsOptional()
  @IsEnum(LogSeverity)
  severity?: LogSeverity;

  @ApiPropertyOptional({
    description: 'Search term for description field',
    example: 'credit',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by date from (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by date to (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 50,
    minimum: 1,
    maximum: 200,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;
}

/**
 * Response DTO for a single activity log entry
 */
export class ActivityLogDto {
  @ApiProperty({ description: 'Log ID' })
  id: string;

  @ApiProperty({ description: 'User ID who performed the action', required: false })
  userId: string | null;

  @ApiProperty({ description: 'User email', required: false })
  userEmail: string | null;

  @ApiProperty({ description: 'User role', enum: UserRole, required: false })
  userRole: UserRole | null;

  @ApiProperty({ description: 'Action type', example: 'campaign.paused' })
  action: string;

  @ApiProperty({ description: 'Entity type', example: 'Book' })
  entity: string;

  @ApiProperty({ description: 'Entity ID', required: false })
  entityId: string | null;

  @ApiProperty({ description: 'Changes (JSON)', required: false })
  changes: string | null;

  @ApiProperty({ description: 'Human-readable description', required: false })
  description: string | null;

  @ApiProperty({ description: 'IP address', required: false })
  ipAddress: string | null;

  @ApiProperty({ description: 'User agent', required: false })
  userAgent: string | null;

  @ApiProperty({ description: 'Log severity', enum: LogSeverity })
  severity: LogSeverity;

  @ApiProperty({ description: 'Timestamp' })
  createdAt: Date;
}

/**
 * Response DTO for paginated activity logs
 */
export class ActivityLogsResponseDto {
  @ApiProperty({ description: 'Activity logs', type: [ActivityLogDto] })
  logs: ActivityLogDto[];

  @ApiProperty({ description: 'Total number of logs matching filters' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;

  @ApiProperty({ description: 'Has next page' })
  hasNext: boolean;

  @ApiProperty({ description: 'Has previous page' })
  hasPrev: boolean;
}

/**
 * Query DTO for filtering error logs
 */
export class GetErrorLogsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by severity',
    enum: LogSeverity,
    example: LogSeverity.ERROR,
  })
  @IsOptional()
  @IsEnum(LogSeverity)
  severity?: LogSeverity;

  @ApiPropertyOptional({
    description: 'Search term for error message',
    example: 'timeout',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by date from (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by date to (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 50,
    minimum: 1,
    maximum: 200,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;
}

/**
 * Response DTO for error logs (reuses ActivityLogDto structure)
 */
export class ErrorLogsResponseDto {
  @ApiProperty({ description: 'Error logs', type: [ActivityLogDto] })
  logs: ActivityLogDto[];

  @ApiProperty({ description: 'Total number of error logs matching filters' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;

  @ApiProperty({ description: 'Has next page' })
  hasNext: boolean;

  @ApiProperty({ description: 'Has previous page' })
  hasPrev: boolean;
}

/**
 * Query DTO for email logs
 */
export class GetEmailLogsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by delivery status',
    enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED'],
    example: 'SENT',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by recipient email',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @ApiPropertyOptional({
    description: 'Filter by email type/template',
    example: 'campaign_report',
  })
  @IsOptional()
  @IsString()
  emailType?: string;

  @ApiPropertyOptional({
    description: 'Search term for subject or body',
    example: 'campaign',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by date from (ISO 8601)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by date to (ISO 8601)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 50,
    minimum: 1,
    maximum: 200,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;
}

/**
 * Response DTO for a single email log
 */
export class EmailLogDto {
  @ApiProperty({ description: 'Email log ID' })
  id: string;

  @ApiProperty({ description: 'Recipient email' })
  email: string;

  @ApiProperty({ description: 'Email subject' })
  subject: string;

  @ApiProperty({
    description: 'Email type',
    example: 'CAMPAIGN_REPORT',
  })
  type: string;

  @ApiProperty({
    description: 'Delivery status',
    enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED'],
  })
  status: string;

  @ApiProperty({ description: 'Sent at timestamp', required: false })
  sentAt: Date | null;

  @ApiProperty({ description: 'Delivered at timestamp', required: false })
  deliveredAt: Date | null;

  @ApiProperty({ description: 'Error message if failed', required: false })
  error: string | null;

  @ApiProperty({ description: 'External provider ID', required: false })
  providerMessageId: string | null;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;
}

/**
 * Response DTO for paginated email logs
 */
export class EmailLogsResponseDto {
  @ApiProperty({ description: 'Email logs', type: [EmailLogDto] })
  logs: EmailLogDto[];

  @ApiProperty({ description: 'Total number of email logs matching filters' })
  total: number;

  @ApiProperty({ description: 'Current page' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total pages' })
  totalPages: number;

  @ApiProperty({ description: 'Has next page' })
  hasNext: boolean;

  @ApiProperty({ description: 'Has previous page' })
  hasPrev: boolean;
}
