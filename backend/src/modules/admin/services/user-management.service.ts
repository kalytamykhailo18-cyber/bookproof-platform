import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { AuditService } from '@modules/audit/audit.service';
import { EmailService } from '@modules/email/email.service';
import { LogSeverity, UserRole, EmailType } from '@prisma/client';
import * as crypto from 'crypto';
import {
  BanUserDto,
  UnbanUserDto,
  ChangeUserRoleDto,
  AdminResetPasswordDto,
  UpdateEmailVerificationDto,
  SendUserEmailDto,
  AdminEditUserProfileDto,
} from '../dto/user-management.dto';

/**
 * Service for admin user management operations (Section 5.2)
 */
@Injectable()
export class UserManagementService {
  private readonly logger = new Logger(UserManagementService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private emailService: EmailService,
  ) {}

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        authorProfile: true,
        readerProfile: true,
        adminProfile: true,
        closerProfile: true,
        affiliateProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Ban a user (permanent suspension)
   */
  async banUser(
    userId: string,
    dto: BanUserDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    const user = await this.getUserById(userId);

    if (user.isBanned) {
      throw new BadRequestException('User is already banned');
    }

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Cannot ban admin users');
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        bannedBy: adminUserId,
        banReason: dto.reason,
        isActive: false,
        tokenVersion: { increment: 1 }, // Invalidate all sessions
      },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'user.banned',
      entity: 'User',
      entityId: userId,
      changes: {
        isBanned: { before: false, after: true },
        isActive: { before: user.isActive, after: false },
      },
      description: `User ${user.email} permanently banned. Reason: ${dto.reason}${dto.notes ? `. Notes: ${dto.notes}` : ''}`,
      ipAddress,
      severity: LogSeverity.WARNING,
    });

    this.logger.log(`User ${user.email} banned by ${adminEmail}`);

    return updatedUser;
  }

  /**
   * Unban a user
   */
  async unbanUser(
    userId: string,
    dto: UnbanUserDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    const user = await this.getUserById(userId);

    if (!user.isBanned) {
      throw new BadRequestException('User is not banned');
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        bannedAt: null,
        bannedBy: null,
        banReason: null,
        isActive: true,
      },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'user.unbanned',
      entity: 'User',
      entityId: userId,
      changes: {
        isBanned: { before: true, after: false },
        isActive: { before: false, after: true },
      },
      description: `User ${user.email} unbanned. Reason: ${dto.reason}${dto.notes ? `. Notes: ${dto.notes}` : ''}`,
      ipAddress,
      severity: LogSeverity.INFO,
    });

    this.logger.log(`User ${user.email} unbanned by ${adminEmail}`);

    return updatedUser;
  }

  /**
   * Change user role
   */
  async changeUserRole(
    userId: string,
    dto: ChangeUserRoleDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    const user = await this.getUserById(userId);

    if (user.role === dto.newRole) {
      throw new BadRequestException('User already has this role');
    }

    // Prevent changing to/from admin without super admin
    if (user.role === UserRole.ADMIN || dto.newRole === UserRole.ADMIN) {
      throw new BadRequestException('Admin role changes require super admin approval');
    }

    const oldRole = user.role;

    // Update user role
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        role: dto.newRole,
      },
    });

    // Create profile for new role if needed (basic profile creation)
    if (dto.newRole === UserRole.AUTHOR && !user.authorProfile) {
      await this.prisma.authorProfile.create({
        data: {
          userId: userId,
        },
      });
    } else if (dto.newRole === UserRole.READER && !user.readerProfile) {
      await this.prisma.readerProfile.create({
        data: {
          userId: userId,
          contentPreference: 'BOTH', // Default to both ebook and audiobook
        },
      });
    }

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'user.role_changed',
      entity: 'User',
      entityId: userId,
      changes: {
        role: { before: oldRole, after: dto.newRole },
      },
      description: `User ${user.email} role changed from ${oldRole} to ${dto.newRole}. Reason: ${dto.reason}`,
      ipAddress,
      severity: LogSeverity.WARNING,
    });

    this.logger.log(`User ${user.email} role changed from ${oldRole} to ${dto.newRole} by ${adminEmail}`);

    return updatedUser;
  }

  /**
   * Admin-initiated password reset
   */
  async resetUserPassword(
    userId: string,
    dto: AdminResetPasswordDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    const user = await this.getUserById(userId);

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create password reset record
    await this.prisma.passwordReset.create({
      data: {
        userId: userId,
        token: resetToken,
        expiresAt,
      },
    });

    // Invalidate all existing sessions
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        tokenVersion: { increment: 1 },
      },
    });

    // Send password reset email if requested
    if (dto.sendEmail !== false) {
      try {
        await this.emailService.sendTemplatedEmail(
          user.email,
          EmailType.PASSWORD_RESET,
          {
            userName: user.name,
            resetLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`,
          },
          userId,
          user.preferredLanguage,
        );
      } catch (error) {
        this.logger.error(`Failed to send password reset email to ${user.email}: ${error.message}`);
      }
    }

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'user.password_reset',
      entity: 'User',
      entityId: userId,
      description: `Password reset initiated for user ${user.email}${dto.reason ? `. Reason: ${dto.reason}` : ''}`,
      ipAddress,
      severity: LogSeverity.WARNING,
    });

    this.logger.log(`Password reset initiated for ${user.email} by ${adminEmail}`);

    return {
      success: true,
      message: dto.sendEmail !== false
        ? 'Password reset email sent to user'
        : 'Password reset initiated. User sessions invalidated.',
      resetToken: dto.sendEmail === false ? resetToken : undefined, // Only return token if email not sent
    };
  }

  /**
   * Update email verification status
   */
  async updateEmailVerification(
    userId: string,
    dto: UpdateEmailVerificationDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    const user = await this.getUserById(userId);

    if (user.emailVerified === dto.verified) {
      throw new BadRequestException(
        `User email is already ${dto.verified ? 'verified' : 'unverified'}`,
      );
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: dto.verified,
        emailVerifiedAt: dto.verified ? new Date() : null,
      },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: dto.verified ? 'user.email_verified' : 'user.email_unverified',
      entity: 'User',
      entityId: userId,
      changes: {
        emailVerified: { before: user.emailVerified, after: dto.verified },
      },
      description: `User ${user.email} email ${dto.verified ? 'verified' : 'unverified'} by admin${dto.reason ? `. Reason: ${dto.reason}` : ''}`,
      ipAddress,
      severity: LogSeverity.INFO,
    });

    this.logger.log(`Email verification for ${user.email} set to ${dto.verified} by ${adminEmail}`);

    return updatedUser;
  }

  /**
   * Send email to user (admin-initiated)
   */
  async sendEmailToUser(
    userId: string,
    dto: SendUserEmailDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    const user = await this.getUserById(userId);

    // Send custom admin email
    try {
      await this.emailService.sendTemplatedEmail(
        user.email,
        EmailType.ADMIN_NOTIFICATION,
        {
          userName: user.name,
          subject: dto.subject,
          message: dto.message,
          adminEmail: adminEmail,
        },
        userId,
        user.preferredLanguage,
      );
    } catch (error) {
      this.logger.error(`Failed to send admin email to ${user.email}: ${error.message}`);
      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'user.email_sent',
      entity: 'User',
      entityId: userId,
      description: `Admin email sent to ${user.email}. Subject: ${dto.subject}`,
      ipAddress,
      severity: LogSeverity.INFO,
    });

    this.logger.log(`Admin email sent to ${user.email} by ${adminEmail}`);

    return {
      success: true,
      message: `Email sent to ${user.email}`,
    };
  }

  /**
   * Edit user profile (admin override)
   */
  async editUserProfile(
    userId: string,
    dto: AdminEditUserProfileDto,
    adminUserId: string,
    adminEmail: string,
    ipAddress?: string,
  ) {
    const user = await this.getUserById(userId);

    // Check if email already exists (if changing email)
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
    }

    // Build update data
    const updateData: any = {};
    const changes: Record<string, { before: any; after: any }> = {};

    if (dto.name !== undefined && dto.name !== user.name) {
      updateData.name = dto.name;
      changes.name = { before: user.name, after: dto.name };
    }

    if (dto.email !== undefined && dto.email !== user.email) {
      updateData.email = dto.email;
      updateData.emailVerified = false; // Require re-verification if email changed
      changes.email = { before: user.email, after: dto.email };
      changes.emailVerified = { before: user.emailVerified, after: false };
    }

    if (dto.phone !== undefined && dto.phone !== user.phone) {
      updateData.phone = dto.phone;
      changes.phone = { before: user.phone, after: dto.phone };
    }

    if (dto.country !== undefined && dto.country !== user.country) {
      updateData.country = dto.country;
      changes.country = { before: user.country, after: dto.country };
    }

    if (dto.companyName !== undefined && dto.companyName !== user.companyName) {
      updateData.companyName = dto.companyName;
      changes.companyName = { before: user.companyName, after: dto.companyName };
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No changes provided');
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      userId: adminUserId,
      userEmail: adminEmail,
      userRole: UserRole.ADMIN,
      action: 'user.profile_edited',
      entity: 'User',
      entityId: userId,
      changes,
      description: `User ${user.email} profile edited by admin${dto.reason ? `. Reason: ${dto.reason}` : ''}`,
      ipAddress,
      severity: LogSeverity.INFO,
    });

    this.logger.log(`User ${user.email} profile edited by ${adminEmail}`);

    return updatedUser;
  }

  /**
   * Get user audit log
   */
  async getUserAuditLog(userId: string, page = 1, limit = 50) {
    const user = await this.getUserById(userId);

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: {
          OR: [
            { userId: userId }, // Actions by this user
            { entityId: userId, entity: 'User' }, // Actions on this user
          ],
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({
        where: {
          OR: [
            { userId: userId },
            { entityId: userId, entity: 'User' },
          ],
        },
      }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
