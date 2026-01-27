import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly appUrl: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('email.apiKey');
    this.fromEmail = this.configService.get<string>('email.fromEmail') || 'noreply@bookproof.app';
    this.appUrl = this.configService.get<string>('app.url') || 'http://localhost:3000';

    if (!apiKey) {
      this.logger.warn('Resend API key not configured. Emails will not be sent.');
    }

    this.resend = new Resend(apiKey);
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verificationUrl = `${this.appUrl}/verify-email?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Verify Your Email - BookProof',
        html: this.getVerificationEmailTemplate(verificationUrl),
      });

      this.logger.log(`Verification email sent to: ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}:`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${this.appUrl}/reset-password?token=${token}`;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Reset Your Password - BookProof',
        html: this.getPasswordResetTemplate(resetUrl),
      });

      this.logger.log(`Password reset email sent to: ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}:`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Welcome to BookProof!',
        html: this.getWelcomeEmailTemplate(name),
      });

      this.logger.log(`Welcome email sent to: ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}:`, error);
      throw error;
    }
  }

  async sendMaterialsReadyEmail(data: {
    to: string;
    readerName: string;
    bookTitle: string;
    authorName: string;
    deadline: Date;
    assignmentId: string;
  }): Promise<void> {
    const assignmentUrl = `${this.appUrl}/reader/assignments/${data.assignmentId}`;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: data.to,
        subject: `Your Book Materials Are Ready! - ${data.bookTitle}`,
        html: this.getMaterialsReadyTemplate(data, assignmentUrl),
      });

      this.logger.log(`Materials ready email sent to: ${data.to} for book: ${data.bookTitle}`);
    } catch (error) {
      this.logger.error(`Failed to send materials ready email to ${data.to}:`, error);
      throw error;
    }
  }

  async sendDeadlineReminder(data: {
    to: string;
    readerName: string;
    bookTitle: string;
    deadline: Date;
    hoursRemaining: number;
    assignmentId: string;
  }): Promise<void> {
    const assignmentUrl = `${this.appUrl}/reader/assignments/${data.assignmentId}`;

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: data.to,
        subject: `Reminder: ${data.hoursRemaining}h Remaining - ${data.bookTitle}`,
        html: this.getDeadlineReminderTemplate(data, assignmentUrl),
      });

      this.logger.log(`Deadline reminder sent to: ${data.to} (${data.hoursRemaining}h remaining)`);
    } catch (error) {
      this.logger.error(`Failed to send deadline reminder to ${data.to}:`, error);
      throw error;
    }
  }

  async sendDeadlineExpiredEmail(data: {
    to: string;
    readerName: string;
    bookTitle: string;
    assignmentId: string;
  }): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: data.to,
        subject: `Assignment Expired - ${data.bookTitle}`,
        html: this.getDeadlineExpiredTemplate(data),
      });

      this.logger.log(`Deadline expired email sent to: ${data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send deadline expired email to ${data.to}:`, error);
      throw error;
    }
  }

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
