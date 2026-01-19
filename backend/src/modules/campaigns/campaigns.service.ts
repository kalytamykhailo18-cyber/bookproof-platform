import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@modules/email/email.service';
import { CampaignStatus, BookFormat, ReviewStatus, EmailType } from '@prisma/client';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignResponseDto,
  ActivateCampaignDto,
} from './dto';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  /**
   * Create new campaign (DRAFT status)
   */
  async createCampaign(
    authorProfileId: string,
    dto: CreateCampaignDto,
  ): Promise<CampaignResponseDto> {
    // Calculate reviews per week based on target reviews
    const reviewsPerWeek = this.calculateReviewsPerWeek(dto.targetReviews);

    const book = await this.prisma.book.create({
      data: {
        authorProfileId,
        title: dto.title,
        authorName: dto.authorName,
        asin: dto.asin,
        amazonLink: dto.amazonLink,
        synopsis: dto.synopsis,
        language: dto.language,
        genre: dto.genre,
        category: dto.category,
        availableFormats: dto.availableFormats,
        targetReviews: dto.targetReviews,
        reviewsPerWeek,
        amazonCouponCode: dto.amazonCouponCode,
        requireVerifiedPurchase: dto.requireVerifiedPurchase ?? false,
        pageCount: dto.pageCount,
        wordCount: dto.wordCount,
        seriesName: dto.seriesName,
        seriesNumber: dto.seriesNumber,
        readingInstructions: dto.readingInstructions, // Per requirements.md Section 2.3
        status: CampaignStatus.DRAFT,
        overBookingEnabled: true,
        overBookingPercent: 20, // Default 20% buffer
      },
    });

    return this.mapToResponse(book);
  }

  /**
   * Get all campaigns for an author
   */
  async getCampaigns(authorProfileId: string): Promise<CampaignResponseDto[]> {
    const books = await this.prisma.book.findMany({
      where: { authorProfileId },
      orderBy: { createdAt: 'desc' },
    });

    // Get pending review counts for all books
    const pendingCounts = await this.getPendingReviewCounts(books.map(b => b.id));

    return books.map((book) => this.mapToResponse(book, pendingCounts.get(book.id) || 0));
  }

  /**
   * Get single campaign by ID
   */
  async getCampaign(
    campaignId: string,
    authorProfileId: string,
  ): Promise<CampaignResponseDto> {
    const book = await this.prisma.book.findFirst({
      where: {
        id: campaignId,
        authorProfileId,
      },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    // Get pending review count for this campaign
    const pendingCount = await this.getPendingReviewCount(book.id);

    return this.mapToResponse(book, pendingCount);
  }

  /**
   * Update campaign (only allowed for DRAFT status)
   */
  async updateCampaign(
    campaignId: string,
    authorProfileId: string,
    dto: UpdateCampaignDto,
  ): Promise<CampaignResponseDto> {
    const book = await this.prisma.book.findFirst({
      where: {
        id: campaignId,
        authorProfileId,
      },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    if (book.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('Can only update campaigns in DRAFT status');
    }

    // Recalculate reviews per week if target reviews changed
    let reviewsPerWeek = book.reviewsPerWeek;
    if (dto.targetReviews && dto.targetReviews !== book.targetReviews) {
      reviewsPerWeek = this.calculateReviewsPerWeek(dto.targetReviews);
    }

    const updatedBook = await this.prisma.book.update({
      where: { id: campaignId },
      data: {
        ...dto,
        reviewsPerWeek,
      },
    });

    return this.mapToResponse(updatedBook);
  }

  /**
   * Delete campaign (only allowed for DRAFT status)
   */
  async deleteCampaign(
    campaignId: string,
    authorProfileId: string,
  ): Promise<void> {
    const book = await this.prisma.book.findFirst({
      where: {
        id: campaignId,
        authorProfileId,
      },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    if (book.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('Can only delete campaigns in DRAFT status');
    }

    await this.prisma.book.delete({
      where: { id: campaignId },
    });
  }

  /**
   * Activate campaign (consumes credits, starts queue)
   */
  async activateCampaign(
    campaignId: string,
    authorProfileId: string,
    dto: ActivateCampaignDto,
  ): Promise<CampaignResponseDto> {
    const book = await this.prisma.book.findFirst({
      where: {
        id: campaignId,
        authorProfileId,
      },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    if (book.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('Campaign is already activated or not in draft');
    }

    // Validate cover image is uploaded
    if (!book.coverImageUrl) {
      throw new BadRequestException(
        'Cover image is required before activating campaign. Please upload a cover image.',
      );
    }

    // Validate required book files based on format
    if (
      (book.availableFormats === BookFormat.EBOOK || book.availableFormats === BookFormat.BOTH) &&
      !book.ebookFileUrl
    ) {
      throw new BadRequestException(
        'Ebook file is required for campaigns offering ebook format. Please upload your ebook file.',
      );
    }

    if (
      (book.availableFormats === BookFormat.AUDIOBOOK || book.availableFormats === BookFormat.BOTH) &&
      !book.audioBookFileUrl
    ) {
      throw new BadRequestException(
        'Audiobook file is required for campaigns offering audiobook format. Please upload your audiobook MP3 file.',
      );
    }

    // Validate credits to allocate
    const requiredCredits = this.calculateRequiredCredits(
      book.targetReviews,
      book.availableFormats,
    );

    if (dto.creditsToAllocate < requiredCredits) {
      throw new BadRequestException(
        `Insufficient credits. Required: ${requiredCredits}, Provided: ${dto.creditsToAllocate}`,
      );
    }

    // Check author has enough available credits
    const authorProfile = await this.prisma.authorProfile.findUnique({
      where: { id: authorProfileId },
    });

    if (!authorProfile) {
      throw new NotFoundException('Author profile not found');
    }

    // CRITICAL: Validate that credits are not expired
    // Credits have an activation window - if author hasn't started a campaign within that window,
    // the credits expire and should be deducted from availableCredits.
    // The cron job handles bulk expiration, but we need real-time validation here.
    const now = new Date();

    // Find all non-activated purchases that HAVE expired (but cron hasn't processed yet)
    const expiredNonActivatedPurchases = await this.prisma.creditPurchase.findMany({
      where: {
        authorProfileId,
        activated: false,
        paymentStatus: 'COMPLETED',
        activationWindowExpiresAt: { lt: now }, // Expired
        NOT: {
          adminNotes: { contains: '[EXPIRED]' }, // Not yet processed by cron
        },
      },
    });

    const pendingExpiredCredits = expiredNonActivatedPurchases.reduce(
      (sum: number, p: { credits: number }) => sum + p.credits,
      0,
    );

    // Calculate actual available credits:
    // availableCredits in profile might include expired credits that cron hasn't processed yet
    // So we need to subtract the pending expired credits to get the true available amount
    const trueAvailableCredits = Math.max(0, authorProfile.availableCredits - pendingExpiredCredits);

    if (trueAvailableCredits < dto.creditsToAllocate) {
      // Provide a helpful error message
      if (pendingExpiredCredits > 0) {
        throw new BadRequestException(
          `Insufficient valid credits. Your account shows ${authorProfile.availableCredits} credits, ` +
          `but ${pendingExpiredCredits} have expired (activation window passed). ` +
          `You have ${trueAvailableCredits} valid credits available, need ${dto.creditsToAllocate}.`,
        );
      } else {
        throw new BadRequestException(
          `Insufficient available credits. You have ${authorProfile.availableCredits}, need ${dto.creditsToAllocate}`,
        );
      }
    }

    // Activate campaign in transaction
    const updatedBook = await this.prisma.$transaction(async (tx) => {
      // Deduct credits from author
      await tx.authorProfile.update({
        where: { id: authorProfileId },
        data: {
          availableCredits: { decrement: dto.creditsToAllocate },
          totalCreditsUsed: { increment: dto.creditsToAllocate },
        },
      });

      // Calculate expected end date based on reviews per week
      const now = new Date();
      const totalWeeks = Math.ceil(book.targetReviews / book.reviewsPerWeek);
      const expectedEndDate = new Date(now);
      expectedEndDate.setDate(expectedEndDate.getDate() + totalWeeks * 7);

      // Allocate credits to campaign
      const updatedBook = await tx.book.update({
        where: { id: campaignId },
        data: {
          creditsAllocated: dto.creditsToAllocate,
          creditsRemaining: dto.creditsToAllocate,
          status: CampaignStatus.ACTIVE,
          campaignStartDate: now,
          expectedEndDate,
          currentWeek: 1,
        },
      });

      // Create credit transaction record
      await tx.creditTransaction.create({
        data: {
          authorProfileId,
          bookId: campaignId,
          amount: -dto.creditsToAllocate,
          type: 'ALLOCATION',
          description: `Activated campaign: ${book.title}`,
          balanceAfter: authorProfile.availableCredits - dto.creditsToAllocate,
        },
      });

      // Mark credit purchases as activated
      await tx.creditPurchase.updateMany({
        where: {
          authorProfileId,
          activated: false,
          paymentStatus: 'COMPLETED',
        },
        data: {
          activated: true,
          activatedAt: now,
        },
      });

      return updatedBook;
    });

    // Send "Campaign Started" email to author
    // Per requirements Section 8.1: Author receives email when campaign is activated
    try {
      const authorUser = await this.prisma.user.findFirst({
        where: {
          authorProfile: { id: authorProfileId },
        },
      });

      if (authorUser) {
        await this.emailService.sendTemplatedEmail(
          authorUser.email,
          EmailType.AUTHOR_CAMPAIGN_STARTED,
          {
            authorName: authorUser.name || 'Author',
            bookTitle: book.title,
            targetReviews: book.targetReviews,
            dashboardUrl: '/author/campaigns',
          },
          authorUser.id,
          authorUser.preferredLanguage,
        );
        this.logger.log(`Sent campaign started email to author ${authorUser.email}`);
      }
    } catch (emailError) {
      this.logger.error(`Failed to send campaign started email: ${emailError.message}`);
    }

    return this.mapToResponse(updatedBook);
  }

  /**
   * Pause an active campaign
   */
  async pauseCampaign(
    campaignId: string,
    authorProfileId: string,
  ): Promise<CampaignResponseDto> {
    const book = await this.prisma.book.findFirst({
      where: {
        id: campaignId,
        authorProfileId,
      },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    if (book.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Can only pause active campaigns');
    }

    const updatedBook = await this.prisma.book.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.PAUSED,
        distributionPausedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedBook);
  }

  /**
   * Resume a paused campaign
   */
  async resumeCampaign(
    campaignId: string,
    authorProfileId: string,
  ): Promise<CampaignResponseDto> {
    const book = await this.prisma.book.findFirst({
      where: {
        id: campaignId,
        authorProfileId,
      },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    if (book.status !== CampaignStatus.PAUSED) {
      throw new BadRequestException('Can only resume paused campaigns');
    }

    const updatedBook = await this.prisma.book.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.ACTIVE,
        distributionResumedAt: new Date(),
      },
    });

    return this.mapToResponse(updatedBook);
  }

  /**
   * Update campaign files (ebook, audiobook, cover, synopsis)
   */
  async updateCampaignFiles(
    campaignId: string,
    authorProfileId: string,
    files: {
      ebookFileUrl?: string;
      ebookFileName?: string;
      ebookFileSize?: number;
      audioBookFileUrl?: string;
      audioBookFileName?: string;
      audioBookFileSize?: number;
      audioBookDuration?: number;
      coverImageUrl?: string;
      synopsisFileUrl?: string;
      synopsisFileName?: string;
    },
  ): Promise<CampaignResponseDto> {
    const book = await this.prisma.book.findFirst({
      where: {
        id: campaignId,
        authorProfileId,
      },
    });

    if (!book) {
      throw new NotFoundException('Campaign not found');
    }

    if (book.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('Can only update files for campaigns in DRAFT status');
    }

    const updatedBook = await this.prisma.book.update({
      where: { id: campaignId },
      data: files,
    });

    return this.mapToResponse(updatedBook);
  }

  /**
   * Calculate reviews per week based on target reviews
   *
   * Distribution is designed to appear natural to Amazon - larger packages
   * spread over more weeks with lower weekly rates.
   *
   * Required durations per requirements:
   * - 25 credits → approximately 5 weeks (5 reviews/week)
   * - 50 credits → approximately 5-6 weeks (8-10 reviews/week)
   * - 100 credits → approximately 5-6 weeks (17-20 reviews/week)
   * - 200 credits → approximately 8-10 weeks (20-25 reviews/week)
   * - 500 credits → approximately 20-25 weeks (20-25 reviews/week)
   *
   * The key principle: Organic pacing is the priority. No rush delivery.
   * Larger packages spread naturally over more time.
   */
  private calculateReviewsPerWeek(targetReviews: number): number {
    // Tiered calculation based on campaign size to maintain natural pacing
    if (targetReviews <= 25) {
      // Small packages: ~5 weeks duration
      // 25 credits → 5 reviews/week → 5 weeks
      return Math.ceil(targetReviews / 5);
    } else if (targetReviews <= 50) {
      // Medium-small packages: ~5-6 weeks duration
      // 50 credits → 8-10 reviews/week → 5-6 weeks
      return Math.ceil(targetReviews / 6);
    } else if (targetReviews <= 100) {
      // Medium packages: ~5-6 weeks duration
      // 100 credits → 17-20 reviews/week → 5-6 weeks
      return Math.ceil(targetReviews / 6);
    } else if (targetReviews <= 200) {
      // Large packages: ~8-10 weeks duration
      // 200 credits → 20-25 reviews/week → 8-10 weeks
      return Math.ceil(targetReviews / 9);
    } else if (targetReviews <= 500) {
      // Very large packages: ~20-25 weeks duration
      // 500 credits → 20-25 reviews/week → 20-25 weeks
      return Math.ceil(targetReviews / 22);
    } else {
      // Enterprise packages (500+): maintain ~20-25 reviews/week rate
      // This keeps review distribution appearing natural regardless of size
      // 1000 credits → 20-25 reviews/week → 40-50 weeks
      return Math.ceil(targetReviews / 45);
    }
  }

  /**
   * Calculate required credits based on format
   * Ebook = 1 credit per review
   * Audiobook = 2 credits per review
   */
  private calculateRequiredCredits(
    targetReviews: number,
    format: BookFormat,
  ): number {
    if (format === BookFormat.AUDIOBOOK) {
      return targetReviews * 2;
    } else if (format === BookFormat.BOTH) {
      // For BOTH, assume mix (average 1.5 credits per review)
      return Math.ceil(targetReviews * 1.5);
    } else {
      return targetReviews;
    }
  }

  /**
   * Get pending review count for a single campaign
   */
  private async getPendingReviewCount(bookId: string): Promise<number> {
    return await this.prisma.review.count({
      where: {
        readerAssignment: {
          bookId,
        },
        status: {
          in: [ReviewStatus.SUBMITTED, ReviewStatus.PENDING_VALIDATION],
        },
      },
    });
  }

  /**
   * Get pending review counts for multiple campaigns (batch)
   */
  private async getPendingReviewCounts(bookIds: string[]): Promise<Map<string, number>> {
    const result = new Map<string, number>();

    if (bookIds.length === 0) {
      return result;
    }

    // Group count by bookId
    const counts = await this.prisma.review.groupBy({
      by: ['readerAssignmentId'],
      where: {
        readerAssignment: {
          bookId: {
            in: bookIds,
          },
        },
        status: {
          in: [ReviewStatus.SUBMITTED, ReviewStatus.PENDING_VALIDATION],
        },
      },
      _count: {
        id: true,
      },
    });

    // Map assignment IDs to book IDs and aggregate
    const assignmentIds = counts.map(c => c.readerAssignmentId);
    if (assignmentIds.length > 0) {
      const assignments = await this.prisma.readerAssignment.findMany({
        where: {
          id: {
            in: assignmentIds,
          },
        },
        select: {
          id: true,
          bookId: true,
        },
      });

      const assignmentToBook = new Map(assignments.map(a => [a.id, a.bookId]));

      for (const count of counts) {
        const bookId = assignmentToBook.get(count.readerAssignmentId);
        if (bookId) {
          result.set(bookId, (result.get(bookId) || 0) + count._count.id);
        }
      }
    }

    return result;
  }

  /**
   * Map Book entity to CampaignResponseDto
   *
   * IMPORTANT: Per Rule 2 - "Buffer is completely invisible to authors"
   * We explicitly list fields to avoid exposing:
   * - overBookingEnabled
   * - overBookingPercent
   * - totalAssignedReaders
   */
  private mapToResponse(book: any, pendingCount: number = 0): CampaignResponseDto {
    return {
      id: book.id,
      authorProfileId: book.authorProfileId,
      title: book.title,
      authorName: book.authorName,
      asin: book.asin,
      amazonLink: book.amazonLink,
      synopsis: book.synopsis,
      language: book.language,
      genre: book.genre,
      category: book.category,
      availableFormats: book.availableFormats,
      ebookFileUrl: book.ebookFileUrl,
      ebookFileName: book.ebookFileName,
      audioBookFileUrl: book.audioBookFileUrl,
      audioBookFileName: book.audioBookFileName,
      audioBookDuration: book.audioBookDuration,
      coverImageUrl: book.coverImageUrl,
      synopsisFileUrl: book.synopsisFileUrl,
      synopsisFileName: book.synopsisFileName,
      readingInstructions: book.readingInstructions,
      creditsAllocated: book.creditsAllocated,
      creditsUsed: book.creditsUsed,
      creditsRemaining: book.creditsRemaining,
      targetReviews: book.targetReviews,
      reviewsPerWeek: book.reviewsPerWeek,
      currentWeek: book.currentWeek,
      status: book.status,
      campaignStartDate: book.campaignStartDate,
      campaignEndDate: book.campaignEndDate,
      expectedEndDate: book.expectedEndDate,
      totalReviewsDelivered: book.totalReviewsDelivered,
      totalReviewsValidated: book.totalReviewsValidated,
      totalReviewsRejected: book.totalReviewsRejected,
      totalReviewsExpired: book.totalReviewsExpired,
      totalReviewsPending: pendingCount,
      averageInternalRating: book.averageInternalRating
        ? book.averageInternalRating.toNumber()
        : undefined,
      // NOTE: Intentionally NOT including buffer fields per Rule 2:
      // overBookingEnabled, overBookingPercent, totalAssignedReaders are ADMIN-ONLY
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    };
  }
}
