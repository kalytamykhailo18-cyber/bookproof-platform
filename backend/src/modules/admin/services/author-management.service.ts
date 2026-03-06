import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@common/prisma/prisma.service';
import { AuditService } from '@modules/audit/audit.service';
import { EmailService } from '@modules/email/email.service';
import { LogSeverity, UserRole, CampaignStatus, EmailType, Language } from '@prisma/client';
import {
  SuspendAuthorDto,
  UnsuspendAuthorDto,
  UpdateAuthorNotesDto,
} from '../dto/author-management.dto';

/**
 * Service for admin author management operations
 */
@Injectable()
export class AuthorManagementService {
  private readonly logger = new Logger(AuthorManagementService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  /**
   * Suspend an author account
   * Per requirements.md Section 4.5: Pauses all active campaigns
   */
  async suspendAuthor(
    authorProfileId: string,
    dto: SuspendAuthorDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    const author = await this.prisma.authorProfile.findUnique({
      where: { id: authorProfileId },
      include: { user: true },
    });

    if (!author) {
      throw new NotFoundException('Author profile not found');
    }

    if (author.isSuspended) {
      throw new BadRequestException('Author is already suspended');
    }

    // Find all active campaigns to pause
    const activeCampaigns = await this.prisma.book.findMany({
      where: {
        authorProfileId,
        status: CampaignStatus.ACTIVE,
      },
      select: {
        id: true,
        title: true,
      },
    });

    const now = new Date();

    // Use transaction to ensure atomicity
    const result = await this.prisma.$transaction(async (tx) => {
      // Update author profile
      const updatedAuthor = await tx.authorProfile.update({
        where: { id: authorProfileId },
        data: {
          isSuspended: true,
          suspendedAt: now,
          suspendedBy: adminUserId,
          suspendReason: dto.reason,
        },
        include: { user: true },
      });

      // Pause all active campaigns
      const pausedCampaigns = [];
      for (const campaign of activeCampaigns) {
        await tx.book.update({
          where: { id: campaign.id },
          data: {
            status: CampaignStatus.PAUSED,
            distributionPausedAt: now,
          },
        });

        pausedCampaigns.push({
          id: campaign.id,
          title: campaign.title,
        });
      }

      return { updatedAuthor, pausedCampaigns };
    });

    // Log audit trail for author suspension
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'author.suspended',
      entity: 'AuthorProfile',
      entityId: authorProfileId,
      changes: {
        isSuspended: { before: false, after: true },
      },
      description: `Author ${author.user.email} suspended. Reason: ${dto.reason}${dto.notes ? `. Notes: ${dto.notes}` : ''}. Paused ${activeCampaigns.length} active campaign(s).`,
      ipAddress,
      severity: LogSeverity.WARNING,
    });

    // Log audit trail for each paused campaign
    for (const campaign of result.pausedCampaigns) {
      await this.auditService.logAdminAction({
        userId: adminUserId,
        userEmail: adminEmail,
        userRole: UserRole.ADMIN,
        action: 'campaign.paused_by_suspension',
        entity: 'Book',
        entityId: campaign.id,
        changes: {
          status: { before: CampaignStatus.ACTIVE, after: CampaignStatus.PAUSED },
        },
        description: `Campaign "${campaign.title}" paused due to author suspension`,
        ipAddress,
        severity: LogSeverity.WARNING,
      });
    }

    // Send email notification to author (per requirements.md Section 4.5: Author notified)
    try {
      const appUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      const supportEmail = this.configService.get<string>('SUPPORT_EMAIL') || 'support@bookproof.app';

      await this.emailService.sendTemplatedEmail(
        author.user.email,
        EmailType.AUTHOR_SUSPENDED,
        {
          userName: author.user.name || 'Author',
          reason: dto.reason,
          suspendedAt: now.toISOString(),
          pausedCampaignsCount: result.pausedCampaigns.length,
          supportEmail,
          supportUrl: `${appUrl}/contact-support`,
          loginUrl: `${appUrl}/login`,
        },
        author.userId,
        author.user.preferredLanguage || Language.EN,
      );
    } catch (error) {
      this.logger.error(`Failed to send suspension email to ${author.user.email}: ${error.message}`);
      // Don't fail the operation if email fails
    }

    return {
      ...result.updatedAuthor,
      pausedCampaignsCount: result.pausedCampaigns.length,
      pausedCampaigns: result.pausedCampaigns,
    };
  }

  /**
   * Unsuspend an author account
   */
  async unsuspendAuthor(
    authorProfileId: string,
    dto: UnsuspendAuthorDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    const author = await this.prisma.authorProfile.findUnique({
      where: { id: authorProfileId },
      include: { user: true },
    });

    if (!author) {
      throw new NotFoundException('Author profile not found');
    }

    if (!author.isSuspended) {
      throw new BadRequestException('Author is not suspended');
    }

    // Update author profile
    const updatedAuthor = await this.prisma.authorProfile.update({
      where: { id: authorProfileId },
      data: {
        isSuspended: false,
        suspendedAt: null,
        suspendedBy: null,
        suspendReason: null,
      },
      include: { user: true },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'author.unsuspended',
      entity: 'AuthorProfile',
      entityId: authorProfileId,
      changes: {
        isSuspended: { before: true, after: false },
      },
      description: `Author ${author.user.email} unsuspended. Reason: ${dto.reason}${dto.notes ? `. Notes: ${dto.notes}` : ''}`,
      ipAddress,
      severity: LogSeverity.INFO,
    });

    // Send email notification to author
    try {
      const appUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

      await this.emailService.sendTemplatedEmail(
        author.user.email,
        EmailType.AUTHOR_UNSUSPENDED,
        {
          userName: author.user.name || 'Author',
          reason: dto.reason,
          unsuspendedAt: new Date().toISOString(),
          dashboardUrl: `${appUrl}/author/dashboard`,
          loginUrl: `${appUrl}/login`,
        },
        author.userId,
        author.user.preferredLanguage || Language.EN,
      );
    } catch (error) {
      this.logger.error(`Failed to send unsuspension email to ${author.user.email}: ${error.message}`);
      // Don't fail the operation if email fails
    }

    return updatedAuthor;
  }

  /**
   * Update author admin notes
   */
  async updateAdminNotes(
    authorProfileId: string,
    dto: UpdateAuthorNotesDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    const author = await this.prisma.authorProfile.findUnique({
      where: { id: authorProfileId },
      include: { user: true },
    });

    if (!author) {
      throw new NotFoundException('Author profile not found');
    }

    const updatedAuthor = await this.prisma.authorProfile.update({
      where: { id: authorProfileId },
      data: {
        adminNotes: dto.adminNotes,
      },
      include: { user: true },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'author.notes_updated',
      entity: 'AuthorProfile',
      entityId: authorProfileId,
      description: `Author ${author.user.email} admin notes updated`,
      ipAddress,
      severity: LogSeverity.INFO,
    });

    return updatedAuthor;
  }
}
