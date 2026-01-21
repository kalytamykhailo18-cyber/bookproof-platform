import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Stripe from 'stripe';
import {
  RefundReason,
  RefundRequestStatus,
  PaymentStatus,
  CreditTransactionType,
} from '@prisma/client';
import { NotificationsService } from '@modules/notifications/notifications.service';
import { EmailService } from '@modules/email/email.service';

export interface CreateRefundRequestInput {
  creditPurchaseId: string;
  reason: RefundReason;
  explanation?: string;
}

export interface AdminRefundDecisionInput {
  decision: 'approve' | 'approve_partial' | 'reject';
  adminNotes?: string;
  refundAmount?: number;
}

export interface RefundRequestResponse {
  id: string;
  creditPurchaseId: string;
  authorProfileId: string;
  authorName: string;
  authorEmail: string;
  originalAmount: number;
  currency: string;
  creditsAmount: number;
  creditsUsed: number;
  creditsRemaining: number;
  purchaseDate: string;
  daysSincePurchase: number;
  isEligible: boolean;
  ineligibilityReason?: string;
  reason: RefundReason;
  explanation?: string;
  status: RefundRequestStatus;
  adminNotes?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
}

export interface RefundEligibilityResponse {
  isEligible: boolean;
  reason?: string;
  daysSincePurchase: number;
  creditsAmount: number;
  creditsUsed: number;
  creditsRemaining: number;
  originalAmount: number;
  hasActiveCampaigns: boolean;
}

@Injectable()
export class RefundsService {
  private readonly logger = new Logger(RefundsService.name);
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Check refund eligibility for a purchase
   */
  async checkEligibility(
    creditPurchaseId: string,
    authorProfileId: string,
  ): Promise<RefundEligibilityResponse> {
    const purchase = await this.prisma.creditPurchase.findUnique({
      where: { id: creditPurchaseId },
      include: {
        authorProfile: {
          include: {
            books: {
              where: {
                status: { in: ['ACTIVE', 'PAUSED'] },
              },
            },
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Credit purchase not found');
    }

    if (purchase.authorProfileId !== authorProfileId) {
      throw new ForbiddenException('You do not have access to this purchase');
    }

    const daysSincePurchase = Math.floor(
      (Date.now() - purchase.purchaseDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Calculate credits used from this specific purchase
    // For simplicity, we consider credits used if author's totalCreditsUsed > 0
    // A more accurate method would track credits per purchase
    const totalPurchasedBefore = purchase.authorProfile.totalCreditsPurchased - purchase.credits;
    const creditsUsedFromThisPurchase = Math.max(
      0,
      purchase.authorProfile.totalCreditsUsed - totalPurchasedBefore,
    );
    const creditsRemaining = Math.max(0, purchase.credits - creditsUsedFromThisPurchase);

    const hasActiveCampaigns = purchase.authorProfile.books.length > 0;
    const originalAmount = parseFloat(purchase.amountPaid.toString());

    // Check eligibility conditions
    let isEligible = true;
    let reason: string | undefined;

    // Check if already refunded
    if (purchase.paymentStatus === PaymentStatus.REFUNDED) {
      isEligible = false;
      reason = 'This purchase has already been refunded';
    }
    // Check if payment was successful
    else if (purchase.paymentStatus !== PaymentStatus.COMPLETED) {
      isEligible = false;
      reason = 'Only completed purchases can be refunded';
    }
    // Check 30-day policy
    else if (daysSincePurchase > 30) {
      isEligible = false;
      reason = 'Refunds are only available within 30 days of purchase';
    }
    // Check if credits have been used
    else if (creditsUsedFromThisPurchase > 0) {
      isEligible = false;
      reason = `${creditsUsedFromThisPurchase} credits from this purchase have been used`;
    }
    // Check for active campaigns
    else if (hasActiveCampaigns) {
      isEligible = false;
      reason = 'Cannot refund while you have active campaigns';
    }

    // Check for existing pending refund request
    const existingRequest = await this.prisma.refundRequest.findFirst({
      where: {
        creditPurchaseId,
        status: { in: [RefundRequestStatus.PENDING, RefundRequestStatus.APPROVED, RefundRequestStatus.PROCESSING] },
      },
    });

    if (existingRequest) {
      isEligible = false;
      reason = 'A refund request for this purchase is already being processed';
    }

    return {
      isEligible,
      reason,
      daysSincePurchase,
      creditsAmount: purchase.credits,
      creditsUsed: creditsUsedFromThisPurchase,
      creditsRemaining,
      originalAmount,
      hasActiveCampaigns,
    };
  }

  /**
   * Create a refund request
   */
  async createRequest(
    authorProfileId: string,
    input: CreateRefundRequestInput,
  ): Promise<RefundRequestResponse> {
    // Check eligibility first
    const eligibility = await this.checkEligibility(input.creditPurchaseId, authorProfileId);

    if (!eligibility.isEligible) {
      throw new BadRequestException(eligibility.reason || 'This purchase is not eligible for refund');
    }

    // Create the refund request
    const request = await this.prisma.refundRequest.create({
      data: {
        creditPurchaseId: input.creditPurchaseId,
        authorProfileId,
        reason: input.reason,
        explanation: input.explanation,
        status: RefundRequestStatus.PENDING,
      },
      include: {
        creditPurchase: {
          include: {
            packageTier: true,
          },
        },
        authorProfile: {
          include: {
            user: true,
          },
        },
      },
    });

    // Notify admins about new refund request
    const admins = await this.prisma.user.findMany({
      where: {
        role: 'ADMIN',
        isActive: true,
      },
    });

    for (const admin of admins) {
      try {
        await this.notificationsService.createNotification({
          userId: admin.id,
          type: 'SYSTEM' as any,
          title: 'New Refund Request',
          message: `${request.authorProfile.user.name || request.authorProfile.user.email} has requested a refund of $${eligibility.originalAmount.toFixed(2)} for ${request.creditPurchase.credits} credits.`,
          actionUrl: '/admin/refunds',
          metadata: {
            refundRequestId: request.id,
            authorEmail: request.authorProfile.user.email,
            amount: eligibility.originalAmount,
          },
        });
      } catch (error) {
        this.logger.error(`Failed to notify admin ${admin.id} about refund request: ${error.message}`);
      }
    }

    return this.mapToResponse(request, eligibility);
  }

  /**
   * Get refund requests for an author
   */
  async getAuthorRequests(authorProfileId: string): Promise<RefundRequestResponse[]> {
    const requests = await this.prisma.refundRequest.findMany({
      where: { authorProfileId },
      include: {
        creditPurchase: {
          include: {
            packageTier: true,
          },
        },
        authorProfile: {
          include: {
            user: true,
            books: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(requests.map(async (request) => {
      const eligibility = await this.calculateEligibilityInfo(request);
      return this.mapToResponse(request, eligibility);
    }));
  }

  /**
   * Get a single refund request
   */
  async getRequest(requestId: string, authorProfileId?: string): Promise<RefundRequestResponse> {
    const request = await this.prisma.refundRequest.findUnique({
      where: { id: requestId },
      include: {
        creditPurchase: {
          include: {
            packageTier: true,
          },
        },
        authorProfile: {
          include: {
            user: true,
            books: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Refund request not found');
    }

    // Check ownership if authorProfileId provided
    if (authorProfileId && request.authorProfileId !== authorProfileId) {
      throw new ForbiddenException('You do not have access to this refund request');
    }

    const eligibility = await this.calculateEligibilityInfo(request);
    return this.mapToResponse(request, eligibility);
  }

  /**
   * Cancel a refund request (author only, must be PENDING)
   */
  async cancelRequest(requestId: string, authorProfileId: string): Promise<void> {
    const request = await this.prisma.refundRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Refund request not found');
    }

    if (request.authorProfileId !== authorProfileId) {
      throw new ForbiddenException('You do not have access to this refund request');
    }

    if (request.status !== RefundRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be cancelled');
    }

    await this.prisma.refundRequest.delete({
      where: { id: requestId },
    });
  }

  // ==========================================
  // ADMIN METHODS
  // ==========================================

  /**
   * Get all refund requests (admin)
   */
  async getAllRequests(filters?: {
    status?: RefundRequestStatus;
    limit?: number;
    offset?: number;
  }): Promise<{ requests: RefundRequestResponse[]; total: number }> {
    const where: any = {};
    if (filters?.status) {
      where.status = filters.status;
    }

    const [requests, total] = await Promise.all([
      this.prisma.refundRequest.findMany({
        where,
        include: {
          creditPurchase: {
            include: {
              packageTier: true,
            },
          },
          authorProfile: {
            include: {
              user: true,
              books: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
      }),
      this.prisma.refundRequest.count({ where }),
    ]);

    const mappedRequests = await Promise.all(
      requests.map(async (request) => {
        const eligibility = await this.calculateEligibilityInfo(request);
        return this.mapToResponse(request, eligibility);
      }),
    );

    return { requests: mappedRequests, total };
  }

  /**
   * Process a refund request (admin)
   */
  async processRequest(
    requestId: string,
    adminId: string,
    input: AdminRefundDecisionInput,
  ): Promise<RefundRequestResponse> {
    const request = await this.prisma.refundRequest.findUnique({
      where: { id: requestId },
      include: {
        creditPurchase: {
          include: {
            packageTier: true,
            authorProfile: {
              include: {
                user: true,
              },
            },
          },
        },
        authorProfile: {
          include: {
            user: true,
            books: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Refund request not found');
    }

    if (request.status !== RefundRequestStatus.PENDING) {
      throw new BadRequestException('This request has already been processed');
    }

    const originalAmount = parseFloat(request.creditPurchase.amountPaid.toString());

    if (input.decision === 'reject') {
      // Reject the refund
      const updatedRequest = await this.prisma.refundRequest.update({
        where: { id: requestId },
        data: {
          status: RefundRequestStatus.REJECTED,
          adminNotes: input.adminNotes,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
        include: {
          creditPurchase: {
            include: {
              packageTier: true,
            },
          },
          authorProfile: {
            include: {
              user: true,
              books: true,
            },
          },
        },
      });

      // Notify author
      await this.notifyAuthor(request, 'rejected', input.adminNotes);

      const eligibility = await this.calculateEligibilityInfo(updatedRequest);
      return this.mapToResponse(updatedRequest, eligibility);
    }

    // Approve or partially approve
    const refundAmount = input.decision === 'approve_partial' && input.refundAmount
      ? Math.min(input.refundAmount, originalAmount)
      : originalAmount;

    // Update request to approved/processing
    await this.prisma.refundRequest.update({
      where: { id: requestId },
      data: {
        status: input.decision === 'approve' ? RefundRequestStatus.APPROVED : RefundRequestStatus.PARTIALLY_APPROVED,
        adminNotes: input.adminNotes,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        refundAmount,
      },
    });

    // Process Stripe refund
    try {
      if (!request.creditPurchase.stripePaymentId) {
        throw new BadRequestException('No Stripe payment ID found for this purchase');
      }

      const refund = await this.stripe.refunds.create({
        payment_intent: request.creditPurchase.stripePaymentId,
        amount: Math.round(refundAmount * 100), // Convert to cents
        reason: 'requested_by_customer',
      });

      // Update request with Stripe refund ID and mark as completed
      const updatedRequest = await this.prisma.refundRequest.update({
        where: { id: requestId },
        data: {
          status: RefundRequestStatus.COMPLETED,
          stripeRefundId: refund.id,
          processedAt: new Date(),
        },
        include: {
          creditPurchase: {
            include: {
              packageTier: true,
            },
          },
          authorProfile: {
            include: {
              user: true,
              books: true,
            },
          },
        },
      });

      // Credits will be deducted by the webhook handler when Stripe sends charge.refunded event
      // But we can notify the author now

      await this.notifyAuthor(request, 'approved', input.adminNotes, refundAmount);

      const eligibility = await this.calculateEligibilityInfo(updatedRequest);
      return this.mapToResponse(updatedRequest, eligibility);
    } catch (error) {
      this.logger.error(`Failed to process Stripe refund: ${error.message}`);

      // Revert to pending if Stripe fails
      await this.prisma.refundRequest.update({
        where: { id: requestId },
        data: {
          status: RefundRequestStatus.PENDING,
          adminNotes: `Stripe refund failed: ${error.message}`,
        },
      });

      throw new BadRequestException(`Failed to process refund: ${error.message}`);
    }
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private async calculateEligibilityInfo(request: any): Promise<{
    daysSincePurchase: number;
    creditsUsed: number;
    creditsRemaining: number;
    originalAmount: number;
    hasActiveCampaigns: boolean;
    isEligible: boolean;
    ineligibilityReason?: string;
  }> {
    const purchase = request.creditPurchase;
    const authorProfile = request.authorProfile;

    const daysSincePurchase = Math.floor(
      (Date.now() - purchase.purchaseDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const totalPurchasedBefore = authorProfile.totalCreditsPurchased - purchase.credits;
    const creditsUsedFromThisPurchase = Math.max(
      0,
      authorProfile.totalCreditsUsed - totalPurchasedBefore,
    );
    const creditsRemaining = Math.max(0, purchase.credits - creditsUsedFromThisPurchase);
    const hasActiveCampaigns = authorProfile.books?.some(
      (book: any) => book.status === 'ACTIVE' || book.status === 'PAUSED',
    ) || false;
    const originalAmount = parseFloat(purchase.amountPaid.toString());

    let isEligible = true;
    let ineligibilityReason: string | undefined;

    if (purchase.paymentStatus === PaymentStatus.REFUNDED) {
      isEligible = false;
      ineligibilityReason = 'This purchase has already been refunded';
    } else if (daysSincePurchase > 30) {
      isEligible = false;
      ineligibilityReason = 'Refunds are only available within 30 days of purchase';
    } else if (creditsUsedFromThisPurchase > 0) {
      isEligible = false;
      ineligibilityReason = `${creditsUsedFromThisPurchase} credits have been used`;
    } else if (hasActiveCampaigns) {
      isEligible = false;
      ineligibilityReason = 'Cannot refund while you have active campaigns';
    }

    return {
      daysSincePurchase,
      creditsUsed: creditsUsedFromThisPurchase,
      creditsRemaining,
      originalAmount,
      hasActiveCampaigns,
      isEligible,
      ineligibilityReason,
    };
  }

  private mapToResponse(request: any, eligibility: any): RefundRequestResponse {
    return {
      id: request.id,
      creditPurchaseId: request.creditPurchaseId,
      authorProfileId: request.authorProfileId,
      authorName: request.authorProfile.user.name || request.authorProfile.user.email,
      authorEmail: request.authorProfile.user.email,
      originalAmount: eligibility.originalAmount,
      currency: request.creditPurchase.currency,
      creditsAmount: request.creditPurchase.credits,
      creditsUsed: eligibility.creditsUsed,
      creditsRemaining: eligibility.creditsRemaining,
      purchaseDate: request.creditPurchase.purchaseDate.toISOString(),
      daysSincePurchase: eligibility.daysSincePurchase,
      isEligible: eligibility.isEligible,
      ineligibilityReason: eligibility.ineligibilityReason,
      reason: request.reason,
      explanation: request.explanation || undefined,
      status: request.status,
      adminNotes: request.adminNotes || undefined,
      refundAmount: request.refundAmount ? parseFloat(request.refundAmount.toString()) : undefined,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      processedAt: request.processedAt?.toISOString(),
    };
  }

  private async notifyAuthor(
    request: any,
    decision: 'approved' | 'rejected',
    adminNotes?: string,
    refundAmount?: number,
  ): Promise<void> {
    const user = request.authorProfile.user;

    try {
      // In-app notification
      await this.notificationsService.createNotification({
        userId: user.id,
        type: 'PAYMENT' as any,
        title: decision === 'approved' ? 'Refund Approved' : 'Refund Request Declined',
        message: decision === 'approved'
          ? `Your refund request for $${refundAmount?.toFixed(2) || '0.00'} has been approved. The funds will be returned to your original payment method within 5-10 business days.`
          : `Your refund request has been declined. ${adminNotes || 'Please contact support for more information.'}`,
        actionUrl: '/author/credits',
        metadata: {
          refundRequestId: request.id,
          decision,
          refundAmount,
        },
      });

      // Email notification would go here
      // await this.emailService.sendTemplatedEmail(...)
    } catch (error) {
      this.logger.error(`Failed to notify author about refund decision: ${error.message}`);
    }
  }
}
