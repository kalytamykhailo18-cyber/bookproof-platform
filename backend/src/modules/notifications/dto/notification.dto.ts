import { IsEnum, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  // Author notifications
  CAMPAIGN_STARTED = 'CAMPAIGN_STARTED',
  CAMPAIGN_COMPLETED = 'CAMPAIGN_COMPLETED',
  REVIEW_VALIDATED = 'REVIEW_VALIDATED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  CREDITS_LOW = 'CREDITS_LOW',

  // Reader notifications
  APPLICATION_ACCEPTED = 'APPLICATION_ACCEPTED',
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  DEADLINE_REMINDER = 'DEADLINE_REMINDER',
  DEADLINE_APPROACHING = 'DEADLINE_APPROACHING',
  PAYMENT_ADDED = 'PAYMENT_ADDED',
  PAYOUT_PROCESSED = 'PAYOUT_PROCESSED',

  // Admin notifications
  REVIEW_PENDING_VALIDATION = 'REVIEW_PENDING_VALIDATION',
  PAYOUT_REQUEST = 'PAYOUT_REQUEST',
  CAMPAIGN_ISSUE = 'CAMPAIGN_ISSUE',
  NEW_AFFILIATE_APPLICATION = 'NEW_AFFILIATE_APPLICATION',
  SYSTEM_ALERT = 'SYSTEM_ALERT',

  // Affiliate notifications
  AFFILIATE_APPROVED = 'AFFILIATE_APPROVED',
  NEW_REFERRAL = 'NEW_REFERRAL',
  REFERRAL_PURCHASE = 'REFERRAL_PURCHASE',
  COMMISSION_APPROVED = 'COMMISSION_APPROVED',
  AFFILIATE_PAYOUT_PROCESSED = 'AFFILIATE_PAYOUT_PROCESSED',
}

export class NotificationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  isRead: boolean;

  @ApiPropertyOptional()
  actionUrl?: string;

  @ApiPropertyOptional()
  metadata?: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;
}

export class NotificationListResponseDto {
  @ApiProperty({ type: [NotificationResponseDto] })
  notifications: NotificationResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  unreadCount: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class GetNotificationsDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean;

  @ApiPropertyOptional({ enum: NotificationType })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}

export class MarkAsReadDto {
  @ApiProperty({ description: 'Notification IDs to mark as read', type: [String] })
  notificationIds: string[];
}

export class CreateNotificationDto {
  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  actionUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class NotificationSettingsDto {
  @ApiProperty()
  emailEnabled: boolean;

  @ApiProperty({ enum: ['IMMEDIATE', 'DAILY', 'WEEKLY'] })
  emailFrequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY';

  @ApiPropertyOptional({ description: 'Disabled notification types', type: [String] })
  disabledTypes?: NotificationType[];
}

export class UpdateNotificationSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiPropertyOptional({ enum: ['IMMEDIATE', 'DAILY', 'WEEKLY'] })
  @IsOptional()
  emailFrequency?: 'IMMEDIATE' | 'DAILY' | 'WEEKLY';

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  disabledTypes?: NotificationType[];
}
