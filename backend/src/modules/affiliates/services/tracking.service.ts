import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { NotificationsService } from '@modules/notifications/notifications.service';
import { TrackClickDto } from '../dto';
import { randomBytes } from 'crypto';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);
  private readonly COOKIE_NAME = 'bp_aff_ref';
  private readonly COOKIE_EXPIRY_DAYS = 90; // 90-day cookie duration per business requirements

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Track an affiliate click
   * Creates a click record and generates a cookie ID for attribution
   */
  async trackClick(dto: TrackClickDto, request: any): Promise<{ cookieId: string; cookieExpiry: Date }> {
    try {
      // Find affiliate by referral code
      const affiliate = await this.prisma.affiliateProfile.findUnique({
        where: { referralCode: dto.referralCode },
      });

      if (!affiliate) {
        this.logger.warn(`Invalid referral code: ${dto.referralCode}`);
        throw new Error('Invalid referral code');
      }

      if (!affiliate.isApproved || !affiliate.isActive) {
        this.logger.warn(`Inactive/unapproved affiliate: ${dto.referralCode}`);
        throw new Error('Affiliate is not active');
      }

      // Extract tracking data from request
      const ipAddress = dto.ipAddress || this.extractIpAddress(request);
      const userAgent = dto.userAgent || request.headers['user-agent'];

      // Generate unique cookie ID
      const cookieId = this.generateCookieId();
      const cookieExpiry = new Date();
      cookieExpiry.setDate(cookieExpiry.getDate() + this.COOKIE_EXPIRY_DAYS);

      // Create click record
      await this.prisma.affiliateClick.create({
        data: {
          affiliateProfileId: affiliate.id,
          ipAddress,
          userAgent,
          refererUrl: dto.refererUrl,
          landingPage: dto.landingPage,
          cookieSet: true,
          cookieId,
        },
      });

      // Update total clicks counter
      await this.prisma.affiliateProfile.update({
        where: { id: affiliate.id },
        data: { totalClicks: { increment: 1 } },
      });

      this.logger.log(`Click tracked for affiliate ${affiliate.referralCode}, cookie: ${cookieId}`);

      return { cookieId, cookieExpiry };
    } catch (error) {
      this.logger.error(`Error tracking click: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get affiliate from cookie
   * Returns affiliate profile if valid cookie exists
   */
  async getAffiliateFromCookie(cookieId: string): Promise<string | null> {
    if (!cookieId) return null;

    try {
      // Find click by cookie ID
      const click = await this.prisma.affiliateClick.findUnique({
        where: { cookieId },
        include: { affiliateProfile: true },
      });

      if (!click) return null;

      // Check if cookie is still valid (not older than 90 days per business requirements)
      const now = new Date();
      const clickAge = now.getTime() - click.clickedAt.getTime();
      const maxAge = this.COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

      if (clickAge > maxAge) {
        this.logger.debug(`Cookie expired: ${cookieId}`);
        return null;
      }

      // Check if affiliate is still active
      if (!click.affiliateProfile.isApproved || !click.affiliateProfile.isActive) {
        this.logger.debug(`Affiliate inactive for cookie: ${cookieId}`);
        return null;
      }

      return click.affiliateProfile.id;
    } catch (error) {
      this.logger.error(`Error getting affiliate from cookie: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Track conversion (when referred user registers)
   * Includes self-referral fraud prevention
   */
  async trackConversion(
    affiliateProfileId: string,
    referredAuthorId: string,
    cookieId: string,
    request: any,
  ): Promise<void> {
    try {
      // FRAUD PREVENTION: Check for self-referral
      // Get the affiliate's user ID and the referred author's user ID
      const [affiliate, authorProfile] = await Promise.all([
        this.prisma.affiliateProfile.findUnique({
          where: { id: affiliateProfileId },
          select: { userId: true, referralCode: true },
        }),
        this.prisma.authorProfile.findUnique({
          where: { id: referredAuthorId },
          select: { userId: true },
        }),
      ]);

      if (!affiliate || !authorProfile) {
        this.logger.warn(`Invalid affiliate or author profile for conversion tracking`);
        return;
      }

      // Block self-referrals: affiliate cannot refer themselves
      if (affiliate.userId === authorProfile.userId) {
        this.logger.warn(
          `FRAUD DETECTED: Self-referral attempt blocked. Affiliate user ${affiliate.userId} tried to refer themselves. Referral code: ${affiliate.referralCode}`,
        );
        return; // Silently reject self-referral
      }

      // FRAUD PREVENTION: Check for same IP address pattern (same household/device)
      const ipAddress = this.extractIpAddress(request);
      const recentClicksFromSameIp = await this.prisma.affiliateClick.count({
        where: {
          affiliateProfileId,
          ipAddress,
          clickedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      if (recentClicksFromSameIp > 10) {
        this.logger.warn(
          `SUSPICIOUS: High click count (${recentClicksFromSameIp}) from same IP ${ipAddress} for affiliate ${affiliate.referralCode}`,
        );
        // Continue with conversion but flag for review
      }

      // Update click to mark as converted
      if (cookieId) {
        await this.prisma.affiliateClick.updateMany({
          where: { cookieId },
          data: {
            converted: true,
            convertedAt: new Date(),
          },
        });
      }

      // Extract tracking data
      const userAgent = request.headers['user-agent'];
      const refererSource = request.headers['referer'];

      // Get first click date
      const firstClick = await this.prisma.affiliateClick.findFirst({
        where: { cookieId },
        orderBy: { clickedAt: 'asc' },
      });

      // Create referral record
      await this.prisma.affiliateReferral.create({
        data: {
          affiliateProfileId,
          referredAuthorId,
          firstClickAt: firstClick?.clickedAt,
          registeredAt: new Date(),
          ipAddress,
          userAgent,
          refererSource,
          cookieId,
        },
      });

      // Update affiliate stats
      await this.updateAffiliateStats(affiliateProfileId);

      // Send in-app notification to affiliate about new referral sign-up (Section 13.2)
      try {
        await this.notificationsService.notifyAffiliateNewReferral(
          affiliate.userId,
          'a new author', // Anonymous per privacy requirements
        );
      } catch (notifError) {
        this.logger.error(`Failed to send new referral notification: ${notifError.message}`);
      }

      this.logger.log(`Conversion tracked for affiliate ${affiliateProfileId}, author: ${referredAuthorId}`);
    } catch (error) {
      this.logger.error(`Error tracking conversion: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update affiliate statistics (conversions, conversion rate)
   */
  async updateAffiliateStats(affiliateProfileId: string): Promise<void> {
    try {
      // Get counts
      const [totalClicks, totalConversions] = await Promise.all([
        this.prisma.affiliateClick.count({
          where: { affiliateProfileId },
        }),
        this.prisma.affiliateReferral.count({
          where: { affiliateProfileId },
        }),
      ]);

      // Calculate conversion rate
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      // Update affiliate profile
      await this.prisma.affiliateProfile.update({
        where: { id: affiliateProfileId },
        data: {
          totalClicks,
          totalConversions,
          conversionRate,
        },
      });
    } catch (error) {
      this.logger.error(`Error updating affiliate stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate unique cookie ID
   */
  private generateCookieId(): string {
    return `aff_${randomBytes(16).toString('hex')}`;
  }

  /**
   * Extract IP address from request
   */
  private extractIpAddress(request: any): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    return request.ip || request.connection?.remoteAddress || 'unknown';
  }

  /**
   * Get cookie name for frontend
   */
  getCookieName(): string {
    return this.COOKIE_NAME;
  }

  /**
   * Get cookie expiry days
   */
  getCookieExpiryDays(): number {
    return this.COOKIE_EXPIRY_DAYS;
  }
}
