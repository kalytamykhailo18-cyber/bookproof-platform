import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import {
  NotificationType,
  NotificationResponseDto,
  NotificationListResponseDto,
  GetNotificationsDto,
  CreateNotificationDto,
  NotificationSettingsDto,
  UpdateNotificationSettingsDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new notification for a user
   */
  async createNotification(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: dto.userId,
          type: dto.type,
          title: dto.title,
          message: dto.message,
          actionUrl: dto.actionUrl,
          metadata: dto.metadata ? JSON.stringify(dto.metadata) : null,
        },
      });

      this.logger.log(`Notification created: ${dto.type} for user ${dto.userId}`);

      return this.mapToResponse(notification);
    } catch (error) {
      this.logger.error(`Error creating notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create notifications for multiple users
   */
  async createBulkNotifications(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: Record<string, unknown>,
  ): Promise<number> {
    try {
      const result = await this.prisma.notification.createMany({
        data: userIds.map((userId) => ({
          userId,
          type,
          title,
          message,
          actionUrl,
          metadata: metadata ? JSON.stringify(metadata) : null,
        })),
      });

      this.logger.log(`Bulk notifications created: ${result.count} for type ${type}`);

      return result.count;
    } catch (error) {
      this.logger.error(`Error creating bulk notifications: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(
    userId: string,
    dto: GetNotificationsDto,
  ): Promise<NotificationListResponseDto> {
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };

    if (dto.unreadOnly) {
      where.isRead = false;
    }

    if (dto.type) {
      where.type = dto.type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      notifications: notifications.map((n) => this.mapToResponse(n)),
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Mark notifications as read
   */
  async markAsRead(userId: string, notificationIds: string[]): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId, // Ensure user owns these notifications
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    this.logger.log(`Marked ${result.count} notifications as read for user ${userId}`);

    return result.count;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    this.logger.log(`Marked all ${result.count} notifications as read for user ${userId}`);

    return result.count;
  }

  /**
   * Delete old notifications (cleanup job)
   */
  async deleteOldNotifications(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        isRead: true, // Only delete read notifications
      },
    });

    this.logger.log(`Deleted ${result.count} old notifications (older than ${daysOld} days)`);

    return result.count;
  }

  /**
   * Get notification settings for a user
   */
  async getSettings(userId: string): Promise<NotificationSettingsDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        notificationEmailEnabled: true,
        notificationEmailFrequency: true,
        notificationDisabledTypes: true,
      },
    });

    return {
      emailEnabled: user?.notificationEmailEnabled ?? true,
      emailFrequency: (user?.notificationEmailFrequency as 'IMMEDIATE' | 'DAILY' | 'WEEKLY') ?? 'IMMEDIATE',
      disabledTypes: user?.notificationDisabledTypes
        ? JSON.parse(user.notificationDisabledTypes)
        : [],
    };
  }

  /**
   * Update notification settings
   */
  async updateSettings(
    userId: string,
    dto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettingsDto> {
    const updateData: Record<string, unknown> = {};

    if (dto.emailEnabled !== undefined) {
      updateData.notificationEmailEnabled = dto.emailEnabled;
    }

    if (dto.emailFrequency !== undefined) {
      updateData.notificationEmailFrequency = dto.emailFrequency;
    }

    if (dto.disabledTypes !== undefined) {
      updateData.notificationDisabledTypes = JSON.stringify(dto.disabledTypes);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return this.getSettings(userId);
  }

  // ==========================================
  // CONVENIENCE METHODS FOR COMMON NOTIFICATIONS
  // ==========================================

  /**
   * Notify reader when application is accepted
   */
  async notifyReaderApplicationAccepted(
    userId: string,
    bookTitle: string,
    queuePosition: number,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.APPLICATION_ACCEPTED,
      title: 'Application Accepted',
      message: `Your application to review "${bookTitle}" has been accepted. You are #${queuePosition} in the queue.`,
      actionUrl: '/reader/dashboard',
      metadata: { bookTitle, queuePosition },
    });
  }

  /**
   * Notify reader when access is granted
   */
  async notifyReaderAccessGranted(
    userId: string,
    bookTitle: string,
    deadline: Date,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.ACCESS_GRANTED,
      title: 'Book Access Granted',
      message: `You now have access to "${bookTitle}". Your review deadline is ${deadline.toLocaleDateString()}.`,
      actionUrl: '/reader/queue',
      metadata: { bookTitle, deadline: deadline.toISOString() },
    });
  }

  /**
   * Notify reader of approaching deadline
   */
  async notifyReaderDeadlineApproaching(
    userId: string,
    bookTitle: string,
    hoursRemaining: number,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.DEADLINE_APPROACHING,
      title: 'Deadline Approaching',
      message: `You have ${hoursRemaining} hours left to submit your review for "${bookTitle}".`,
      actionUrl: '/reader/queue',
      metadata: { bookTitle, hoursRemaining },
    });
  }

  /**
   * Notify reader of payment added to wallet
   */
  async notifyReaderPaymentAdded(
    userId: string,
    amount: number,
    bookTitle: string,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.PAYMENT_ADDED,
      title: 'Payment Added',
      message: `$${amount.toFixed(2)} has been added to your wallet for reviewing "${bookTitle}".`,
      actionUrl: '/reader/wallet',
      metadata: { amount, bookTitle },
    });
  }

  /**
   * Notify author when review is validated
   */
  async notifyAuthorReviewValidated(
    userId: string,
    bookTitle: string,
    reviewCount: number,
    targetReviews: number,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.REVIEW_VALIDATED,
      title: 'Review Validated',
      message: `A new review for "${bookTitle}" has been validated. Progress: ${reviewCount}/${targetReviews} reviews.`,
      actionUrl: '/author/campaigns',
      metadata: { bookTitle, reviewCount, targetReviews },
    });
  }

  /**
   * Notify admin of pending review
   */
  async notifyAdminPendingReview(
    adminUserIds: string[],
    bookTitle: string,
    reviewId: string,
  ): Promise<void> {
    await this.createBulkNotifications(
      adminUserIds,
      NotificationType.REVIEW_PENDING_VALIDATION,
      'Review Pending Validation',
      `A new review for "${bookTitle}" is pending validation.`,
      `/admin/reviews/${reviewId}`,
      { bookTitle, reviewId },
    );
  }

  /**
   * Notify admin of payout request
   */
  async notifyAdminPayoutRequest(
    adminUserIds: string[],
    readerName: string,
    amount: number,
    payoutId: string,
  ): Promise<void> {
    await this.createBulkNotifications(
      adminUserIds,
      NotificationType.PAYOUT_REQUEST,
      'Payout Request',
      `${readerName} has requested a payout of $${amount.toFixed(2)}.`,
      `/admin/payouts`,
      { readerName, amount, payoutId },
    );
  }

  /**
   * Notify affiliate of new referral
   */
  async notifyAffiliateNewReferral(
    userId: string,
    referredAuthorName: string,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.NEW_REFERRAL,
      title: 'New Referral',
      message: `${referredAuthorName} has signed up using your referral link.`,
      actionUrl: '/affiliate/dashboard',
      metadata: { referredAuthorName },
    });
  }

  /**
   * Notify affiliate of referral purchase
   */
  async notifyAffiliateReferralPurchase(
    userId: string,
    amount: number,
    commission: number,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.REFERRAL_PURCHASE,
      title: 'Referral Made Purchase',
      message: `One of your referrals made a purchase of $${amount.toFixed(2)}. You earned $${commission.toFixed(2)} in commission.`,
      actionUrl: '/affiliate/commissions',
      metadata: { amount, commission },
    });
  }

  private mapToResponse(notification: any): NotificationResponseDto {
    return {
      id: notification.id,
      type: notification.type as NotificationType,
      title: notification.title,
      message: notification.message,
      isRead: notification.isRead,
      actionUrl: notification.actionUrl ?? undefined,
      metadata: notification.metadata ? JSON.parse(notification.metadata) : undefined,
      createdAt: notification.createdAt,
    };
  }
}
