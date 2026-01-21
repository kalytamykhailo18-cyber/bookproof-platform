import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CampaignStatus, Language } from '@prisma/client';
import { PublicCampaignDto } from './dto/public-campaign.dto';
import { generateVisitorHash } from '@common/utils/visitor-hash.util';

/**
 * Public Campaigns Service - Milestone 2.2 & 2.3
 *
 * Handles public-facing campaign operations:
 * - Public landing page viewing
 * - View tracking
 * - Public campaign discovery
 */
@Injectable()
export class PublicCampaignsService {
  private readonly logger = new Logger(PublicCampaignsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get public campaign details by slug and language
   * Per Milestone 2.2: "System automatically creates public-facing campaign pages"
   */
  async getPublicCampaign(slug: string, language: string): Promise<PublicCampaignDto> {
    const lang = language.toUpperCase() as Language;

    // Find campaign by slug
    const book = await this.prisma.book.findUnique({
      where: { slug },
    });

    if (!book) {
      throw new NotFoundException(`Campaign not found: ${slug}`);
    }

    // Verify landing page is enabled
    if (!book.landingPageEnabled) {
      throw new NotFoundException(`Public landing page not enabled for campaign: ${slug}`);
    }

    // Verify requested language is enabled for this campaign
    if (!book.landingPageLanguages.includes(lang)) {
      throw new NotFoundException(
        `Language ${lang} not available for this campaign. Available languages: ${book.landingPageLanguages.join(', ')}`,
      );
    }

    // Only show campaigns that are ACTIVE
    // Per requirements: "Campaign must be active to accept new registrations"
    if (book.status !== CampaignStatus.ACTIVE) {
      throw new NotFoundException(
        `Campaign is not currently active. Status: ${book.status}`,
      );
    }

    // Get language-specific title and synopsis
    let title = book.title;
    let synopsis = book.synopsis;

    if (lang === Language.EN && book.titleEN) {
      title = book.titleEN;
    } else if (lang === Language.PT && book.titlePT) {
      title = book.titlePT;
    } else if (lang === Language.ES && book.titleES) {
      title = book.titleES;
    }

    if (lang === Language.EN && book.synopsisEN) {
      synopsis = book.synopsisEN;
    } else if (lang === Language.PT && book.synopsisPT) {
      synopsis = book.synopsisPT;
    } else if (lang === Language.ES && book.synopsisES) {
      synopsis = book.synopsisES;
    }

    // Calculate availability - Milestone 2.2 requirement
    // Per requirements.md: "Display real-time availability status"
    const totalSpots = book.targetReviews || 0;
    const spotsTaken = book.creditsUsed || 0;
    const spotsRemaining = Math.max(0, totalSpots - spotsTaken);
    const acceptingRegistrations =
      book.status === CampaignStatus.ACTIVE &&
      spotsRemaining > 0 &&
      !book.distributionPausedAt;

    return {
      id: book.id,
      title,
      authorName: book.authorName,
      synopsis,
      genre: book.genre,
      category: book.category,
      availableFormats: book.availableFormats,
      coverImageUrl: book.coverImageUrl || undefined,
      pageCount: book.pageCount || undefined,
      audiobookDurationMinutes: book.audioBookDuration
        ? Math.floor(book.audioBookDuration / 60)
        : undefined,
      seriesName: book.seriesName || undefined,
      seriesNumber: book.seriesNumber || undefined,
      status: book.status,
      slug: book.slug!,
      viewingLanguage: lang,
      availableLanguages: book.landingPageLanguages as Language[],
      amazonLink: book.amazonLink,
      asin: book.asin,
      readingInstructions: book.readingInstructions || undefined,
      totalSpots,
      spotsTaken,
      spotsRemaining,
      acceptingRegistrations,
    };
  }

  /**
   * Track view on campaign landing page
   * Per Milestone 2.2: "View counter (tracks page visits)"
   * Per requirements: "View tracking counts unique visitors, not repeated visits"
   */
  async trackView(
    slug: string,
    language: Language,
    visitorHash: string,
  ): Promise<void> {
    try {
      const lang = language.toUpperCase() as Language;

      // Find the book
      const book = await this.prisma.book.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!book) {
        this.logger.warn(`Book not found for slug: ${slug}`);
        return;
      }

      // Check if this is a unique visitor or returning visitor
      const existingView = await this.prisma.campaignView.findUnique({
        where: {
          bookId_visitorHash_language: {
            bookId: book.id,
            visitorHash,
            language: lang,
          },
        },
      });

      if (existingView) {
        // Returning visitor - increment view count
        await this.prisma.campaignView.update({
          where: { id: existingView.id },
          data: {
            viewCount: { increment: 1 },
            lastViewedAt: new Date(),
          },
        });

        // Update total views only (not unique visitors)
        const updateData: any = {
          totalPublicViews: { increment: 1 },
          lastViewedAt: new Date(),
        };

        if (lang === Language.EN) {
          updateData.totalENViews = { increment: 1 };
        } else if (lang === Language.PT) {
          updateData.totalPTViews = { increment: 1 };
        } else if (lang === Language.ES) {
          updateData.totalESViews = { increment: 1 };
        }

        await this.prisma.book.update({
          where: { id: book.id },
          data: updateData,
        });

        this.logger.debug(
          `Tracked returning visitor for campaign ${slug} in language ${lang}`,
        );
      } else {
        // New unique visitor - create record and increment both total views and unique visitors
        await this.prisma.campaignView.create({
          data: {
            bookId: book.id,
            visitorHash,
            language: lang,
            viewCount: 1,
            viewedAt: new Date(),
            lastViewedAt: new Date(),
          },
        });

        // Update both total views AND unique visitor counts
        const updateData: any = {
          totalPublicViews: { increment: 1 },
          totalUniqueVisitors: { increment: 1 },
          lastViewedAt: new Date(),
        };

        if (lang === Language.EN) {
          updateData.totalENViews = { increment: 1 };
          updateData.uniqueENVisitors = { increment: 1 };
        } else if (lang === Language.PT) {
          updateData.totalPTViews = { increment: 1 };
          updateData.uniquePTVisitors = { increment: 1 };
        } else if (lang === Language.ES) {
          updateData.totalESViews = { increment: 1 };
          updateData.uniqueESVisitors = { increment: 1 };
        }

        await this.prisma.book.update({
          where: { id: book.id },
          data: updateData,
        });

        this.logger.debug(
          `Tracked new unique visitor for campaign ${slug} in language ${lang}`,
        );
      }
    } catch (error) {
      // Don't fail the request if view tracking fails
      this.logger.error(`Failed to track view for ${slug}: ${error.message}`);
    }
  }

  /**
   * Get all active public campaigns (for discovery page - optional feature)
   * Returns list of campaigns with public landing pages enabled
   */
  async getActivePublicCampaigns(language?: Language): Promise<PublicCampaignDto[]> {
    const where: any = {
      landingPageEnabled: true,
      status: CampaignStatus.ACTIVE,
    };

    if (language) {
      where.landingPageLanguages = {
        has: language,
      };
    }

    const books = await this.prisma.book.findMany({
      where,
      orderBy: {
        campaignStartDate: 'desc',
      },
      take: 50, // Limit to 50 most recent campaigns
    });

    return books.map((book) => {
      const lang = language || (book.landingPageLanguages[0] as Language) || Language.EN;

      let title = book.title;
      let synopsis = book.synopsis;

      if (lang === Language.EN && book.titleEN) title = book.titleEN;
      else if (lang === Language.PT && book.titlePT) title = book.titlePT;
      else if (lang === Language.ES && book.titleES) title = book.titleES;

      if (lang === Language.EN && book.synopsisEN) synopsis = book.synopsisEN;
      else if (lang === Language.PT && book.synopsisPT) synopsis = book.synopsisPT;
      else if (lang === Language.ES && book.synopsisES) synopsis = book.synopsisES;

      // Calculate availability
      const totalSpots = book.targetReviews || 0;
      const spotsTaken = book.creditsUsed || 0;
      const spotsRemaining = Math.max(0, totalSpots - spotsTaken);
      const acceptingRegistrations =
        book.status === CampaignStatus.ACTIVE &&
        spotsRemaining > 0 &&
        !book.distributionPausedAt;

      return {
        id: book.id,
        title,
        authorName: book.authorName,
        synopsis: synopsis.substring(0, 300) + '...', // Preview only
        genre: book.genre,
        category: book.category,
        availableFormats: book.availableFormats,
        coverImageUrl: book.coverImageUrl || undefined,
        pageCount: book.pageCount || undefined,
        audiobookDurationMinutes: book.audioBookDuration
          ? Math.floor(book.audioBookDuration / 60)
          : undefined,
        seriesName: book.seriesName || undefined,
        seriesNumber: book.seriesNumber || undefined,
        status: book.status,
        slug: book.slug!,
        viewingLanguage: lang,
        availableLanguages: book.landingPageLanguages as Language[],
        amazonLink: book.amazonLink,
        asin: book.asin,
        readingInstructions: undefined, // Don't show in list view
        totalSpots,
        spotsTaken,
        spotsRemaining,
        acceptingRegistrations,
      };
    });
  }
}
