import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { EmailService } from '@modules/email/email.service';
import { CaptchaService } from '@common/services/captcha.service';
import { CaptureLeadDto, CaptureLeadResponseDto } from './dto/capture-lead.dto';
import { TrackPageViewDto, TrackPageViewResponseDto } from './dto/track-page-view.dto';
import { SalesContactDto, SalesContactResponseDto } from './dto/sales-contact.dto';
import { AnalyticsStatsDto, GlobalAnalyticsDto } from './dto/analytics.dto';
import {
  UpdateLandingPageDto,
  LandingPageResponseDto,
  GetLandingPageLeadsDto,
  LeadsListResponseDto,
} from './dto/update-landing-page.dto';
import { Language } from '@prisma/client';

@Injectable()
export class LandingPagesService {
  private readonly logger = new Logger(LandingPagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly captchaService: CaptchaService,
  ) {}

  /**
   * Capture a lead from the landing page form
   * Per Section 15.2: Contact forms must have CAPTCHA protection
   */
  async captureLead(dto: CaptureLeadDto): Promise<CaptureLeadResponseDto> {
    try {
      // Verify CAPTCHA for bot protection (Section 15.2)
      await this.captchaService.verify(dto.captchaToken, 'lead_capture', dto.ipAddress);

      // Check if lead already exists
      const existingLead = await this.prisma.landingPageLead.findFirst({
        where: {
          email: dto.email,
          language: dto.language,
        },
      });

      if (existingLead) {
        this.logger.warn(`Duplicate lead submission: ${dto.email} for language ${dto.language}`);
        return {
          success: true,
          message: 'You are already on our waitlist!',
          leadId: existingLead.id,
        };
      }

      // Create new lead with all UTM parameters (per requirements 10.3)
      const lead = await this.prisma.landingPageLead.create({
        data: {
          email: dto.email,
          name: dto.name,
          language: dto.language,
          userType: dto.userType,
          source: dto.source,
          medium: dto.medium,
          campaign: dto.campaign,
          content: dto.content,      // utm_content
          term: dto.term,            // utm_term
          affiliateRef: dto.affiliateRef, // ref (affiliate code)
          referrer: dto.referrer,
          ipAddress: dto.ipAddress,
          country: dto.country,
          marketingConsent: dto.marketingConsent || false,
          consentedAt: dto.marketingConsent ? new Date() : null,
        },
      });

      // Update landing page stats
      await this.updateLandingPageStats(dto.language, 'lead');

      this.logger.log(`New lead captured: ${dto.email} (${dto.language})`);

      // Send welcome email (per requirements: "Automatic welcome email upon signup")
      try {
        await this.emailService.sendLandingPageWelcomeEmail({
          to: dto.email,
          name: dto.name,
          language: dto.language,
        });

        // Update lead record to mark welcome email as sent
        await this.prisma.landingPageLead.update({
          where: { id: lead.id },
          data: {
            welcomeEmailSent: true,
            welcomeEmailSentAt: new Date(),
          },
        });

        this.logger.log(`Welcome email sent to: ${dto.email}`);
      } catch (emailError) {
        // Log error but don't fail the lead capture
        this.logger.error(`Failed to send welcome email to ${dto.email}: ${emailError.message}`);
      }

      return {
        success: true,
        message: 'Thank you for joining our waitlist!',
        leadId: lead.id,
      };
    } catch (error) {
      this.logger.error(`Error capturing lead: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Track a page view on the landing page
   */
  async trackPageView(dto: TrackPageViewDto): Promise<TrackPageViewResponseDto> {
    try {
      await this.updateLandingPageStats(dto.language, 'view');

      this.logger.debug(`Page view tracked for language: ${dto.language}`);

      return {
        success: true,
      };
    } catch (error) {
      this.logger.error(`Error tracking page view: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Submit enterprise/sales contact form
   * Sends email to sales team and auto-reply to customer
   */
  async submitSalesContact(dto: SalesContactDto): Promise<SalesContactResponseDto> {
    try {
      // Verify CAPTCHA for bot protection
      await this.captchaService.verify(dto.captchaToken, 'sales_contact');

      const salesEmail = 'sales.bookproof@gmail.com';

      // Get language-specific auto-reply message
      const autoReplyMessages: Record<string, { subject: string; body: string }> = {
        EN: {
          subject: 'Thank you for contacting BookProof Sales',
          body: `
            <p>Dear ${dto.name},</p>
            <p>Thank you for your interest in BookProof Enterprise solutions!</p>
            <p>We have received your inquiry for <strong>${dto.reviewsNeeded} reviews</strong> and our sales team will get back to you within 24-48 business hours.</p>
            <p>In the meantime, feel free to explore our standard packages at <a href="https://bookproof.app/#pricing">bookproof.app</a>.</p>
            <p>Best regards,<br>The BookProof Sales Team</p>
          `,
        },
        PT: {
          subject: 'Obrigado por entrar em contato com BookProof',
          body: `
            <p>Prezado(a) ${dto.name},</p>
            <p>Obrigado pelo seu interesse nas soluções Enterprise do BookProof!</p>
            <p>Recebemos sua solicitação para <strong>${dto.reviewsNeeded} avaliações</strong> e nossa equipe de vendas entrará em contato em até 24-48 horas úteis.</p>
            <p>Enquanto isso, sinta-se à vontade para explorar nossos pacotes padrão em <a href="https://bookproof.app/#pricing">bookproof.app</a>.</p>
            <p>Atenciosamente,<br>Equipe de Vendas BookProof</p>
          `,
        },
        ES: {
          subject: 'Gracias por contactar con BookProof',
          body: `
            <p>Estimado/a ${dto.name},</p>
            <p>¡Gracias por su interés en las soluciones Enterprise de BookProof!</p>
            <p>Hemos recibido su consulta para <strong>${dto.reviewsNeeded} reseñas</strong> y nuestro equipo de ventas se pondrá en contacto con usted en 24-48 horas hábiles.</p>
            <p>Mientras tanto, no dude en explorar nuestros paquetes estándar en <a href="https://bookproof.app/#pricing">bookproof.app</a>.</p>
            <p>Saludos cordiales,<br>El Equipo de Ventas de BookProof</p>
          `,
        },
      };

      const langKey = dto.language || 'EN';
      const autoReply = autoReplyMessages[langKey] || autoReplyMessages.EN;

      // Send email to sales team
      const salesEmailHtml = `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">New Enterprise Inquiry</h1>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${dto.name}</p>
              <p><strong>Email:</strong> ${dto.email}</p>
              <p><strong>Reviews Needed:</strong> ${dto.reviewsNeeded}</p>
              <p><strong>Language:</strong> ${dto.language}</p>
            </div>
            <h3>Message:</h3>
            <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <p>${dto.message.replace(/\n/g, '<br>')}</p>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">This inquiry was submitted via the BookProof Enterprise contact form.</p>
          </body>
        </html>
      `;

      // Use Resend directly for custom emails
      const { Resend } = await import('resend');
      const resendApiKey = process.env.RESEND_API_KEY;

      if (!resendApiKey) {
        this.logger.warn('Resend API key not configured. Sales contact email will not be sent.');
      } else {
        const resend = new Resend(resendApiKey);

        // Send to sales team
        await resend.emails.send({
          from: 'BookProof <noreply@bookproof.app>',
          to: salesEmail,
          reply_to: dto.email,
          subject: `[Enterprise Inquiry] ${dto.name} - ${dto.reviewsNeeded} reviews`,
          html: salesEmailHtml,
        });

        this.logger.log(`Sales inquiry email sent to ${salesEmail} from ${dto.email}`);

        // Send auto-reply to customer
        const autoReplyHtml = `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #f8fafc; padding: 30px; border-radius: 8px;">
                <img src="https://bookproof.app/logo.png" alt="BookProof" style="height: 40px; margin-bottom: 20px;">
                ${autoReply.body}
              </div>
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
                © ${new Date().getFullYear()} BookProof. All rights reserved.
              </p>
            </body>
          </html>
        `;

        await resend.emails.send({
          from: 'BookProof Sales <noreply@bookproof.app>',
          to: dto.email,
          subject: autoReply.subject,
          html: autoReplyHtml,
        });

        this.logger.log(`Auto-reply sent to ${dto.email}`);
      }

      return {
        success: true,
        message: langKey === 'PT'
          ? 'Obrigado! Nossa equipe entrará em contato em breve.'
          : langKey === 'ES'
          ? '¡Gracias! Nuestro equipo se pondrá en contacto pronto.'
          : 'Thank you! Our team will be in touch soon.',
      };
    } catch (error) {
      this.logger.error(`Error submitting sales contact: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get public landing page content (for frontend rendering)
   * Only returns content if page is published
   */
  async getPublicContent(language: Language): Promise<{ content: string; isPublished: boolean }> {
    try {
      const landingPage = await this.prisma.landingPage.findUnique({
        where: { language },
        select: {
          content: true,
          isPublished: true,
        },
      });

      if (!landingPage) {
        return {
          content: '{}',
          isPublished: false,
        };
      }

      return {
        content: landingPage.content,
        isPublished: landingPage.isPublished,
      };
    } catch (error) {
      this.logger.error(`Error getting public content: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get analytics for a specific language
   */
  async getAnalyticsByLanguage(language: Language): Promise<AnalyticsStatsDto> {
    try {
      // Get landing page stats
      const landingPage = await this.prisma.landingPage.findUnique({
        where: { language },
      });

      if (!landingPage) {
        return {
          language,
          totalViews: 0,
          totalLeads: 0,
          conversionRate: 0,
          leadsByUserType: {
            author: 0,
            reader: 0,
            both: 0,
            unknown: 0,
          },
          topSources: [],
          topCampaigns: [],
        };
      }

      // Get leads by user type
      const leadsGroupedByType = await this.prisma.landingPageLead.groupBy({
        by: ['userType'],
        where: { language },
        _count: true,
      });

      const leadsByUserType = {
        author: 0,
        reader: 0,
        both: 0,
        unknown: 0,
      };

      leadsGroupedByType.forEach((group) => {
        const type = group.userType?.toLowerCase();
        if (type === 'author') leadsByUserType.author = group._count;
        else if (type === 'reader') leadsByUserType.reader = group._count;
        else if (type === 'both') leadsByUserType.both = group._count;
        else leadsByUserType.unknown = group._count;
      });

      // Get top sources
      const topSources = await this.prisma.landingPageLead.groupBy({
        by: ['source'],
        where: {
          language,
          source: { not: null },
        },
        _count: true,
        orderBy: {
          _count: {
            source: 'desc',
          },
        },
        take: 5,
      });

      // Get top campaigns
      const topCampaigns = await this.prisma.landingPageLead.groupBy({
        by: ['campaign'],
        where: {
          language,
          campaign: { not: null },
        },
        _count: true,
        orderBy: {
          _count: {
            campaign: 'desc',
          },
        },
        take: 5,
      });

      return {
        language,
        totalViews: landingPage.totalViews,
        totalLeads: landingPage.totalLeads,
        conversionRate: landingPage.conversionRate?.toNumber() || 0,
        leadsByUserType,
        topSources: topSources.map((s) => ({
          source: s.source || 'direct',
          count: s._count,
        })),
        topCampaigns: topCampaigns.map((c) => ({
          campaign: c.campaign || 'none',
          count: c._count,
        })),
      };
    } catch (error) {
      this.logger.error(`Error getting analytics for ${language}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get global analytics across all languages
   */
  async getGlobalAnalytics(): Promise<GlobalAnalyticsDto> {
    try {
      const languages = [Language.EN, Language.PT, Language.ES];
      const byLanguage = await Promise.all(
        languages.map((lang) => this.getAnalyticsByLanguage(lang))
      );

      const totalViews = byLanguage.reduce((sum, stats) => sum + stats.totalViews, 0);
      const totalLeads = byLanguage.reduce((sum, stats) => sum + stats.totalLeads, 0);
      const conversionRate = totalViews > 0 ? (totalLeads / totalViews) * 100 : 0;

      return {
        totalViews,
        totalLeads,
        conversionRate,
        byLanguage,
      };
    } catch (error) {
      this.logger.error(`Error getting global analytics: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update landing page statistics
   * @private
   */
  private async updateLandingPageStats(language: Language, type: 'view' | 'lead'): Promise<void> {
    try {
      // Upsert landing page record
      const landingPage = await this.prisma.landingPage.upsert({
        where: { language },
        create: {
          language,
          content: '{}',
          totalViews: type === 'view' ? 1 : 0,
          totalLeads: type === 'lead' ? 1 : 0,
        },
        update: {
          totalViews: type === 'view' ? { increment: 1 } : undefined,
          totalLeads: type === 'lead' ? { increment: 1 } : undefined,
        },
      });

      // Calculate conversion rate
      if (landingPage.totalViews > 0) {
        const conversionRate = (landingPage.totalLeads / landingPage.totalViews) * 100;
        await this.prisma.landingPage.update({
          where: { language },
          data: {
            conversionRate,
          },
        });
      }
    } catch (error) {
      this.logger.error(`Error updating landing page stats: ${error.message}`, error.stack);
      // Don't throw - this is a background operation
    }
  }

  /**
   * Mark a lead as converted (registered as user)
   */
  async markLeadAsConverted(email: string, userId: string): Promise<void> {
    try {
      await this.prisma.landingPageLead.updateMany({
        where: {
          email,
          converted: false,
        },
        data: {
          converted: true,
          convertedToUserId: userId,
          convertedAt: new Date(),
        },
      });

      this.logger.log(`Lead converted: ${email} -> User ${userId}`);
    } catch (error) {
      this.logger.error(`Error marking lead as converted: ${error.message}`, error.stack);
      // Don't throw - this is a background operation
    }
  }

  // ==========================================
  // ADMIN CONTENT MANAGEMENT METHODS
  // ==========================================

  /**
   * Get landing page content by language (for admin)
   */
  async getLandingPage(language: Language): Promise<LandingPageResponseDto> {
    try {
      // Upsert to ensure page exists
      const landingPage = await this.prisma.landingPage.upsert({
        where: { language },
        create: {
          language,
          content: '{}',
          ctaText: 'Join Waitlist',
          ctaLink: '#',
          ctaMode: 'PRE_LAUNCH',
        },
        update: {},
      });

      return {
        id: landingPage.id,
        language: landingPage.language,
        content: landingPage.content,
        metaTitle: landingPage.metaTitle || undefined,
        metaDescription: landingPage.metaDescription || undefined,
        metaKeywords: landingPage.metaKeywords || undefined,
        isPublished: landingPage.isPublished,
        publishedAt: landingPage.publishedAt || undefined,
        ctaText: landingPage.ctaText,
        ctaLink: landingPage.ctaLink,
        ctaMode: landingPage.ctaMode,
        totalViews: landingPage.totalViews,
        totalLeads: landingPage.totalLeads,
        conversionRate: landingPage.conversionRate?.toNumber() || undefined,
        createdAt: landingPage.createdAt,
        updatedAt: landingPage.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Error getting landing page: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all landing pages (for admin dashboard)
   */
  async getAllLandingPages(): Promise<LandingPageResponseDto[]> {
    try {
      const languages = [Language.EN, Language.PT, Language.ES];
      const pages = await Promise.all(languages.map((lang) => this.getLandingPage(lang)));
      return pages;
    } catch (error) {
      this.logger.error(`Error getting all landing pages: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update landing page content (admin CMS)
   */
  async updateLandingPage(dto: UpdateLandingPageDto): Promise<LandingPageResponseDto> {
    try {
      const updateData: Record<string, unknown> = {};

      if (dto.content !== undefined) {
        updateData.content = dto.content;
      }

      if (dto.seo) {
        if (dto.seo.metaTitle !== undefined) updateData.metaTitle = dto.seo.metaTitle;
        if (dto.seo.metaDescription !== undefined) updateData.metaDescription = dto.seo.metaDescription;
        if (dto.seo.metaKeywords !== undefined) updateData.metaKeywords = dto.seo.metaKeywords;
      }

      if (dto.cta) {
        if (dto.cta.ctaText !== undefined) updateData.ctaText = dto.cta.ctaText;
        if (dto.cta.ctaLink !== undefined) updateData.ctaLink = dto.cta.ctaLink;
        if (dto.cta.ctaMode !== undefined) updateData.ctaMode = dto.cta.ctaMode;
      }

      if (dto.isPublished !== undefined) {
        updateData.isPublished = dto.isPublished;
        if (dto.isPublished) {
          updateData.publishedAt = new Date();
        }
      }

      const landingPage = await this.prisma.landingPage.upsert({
        where: { language: dto.language },
        create: {
          language: dto.language,
          content: dto.content || '{}',
          metaTitle: dto.seo?.metaTitle,
          metaDescription: dto.seo?.metaDescription,
          metaKeywords: dto.seo?.metaKeywords,
          ctaText: dto.cta?.ctaText || 'Join Waitlist',
          ctaLink: dto.cta?.ctaLink || '#',
          ctaMode: dto.cta?.ctaMode || 'PRE_LAUNCH',
          isPublished: dto.isPublished || false,
          publishedAt: dto.isPublished ? new Date() : null,
        },
        update: updateData,
      });

      this.logger.log(`Landing page updated for language: ${dto.language}`);

      return {
        id: landingPage.id,
        language: landingPage.language,
        content: landingPage.content,
        metaTitle: landingPage.metaTitle || undefined,
        metaDescription: landingPage.metaDescription || undefined,
        metaKeywords: landingPage.metaKeywords || undefined,
        isPublished: landingPage.isPublished,
        publishedAt: landingPage.publishedAt || undefined,
        ctaText: landingPage.ctaText,
        ctaLink: landingPage.ctaLink,
        ctaMode: landingPage.ctaMode,
        totalViews: landingPage.totalViews,
        totalLeads: landingPage.totalLeads,
        conversionRate: landingPage.conversionRate?.toNumber() || undefined,
        createdAt: landingPage.createdAt,
        updatedAt: landingPage.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Error updating landing page: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get leads list with pagination and filters (for admin)
   */
  async getLeads(dto: GetLandingPageLeadsDto): Promise<LeadsListResponseDto> {
    try {
      const page = dto.page || 1;
      const limit = dto.limit || 20;
      const skip = (page - 1) * limit;

      const where: Record<string, unknown> = {};
      if (dto.language) where.language = dto.language;
      if (dto.userType) where.userType = dto.userType;
      if (dto.source) where.source = dto.source;

      const [leads, total] = await Promise.all([
        this.prisma.landingPageLead.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.landingPageLead.count({ where }),
      ]);

      return {
        leads: leads.map((lead) => ({
          id: lead.id,
          email: lead.email,
          name: lead.name || undefined,
          language: lead.language,
          userType: lead.userType || undefined,
          source: lead.source || undefined,
          medium: lead.medium || undefined,
          campaign: lead.campaign || undefined,
          content: lead.content || undefined,
          term: lead.term || undefined,
          affiliateRef: lead.affiliateRef || undefined,
          country: lead.country || undefined,
          marketingConsent: lead.marketingConsent,
          welcomeEmailSent: lead.welcomeEmailSent,
          converted: lead.converted,
          convertedAt: lead.convertedAt || undefined,
          createdAt: lead.createdAt,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error getting leads: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Export leads as CSV or JSON
   */
  async exportLeads(language?: Language, format: 'csv' | 'json' = 'csv'): Promise<string> {
    try {
      const where: Record<string, unknown> = {};
      if (language) where.language = language;

      const leads = await this.prisma.landingPageLead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      if (format === 'json') {
        return JSON.stringify(leads, null, 2);
      }

      // CSV format with all UTM parameters
      const headers = [
        'ID',
        'Email',
        'Name',
        'Language',
        'User Type',
        'Source',
        'Medium',
        'Campaign',
        'Content',
        'Term',
        'Affiliate Ref',
        'Country',
        'Marketing Consent',
        'Welcome Email Sent',
        'Converted',
        'Created At',
      ];

      const rows = leads.map((lead) => [
        lead.id,
        lead.email,
        lead.name || '',
        lead.language,
        lead.userType || '',
        lead.source || '',
        lead.medium || '',
        lead.campaign || '',
        lead.content || '',
        lead.term || '',
        lead.affiliateRef || '',
        lead.country || '',
        lead.marketingConsent ? 'Yes' : 'No',
        lead.welcomeEmailSent ? 'Yes' : 'No',
        lead.converted ? 'Yes' : 'No',
        lead.createdAt.toISOString(),
      ]);

      const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

      return csvContent;
    } catch (error) {
      this.logger.error(`Error exporting leads: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a lead (admin only)
   */
  async deleteLead(leadId: string): Promise<{ success: boolean }> {
    try {
      const lead = await this.prisma.landingPageLead.findUnique({
        where: { id: leadId },
      });

      if (!lead) {
        throw new NotFoundException(`Lead with ID ${leadId} not found`);
      }

      await this.prisma.landingPageLead.delete({
        where: { id: leadId },
      });

      this.logger.log(`Lead deleted: ${leadId}`);

      return { success: true };
    } catch (error) {
      this.logger.error(`Error deleting lead: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Resend welcome email to a lead
   */
  async resendWelcomeEmail(leadId: string): Promise<{ success: boolean }> {
    try {
      const lead = await this.prisma.landingPageLead.findUnique({
        where: { id: leadId },
      });

      if (!lead) {
        throw new NotFoundException(`Lead with ID ${leadId} not found`);
      }

      await this.emailService.sendLandingPageWelcomeEmail({
        to: lead.email,
        name: lead.name || undefined,
        language: lead.language,
      });

      await this.prisma.landingPageLead.update({
        where: { id: leadId },
        data: {
          welcomeEmailSent: true,
          welcomeEmailSentAt: new Date(),
        },
      });

      this.logger.log(`Welcome email resent to: ${lead.email}`);

      return { success: true };
    } catch (error) {
      this.logger.error(`Error resending welcome email: ${error.message}`, error.stack);
      throw error;
    }
  }
}
