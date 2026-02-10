import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
  Inject,
  forwardRef,
  Optional,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  CreateKeywordResearchDto,
  UpdateKeywordResearchDto,
  KeywordResearchResponseDto,
  KeywordResearchListItemDto,
  CreateKeywordResearchCheckoutDto,
  KeywordResearchCheckoutResponseDto,
} from './dto';
import { KeywordResearchStatus, Prisma, EmailType, TargetMarket } from '@prisma/client';
import { KeywordAiService } from './services/keyword-ai.service';
import { KeywordPdfService } from './services/keyword-pdf.service';
import { FilesService } from '../files/files.service';
import { EmailService } from '../email/email.service';
import { SettingsService } from '../settings/settings.service';
import { QueueService } from '../jobs/queue.service';

@Injectable()
export class KeywordsService {
  private readonly logger = new Logger(KeywordsService.name);
  private readonly appUrl: string;
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private keywordAiService: KeywordAiService,
    private keywordPdfService: KeywordPdfService,
    private filesService: FilesService,
    private emailService: EmailService,
    @Inject(forwardRef(() => SettingsService))
    private settingsService: SettingsService,
    @Optional()
    private queueService?: QueueService,
  ) {
    this.appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';

    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeSecretKey) {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  /**
   * Get current keyword research price from settings
   */
  private async getKeywordResearchPrice(): Promise<number> {
    return this.settingsService.getKeywordResearchPrice();
  }

  /**
   * Create keyword research order
   */
  async create(
    dto: CreateKeywordResearchDto,
    authorProfileId: string,
  ): Promise<KeywordResearchResponseDto> {
    // If bookId is provided, validate the book
    if (dto.bookId) {
      // Check if book exists and belongs to author
      const book = await this.prisma.book.findUnique({
        where: { id: dto.bookId },
        include: { authorProfile: true },
      });

      if (!book) {
        throw new NotFoundException('Book not found');
      }

      if (book.authorProfileId !== authorProfileId) {
        throw new BadRequestException('Book does not belong to this author');
      }

      // Check if keyword research already exists for this book
      const existing = await this.prisma.keywordResearch.findUnique({
        where: { bookId: dto.bookId },
      });

      if (existing) {
        throw new ConflictException(
          'Keyword research already exists for this book',
        );
      }
    }
    // For standalone purchases (no bookId), no book validation needed

    // Get current price from settings
    const keywordResearchPrice = await this.getKeywordResearchPrice();

    // Calculate price (can be 0 if coupon provides free addon or using pending credit)
    let finalPrice = keywordResearchPrice;
    let couponId: string | undefined;
    let usedPendingCredit = false;

    // Check if using pending credit from credit checkout purchase (Section 9.1)
    if (dto.usePendingCredit) {
      const authorProfile = await this.prisma.authorProfile.findUnique({
        where: { id: authorProfileId },
      });

      if (authorProfile && authorProfile.pendingKeywordResearchCredits > 0) {
        // Decrement pending credit and mark as free
        await this.prisma.authorProfile.update({
          where: { id: authorProfileId },
          data: {
            pendingKeywordResearchCredits: { decrement: 1 },
          },
        });
        finalPrice = 0;
        usedPendingCredit = true;
        this.logger.log(`Used pending keyword research credit for author ${authorProfileId}`);
      } else {
        throw new BadRequestException('No pending keyword research credits available');
      }
    }

    // Validate and apply coupon if provided
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode.toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        // Check if coupon applies to keyword research
        if (
          coupon.appliesTo === 'KEYWORD_RESEARCH' ||
          coupon.appliesTo === 'ALL'
        ) {
          if (coupon.type === 'FREE_ADDON') {
            finalPrice = 0;
            couponId = coupon.id;
          } else if (coupon.type === 'PERCENTAGE' && coupon.discountPercent) {
            finalPrice =
              finalPrice -
              (finalPrice * coupon.discountPercent.toNumber()) / 100;
            couponId = coupon.id;
          } else if (coupon.type === 'FIXED_AMOUNT' && coupon.discountAmount) {
            finalPrice = Math.max(
              0,
              finalPrice - coupon.discountAmount.toNumber(),
            );
            couponId = coupon.id;
          }
        }
      }
    }

    // Create keyword research record
    const research = await this.prisma.keywordResearch.create({
      data: {
        authorProfileId,
        bookId: dto.bookId || null, // null for standalone purchases
        bookTitle: dto.bookTitle,
        bookSubtitle: dto.bookSubtitle, // Optional subtitle (max 200 chars)
        genre: dto.genre,
        category: dto.category,
        description: dto.description,
        targetAudience: dto.targetAudience,
        competingBooks: dto.competingBooks,
        specificKeywords: dto.specificKeywords, // User-specified keywords to include
        bookLanguage: dto.bookLanguage,
        targetMarket: dto.targetMarket,
        additionalNotes: dto.additionalNotes,
        price: new Prisma.Decimal(finalPrice),
        paid: finalPrice === 0, // Free if price is 0
        paidAt: finalPrice === 0 ? new Date() : null,
        couponId,
        status: KeywordResearchStatus.PENDING,
      },
    });

    // If paid (or free), trigger processing
    if (research.paid) {
      // Queue background job to process
      if (this.queueService) {
        // Use BullMQ queue for asynchronous processing
        await this.queueService.addJob(
          'keyword-generation-queue',
          'generate-keywords',
          { keywordResearchId: research.id },
          {
            attempts: 3, // Retry up to 3 times
            backoff: {
              type: 'exponential',
              delay: 5000, // Start with 5 seconds
            },
          },
        );
        this.logger.log(`Queued keyword generation job for research ${research.id}`);
      } else {
        // Fallback: Process immediately if queue service not available
        this.logger.warn('QueueService not available, processing keywords immediately');
        this.processKeywordResearch(research.id).catch((error) => {
          console.error('Error processing keyword research:', error);
        });
      }
    }

    return this.toResponseDto(research);
  }

  /**
   * Get all keyword research orders for an author
   */
  async findAllForAuthor(
    authorProfileId: string,
  ): Promise<KeywordResearchListItemDto[]> {
    const researches = await this.prisma.keywordResearch.findMany({
      where: { authorProfileId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        bookTitle: true,
        status: true,
        price: true,
        paid: true,
        pdfUrl: true,
        createdAt: true,
        completedAt: true,
      },
    });

    return researches.map((r) => ({
      id: r.id,
      bookTitle: r.bookTitle,
      status: r.status,
      price: r.price.toNumber(),
      paid: r.paid,
      pdfUrl: r.pdfUrl || undefined,
      createdAt: r.createdAt,
      completedAt: r.completedAt || undefined,
    }));
  }

  /**
   * Get all keyword research orders (Admin)
   */
  async findAll(): Promise<KeywordResearchListItemDto[]> {
    const researches = await this.prisma.keywordResearch.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        bookTitle: true,
        status: true,
        price: true,
        paid: true,
        pdfUrl: true,
        createdAt: true,
        completedAt: true,
      },
    });

    return researches.map((r) => ({
      id: r.id,
      bookTitle: r.bookTitle,
      status: r.status,
      price: r.price.toNumber(),
      paid: r.paid,
      pdfUrl: r.pdfUrl || undefined,
      createdAt: r.createdAt,
      completedAt: r.completedAt || undefined,
    }));
  }

  /**
   * Get keyword research by ID
   */
  async findOne(id: string, authorProfileId?: string): Promise<KeywordResearchResponseDto> {
    const research = await this.prisma.keywordResearch.findUnique({
      where: { id },
    });

    if (!research) {
      throw new NotFoundException('Keyword research not found');
    }

    // If authorProfileId provided, verify ownership
    if (authorProfileId && research.authorProfileId !== authorProfileId) {
      throw new BadRequestException('Not authorized to access this research');
    }

    return this.toResponseDto(research);
  }

  /**
   * Update keyword research (only allowed for PENDING status)
   */
  async update(
    id: string,
    dto: UpdateKeywordResearchDto,
    authorProfileId: string,
  ): Promise<KeywordResearchResponseDto> {
    const research = await this.prisma.keywordResearch.findUnique({
      where: { id },
    });

    if (!research) {
      throw new NotFoundException('Keyword research not found');
    }

    // Verify ownership
    if (research.authorProfileId !== authorProfileId) {
      throw new BadRequestException('Not authorized to update this research');
    }

    // Only allow updates for PENDING status
    if (research.status !== KeywordResearchStatus.PENDING) {
      throw new BadRequestException(
        'Can only edit keyword research that is pending payment. Once processing has started, changes are not allowed.',
      );
    }

    // Update the research
    const updated = await this.prisma.keywordResearch.update({
      where: { id },
      data: {
        ...(dto.bookTitle && { bookTitle: dto.bookTitle }),
        ...(dto.bookSubtitle !== undefined && { bookSubtitle: dto.bookSubtitle }),
        ...(dto.genre && { genre: dto.genre }),
        ...(dto.category && { category: dto.category }),
        ...(dto.description && { description: dto.description }),
        ...(dto.targetAudience && { targetAudience: dto.targetAudience }),
        ...(dto.competingBooks !== undefined && { competingBooks: dto.competingBooks }),
        ...(dto.specificKeywords !== undefined && { specificKeywords: dto.specificKeywords }),
        ...(dto.bookLanguage && { bookLanguage: dto.bookLanguage }),
        ...(dto.targetMarket && { targetMarket: dto.targetMarket }),
        ...(dto.additionalNotes !== undefined && { additionalNotes: dto.additionalNotes }),
      },
    });

    return this.toResponseDto(updated);
  }

  /**
   * Download PDF
   */
  async downloadPdf(id: string, authorProfileId?: string): Promise<string> {
    const research = await this.prisma.keywordResearch.findUnique({
      where: { id },
    });

    if (!research) {
      throw new NotFoundException('Keyword research not found');
    }

    // If authorProfileId provided, verify ownership
    if (authorProfileId && research.authorProfileId !== authorProfileId) {
      throw new BadRequestException('Not authorized to access this research');
    }

    if (!research.pdfUrl) {
      throw new BadRequestException('PDF not yet generated');
    }

    // Increment download count
    await this.prisma.keywordResearch.update({
      where: { id },
      data: {
        downloadCount: { increment: 1 },
        lastDownloadedAt: new Date(),
      },
    });

    // Check if R2 is properly configured (not placeholder)
    const r2Endpoint = this.configService.get<string>('r2.endpoint');
    const isR2Configured = r2Endpoint && !r2Endpoint.includes('placeholder');

    if (!isR2Configured) {
      // In development/local without R2 configured, return stored URL directly
      this.logger.warn('R2 not configured - returning stored PDF URL directly. Configure R2 credentials for production.');
      return research.pdfUrl;
    }

    // In production with R2 configured, generate signed URL
    try {
      // Extract the key from the stored URL
      // URL format: https://files.bookproof.app/keyword-research/keyword-research-{id}.pdf
      // We need: keyword-research/keyword-research-{id}.pdf
      const urlPath = new URL(research.pdfUrl).pathname;
      const key = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath;

      // Generate signed URL valid for 1 hour (3600 seconds)
      const signedUrl = await this.filesService.getSignedUrl(key, 3600);
      return signedUrl;
    } catch (error) {
      this.logger.error('Failed to generate signed URL, falling back to stored URL', error);
      return research.pdfUrl;
    }
  }

  /**
   * Regenerate keywords (Admin or after error)
   */
  async regenerate(id: string): Promise<KeywordResearchResponseDto> {
    const research = await this.prisma.keywordResearch.findUnique({
      where: { id },
    });

    if (!research) {
      throw new NotFoundException('Keyword research not found');
    }

    // Reset status to processing
    await this.prisma.keywordResearch.update({
      where: { id },
      data: {
        status: KeywordResearchStatus.PROCESSING,
        processingStartedAt: new Date(),
        errorMessage: null,
      },
    });

    // Trigger processing
    this.processKeywordResearch(id).catch((error) => {
      console.error('Error regenerating keyword research:', error);
    });

    return this.toResponseDto(research);
  }

  /**
   * Process keyword research (generate keywords and PDF)
   * This should be called from a background job in production
   */
  private async processKeywordResearch(id: string): Promise<void> {
    try {
      const research = await this.prisma.keywordResearch.findUnique({
        where: { id },
      });

      if (!research) {
        throw new Error('Research not found');
      }

      // Update status to processing
      await this.prisma.keywordResearch.update({
        where: { id },
        data: {
          status: KeywordResearchStatus.PROCESSING,
          processingStartedAt: new Date(),
        },
      });

      // Generate keywords using AI
      const keywords = await this.keywordAiService.generateKeywords({
        bookTitle: research.bookTitle,
        bookSubtitle: research.bookSubtitle || undefined,
        genre: research.genre,
        category: research.category,
        description: research.description,
        targetAudience: research.targetAudience,
        competingBooks: research.competingBooks || undefined,
        specificKeywords: research.specificKeywords || undefined, // User-specified keywords to include
        language: research.bookLanguage,
        targetMarket: research.targetMarket,
        additionalNotes: research.additionalNotes || undefined,
      });

      // Store keywords in database (as JSON strings)
      await this.prisma.keywordResearch.update({
        where: { id },
        data: {
          primaryKeywords: JSON.stringify(keywords.primaryKeywords),
          secondaryKeywords: JSON.stringify(keywords.secondaryKeywords),
          longTailKeywords: JSON.stringify(keywords.longTailKeywords),
          usageGuidelines: JSON.stringify(keywords.usageGuidelines),
          kdpSuggestions: JSON.stringify(keywords.kdpSuggestions),
        },
      });

      // Generate PDF
      const pdfBuffer = await this.keywordPdfService.generatePdf({
        bookTitle: research.bookTitle,
        bookSubtitle: research.bookSubtitle || undefined,
        genre: research.genre,
        category: research.category,
        language: research.bookLanguage,
        targetMarket: research.targetMarket,
        keywords,
      });

      // Upload PDF to R2
      const fileName = `keyword-research-${id}.pdf`;
      const key = `keyword-research/${fileName}`;
      const uploadResult = await this.filesService.uploadFile(
        pdfBuffer,
        key,
        'application/pdf',
      );

      // Update research with PDF info
      await this.prisma.keywordResearch.update({
        where: { id },
        data: {
          pdfUrl: uploadResult.url,
          pdfFileName: fileName,
          pdfGeneratedAt: new Date(),
          status: KeywordResearchStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      // Send email with PDF to author
      try {
        // Get author's email
        const authorProfile = await this.prisma.authorProfile.findUnique({
          where: { id: research.authorProfileId },
          include: { user: true },
        });

        if (authorProfile?.user?.email) {
          await this.emailService.sendTemplatedEmail(
            authorProfile.user.email,
            EmailType.KEYWORD_RESEARCH_READY,
            {
              userName: authorProfile.user.name,
              bookTitle: research.bookTitle,
              keywordPdfUrl: uploadResult.url,
              dashboardUrl: `${this.appUrl}/author/keyword-research/${id}`,
            },
            authorProfile.userId,
            research.bookLanguage,
            // Attach the PDF to the email
            [
              {
                filename: fileName,
                content: pdfBuffer,
                contentType: 'application/pdf',
              },
            ],
          );

          // Update emailedAt status
          await this.prisma.keywordResearch.update({
            where: { id },
            data: {
              emailedAt: new Date(),
              emailDelivered: true,
            },
          });

          this.logger.log(`Keyword research email sent to ${authorProfile.user.email} for research ID: ${id}`);
        } else {
          this.logger.warn(`No author email found for keyword research ID: ${id}`);
        }
      } catch (emailError) {
        // Email failure should not fail the entire process
        this.logger.error(`Failed to send keyword research email for ID: ${id}`, emailError);

        // Mark email as not delivered
        await this.prisma.keywordResearch.update({
          where: { id },
          data: {
            emailDelivered: false,
          },
        });
      }

      this.logger.log(`Keyword research completed for ID: ${id}`);
    } catch (error) {
      // Mark as failed
      await this.prisma.keywordResearch.update({
        where: { id },
        data: {
          status: KeywordResearchStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Create Stripe checkout session for keyword research payment
   */
  async createCheckoutSession(
    id: string,
    dto: CreateKeywordResearchCheckoutDto,
    authorProfileId: string,
  ): Promise<KeywordResearchCheckoutResponseDto> {
    if (!this.stripe) {
      throw new BadRequestException('Payment system is not configured');
    }

    const research = await this.prisma.keywordResearch.findUnique({
      where: { id },
    });

    if (!research) {
      throw new NotFoundException('Keyword research not found');
    }

    if (research.authorProfileId !== authorProfileId) {
      throw new BadRequestException('Not authorized to access this research');
    }

    if (research.paid) {
      throw new BadRequestException('This keyword research has already been paid');
    }

    if (research.status !== KeywordResearchStatus.PENDING) {
      throw new BadRequestException('Can only pay for keyword research in PENDING status');
    }

    // Get author profile for Stripe customer
    const authorProfile = await this.prisma.authorProfile.findUnique({
      where: { id: authorProfileId },
      include: { user: true },
    });

    if (!authorProfile) {
      throw new NotFoundException('Author profile not found');
    }

    // Create or get Stripe customer
    let stripeCustomerId = authorProfile.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: authorProfile.user.email,
        name: authorProfile.user.name,
        metadata: {
          authorProfileId: authorProfile.id,
          userId: authorProfile.userId,
        },
      });
      stripeCustomerId = customer.id;

      await this.prisma.authorProfile.update({
        where: { id: authorProfileId },
        data: { stripeCustomerId },
      });
    }

    const amount = research.price.toNumber();

    // Create Stripe checkout session
    const session = await this.stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Amazon Keyword Research',
              description: `Keyword research for "${research.bookTitle}"`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: dto.successUrl,
      cancel_url: dto.cancelUrl,
      metadata: {
        type: 'keyword_research',
        keywordResearchId: id,
        authorProfileId,
      },
    });

    this.logger.log(`Created checkout session ${session.id} for keyword research ${id}`);

    return {
      sessionId: session.id,
      checkoutUrl: session.url!,
      keywordResearchId: id,
      amount,
      currency: 'USD',
    };
  }

  /**
   * Handle successful payment webhook for keyword research
   */
  async handlePaymentSuccess(keywordResearchId: string): Promise<void> {
    const research = await this.prisma.keywordResearch.findUnique({
      where: { id: keywordResearchId },
    });

    if (!research) {
      throw new NotFoundException('Keyword research not found');
    }

    if (research.paid) {
      this.logger.warn(`Keyword research ${keywordResearchId} already marked as paid`);
      return;
    }

    // Update to paid status
    await this.prisma.keywordResearch.update({
      where: { id: keywordResearchId },
      data: {
        paid: true,
        paidAt: new Date(),
      },
    });

    this.logger.log(`Keyword research ${keywordResearchId} marked as paid, starting processing`);

    // Trigger keyword generation processing
    if (this.queueService) {
      // Use BullMQ queue for asynchronous processing
      await this.queueService.addJob(
        'keyword-generation-queue',
        'generate-keywords',
        { keywordResearchId },
        {
          attempts: 3, // Retry up to 3 times
          backoff: {
            type: 'exponential',
            delay: 5000, // Start with 5 seconds
          },
        },
      );
      this.logger.log(`Queued keyword generation job for research ${keywordResearchId}`);
    } else {
      // Fallback: Process immediately if queue service not available
      this.logger.warn('QueueService not available, processing keywords immediately');
      this.processKeywordResearch(keywordResearchId).catch((error) => {
        this.logger.error(`Error processing keyword research after payment: ${error.message}`);
      });
    }
  }

  /**
   * Convert Prisma model to response DTO
   */
  private toResponseDto(research: any): KeywordResearchResponseDto {
    return new KeywordResearchResponseDto({
      id: research.id,
      authorProfileId: research.authorProfileId,
      bookId: research.bookId || undefined, // undefined for standalone purchases
      bookTitle: research.bookTitle,
      bookSubtitle: research.bookSubtitle || undefined,
      genre: research.genre,
      category: research.category,
      description: research.description,
      targetAudience: research.targetAudience,
      competingBooks: research.competingBooks || undefined,
      specificKeywords: research.specificKeywords || undefined,
      bookLanguage: research.bookLanguage,
      targetMarket: research.targetMarket,
      additionalNotes: research.additionalNotes || undefined,
      primaryKeywords: research.primaryKeywords
        ? JSON.parse(research.primaryKeywords)
        : undefined,
      secondaryKeywords: research.secondaryKeywords
        ? JSON.parse(research.secondaryKeywords)
        : undefined,
      longTailKeywords: research.longTailKeywords
        ? JSON.parse(research.longTailKeywords)
        : undefined,
      usageGuidelines: research.usageGuidelines
        ? JSON.parse(research.usageGuidelines)
        : undefined,
      kdpSuggestions: research.kdpSuggestions
        ? JSON.parse(research.kdpSuggestions)
        : undefined,
      pdfUrl: research.pdfUrl || undefined,
      pdfFileName: research.pdfFileName || undefined,
      pdfGeneratedAt: research.pdfGeneratedAt || undefined,
      status: research.status,
      processingStartedAt: research.processingStartedAt || undefined,
      completedAt: research.completedAt || undefined,
      errorMessage: research.errorMessage || undefined,
      price: research.price.toNumber(),
      paid: research.paid,
      paidAt: research.paidAt || undefined,
      couponId: research.couponId || undefined,
      emailedAt: research.emailedAt || undefined,
      emailDelivered: research.emailDelivered,
      downloadCount: research.downloadCount,
      lastDownloadedAt: research.lastDownloadedAt || undefined,
      createdAt: research.createdAt,
      updatedAt: research.updatedAt,
    });
  }
}
