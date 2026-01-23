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
      type: NotificationType.REVIEW,
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
      type: NotificationType.REVIEW,
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
      type: NotificationType.REVIEW,
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
      type: NotificationType.PAYMENT,
      title: 'Payment Added',
      message: `$${amount.toFixed(2)} has been added to your wallet for reviewing "${bookTitle}".`,
      actionUrl: '/reader/wallet',
      metadata: { amount, bookTitle },
    });
  }

  /**
   * Notify reader when their review is submitted
   * Per Milestone 4.4: Reader receives confirmation after submission
   */
  async notifyReaderReviewSubmitted(
    userId: string,
    bookTitle: string,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.REVIEW,
      title: 'Review Submitted',
      message: `Your review for "${bookTitle}" has been submitted and is pending validation.`,
      actionUrl: '/reader/dashboard',
      metadata: { bookTitle },
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
      type: NotificationType.REVIEW,
      title: 'Review Validated',
      message: `A new review for "${bookTitle}" has been validated. Progress: ${reviewCount}/${targetReviews} reviews.`,
      actionUrl: '/author/campaigns',
      metadata: { bookTitle, reviewCount, targetReviews },
    });
  }

  /**
   * Notify author when campaign is automatically paused
   * Per Milestone 3.4.6: "Notification when campaign is automatically paused"
   */
  async notifyAuthorCampaignPaused(
    userId: string,
    bookTitle: string,
    reason: string,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.CAMPAIGN,
      title: 'Campaign Paused',
      message: `Your campaign "${bookTitle}" has been automatically paused due to: ${reason}. Please add more credits to resume.`,
      actionUrl: '/author/campaigns',
      metadata: { bookTitle, reason },
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
      NotificationType.ADMIN,
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
      NotificationType.ADMIN,
      'Payout Request',
      `${readerName} has requested a payout of $${amount.toFixed(2)}.`,
      `/admin/payouts`,
      { readerName, amount, payoutId },
    );
  }

  /**
   * Notify author when campaign credits are running low (below 10)
   * Per Milestone 3.4: "Low credit warning when campaign allocation below 10 credits"
   */
  async notifyAuthorLowCampaignCredits(
    userId: string,
    bookTitle: string,
    creditsRemaining: number,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.CAMPAIGN,
      title: 'Low Campaign Credits',
      message: `Your campaign "${bookTitle}" has only ${creditsRemaining} credits remaining. Consider adding more credits to avoid campaign interruption.`,
      actionUrl: '/author/credits',
      metadata: { bookTitle, creditsRemaining },
    });
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
      type: NotificationType.GENERAL,
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
      type: NotificationType.PAYMENT,
      title: 'Referral Made Purchase',
      message: `One of your referrals made a purchase of $${amount.toFixed(2)}. You earned $${commission.toFixed(2)} in commission.`,
      actionUrl: '/affiliate/commissions',
      metadata: { amount, commission },
    });
  }

  // ==========================================
  // SECTION 13.2: ADDITIONAL NOTIFICATION METHODS
  // ==========================================

  /**
   * Notify author when campaign is completed
   * Per Section 13.2: Author notification - Campaign completed
   */
  async notifyAuthorCampaignCompleted(
    userId: string,
    bookTitle: string,
    totalReviews: number,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.CAMPAIGN,
      title: 'Campaign Completed',
      message: `Congratulations! Your campaign "${bookTitle}" has been completed with ${totalReviews} reviews delivered.`,
      actionUrl: '/author/campaigns',
      metadata: { bookTitle, totalReviews },
    });
  }

  /**
   * Notify author when report is ready
   * Per Section 13.2: Author notification - Report ready
   */
  async notifyAuthorReportReady(
    userId: string,
    reportType: string,
    reportUrl: string,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.GENERAL,
      title: 'Report Ready',
      message: `Your ${reportType} report is ready for download.`,
      actionUrl: reportUrl,
      metadata: { reportType },
    });
  }

  /**
   * Notify author when credits are expiring soon
   * Per Section 13.2: Author notification - Credits expiring soon
   */
  async notifyAuthorCreditsExpiringSoon(
    userId: string,
    creditsExpiring: number,
    expirationDate: Date,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.PAYMENT,
      title: 'Credits Expiring Soon',
      message: `You have ${creditsExpiring} credits expiring on ${expirationDate.toLocaleDateString()}. Use them before they expire!`,
      actionUrl: '/author/credits',
      metadata: { creditsExpiring, expirationDate: expirationDate.toISOString() },
    });
  }

  /**
   * Notify reader when payout is processed
   * Per Section 13.2: Reader notification - Payout processed
   */
  async notifyReaderPayoutProcessed(
    userId: string,
    amount: number,
    paymentMethod: string,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.PAYMENT,
      title: 'Payout Processed',
      message: `Your payout of $${amount.toFixed(2)} has been processed via ${paymentMethod}. Funds should arrive within 3-5 business days.`,
      actionUrl: '/reader/wallet',
      metadata: { amount, paymentMethod },
    });
  }

  /**
   * Notify admin of campaign issue
   * Per Section 13.2: Admin notification - Campaign issue detected
   */
  async notifyAdminCampaignIssue(
    adminUserIds: string[],
    bookTitle: string,
    issueType: string,
    campaignId: string,
  ): Promise<void> {
    await this.createBulkNotifications(
      adminUserIds,
      NotificationType.ADMIN,
      'Campaign Issue Detected',
      `A ${issueType} issue has been detected for campaign "${bookTitle}".`,
      `/admin/campaigns/${campaignId}`,
      { bookTitle, issueType, campaignId },
    );
  }

  /**
   * Notify admin of new affiliate application
   * Per Section 13.2: Admin notification - New affiliate application
   */
  async notifyAdminNewAffiliateApplication(
    adminUserIds: string[],
    affiliateName: string,
    affiliateEmail: string,
    affiliateId: string,
  ): Promise<void> {
    await this.createBulkNotifications(
      adminUserIds,
      NotificationType.ADMIN,
      'New Affiliate Application',
      `${affiliateName} (${affiliateEmail}) has submitted an affiliate application.`,
      `/admin/affiliates/${affiliateId}`,
      { affiliateName, affiliateEmail, affiliateId },
    );
  }

  /**
   * Notify affiliate when application is approved
   * Per Section 13.2: Affiliate notification - Application approved
   */
  async notifyAffiliateApplicationApproved(
    userId: string,
    referralCode: string,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.GENERAL,
      title: 'Application Approved',
      message: `Your affiliate application has been approved! Your referral code is: ${referralCode}. Start sharing your link to earn commissions.`,
      actionUrl: '/affiliate/dashboard',
      metadata: { referralCode },
    });
  }

  /**
   * Notify affiliate when application is rejected
   * Per Section 13.2: Affiliate notification - Application rejected
   */
  async notifyAffiliateApplicationRejected(
    userId: string,
    reason: string,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.GENERAL,
      title: 'Application Not Approved',
      message: `Your affiliate application was not approved. Reason: ${reason}. You may reapply after 30 days.`,
      actionUrl: '/affiliate/dashboard',
      metadata: { reason },
    });
  }

  /**
   * Notify affiliate when commission is approved
   * Per Section 13.2: Affiliate notification - Commission approved
   */
  async notifyAffiliateCommissionApproved(
    userId: string,
    amount: number,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.PAYMENT,
      title: 'Commission Approved',
      message: `$${amount.toFixed(2)} in commission has been approved and added to your available balance for withdrawal.`,
      actionUrl: '/affiliate/earnings',
      metadata: { amount },
    });
  }

  /**
   * Notify affiliate when payout is processed
   * Per Section 13.2: Affiliate notification - Payout processed
   */
  async notifyAffiliatePayoutProcessed(
    userId: string,
    amount: number,
    paymentMethod: string,
  ): Promise<void> {
    await this.createNotification({
      userId,
      type: NotificationType.PAYMENT,
      title: 'Payout Processed',
      message: `Your payout of $${amount.toFixed(2)} has been processed via ${paymentMethod}. Funds should arrive within 3-5 business days.`,
      actionUrl: '/affiliate/earnings',
      metadata: { amount, paymentMethod },
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
