import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { AuditService } from '@modules/audit/audit.service';
import { EmailService } from '@modules/email/email.service';
import { NotificationsService } from '@modules/notifications/notifications.service';
import { TrackingService } from './services/tracking.service';
import { CommissionService } from './services/commission.service';
import { AffiliatePayoutService } from './services/payout.service';
import {
  RegisterAffiliateDto,
  ApproveAffiliateDto,
  AffiliateProfileResponseDto,
  AffiliateListItemDto,
  AffiliateStatsDto,
  AffiliateChartDataDto,
  ChartDataPointDto,
  ReferredAuthorDto,
  ReferredAuthorDetailDto,
} from './dto';
import { randomBytes } from 'crypto';
import { UserRole, EmailType } from '@prisma/client';

@Injectable()
export class AffiliatesService {
  private readonly logger = new Logger(AffiliatesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
    private readonly trackingService: TrackingService,
    private readonly commissionService: CommissionService,
    private readonly payoutService: AffiliatePayoutService,
  ) {}

  /**
   * Register as affiliate (creates application)
   */
  async register(userId: string, dto: RegisterAffiliateDto): Promise<AffiliateProfileResponseDto> {
    try {
      // Check if user already has affiliate profile
      const existing = await this.prisma.affiliateProfile.findUnique({
        where: { userId },
      });

      if (existing) {
        throw new ConflictException('User already has an affiliate profile');
      }

      // Get user details
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Generate unique referral code
      const referralCode = await this.generateUniqueReferralCode();

      // Validate custom slug if provided
      let customSlug = dto.customSlug?.toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (customSlug) {
        const slugExists = await this.prisma.affiliateProfile.findUnique({
          where: { customSlug },
        });
        if (slugExists) {
          throw new BadRequestException('Custom slug already taken');
        }
      }

      // Parse social media URLs
      const socialMediaUrls = dto.socialMediaUrls ? JSON.stringify(dto.socialMediaUrls.split(',').map((url) => url.trim())) : null;

      // Create affiliate profile
      const profile = await this.prisma.affiliateProfile.create({
        data: {
          userId,
          referralCode,
          customSlug: customSlug || null,
          websiteUrl: dto.websiteUrl,
          socialMediaUrls,
          promotionPlan: dto.promotionPlan,
          estimatedReach: dto.estimatedReach,
          isApproved: false, // Requires admin approval
          isActive: true,
        },
      });

      this.logger.log(`Affiliate registration created for user ${userId}, code: ${referralCode}`);

      // Send "Application Received" email to affiliate
      // Per requirements Section 1.5: "Email sent to affiliate confirming application received"
      try {
        await this.emailService.sendTemplatedEmail(
          user.email,
          EmailType.AFFILIATE_APPLICATION_RECEIVED,
          {
            affiliateName: user.name || 'Affiliate',
            websiteUrl: dto.websiteUrl,
            dashboardUrl: '/affiliate/dashboard',
          },
          user.id,
          user.preferredLanguage,
        );
        this.logger.log(`Sent affiliate application received email to ${user.email}`);
      } catch (emailError) {
        this.logger.error(`Failed to send affiliate application email: ${emailError.message}`);
      }

      // Send notification to all admins about new affiliate application
      // Per requirements Section 8.1: "Admin receives notification of new application"
      // Per requirements Section 13.2: "Admin notification - New affiliate application"
      try {
        const admins = await this.prisma.user.findMany({
          where: { role: UserRole.ADMIN },
          select: { id: true, email: true, name: true, preferredLanguage: true },
        });

        // Send in-app notifications to admins (Section 13.2)
        const adminIds = admins.map((admin) => admin.id);
        await this.notificationsService.notifyAdminNewAffiliateApplication(
          adminIds,
          user.name || 'Unknown',
          user.email,
          profile.id,
        );

        // Send email notifications
        for (const admin of admins) {
          await this.emailService.sendTemplatedEmail(
            admin.email,
            EmailType.ADMIN_NEW_AFFILIATE_APPLICATION,
            {
              adminName: admin.name || 'Admin',
              affiliateName: user.name || 'Unknown',
              affiliateEmail: user.email,
              websiteUrl: dto.websiteUrl,
              promotionPlan: dto.promotionPlan,
              reviewUrl: '/admin/affiliates',
            },
            admin.id,
            admin.preferredLanguage,
          );
        }
        this.logger.log(`Sent new affiliate application notifications to ${admins.length} admins`);
      } catch (emailError) {
        this.logger.error(`Failed to send admin notification: ${emailError.message}`);
      }

      return this.toResponseDto(profile, user);
    } catch (error) {
      this.logger.error(`Error registering affiliate: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get affiliate profile (with stats)
   */
  async getProfile(userId: string): Promise<AffiliateProfileResponseDto> {
    try {
      const profile = await this.prisma.affiliateProfile.findUnique({
        where: { userId },
        include: { user: true },
      });

      if (!profile) {
        throw new NotFoundException('Affiliate profile not found');
      }

      const stats = await this.getStats(profile.id);

      return this.toResponseDto(profile, profile.user, stats);
    } catch (error) {
      this.logger.error(`Error getting affiliate profile: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get affiliate by ID (for admin)
   */
  async getById(id: string): Promise<AffiliateProfileResponseDto> {
    try {
      const profile = await this.prisma.affiliateProfile.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!profile) {
        throw new NotFoundException('Affiliate not found');
      }

      const stats = await this.getStats(id);

      return this.toResponseDto(profile, profile.user, stats);
    } catch (error) {
      this.logger.error(`Error getting affiliate by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all affiliates (for admin)
   */
  async getAllForAdmin(): Promise<AffiliateListItemDto[]> {
    try {
      const profiles = await this.prisma.affiliateProfile.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      });

      return profiles.map((profile) => this.toListItemDto(profile, profile.user));
    } catch (error) {
      this.logger.error(`Error getting all affiliates: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Approve or reject affiliate application (admin)
   */
  async approveAffiliate(
    id: string,
    dto: ApproveAffiliateDto,
    adminUserId: string,
  ): Promise<AffiliateProfileResponseDto> {
    try {
      const profile = await this.prisma.affiliateProfile.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!profile) {
        throw new NotFoundException('Affiliate not found');
      }

      if (profile.isApproved) {
        throw new BadRequestException('Affiliate already approved');
      }

      const updateData: any = {};

      if (dto.approve) {
        // Approve
        updateData.isApproved = true;
        updateData.approvedAt = new Date();
        updateData.approvedBy = adminUserId;
        updateData.rejectedAt = null;
        updateData.rejectionReason = null;

        if (dto.commissionRate !== undefined) {
          updateData.commissionRate = dto.commissionRate;
        }

        this.logger.log(`Affiliate ${id} approved by admin ${adminUserId}`);
      } else {
        // Reject
        if (!dto.rejectionReason) {
          throw new BadRequestException('Rejection reason is required');
        }

        updateData.isApproved = false;
        updateData.rejectedAt = new Date();
        updateData.rejectionReason = dto.rejectionReason;
        updateData.approvedAt = null;
        updateData.approvedBy = null;

        this.logger.log(`Affiliate ${id} rejected by admin ${adminUserId}`);
      }

      const updated = await this.prisma.affiliateProfile.update({
        where: { id },
        data: updateData,
      });

      // Audit logging
      try {
        const admin = await this.prisma.user.findUnique({ where: { id: adminUserId } });
        await this.auditService.logAdminAction({
          userId: adminUserId,
          userEmail: admin?.email || 'unknown',
          userRole: UserRole.ADMIN,
          action: dto.approve ? 'affiliate.approved' : 'affiliate.rejected',
          entity: 'AffiliateProfile',
          entityId: id,
          changes: dto.approve
            ? { approved: true, commissionRate: dto.commissionRate }
            : { rejected: true, reason: dto.rejectionReason },
          description: dto.approve
            ? `Affiliate ${profile.user.email} approved with ${dto.commissionRate || 20}% commission rate`
            : `Affiliate ${profile.user.email} rejected. Reason: ${dto.rejectionReason}`,
        });
      } catch (auditError) {
        this.logger.error(`Failed to log audit for affiliate approval: ${auditError.message}`);
      }

      // Send approval/rejection notification to affiliate
      // Per requirements Section 1.5:
      // - If Approved: Affiliate receives email with dashboard access, unique referral link is generated
      // - If Rejected: Affiliate receives email with rejection reason, can reapply after 30 days
      // Per requirements Section 13.2: "Affiliate notification - Application approved"
      try {
        if (dto.approve) {
          // Send in-app notification (Section 13.2)
          await this.notificationsService.notifyAffiliateApplicationApproved(
            profile.user.id,
            updated.referralCode,
          );

          // Send email notification
          const referralLink = await this.getReferralLink(id);
          await this.emailService.sendTemplatedEmail(
            profile.user.email,
            EmailType.AFFILIATE_APPLICATION_APPROVED,
            {
              affiliateName: profile.user.name || 'Affiliate',
              referralCode: updated.referralCode,
              dashboardUrl: '/affiliate/dashboard',
              actionUrl: referralLink,
            },
            profile.user.id,
            profile.user.preferredLanguage,
          );
          this.logger.log(`Sent affiliate approval notifications to ${profile.user.email}`);
        } else {
          // Send in-app notification (Section 13.2)
          await this.notificationsService.notifyAffiliateApplicationRejected(
            profile.user.id,
            dto.rejectionReason || 'Application did not meet requirements',
          );

          // Send email notification
          await this.emailService.sendTemplatedEmail(
            profile.user.email,
            EmailType.AFFILIATE_APPLICATION_REJECTED,
            {
              affiliateName: profile.user.name || 'Affiliate',
              rejectionReason: dto.rejectionReason,
              supportUrl: '/support',
            },
            profile.user.id,
            profile.user.preferredLanguage,
          );
          this.logger.log(`Sent affiliate rejection notifications to ${profile.user.email}`);
        }
      } catch (emailError) {
        this.logger.error(`Failed to send affiliate approval/rejection notifications: ${emailError.message}`);
      }

      return this.toResponseDto(updated, profile.user);
    } catch (error) {
      this.logger.error(`Error approving affiliate: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get affiliate stats
   */
  async getStats(affiliateProfileId: string): Promise<AffiliateStatsDto> {
    try {
      const profile = await this.prisma.affiliateProfile.findUnique({
        where: { id: affiliateProfileId },
      });

      if (!profile) {
        throw new NotFoundException('Affiliate profile not found');
      }

      // Get referral count
      const totalReferrals = await this.prisma.affiliateReferral.count({
        where: { affiliateProfileId },
      });

      // Get active referrals (those who made at least one purchase)
      const activeReferrals = await this.prisma.affiliateReferral.count({
        where: {
          affiliateProfileId,
          firstPurchaseAt: { not: null },
        },
      });

      const conversionRate = profile.conversionRate ? parseFloat(profile.conversionRate.toString()) : 0;

      return {
        totalClicks: profile.totalClicks,
        totalConversions: profile.totalConversions,
        conversionRate,
        totalEarnings: parseFloat(profile.totalEarnings.toString()),
        pendingEarnings: parseFloat(profile.pendingEarnings.toString()),
        approvedEarnings: parseFloat(profile.approvedEarnings.toString()),
        paidEarnings: parseFloat(profile.paidEarnings.toString()),
        totalReferrals,
        activeReferrals,
      };
    } catch (error) {
      this.logger.error(`Error getting affiliate stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get chart data (clicks and conversions over last 30 days) - Section 6.1
   */
  async getChartData(affiliateProfileId: string): Promise<AffiliateChartDataDto> {
    try {
      const profile = await this.prisma.affiliateProfile.findUnique({
        where: { id: affiliateProfileId },
      });

      if (!profile) {
        throw new NotFoundException('Affiliate profile not found');
      }

      // Get last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get clicks grouped by day
      const clicks = await this.prisma.affiliateClick.groupBy({
        by: ['clickedAt'],
        where: {
          affiliateProfileId,
          clickedAt: { gte: thirtyDaysAgo },
        },
        _count: { _all: true },
      });

      // Get conversions (sign-ups) grouped by day
      const conversions = await this.prisma.affiliateReferral.groupBy({
        by: ['registeredAt'],
        where: {
          affiliateProfileId,
          registeredAt: { gte: thirtyDaysAgo },
        },
        _count: { _all: true },
      });

      // Create date range for last 30 days
      const clicksData: ChartDataPointDto[] = [];
      const conversionsData: ChartDataPointDto[] = [];

      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Find clicks for this date
        const clickCount = clicks
          .filter((c) => c.clickedAt?.toISOString().split('T')[0] === dateStr)
          .reduce((sum, c) => sum + (c._count?._all || 0), 0);

        // Find conversions for this date
        const conversionCount = conversions
          .filter((c) => c.registeredAt?.toISOString().split('T')[0] === dateStr)
          .reduce((sum, c) => sum + (c._count?._all || 0), 0);

        clicksData.push({ date: dateStr, value: clickCount });
        conversionsData.push({ date: dateStr, value: conversionCount });
      }

      return {
        clicks: clicksData,
        conversions: conversionsData,
      };
    } catch (error) {
      this.logger.error(`Error getting chart data: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get referred authors list - Section 6.3
   */
  async getReferredAuthors(affiliateProfileId: string): Promise<ReferredAuthorDto[]> {
    try {
      const referrals = await this.prisma.affiliateReferral.findMany({
        where: { affiliateProfileId },
        orderBy: { registeredAt: 'desc' },
      });

      const result: ReferredAuthorDto[] = [];

      for (const referral of referrals) {
        // Get the referred author's email
        const authorProfile = await this.prisma.authorProfile.findUnique({
          where: { id: referral.referredAuthorId },
          include: { user: { select: { email: true } } },
        });

        // Get commissions for this referral
        const commissions = await this.prisma.affiliateCommission.findMany({
          where: {
            affiliateProfileId,
            referredAuthorId: referral.referredAuthorId,
          },
          orderBy: { createdAt: 'desc' },
        });

        const totalCommissionEarned = commissions.reduce(
          (sum, c) => sum + parseFloat(c.commissionAmount.toString()),
          0,
        );
        const totalPurchases = commissions.length;
        const lastPurchaseDate =
          commissions.length > 0 ? commissions[0].createdAt : undefined;

        // Mask email for privacy (show first 3 chars + *** + domain)
        const email = authorProfile?.user?.email || 'unknown';
        const [localPart, domain] = email.split('@');
        const maskedEmail =
          localPart.length > 3
            ? `${localPart.substring(0, 3)}***@${domain}`
            : `${localPart}***@${domain}`;

        result.push({
          id: referral.id,
          authorIdentifier: maskedEmail,
          signUpDate: referral.registeredAt || referral.createdAt,
          totalPurchases,
          totalCommissionEarned,
          lastPurchaseDate,
        });
      }

      return result;
    } catch (error) {
      this.logger.error(`Error getting referred authors: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get referred author detail with purchase history - Section 6.3
   */
  async getReferredAuthorDetail(
    affiliateProfileId: string,
    referralId: string,
  ): Promise<ReferredAuthorDetailDto> {
    try {
      const referral = await this.prisma.affiliateReferral.findFirst({
        where: {
          id: referralId,
          affiliateProfileId,
        },
      });

      if (!referral) {
        throw new NotFoundException('Referral not found');
      }

      // Get the referred author's email
      const authorProfile = await this.prisma.authorProfile.findUnique({
        where: { id: referral.referredAuthorId },
        include: { user: { select: { email: true } } },
      });

      // Get commissions for this referral
      const commissions = await this.prisma.affiliateCommission.findMany({
        where: {
          affiliateProfileId,
          referredAuthorId: referral.referredAuthorId,
        },
        orderBy: { createdAt: 'desc' },
      });

      const totalCommissionEarned = commissions.reduce(
        (sum, c) => sum + parseFloat(c.commissionAmount.toString()),
        0,
      );
      const totalPurchases = commissions.length;
      const lastPurchaseDate =
        commissions.length > 0 ? commissions[0].createdAt : undefined;

      // Mask email for privacy
      const email = authorProfile?.user?.email || 'unknown';
      const [localPart, domain] = email.split('@');
      const maskedEmail =
        localPart.length > 3
          ? `${localPart.substring(0, 3)}***@${domain}`
          : `${localPart}***@${domain}`;

      // Purchase history (amounts only, no details per requirements)
      const purchaseHistory = commissions.map((c) => ({
        amount: parseFloat(c.purchaseAmount.toString()),
        date: c.createdAt,
        commission: parseFloat(c.commissionAmount.toString()),
      }));

      return {
        id: referral.id,
        authorIdentifier: maskedEmail,
        signUpDate: referral.registeredAt || referral.createdAt,
        totalPurchases,
        totalCommissionEarned,
        lastPurchaseDate,
        purchaseHistory,
      };
    } catch (error) {
      this.logger.error(`Error getting referred author detail: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate referral link
   */
  async getReferralLink(affiliateProfileId: string, baseUrl: string = 'https://bookproof.com'): Promise<string> {
    try {
      const profile = await this.prisma.affiliateProfile.findUnique({
        where: { id: affiliateProfileId },
      });

      if (!profile) {
        throw new NotFoundException('Affiliate profile not found');
      }

      if (!profile.isApproved || !profile.isActive) {
        throw new BadRequestException('Affiliate is not active');
      }

      // Use custom slug if available, otherwise use referral code
      const refParam = profile.customSlug || profile.referralCode;

      return `${baseUrl}?ref=${refParam}`;
    } catch (error) {
      this.logger.error(`Error generating referral link: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Toggle affiliate active status (Admin)
   */
  async toggleAffiliateActive(id: string, adminUserId: string): Promise<AffiliateProfileResponseDto> {
    try {
      const profile = await this.prisma.affiliateProfile.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!profile) {
        throw new NotFoundException('Affiliate not found');
      }

      const newStatus = !profile.isActive;

      const updated = await this.prisma.affiliateProfile.update({
        where: { id },
        data: { isActive: newStatus },
      });

      this.logger.log(
        `Affiliate ${id} ${newStatus ? 'enabled' : 'disabled'} by admin ${adminUserId}`,
      );

      // Audit logging
      try {
        const admin = await this.prisma.user.findUnique({ where: { id: adminUserId } });
        await this.auditService.logAdminAction({
          userId: adminUserId,
          userEmail: admin?.email || 'unknown',
          userRole: UserRole.ADMIN,
          action: newStatus ? 'affiliate.enabled' : 'affiliate.disabled',
          entity: 'AffiliateProfile',
          entityId: id,
          changes: { isActive: { before: profile.isActive, after: newStatus } },
          description: `Affiliate ${profile.user.email} ${newStatus ? 'enabled' : 'disabled'}`,
        });
      } catch (auditError) {
        this.logger.error(`Failed to log audit for affiliate status toggle: ${auditError.message}`);
      }

      return this.toResponseDto(updated, profile.user);
    } catch (error) {
      this.logger.error(`Error toggling affiliate status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update affiliate commission rate (Admin)
   */
  async updateCommissionRate(
    id: string,
    commissionRate: number,
    adminUserId: string,
  ): Promise<AffiliateProfileResponseDto> {
    try {
      if (commissionRate < 0 || commissionRate > 100) {
        throw new BadRequestException('Commission rate must be between 0 and 100');
      }

      const profile = await this.prisma.affiliateProfile.findUnique({
        where: { id },
        include: { user: true },
      });

      if (!profile) {
        throw new NotFoundException('Affiliate not found');
      }

      const oldRate = parseFloat(profile.commissionRate.toString());

      const updated = await this.prisma.affiliateProfile.update({
        where: { id },
        data: { commissionRate },
      });

      this.logger.log(
        `Affiliate ${id} commission rate updated to ${commissionRate}% by admin ${adminUserId}`,
      );

      // Audit logging
      try {
        const admin = await this.prisma.user.findUnique({ where: { id: adminUserId } });
        await this.auditService.logAdminAction({
          userId: adminUserId,
          userEmail: admin?.email || 'unknown',
          userRole: UserRole.ADMIN,
          action: 'affiliate.commission_rate_updated',
          entity: 'AffiliateProfile',
          entityId: id,
          changes: { commissionRate: { before: oldRate, after: commissionRate } },
          description: `Affiliate ${profile.user.email} commission rate updated from ${oldRate}% to ${commissionRate}%`,
        });
      } catch (auditError) {
        this.logger.error(`Failed to log audit for commission rate update: ${auditError.message}`);
      }

      return this.toResponseDto(updated, profile.user);
    } catch (error) {
      this.logger.error(`Error updating commission rate: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate unique referral code
   */
  private async generateUniqueReferralCode(): Promise<string> {
    let code: string = '';
    let exists = true;

    while (exists) {
      // Generate 6-character alphanumeric code
      code = randomBytes(3).toString('hex').toUpperCase();

      const existing = await this.prisma.affiliateProfile.findUnique({
        where: { referralCode: code },
      });

      exists = !!existing;
    }

    return code;
  }

  /**
   * Convert to response DTO
   */
  private toResponseDto(profile: any, user: any, stats?: AffiliateStatsDto): AffiliateProfileResponseDto {
    return {
      id: profile.id,
      userId: profile.userId,
      userEmail: user.email,
      userName: user.name,
      referralCode: profile.referralCode,
      customSlug: profile.customSlug,
      commissionRate: parseFloat(profile.commissionRate.toString()),
      lifetimeCommission: profile.lifetimeCommission,
      isActive: profile.isActive,
      isApproved: profile.isApproved,
      approvedAt: profile.approvedAt,
      websiteUrl: profile.websiteUrl,
      socialMediaUrls: profile.socialMediaUrls,
      promotionPlan: profile.promotionPlan,
      estimatedReach: profile.estimatedReach,
      rejectedAt: profile.rejectedAt,
      rejectionReason: profile.rejectionReason,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      stats,
    };
  }

  /**
   * Convert to list item DTO
   */
  private toListItemDto(profile: any, user: any): AffiliateListItemDto {
    return {
      id: profile.id,
      userEmail: user.email,
      userName: user.name,
      referralCode: profile.referralCode,
      commissionRate: parseFloat(profile.commissionRate.toString()),
      totalEarnings: parseFloat(profile.totalEarnings.toString()),
      approvedEarnings: parseFloat(profile.approvedEarnings.toString()),
      totalClicks: profile.totalClicks,
      totalConversions: profile.totalConversions,
      isApproved: profile.isApproved,
      isActive: profile.isActive,
      createdAt: profile.createdAt,
    };
  }
}
