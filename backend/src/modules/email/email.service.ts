import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailTemplateService, EmailVariables } from './email-template.service';
import { PrismaService } from '@common/prisma/prisma.service';
import { EmailType, EmailStatus, Language, NotificationType } from '@prisma/client';

/**
 * Transactional email types that MUST always be sent regardless of user preferences
 * These are critical for account security and service delivery
 */
const TRANSACTIONAL_EMAIL_TYPES: EmailType[] = [
  EmailType.EMAIL_VERIFICATION,
  EmailType.PASSWORD_RESET,
  EmailType.PASSWORD_CHANGED,
  EmailType.WELCOME,
  EmailType.PAYMENT_RECEIVED,
  EmailType.PAYMENT_FAILED,
  EmailType.REFUND_PROCESSED,
  EmailType.AUTHOR_PAYMENT_RECEIVED,
  EmailType.AUTHOR_PAYMENT_FAILED,
  EmailType.READER_PAYOUT_COMPLETED,
  EmailType.READER_ASSIGNMENT_EXPIRED,
  EmailType.READER_MATERIALS_READY,
  EmailType.CLOSER_PAYMENT_RECEIVED,
  EmailType.CLOSER_ACCOUNT_CREATED,
  EmailType.AUTHOR_ACCOUNT_CREATED_BY_CLOSER,
];

/**
 * Marketing email types that require explicit marketing consent
 */
const MARKETING_EMAIL_TYPES: EmailType[] = [
  EmailType.AFFILIATE_NEW_REFERRAL,
  EmailType.LANDING_PAGE_WELCOME,
];

/**
 * Map email types to notification types for preference checking
 */
const EMAIL_TO_NOTIFICATION_TYPE: Partial<Record<EmailType, NotificationType>> = {
  [EmailType.AUTHOR_CAMPAIGN_STARTED]: NotificationType.CAMPAIGN,
  [EmailType.AUTHOR_CAMPAIGN_COMPLETED]: NotificationType.CAMPAIGN,
  [EmailType.AUTHOR_REPORT_READY]: NotificationType.CAMPAIGN,
  [EmailType.AUTHOR_CREDITS_EXPIRING_SOON]: NotificationType.PAYMENT,
  [EmailType.AUTHOR_CREDITS_EXPIRED]: NotificationType.PAYMENT,
  [EmailType.AUTHOR_CREDITS_ADDED]: NotificationType.PAYMENT,
  [EmailType.AUTHOR_CREDITS_REMOVED]: NotificationType.PAYMENT,
  [EmailType.READER_REVIEW_SUBMITTED]: NotificationType.REVIEW,
  [EmailType.READER_REVIEW_VALIDATED]: NotificationType.REVIEW,
  [EmailType.READER_REVIEW_REJECTED]: NotificationType.REVIEW,
  [EmailType.READER_DEADLINE_24H]: NotificationType.REVIEW,
  [EmailType.READER_DEADLINE_48H]: NotificationType.REVIEW,
  [EmailType.READER_DEADLINE_72H]: NotificationType.REVIEW,
  [EmailType.ADMIN_NEW_ISSUE]: NotificationType.ADMIN,
  [EmailType.ADMIN_URGENT_ISSUE]: NotificationType.ADMIN,
  [EmailType.ADMIN_PAYOUT_REQUESTED]: NotificationType.ADMIN,
  [EmailType.ADMIN_NEW_AFFILIATE_APPLICATION]: NotificationType.ADMIN,
  [EmailType.ADMIN_CRITICAL_ERROR]: NotificationType.ADMIN,
  [EmailType.ADMIN_NOTIFICATION]: NotificationType.ADMIN,
};

/**
 * Email attachment interface for sending PDFs and other files
 */
export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly appUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly templateService: EmailTemplateService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('email.resend.apiKey');
    this.fromEmail = this.configService.get<string>('email.resend.fromEmail') || 'noreply@bookproof.com';
    this.appUrl = this.configService.get<string>('app.url') || 'http://localhost:3000';

    if (!apiKey) {
      this.logger.warn('Resend API key not configured. Emails will not be sent.');
    } else {
      this.logger.log('Resend API configured successfully');
    }

    this.resend = new Resend(apiKey);
  }

  /**
   * Check if user has opted out of this email type
   * Returns true if email should be blocked, false if allowed
   */
  private async shouldBlockEmail(userId: string | undefined, type: EmailType): Promise<{ blocked: boolean; reason?: string }> {
    // Transactional emails are ALWAYS sent
    if (TRANSACTIONAL_EMAIL_TYPES.includes(type)) {
      return { blocked: false };
    }

    // If no userId, we can't check preferences - allow email
    if (!userId) {
      return { blocked: false };
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          notificationEmailEnabled: true,
          notificationDisabledTypes: true,
          marketingConsent: true,
        },
      });

      if (!user) {
        return { blocked: false };
      }

      // Check if marketing consent is required
      if (MARKETING_EMAIL_TYPES.includes(type) && !user.marketingConsent) {
        return { blocked: true, reason: 'User has not consented to marketing emails' };
      }

      // Check if email notifications are globally disabled
      if (!user.notificationEmailEnabled) {
        return { blocked: true, reason: 'User has disabled email notifications' };
      }

      // Check if this notification type is disabled
      const notificationType = EMAIL_TO_NOTIFICATION_TYPE[type];
      if (notificationType && user.notificationDisabledTypes) {
        try {
          const disabledTypes: string[] = JSON.parse(user.notificationDisabledTypes);
          if (disabledTypes.includes(notificationType)) {
            return { blocked: true, reason: `User has disabled ${notificationType} notifications` };
          }
        } catch {
          // Invalid JSON, don't block
        }
      }

      return { blocked: false };
    } catch (error) {
      this.logger.warn(`Failed to check email preferences for user ${userId}:`, error);
      // On error, don't block the email
      return { blocked: false };
    }
  }

  /**
   * NEW: Send email with template system and logging
   * Supports optional attachments (e.g., PDF files)
   * Respects user notification preferences (except for transactional emails)
   */
  async sendTemplatedEmail(
    to: string,
    type: EmailType,
    variables: EmailVariables,
    userId?: string,
    language: Language = Language.EN,
    attachments?: EmailAttachment[],
  ): Promise<void> {
    let emailLogId: string | null = null;

    try {
      // 0. Check user notification preferences
      const preferenceCheck = await this.shouldBlockEmail(userId, type);
      if (preferenceCheck.blocked) {
        this.logger.log(`Email ${type} to ${to} blocked: ${preferenceCheck.reason}`);
        // Log the blocked email for audit trail
        await this.prisma.emailLog.create({
          data: {
            userId,
            email: to,
            type,
            subject: `[BLOCKED] ${type}`,
            status: EmailStatus.FAILED,
            error: preferenceCheck.reason,
          },
        });
        return; // Don't send the email
      }

      // 1. Enhance variables with default values
      const enhancedVariables: EmailVariables = {
        ...variables,
        appUrl: this.appUrl,
        currentYear: new Date().getFullYear(),
        supportUrl: `${this.appUrl}/support`,
        unsubscribeUrl: `${this.appUrl}/unsubscribe`,
      };

      // 2. Get template
      const templateHtml = await this.templateService.getTemplate(type, language);

      // 3. Substitute variables
      const html = this.templateService.substituteVariables(templateHtml, enhancedVariables);

      // 4. Get subject
      const subject = this.templateService.getSubject(type, language, enhancedVariables);

      // 5. Create email log entry (PENDING)
      const emailLog = await this.prisma.emailLog.create({
        data: {
          userId,
          email: to,
          type,
          subject,
          status: EmailStatus.PENDING,
        },
      });

      emailLogId = emailLog.id;
      this.logger.log(`Created email log ${emailLogId} for ${type} to ${to}`);

      // 6. Prepare attachments for Resend (base64 encode)
      const resendAttachments = attachments?.map((att) => ({
        filename: att.filename,
        content: att.content.toString('base64'),
        type: att.contentType || 'application/pdf',
      }));

      // 7. Send email via Resend
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
        attachments: resendAttachments,
      });

      // 8. Update email log (SENT)
      await this.prisma.emailLog.update({
        where: { id: emailLogId },
        data: {
          status: EmailStatus.SENT,
          sentAt: new Date(),
          providerMessageId: result.data?.id ?? null,
          provider: 'Resend',
        },
      });

      this.logger.log(`Email sent successfully: ${type} to ${to} (Log ID: ${emailLogId})`);
    } catch (error) {
      this.logger.error(`Failed to send email ${type} to ${to}:`, error);

      // Update email log with error if we created one
      if (emailLogId) {
        try {
          await this.prisma.emailLog.update({
            where: { id: emailLogId },
            data: {
              status: EmailStatus.FAILED,
              error: error.message || 'Unknown error',
              retryCount: { increment: 1 },
            },
          });
        } catch (logError) {
          this.logger.error('Failed to update email log with error:', logError);
        }
      }

      throw error;
    }
  }

  /**
   * LEGACY: Send verification email (kept for backwards compatibility)
   */
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${this.appUrl}/verify-email?token=${token}`;

    await this.sendTemplatedEmail(
      to,
      EmailType.EMAIL_VERIFICATION,
      {
        actionUrl: verificationUrl,
      },
      undefined,
      Language.EN,
    );
  }

  /**
   * LEGACY: Send password reset email
   */
  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${this.appUrl}/reset-password?token=${token}`;

    await this.sendTemplatedEmail(
      to,
      EmailType.PASSWORD_RESET,
      {
        actionUrl: resetUrl,
      },
      undefined,
      Language.EN,
    );
  }

  /**
   * Send password changed confirmation email
   * Per requirements.md Section 1.6 Step 3
   */
  async sendPasswordChangedConfirmation(to: string, name: string): Promise<void> {
    const supportUrl = `${this.appUrl}/support`;
    const subject = 'Your BookProof Password Has Been Changed';

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h1>Password Changed</h1>
          <p>Hi ${name},</p>
          <p>Your BookProof account password was successfully changed.</p>
          <p>If you made this change, no further action is required.</p>
          <p><strong>If you did NOT make this change</strong>, your account may have been compromised. Please contact our support team immediately:</p>
          <p><a href="${supportUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Contact Support</a></p>
          <hr>
          <p style="color: #666; font-size: 12px;">This is an automated security notification from BookProof.</p>
        </body>
      </html>
    `;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });
      this.logger.log(`Password changed confirmation sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password changed confirmation to ${to}:`, error);
      throw error;
    }
  }

  /**
   * LEGACY: Send welcome email
   */
  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await this.sendTemplatedEmail(
      to,
      EmailType.WELCOME,
      {
        userName: name,
        dashboardUrl: `${this.appUrl}/dashboard`,
      },
      undefined,
      Language.EN,
    );
  }

  /**
   * LEGACY: Send materials ready email
   */
  async sendMaterialsReadyEmail(data: {
    to: string;
    readerName: string;
    bookTitle: string;
    authorName: string;
    deadline: Date;
    assignmentId: string;
  }): Promise<void> {
    const assignmentUrl = `${this.appUrl}/reader/assignments/${data.assignmentId}`;

    await this.sendTemplatedEmail(
      data.to,
      EmailType.READER_MATERIALS_READY,
      {
        userName: data.readerName,
        bookTitle: data.bookTitle,
        authorName: data.authorName,
        deadlineAt: data.deadline,
        assignmentUrl,
      },
      undefined,
      Language.EN,
    );
  }

  /**
   * LEGACY: Send deadline reminder
   * Per Milestone 4.3 - Deadline Timeline:
   * - Hour 24: First reminder ("48 hours remaining")
   * - Hour 48: Second reminder ("24 hours remaining")
   * - Hour 60: Urgent reminder ("12 hours remaining")
   * - Hour 69: Final reminder ("3 hours remaining")
   */
  async sendDeadlineReminder(data: {
    to: string;
    readerName: string;
    bookTitle: string;
    deadline: Date;
    hoursRemaining: number;
    assignmentId: string;
    isUrgent?: boolean;
    isFinal?: boolean;
  }): Promise<void> {
    const assignmentUrl = `${this.appUrl}/reader/assignments/${data.assignmentId}`;

    // Determine email type based on hours remaining
    // Maps to specific email templates for different urgency levels
    let emailType: EmailType;
    if (data.hoursRemaining <= 12) {
      // 12 hours or less remaining - urgent reminder
      emailType = EmailType.READER_DEADLINE_24H; // Use most urgent template
    } else if (data.hoursRemaining <= 24) {
      emailType = EmailType.READER_DEADLINE_24H;
    } else if (data.hoursRemaining <= 48) {
      emailType = EmailType.READER_DEADLINE_48H;
    } else {
      emailType = EmailType.READER_DEADLINE_72H;
    }

    await this.sendTemplatedEmail(
      data.to,
      emailType,
      {
        userName: data.readerName,
        bookTitle: data.bookTitle,
        deadlineAt: data.deadline,
        hoursRemaining: data.hoursRemaining,
        assignmentUrl,
        isUrgent: data.isUrgent || false,
        isFinal: data.isFinal || false,
      },
      undefined,
      Language.EN,
    );
  }

  /**
   * LEGACY: Send deadline expired email
   */
  async sendDeadlineExpiredEmail(data: {
    to: string;
    readerName: string;
    bookTitle: string;
    assignmentId: string;
  }): Promise<void> {
    await this.sendTemplatedEmail(
      data.to,
      EmailType.READER_ASSIGNMENT_EXPIRED,
      {
        userName: data.readerName,
        bookTitle: data.bookTitle,
        dashboardUrl: `${this.appUrl}/reader/campaigns`,
      },
      undefined,
      Language.EN,
    );
  }

  /**
   * LEGACY: Get verification email template (private, kept for reference)
   */
  private getVerificationEmailTemplate(verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 6px;">
            <h1 style="color: #2563eb; margin-bottom: 20px;">Verify Your Email</h1>
            <p>Thank you for registering with BookProof!</p>
            <p>Please click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}"
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Or copy and paste this link in your browser:<br>
              <a href="${verificationUrl}" style="color: #2563eb;">${verificationUrl}</a>
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * LEGACY: Get password reset template (private, kept for reference)
   */
  private getPasswordResetTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 6px;">
            <h1 style="color: #2563eb; margin-bottom: 20px;">Reset Your Password</h1>
            <p>We received a request to reset your password for your BookProof account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Or copy and paste this link in your browser:<br>
              <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * LEGACY: Get welcome email template (private, kept for reference)
   */
  private getWelcomeEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to BookProof</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 6px;">
            <h1 style="color: #2563eb; margin-bottom: 20px;">Welcome to BookProof, ${name}!</h1>
            <p>We're excited to have you on board.</p>
            <p>BookProof connects authors with readers to generate authentic Amazon reviews. Here's what you can do next:</p>
            <ul style="line-height: 2;">
              <li>Complete your profile</li>
              <li>Browse available features</li>
              <li>Get started with your first campaign</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.appUrl}"
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Go to Dashboard
              </a>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you have any questions, feel free to reach out to our support team.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * LEGACY: Get materials ready template (private, kept for reference)
   */
  private getMaterialsReadyTemplate(
    data: {
      readerName: string;
      bookTitle: string;
      authorName: string;
      deadline: Date;
    },
    assignmentUrl: string,
  ): string {
    const deadlineFormatted = data.deadline.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Book Materials Are Ready</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f0fdf4; padding: 30px; border-radius: 6px; border-left: 4px solid #10b981;">
            <h1 style="color: #10b981; margin-bottom: 20px;">Your Book Materials Are Ready!</h1>
            <p>Hi ${data.readerName},</p>
            <p>Great news! The materials for <strong>"${data.bookTitle}"</strong> by ${data.authorName} are now available for you to access.</p>

            <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2563eb;">Important Details:</h3>
              <p><strong>Deadline:</strong> ${deadlineFormatted}</p>
              <p style="color: #dc2626; font-weight: bold;">You have 72 hours to complete your review.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${assignmentUrl}"
                 style="background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Access Materials Now
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              <strong>What's included:</strong>
            </p>
            <ul style="color: #666; font-size: 14px;">
              <li>Synopsis</li>
              <li>eBook download or Audiobook streaming</li>
              <li>Review submission form</li>
            </ul>

            <p style="color: #dc2626; font-size: 14px; margin-top: 30px; padding: 15px; background-color: #fee2e2; border-radius: 6px;">
              <strong>⏰ Remember:</strong> You'll receive reminders at 24h and 48h. Please complete your review before the 72-hour deadline expires.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * LEGACY: Get deadline reminder template (private, kept for reference)
   */
  private getDeadlineReminderTemplate(
    data: {
      readerName: string;
      bookTitle: string;
      deadline: Date;
      hoursRemaining: number;
    },
    assignmentUrl: string,
  ): string {
    const deadlineFormatted = data.deadline.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });

    const urgencyColor = data.hoursRemaining <= 24 ? '#dc2626' : '#f59e0b';
    const urgencyBg = data.hoursRemaining <= 24 ? '#fee2e2' : '#fef3c7';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Deadline Reminder - ${data.hoursRemaining}h Remaining</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: ${urgencyBg}; padding: 30px; border-radius: 6px; border-left: 4px solid ${urgencyColor};">
            <h1 style="color: ${urgencyColor}; margin-bottom: 20px;">⏰ Deadline Reminder: ${data.hoursRemaining} Hours Remaining</h1>
            <p>Hi ${data.readerName},</p>
            <p>This is a friendly reminder that your review deadline for <strong>"${data.bookTitle}"</strong> is approaching.</p>

            <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
              <h2 style="color: ${urgencyColor}; margin: 0; font-size: 36px;">${data.hoursRemaining}h</h2>
              <p style="margin: 10px 0; color: #666;">Remaining until deadline</p>
              <p style="margin: 0; font-size: 14px; color: #999;">${deadlineFormatted}</p>
            </div>

            <p style="font-weight: bold;">Please complete your review as soon as possible to avoid expiration.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${assignmentUrl}"
                 style="background-color: ${urgencyColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Complete Review Now
              </a>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you're unable to complete the review by the deadline, the assignment will be automatically reassigned to another reader.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Send email for Closer-created author accounts with temporary credentials
   * This email is sent TO THE AUTHOR with their login credentials
   */
  async sendCloserCreatedAccountEmail(
    to: string,
    name: string,
    temporaryPassword: string,
    verificationToken: string,
  ): Promise<void> {
    const verificationUrl = `${this.appUrl}/verify-email?token=${verificationToken}`;
    const loginUrl = `${this.appUrl}/login`;

    await this.sendTemplatedEmail(
      to,
      EmailType.AUTHOR_ACCOUNT_CREATED_BY_CLOSER,
      {
        userName: name,
        userEmail: to,
        temporaryPassword,
        actionUrl: verificationUrl,
        loginUrl,
        dashboardUrl: `${this.appUrl}/author`,
      },
      undefined,
      Language.EN,
    );
  }

  /**
   * Send email for newly created admin accounts
   */
  async sendAdminAccountEmail(
    to: string,
    name: string,
    temporaryPassword: string | undefined,
    verificationToken: string,
  ): Promise<void> {
    const verificationUrl = `${this.appUrl}/verify-email?token=${verificationToken}`;
    const loginUrl = `${this.appUrl}/login`;

    const subject = 'Your BookProof Admin Account Has Been Created';
    const html = this.getAdminAccountEmailHtml(name, to, temporaryPassword, verificationUrl, loginUrl);

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });
      this.logger.log(`Admin account email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send admin account email to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Generate admin account email HTML
   */
  private getAdminAccountEmailHtml(
    name: string,
    email: string,
    temporaryPassword: string | undefined,
    verificationUrl: string,
    loginUrl: string,
  ): string {
    const passwordSection = temporaryPassword
      ? `<p><strong>Your temporary password:</strong> ${temporaryPassword}</p>
         <p>Please change your password after your first login for security.</p>`
      : `<p>Your password has been set by the administrator.</p>`;

    return `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to BookProof, ${name}!</h1>
          <p>Your admin account has been created.</p>
          <p><strong>Email:</strong> ${email}</p>
          ${passwordSection}
          <p>Please verify your email first:</p>
          <p><a href="${verificationUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a></p>
          <p>After verifying your email, you can log in at:</p>
          <p><a href="${loginUrl}">${loginUrl}</a></p>
          <hr>
          <p style="color: #666; font-size: 12px;">If you didn't expect this email, please contact support.</p>
        </body>
      </html>
    `;
  }

  /**
   * Send email for newly created closer accounts
   */
  async sendCloserAccountEmail(
    to: string,
    name: string,
    temporaryPassword: string | undefined,
    verificationToken: string,
  ): Promise<void> {
    const verificationUrl = `${this.appUrl}/verify-email?token=${verificationToken}`;
    const loginUrl = `${this.appUrl}/login`;

    const subject = 'Your BookProof Closer Account Has Been Created';
    const html = this.getCloserAccountEmailHtml(name, to, temporaryPassword, verificationUrl, loginUrl);

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });
      this.logger.log(`Closer account email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send closer account email to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Generate closer account email HTML
   */
  private getCloserAccountEmailHtml(
    name: string,
    email: string,
    temporaryPassword: string | undefined,
    verificationUrl: string,
    loginUrl: string,
  ): string {
    const passwordSection = temporaryPassword
      ? `<p><strong>Your temporary password:</strong> ${temporaryPassword}</p>
         <p>Please change your password after your first login for security.</p>`
      : `<p>Your password has been set by the administrator.</p>`;

    return `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to BookProof, ${name}!</h1>
          <p>Your closer account has been created. As a closer, you'll be able to create custom packages and manage author sales.</p>
          <p><strong>Email:</strong> ${email}</p>
          ${passwordSection}
          <p>Please verify your email first:</p>
          <p><a href="${verificationUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email</a></p>
          <p>After verifying your email, you can log in at:</p>
          <p><a href="${loginUrl}">${loginUrl}</a></p>
          <hr>
          <p style="color: #666; font-size: 12px;">If you didn't expect this email, please contact support.</p>
        </body>
      </html>
    `;
  }

  /**
   * Send credit expiration notice email
   */
  async sendCreditExpirationNotice(data: {
    to: string;
    authorName: string;
    expiredCredits: number;
    remainingCredits: number;
    purchaseDate: Date;
    expirationDate: Date;
    language: string;
  }): Promise<void> {
    const lang = data.language as Language || Language.EN;

    await this.sendTemplatedEmail(
      data.to,
      EmailType.AUTHOR_CREDITS_EXPIRED,
      {
        userName: data.authorName,
        expiredCredits: data.expiredCredits,
        remainingCredits: data.remainingCredits,
        purchaseDate: data.purchaseDate,
        expirationDate: data.expirationDate,
        dashboardUrl: `${this.appUrl}/author/credits`,
      },
      undefined,
      lang,
    );
  }

  /**
   * Send credit expiration warning email (7 days before expiration)
   */
  async sendCreditExpirationWarning(data: {
    to: string;
    authorName: string;
    credits: number;
    daysUntilExpiration: number;
    expirationDate: Date;
    language: string;
  }): Promise<void> {
    const lang = data.language as Language || Language.EN;

    await this.sendTemplatedEmail(
      data.to,
      EmailType.AUTHOR_CREDITS_EXPIRING_SOON,
      {
        userName: data.authorName,
        credits: data.credits,
        daysUntilExpiration: data.daysUntilExpiration,
        expirationDate: data.expirationDate,
        dashboardUrl: `${this.appUrl}/author/campaigns/new`,
      },
      undefined,
      lang,
    );
  }

  /**
   * Send payout completed confirmation email to reader
   * Per requirements: "Reader receives confirmation email" when payout is completed
   */
  async sendPayoutCompletedEmail(data: {
    to: string;
    readerName: string;
    amount: number;
    paymentMethod: string;
    transactionId: string;
    paidAt: Date;
    userId?: string;
    language?: Language;
  }): Promise<void> {
    const walletUrl = `${this.appUrl}/reader/wallet`;
    const lang = data.language || Language.EN;

    await this.sendTemplatedEmail(
      data.to,
      EmailType.READER_PAYOUT_COMPLETED,
      {
        userName: data.readerName,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        paidAt: data.paidAt,
        walletUrl,
      },
      data.userId,
      lang,
    );
  }

  /**
   * Send welcome email to landing page lead
   * Per requirements: "Automatic welcome email upon signup"
   */
  async sendLandingPageWelcomeEmail(data: {
    to: string;
    name?: string;
    language: Language;
  }): Promise<void> {
    await this.sendTemplatedEmail(
      data.to,
      EmailType.LANDING_PAGE_WELCOME,
      {
        userName: data.name || 'there',
      },
      undefined,
      data.language,
    );
  }

  /**
   * LEGACY: Get deadline expired template (private, kept for reference)
   */
  private getDeadlineExpiredTemplate(data: {
    readerName: string;
    bookTitle: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Assignment Expired</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #fef2f2; padding: 30px; border-radius: 6px; border-left: 4px solid #dc2626;">
            <h1 style="color: #dc2626; margin-bottom: 20px;">Assignment Expired</h1>
            <p>Hi ${data.readerName},</p>
            <p>Unfortunately, the 72-hour deadline for <strong>"${data.bookTitle}"</strong> has passed without a submission.</p>

            <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0;">This assignment has been automatically marked as expired and will be reassigned to another reader from the queue.</p>
            </div>

            <p><strong>What this means:</strong></p>
            <ul>
              <li>You will no longer have access to the materials</li>
              <li>No credits will be charged</li>
              <li>This will be reflected in your completion statistics</li>
            </ul>

            <p style="color: #666; font-size: 14px; margin-top: 30px; padding: 15px; background-color: #fef3c7; border-radius: 6px;">
              <strong>💡 Tip:</strong> To maintain a good reliability score, please only apply for books you're committed to reviewing within the 72-hour window. Your completion rate affects future assignment opportunities.
            </p>

            <p style="margin-top: 30px;">Keep browsing for other available books that interest you!</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.appUrl}/reader/campaigns"
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Browse Available Books
              </a>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
