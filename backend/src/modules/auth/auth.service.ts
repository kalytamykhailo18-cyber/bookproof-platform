import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger, Optional } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@common/prisma/prisma.service';
import { CacheService } from '@common/cache/cache.service';
import { CaptchaService } from '@common/services/captcha.service';
import { PasswordUtil } from '@common/utils/password.util';
import { EmailService } from '@modules/email/email.service';
import { TrackingService } from '@modules/affiliates/services/tracking.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto, RequestPasswordResetDto } from './dto/reset-password.dto';
import { AuthResponseDto, UserDataDto } from './dto/auth-response.dto';
import { CreateAuthorByCloserDto, CreateAuthorByCloserResponseDto } from './dto/create-author-by-closer.dto';
import { CreateAdminDto, CreateAdminResponseDto, AdminLevel, AdminPermission } from './dto/create-admin.dto';
import { CreateCloserDto, CreateCloserResponseDto } from './dto/create-closer.dto';
import { UserRole, ContentPreference, AdminRole } from '@prisma/client';
import { Request } from 'express';

/**
 * Account lockout configuration per requirements.md Section 1.1
 * - After 5 failed login attempts, account is locked for 15 minutes
 * - After 10 failed attempts, account is locked for 1 hour
 */
const LOCKOUT_CONFIG = {
  FIRST_LOCKOUT_ATTEMPTS: 5,           // First lockout after 5 failed attempts
  FIRST_LOCKOUT_DURATION_MINUTES: 15,  // 15 minutes lockout
  SECOND_LOCKOUT_ATTEMPTS: 10,         // Second lockout after 10 failed attempts
  SECOND_LOCKOUT_DURATION_MINUTES: 60, // 1 hour lockout
  FAILED_ATTEMPT_WINDOW_MINUTES: 60,   // Window to count failed attempts (1 hour)
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private captchaService: CaptchaService,
    @Optional()
    private cacheService?: CacheService,
    @Optional() // TrackingService is optional - no forwardRef needed!
    private trackingService?: TrackingService,
  ) {}

  /**
   * Get cache key for login attempts tracking
   */
  private getLoginAttemptsKey(email: string): string {
    return `login_attempts:${email.toLowerCase()}`;
  }

  /**
   * Get cache key for account lockout
   */
  private getLockoutKey(email: string): string {
    return `account_locked:${email.toLowerCase()}`;
  }

  /**
   * Check if account is locked out
   */
  private async isAccountLocked(email: string): Promise<boolean> {
    if (!this.cacheService) return false;
    return await this.cacheService.exists(this.getLockoutKey(email));
  }

  /**
   * Get remaining lockout time in seconds
   */
  private async getRemainingLockoutTime(email: string): Promise<number> {
    if (!this.cacheService) return 0;
    const ttl = await this.cacheService.ttl(this.getLockoutKey(email));
    return ttl > 0 ? ttl : 0;
  }

  /**
   * Record a failed login attempt
   * Per requirements.md Section 1.1:
   * - After 5 failed attempts, account is locked for 15 minutes
   * - After 10 failed attempts, account is locked for 1 hour
   */
  private async recordFailedAttempt(email: string): Promise<void> {
    if (!this.cacheService) return;

    const key = this.getLoginAttemptsKey(email);
    const attempts = await this.cacheService.incr(key);

    // Set TTL on first attempt
    if (attempts === 1) {
      await this.cacheService.expire(key, LOCKOUT_CONFIG.FAILED_ATTEMPT_WINDOW_MINUTES * 60);
    }

    // Lock account based on attempt count
    if (attempts >= LOCKOUT_CONFIG.SECOND_LOCKOUT_ATTEMPTS) {
      // 10+ attempts: lock for 1 hour
      await this.lockAccount(email, LOCKOUT_CONFIG.SECOND_LOCKOUT_DURATION_MINUTES);
      this.logger.warn(`Account locked for 1 hour due to ${attempts} failed login attempts: ${email}`);
    } else if (attempts >= LOCKOUT_CONFIG.FIRST_LOCKOUT_ATTEMPTS) {
      // 5-9 attempts: lock for 15 minutes
      await this.lockAccount(email, LOCKOUT_CONFIG.FIRST_LOCKOUT_DURATION_MINUTES);
      this.logger.warn(`Account locked for 15 minutes due to ${attempts} failed login attempts: ${email}`);
    }
  }

  /**
   * Lock an account for a specified duration
   * @param email - User email to lock
   * @param durationMinutes - Duration of lockout in minutes
   */
  private async lockAccount(email: string, durationMinutes: number): Promise<void> {
    if (!this.cacheService) return;

    const lockoutKey = this.getLockoutKey(email);
    const attemptsKey = this.getLoginAttemptsKey(email);

    await this.cacheService.set(
      lockoutKey,
      { lockedAt: new Date().toISOString(), reason: 'Too many failed login attempts', durationMinutes },
      durationMinutes * 60,
    );

    // Clear attempts counter
    await this.cacheService.del(attemptsKey);
  }

  /**
   * Clear failed login attempts after successful login
   */
  private async clearFailedAttempts(email: string): Promise<void> {
    if (!this.cacheService) return;
    await this.cacheService.del(this.getLoginAttemptsKey(email));
  }

  /**
   * Unlock a locked account (Admin only)
   * Per requirements.md Section 1.1: Admin can manually unlock accounts
   *
   * @param email - Email of the account to unlock
   * @param adminUserId - ID of the admin performing the action (for audit)
   * @param reason - Optional reason for unlocking
   * @returns Whether the account was locked and is now unlocked
   */
  async unlockAccount(email: string, adminUserId: string, reason?: string): Promise<{ message: string; wasLocked: boolean }> {
    const wasLocked = await this.isAccountLocked(email);

    if (!wasLocked) {
      return {
        message: 'Account is not currently locked',
        wasLocked: false,
      };
    }

    // Clear the lockout
    if (this.cacheService) {
      await this.cacheService.del(this.getLockoutKey(email));
      await this.cacheService.del(this.getLoginAttemptsKey(email));
    }

    this.logger.log(`Account unlocked by admin: ${email} (Admin: ${adminUserId}, Reason: ${reason || 'Not provided'})`);

    // Log the action for audit purposes
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (user) {
        await this.prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'ACCOUNT_UNLOCKED',
            entity: 'User',
            entityId: user.id,
            changes: JSON.stringify({
              unlockedBy: adminUserId,
              reason: reason || 'Admin manual unlock',
              timestamp: new Date().toISOString(),
            }),
            description: `Account unlocked by admin ${adminUserId}`,
            severity: 'INFO',
          },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to create audit log for account unlock: ${email}`, error);
    }

    return {
      message: 'Account unlocked successfully',
      wasLocked: true,
    };
  }

  async register(registerDto: RegisterDto, request?: Request): Promise<AuthResponseDto> {
    const {
      email,
      password,
      role,
      name,
      companyName,
      preferredLanguage,
      preferredCurrency,
      phone,
      country,
      termsAccepted,
      marketingConsent,
      contentPreference,
      amazonProfileLinks,
      // Affiliate-specific fields
      websiteUrl,
      socialMediaUrls,
      promotionPlan,
      estimatedReach,
      preferredSlug,
      paypalEmail,
      captchaToken
    } = registerDto;

    // Verify CAPTCHA for bot protection
    const clientIp = request?.ip || request?.headers?.['x-forwarded-for']?.toString().split(',')[0];
    await this.captchaService.verify(captchaToken, 'register', clientIp);

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await PasswordUtil.hash(password);

    // Generate email verification token
    const verificationToken = PasswordUtil.generateToken(32);

    // Create user and profile based on role
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        name,
        companyName,
        preferredLanguage: preferredLanguage || 'EN',
        preferredCurrency: preferredCurrency || 'USD',
        phone,
        country,
        marketingConsent: marketingConsent || false,
        emailVerified: false,
      },
    });

    // Create role-specific profile with termsAccepted for authors, contentPreference/amazonProfileLinks for readers, and affiliate data
    const affiliateData = role === UserRole.AFFILIATE ? {
      websiteUrl,
      socialMediaUrls,
      promotionPlan,
      estimatedReach,
      preferredSlug,
      paypalEmail,
    } : undefined;
    const profile = await this.createRoleProfile(user.id, role, termsAccepted, contentPreference, amazonProfileLinks, affiliateData);

    // Store verification token in password reset table (reusing for email verification)
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        used: false,
      },
    });

    // Track affiliate conversion if user is an AUTHOR and has affiliate cookie
    if (role === UserRole.AUTHOR && request && this.trackingService) {
      try {
        const affiliateCookie = request.cookies?.['bp_aff_ref'];
        if (affiliateCookie) {
          const affiliateProfileId = await this.trackingService.getAffiliateFromCookie(affiliateCookie);
          if (affiliateProfileId && profile?.id) {
            await this.trackingService.trackConversion(
              affiliateProfileId,
              profile.id, // authorProfileId
              affiliateCookie,
              request
            );
            this.logger.log(`Affiliate conversion tracked for user: ${email}`);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to track affiliate conversion for ${email}`, error);
      }
    }

    this.logger.log(`User registered: ${email} with role ${role}`);

    // Send verification email (per requirements.md: Welcome email sent AFTER verification)
    try {
      await this.emailService.sendVerificationEmail(user.email, verificationToken);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${user.email}`, error);
    }

    // Generate JWT token (new users have tokenVersion 0)
    const accessToken = this.generateToken(user.id, user.email, user.role, 0);

    return {
      accessToken,
      user: this.mapToUserData(user),
    };
  }

  async login(loginDto: LoginDto, request?: Request): Promise<AuthResponseDto> {
    const { email, password, captchaToken, rememberMe } = loginDto;

    // Verify CAPTCHA for bot protection
    const clientIp = request?.ip || request?.headers?.['x-forwarded-for']?.toString().split(',')[0];
    await this.captchaService.verify(captchaToken, 'login', clientIp);

    // Check if account is locked
    if (await this.isAccountLocked(email)) {
      const remainingTime = await this.getRemainingLockoutTime(email);
      const remainingMinutes = Math.ceil(remainingTime / 60);
      this.logger.warn(`Login attempt on locked account: ${email}`);
      throw new UnauthorizedException(
        `Account is temporarily locked due to too many failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
      );
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Record failed attempt even for non-existent users (prevents user enumeration timing attacks)
      await this.recordFailedAttempt(email);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Check if email is verified (per requirements.md Section 1.1: User cannot log in until email is verified)
    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email address before logging in. Check your inbox for the verification link.');
    }

    // Verify password
    const isPasswordValid = await PasswordUtil.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      await this.recordFailedAttempt(email);
      this.logger.warn(`Failed login attempt for user: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Clear failed attempts on successful login
    await this.clearFailedAttempts(email);

    this.logger.log(`User logged in: ${email}${rememberMe ? ' (remember me enabled)' : ''}`);

    // Generate JWT token with tokenVersion for session invalidation support
    // Per requirements.md Section 1.1: "Remember Me" extends session to 7 days
    const accessToken = this.generateToken(user.id, user.email, user.role, user.tokenVersion || 0, rememberMe);

    return {
      accessToken,
      user: this.mapToUserData(user),
    };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    // Find the verification token
    const resetRecord = await this.prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      throw new BadRequestException('Invalid verification token');
    }

    if (resetRecord.used) {
      throw new BadRequestException('Verification token already used');
    }

    if (resetRecord.expiresAt < new Date()) {
      throw new BadRequestException('Verification token expired');
    }

    // Update user email verification status
    await this.prisma.user.update({
      where: { id: resetRecord.userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Mark token as used
    await this.prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    this.logger.log(`Email verified for user: ${resetRecord.user.email}`);

    // Send welcome email AFTER verification (per requirements.md Section 1.1)
    try {
      await this.emailService.sendWelcomeEmail(resetRecord.user.email, resetRecord.user.name);
      this.logger.log(`Welcome email sent to ${resetRecord.user.email} after verification`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${resetRecord.user.email}`, error);
    }

    return { message: 'Email verified successfully' };
  }

  async requestPasswordReset(dto: RequestPasswordResetDto): Promise<{ message: string }> {
    const { email } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      this.logger.warn(`Password reset requested for non-existent email: ${email}`);
      return { message: 'If the email exists, a password reset link has been sent' };
    }

    // Generate reset token
    const resetToken = PasswordUtil.generateToken(32);

    // Store reset token
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
        used: false,
      },
    });

    this.logger.log(`Password reset requested for user: ${email}`);

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${user.email}`, error);
    }

    return { message: 'If the email exists, a password reset link has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword } = dto;

    // Find the reset token
    const resetRecord = await this.prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetRecord) {
      throw new BadRequestException('Invalid reset token');
    }

    if (resetRecord.used) {
      throw new BadRequestException('Reset token already used');
    }

    if (resetRecord.expiresAt < new Date()) {
      throw new BadRequestException('Reset token expired');
    }

    // Hash new password
    const passwordHash = await PasswordUtil.hash(newPassword);

    // Update user password and increment tokenVersion to invalidate all sessions
    // Per requirements.md Section 1.6: All sessions invalidated (silent invalidation for security)
    await this.prisma.user.update({
      where: { id: resetRecord.userId },
      data: {
        passwordHash,
        tokenVersion: { increment: 1 },
      },
    });

    // Mark token as used
    await this.prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    this.logger.log(`Password reset completed for user: ${resetRecord.user.email}`);

    // Send confirmation email that password was changed (per requirements.md Section 1.6 Step 3)
    try {
      await this.emailService.sendPasswordChangedConfirmation(
        resetRecord.user.email,
        resetRecord.user.name,
      );
    } catch (error) {
      this.logger.error(`Failed to send password changed confirmation to ${resetRecord.user.email}`, error);
    }

    return { message: 'Password reset successfully' };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await PasswordUtil.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Generate JWT token with configurable expiration
   *
   * Per requirements.md Section 1.1:
   * - Default session: 24 hours
   * - "Remember Me" enabled: 7 days
   */
  private generateToken(
    userId: string,
    email: string,
    role: UserRole,
    tokenVersion: number = 0,
    rememberMe: boolean = false,
  ): string {
    const payload = { sub: userId, email, role, tokenVersion };

    // Use 7 days for "remember me", otherwise use default (24h from config)
    if (rememberMe) {
      return this.jwtService.sign(payload, { expiresIn: '7d' });
    }

    return this.jwtService.sign(payload);
  }

  private mapToUserData(user: any): UserDataDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      preferredCurrency: user.preferredCurrency,
      emailVerified: user.emailVerified,
      photo: user.photo,
      country: user.country,
      termsAccepted: user.authorProfile?.termsAccepted ?? true, // Default true for non-authors
      accountCreatedByCloser: user.authorProfile?.accountCreatedByCloser ?? false,
      // Admin role for role-based access control (Section 5.1, 5.5)
      adminRole: user.adminProfile?.role,
      adminPermissions: user.adminProfile?.permissions || [],
    };
  }

  /**
   * Get user profile with terms acceptance info (for /auth/me endpoint)
   */
  async getUserProfile(userId: string): Promise<UserDataDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        authorProfile: true,
        adminProfile: true, // Include admin profile for role-based access control
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.mapToUserData(user);
  }

  /**
   * Accept terms of service for authors
   */
  async acceptTerms(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { authorProfile: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.role !== UserRole.AUTHOR || !user.authorProfile) {
      throw new BadRequestException('Terms acceptance is only applicable to authors');
    }

    if (user.authorProfile.termsAccepted) {
      throw new BadRequestException('Terms have already been accepted');
    }

    await this.prisma.authorProfile.update({
      where: { id: user.authorProfile.id },
      data: {
        termsAccepted: true,
        termsAcceptedAt: new Date(),
      },
    });

    this.logger.log(`Terms accepted by user: ${user.email}`);

    return { message: 'Terms of service accepted successfully' };
  }

  private async createRoleProfile(
    userId: string,
    role: UserRole,
    termsAccepted?: boolean,
    contentPreference?: ContentPreference,
    amazonProfileLinks?: string[],
    affiliateData?: {
      websiteUrl?: string;
      socialMediaUrls?: string;
      promotionPlan?: string;
      estimatedReach?: string;
      preferredSlug?: string;
      paypalEmail?: string;
    },
  ): Promise<any> {
    switch (role) {
      case UserRole.AUTHOR:
        return await this.prisma.authorProfile.create({
          data: {
            userId,
            totalCreditsPurchased: 0,
            totalCreditsUsed: 0,
            availableCredits: 0,
            termsAccepted: termsAccepted || false,
            termsAcceptedAt: termsAccepted ? new Date() : null,
            accountCreatedByCloser: false,
          },
        });

      case UserRole.READER:
        // Create reader profile
        const readerProfile = await this.prisma.readerProfile.create({
          data: {
            userId,
            preferredGenres: [],
            contentPreference: contentPreference || ContentPreference.BOTH,
          },
        });

        // Create Amazon profile records if provided
        if (amazonProfileLinks && amazonProfileLinks.length > 0) {
          await this.prisma.amazonProfile.createMany({
            data: amazonProfileLinks.map(profileUrl => ({
              readerProfileId: readerProfile.id,
              profileUrl,
              isVerified: false,
            })),
          });
        }

        return readerProfile;

      case UserRole.ADMIN:
        return await this.prisma.adminProfile.create({
          data: {
            userId,
            permissions: [],
          },
        });

      case UserRole.CLOSER:
        return await this.prisma.closerProfile.create({
          data: {
            userId,
            commissionEnabled: true,
            commissionRate: 10.0,
          },
        });

      case UserRole.AFFILIATE:
        // Generate a unique referral code
        const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Check if custom slug is available
        let customSlug = affiliateData?.preferredSlug;
        if (customSlug) {
          const existingSlug = await this.prisma.affiliateProfile.findUnique({
            where: { customSlug },
          });
          if (existingSlug) {
            this.logger.warn(`Custom slug "${customSlug}" is already taken`);
            customSlug = undefined; // Slug taken, don't use it
          }
        }

        // Affiliate starts in "Pending Review" status (isApproved: false)
        return await this.prisma.affiliateProfile.create({
          data: {
            userId,
            referralCode,
            customSlug,
            commissionRate: 20.0, // Default 20%
            isApproved: false, // Per requirements.md: needs admin approval
            websiteUrl: affiliateData?.websiteUrl,
            socialMediaUrls: affiliateData?.socialMediaUrls,
            promotionPlan: affiliateData?.promotionPlan,
            estimatedReach: affiliateData?.estimatedReach,
            paypalEmail: affiliateData?.paypalEmail,
          },
        });

      default:
        throw new BadRequestException('Invalid user role');
    }
  }

  /**
   * Create an author account by Closer (sales team) after custom package sale
   * Generates a temporary password and sends welcome email with credentials
   */
  async createAuthorByCloser(
    dto: CreateAuthorByCloserDto,
    closerUserId: string,
  ): Promise<CreateAuthorByCloserResponseDto> {
    const { email, name, preferredLanguage, preferredCurrency, phone, country, initialCredits, saleNotes } = dto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Generate temporary password
    const temporaryPassword = PasswordUtil.generateToken(12);
    const passwordHash = await PasswordUtil.hash(temporaryPassword);

    // Generate email verification token
    const verificationToken = PasswordUtil.generateToken(32);

    // Create user with AUTHOR role
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.AUTHOR,
        name,
        preferredLanguage: preferredLanguage || 'EN',
        preferredCurrency: preferredCurrency || 'USD',
        phone,
        country,
        emailVerified: false,
      },
    });

    // Create author profile with closer flag
    const authorProfile = await this.prisma.authorProfile.create({
      data: {
        userId: user.id,
        totalCreditsPurchased: initialCredits || 0,
        totalCreditsUsed: 0,
        availableCredits: initialCredits || 0,
        termsAccepted: false, // Author must accept terms on first login
        accountCreatedByCloser: true,
      },
    });

    // Store verification token
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days for closer-created accounts
        used: false,
      },
    });

    // Create credit transaction record if initial credits were allocated
    if (initialCredits && initialCredits > 0) {
      await this.prisma.creditTransaction.create({
        data: {
          authorProfileId: authorProfile.id,
          type: 'MANUAL_ADJUSTMENT',
          amount: initialCredits,
          description: saleNotes || 'Initial credits from custom package sale',
          performedBy: closerUserId,
          balanceAfter: initialCredits,
        },
      });
    }

    this.logger.log(`Author account created by Closer: ${email} (Closer: ${closerUserId})`);

    // Send welcome email with temporary credentials
    let welcomeEmailSent = false;
    let temporaryPasswordSent = false;

    try {
      await this.emailService.sendCloserCreatedAccountEmail(
        user.email,
        user.name,
        temporaryPassword,
        verificationToken,
      );
      welcomeEmailSent = true;
      temporaryPasswordSent = true;
      this.logger.log(`Closer-created account email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send closer-created account email to ${user.email}`, error);
    }

    return {
      authorProfileId: authorProfile.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      temporaryPasswordSent,
      welcomeEmailSent,
      initialCredits: initialCredits || 0,
    };
  }

  /**
   * Create an admin account (by Super Admin only)
   * Per requirements.md Section 1.3
   */
  async createAdmin(
    dto: CreateAdminDto,
    creatorUserId: string,
  ): Promise<CreateAdminResponseDto> {
    const { email, password, name, adminLevel, permissions } = dto;

    // Verify creator is a Super Admin (per requirements.md Section 1.3)
    const creator = await this.prisma.user.findUnique({
      where: { id: creatorUserId },
      include: { adminProfile: true },
    });

    if (!creator || creator.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Only admins can create admin accounts');
    }

    // Check if creator has MANAGE_ADMINS permission (Super Admin)
    const hasManageAdminsPermission = creator.adminProfile?.permissions?.includes(AdminPermission.MANAGE_ADMINS);
    if (!hasManageAdminsPermission) {
      throw new UnauthorizedException('Only Super Admins can create admin accounts');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Generate temporary password if not provided
    const actualPassword = password || PasswordUtil.generateToken(12);
    const passwordHash = await PasswordUtil.hash(actualPassword);

    // Generate email verification token
    const verificationToken = PasswordUtil.generateToken(32);

    // Determine permissions based on admin level
    let finalPermissions: string[] = permissions || [];
    if (adminLevel === AdminLevel.SUPER_ADMIN) {
      // Super admin gets all permissions
      finalPermissions = Object.values(AdminPermission);
    } else {
      // Regular admin cannot have MANAGE_ADMINS or MANAGE_FINANCIALS
      finalPermissions = finalPermissions.filter(
        p => p !== AdminPermission.MANAGE_ADMINS && p !== AdminPermission.MANAGE_FINANCIALS
      );
    }

    // Create user with ADMIN role
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.ADMIN,
        name,
        emailVerified: false,
      },
    });

    // Map AdminLevel to Prisma AdminRole
    // Per requirements.md Section 1.3:
    // - SUPER_ADMIN: Full access to everything
    // - REGULAR_ADMIN: Cannot create other admins, cannot access financial settings
    const prismaAdminRole = adminLevel === AdminLevel.SUPER_ADMIN
      ? AdminRole.SUPER_ADMIN
      : AdminRole.ADMIN;

    // Create admin profile with proper role
    const adminProfile = await this.prisma.adminProfile.create({
      data: {
        userId: user.id,
        permissions: finalPermissions,
        role: prismaAdminRole,
      },
    });

    // Store verification token
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        used: false,
      },
    });

    this.logger.log(`Admin account created: ${email} by user ${creatorUserId}`);

    // Send welcome email with credentials
    let welcomeEmailSent = false;
    let temporaryPasswordSent = false;

    try {
      await this.emailService.sendAdminAccountEmail(
        user.email,
        user.name,
        !password ? actualPassword : undefined, // Only send if we generated it
        verificationToken,
      );
      welcomeEmailSent = true;
      temporaryPasswordSent = !password;
      this.logger.log(`Admin account email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send admin account email to ${user.email}`, error);
    }

    return {
      adminProfileId: adminProfile.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      temporaryPasswordSent,
      welcomeEmailSent,
      adminLevel,
      permissions: finalPermissions as AdminPermission[],
    };
  }

  /**
   * Create a closer account (by Admin only)
   * Per requirements.md Section 1.4
   */
  async createCloser(
    dto: CreateCloserDto,
    creatorUserId: string,
  ): Promise<CreateCloserResponseDto> {
    const { email, password, name, commissionRate = 0, isActive = true } = dto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Generate temporary password if not provided
    const actualPassword = password || PasswordUtil.generateToken(12);
    const passwordHash = await PasswordUtil.hash(actualPassword);

    // Generate email verification token
    const verificationToken = PasswordUtil.generateToken(32);

    // Create user with CLOSER role
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: UserRole.CLOSER,
        name,
        isActive,
        emailVerified: false,
      },
    });

    // Create closer profile
    const closerProfile = await this.prisma.closerProfile.create({
      data: {
        userId: user.id,
        commissionEnabled: commissionRate > 0,
        commissionRate,
      },
    });

    // Store verification token
    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        used: false,
      },
    });

    this.logger.log(`Closer account created: ${email} by user ${creatorUserId}`);

    // Send welcome email with credentials
    let welcomeEmailSent = false;
    let temporaryPasswordSent = false;

    try {
      await this.emailService.sendCloserAccountEmail(
        user.email,
        user.name,
        !password ? actualPassword : undefined, // Only send if we generated it
        verificationToken,
      );
      welcomeEmailSent = true;
      temporaryPasswordSent = !password;
      this.logger.log(`Closer account email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send closer account email to ${user.email}`, error);
    }

    return {
      closerProfileId: closerProfile.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      temporaryPasswordSent,
      welcomeEmailSent,
      commissionRate,
      isActive,
    };
  }
}
