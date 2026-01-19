import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@common/prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { EmailService } from '../../email/email.service';
import {
  CreatePaymentIssueDto,
  ResolvePaymentIssueDto,
  ProcessRefundDto,
  UpdatePaymentIssueStatusDto,
  GetPaymentIssuesQueryDto,
  PaymentIssueResponseDto,
  PaymentIssueStatus,
  PaymentIssuePriority,
  PaymentIssueAction,
} from '../dto/payment-issue.dto';
import { UserRole, CreditTransactionType, EmailType, Language } from '@prisma/client';
import Stripe from 'stripe';

@Injectable()
export class PaymentIssueService {
  private readonly logger = new Logger(PaymentIssueService.name);
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (stripeSecretKey) {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  /**
   * Create a payment issue
   */
  async createPaymentIssue(
    dto: CreatePaymentIssueDto,
    adminUserId?: string,
  ): Promise<PaymentIssueResponseDto> {
    // Get user to determine role
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const paymentIssue = await this.prisma.paymentIssue.create({
      data: {
        userId: dto.userId,
        userRole: user.role,
        type: dto.type as any,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        description: dto.description,
        stripePaymentId: dto.stripePaymentId,
        priority: (dto.priority || PaymentIssuePriority.HIGH) as any,
        status: 'OPEN' as any,
      },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      action: 'payment_issue.created',
      entity: 'PaymentIssue',
      entityId: paymentIssue.id,
      userId: adminUserId || dto.userId,
      userEmail: user.email,
      userRole: adminUserId ? UserRole.ADMIN : user.role,
      description: `Payment issue created: ${dto.type} for $${dto.amount}`,
      changes: {
        type: dto.type,
        amount: dto.amount,
        currency: dto.currency || 'USD',
        stripePaymentId: dto.stripePaymentId,
      },
    });

    return this.mapToResponseDto(paymentIssue);
  }

  /**
   * Get all open payment issues
   */
  async getOpenPaymentIssues(): Promise<PaymentIssueResponseDto[]> {
    const issues = await this.prisma.paymentIssue.findMany({
      where: {
        status: {
          in: ['OPEN', 'IN_PROGRESS', 'ESCALATED'] as any[],
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    return issues.map((i) => this.mapToResponseDto(i));
  }

  /**
   * Get payment issues with filters
   */
  async getPaymentIssues(query: GetPaymentIssuesQueryDto): Promise<PaymentIssueResponseDto[]> {
    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }
    if (query.type) {
      where.type = query.type;
    }
    if (query.priority) {
      where.priority = query.priority;
    }
    if (query.userId) {
      where.userId = query.userId;
    }

    const issues = await this.prisma.paymentIssue.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return issues.map((i) => this.mapToResponseDto(i));
  }

  /**
   * Get payment issue by ID
   */
  async getPaymentIssueById(issueId: string): Promise<PaymentIssueResponseDto> {
    const issue = await this.prisma.paymentIssue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new NotFoundException('Payment issue not found');
    }

    return this.mapToResponseDto(issue);
  }

  /**
   * Resolve a payment issue
   */
  async resolvePaymentIssue(
    issueId: string,
    dto: ResolvePaymentIssueDto,
    adminUserId: string,
  ): Promise<PaymentIssueResponseDto> {
    const issue = await this.prisma.paymentIssue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new NotFoundException('Payment issue not found');
    }

    if (issue.status === 'RESOLVED' || issue.status === 'REJECTED') {
      throw new BadRequestException('Payment issue is already resolved or rejected');
    }

    const updatedIssue = await this.prisma.paymentIssue.update({
      where: { id: issueId },
      data: {
        status: 'RESOLVED' as any,
        resolution: dto.resolution,
        actionTaken: dto.action as any,
        stripeRefundId: dto.stripeRefundId,
        resolvedBy: adminUserId,
        resolvedAt: new Date(),
      },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      action: 'payment_issue.resolved',
      entity: 'PaymentIssue',
      entityId: issueId,
      userId: adminUserId,
      userEmail: '', // Admin email not available in context
      userRole: UserRole.ADMIN,
      description: `Payment issue resolved with action: ${dto.action}`,
      changes: {
        previousStatus: issue.status,
        action: dto.action,
        resolution: dto.resolution,
        stripeRefundId: dto.stripeRefundId,
      },
    });

    return this.mapToResponseDto(updatedIssue);
  }

  /**
   * Process a refund for a payment issue through Stripe
   */
  async processRefund(
    issueId: string,
    dto: ProcessRefundDto,
    adminUserId: string,
  ): Promise<PaymentIssueResponseDto> {
    const issue = await this.prisma.paymentIssue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new NotFoundException('Payment issue not found');
    }

    // Fetch the user associated with the payment issue
    const user = await this.prisma.user.findUnique({
      where: { id: issue.userId },
    });

    if (issue.status === 'RESOLVED' || issue.status === 'REJECTED') {
      throw new BadRequestException('Payment issue is already resolved or rejected');
    }

    if (!issue.stripePaymentId) {
      throw new BadRequestException('No Stripe payment ID associated with this issue');
    }

    let refund: Stripe.Refund | null = null;
    let stripeRefundId: string | null = null;

    // Process refund through Stripe
    if (this.stripe) {
      try {
        const refundParams: Stripe.RefundCreateParams = {
          payment_intent: issue.stripePaymentId,
          reason: 'requested_by_customer',
        };

        // If partial amount specified, add it (convert to cents)
        if (dto.amount && dto.amount < parseFloat(issue.amount.toString())) {
          refundParams.amount = Math.round(dto.amount * 100);
        }

        refund = await this.stripe.refunds.create(refundParams);
        stripeRefundId = refund.id;
        this.logger.log(`Stripe refund created: ${refund.id} for payment ${issue.stripePaymentId}`);
      } catch (error) {
        this.logger.error(`Failed to process Stripe refund: ${error.message}`);
        throw new BadRequestException(`Failed to process refund through Stripe: ${error.message}`);
      }
    } else {
      this.logger.warn('Stripe not configured - refund marked as processed without Stripe API call');
    }

    // Find and update related credit purchase if exists
    const creditPurchase = await this.prisma.creditPurchase.findFirst({
      where: { stripePaymentId: issue.stripePaymentId },
      include: { authorProfile: true },
    });

    const refundAmount = dto.amount || parseFloat(issue.amount.toString());
    let creditsDeducted = 0;

    if (creditPurchase && creditPurchase.authorProfile) {
      // Calculate credits to deduct (proportional to refund amount)
      const originalAmount = parseFloat(creditPurchase.amountPaid.toString());
      const isFullRefund = refundAmount >= originalAmount;
      creditsDeducted = isFullRefund
        ? creditPurchase.credits
        : Math.floor((refundAmount / originalAmount) * creditPurchase.credits);

      // Update credit purchase record - use REFUNDED status (partial tracking via refundAmount field)
      await this.prisma.creditPurchase.update({
        where: { id: creditPurchase.id },
        data: {
          refundedAt: new Date(),
          refundAmount: refundAmount,
          refundReason: dto.reason,
          paymentStatus: 'REFUNDED',
        },
      });

      // Deduct credits from author account
      const currentCredits = creditPurchase.authorProfile.availableCredits;
      const newBalance = Math.max(0, currentCredits - creditsDeducted);

      await this.prisma.authorProfile.update({
        where: { id: creditPurchase.authorProfileId },
        data: {
          availableCredits: newBalance,
        },
      });

      // Create credit transaction for the deduction
      await this.prisma.creditTransaction.create({
        data: {
          authorProfileId: creditPurchase.authorProfileId,
          amount: -creditsDeducted,
          type: CreditTransactionType.REFUND,
          description: `Admin refund processed: ${creditsDeducted} credits deducted. Reason: ${dto.reason}`,
          balanceAfter: newBalance,
        },
      });

      this.logger.log(`Credits deducted: ${creditsDeducted} from author ${creditPurchase.authorProfileId}`);
    }

    // Update the payment issue
    const updatedIssue = await this.prisma.paymentIssue.update({
      where: { id: issueId },
      data: {
        status: 'RESOLVED' as any,
        resolution: dto.reason,
        actionTaken: 'REFUNDED' as any,
        stripeRefundId: stripeRefundId,
        resolvedBy: adminUserId,
        resolvedAt: new Date(),
      },
    });

    // Send notification email to user about refund
    if (user) {
      try {
        await this.emailService.sendTemplatedEmail(
          user.email,
          EmailType.REFUND_PROCESSED,
          {
            userName: user.name || 'Customer',
            amount: refundAmount,
            currency: issue.currency,
            transactionId: stripeRefundId || issue.stripePaymentId,
            dashboardUrl: `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/author/credits`,
          },
          issue.userId,
          (user.preferredLanguage as Language) || Language.EN,
        );
        this.logger.log(`Refund notification email sent to ${user.email}`);
      } catch (error) {
        this.logger.error(`Failed to send refund notification email: ${error.message}`);
        // Don't throw - refund was successful, just notification failed
      }
    }

    // Log audit trail
    await this.auditService.logAdminAction({
      action: 'payment_issue.refund_processed',
      entity: 'PaymentIssue',
      entityId: issueId,
      userId: adminUserId,
      userEmail: '', // Admin email not available in context
      userRole: UserRole.ADMIN,
      description: `Refund processed: $${refundAmount}. Credits deducted: ${creditsDeducted}`,
      changes: {
        refundAmount,
        stripeRefundId,
        creditsDeducted,
        reason: dto.reason,
      },
    });

    return this.mapToResponseDto(updatedIssue);
  }

  /**
   * Reconcile a payment issue
   */
  async reconcilePayment(
    issueId: string,
    notes: string,
    adminUserId: string,
  ): Promise<PaymentIssueResponseDto> {
    const issue = await this.prisma.paymentIssue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new NotFoundException('Payment issue not found');
    }

    const updatedIssue = await this.prisma.paymentIssue.update({
      where: { id: issueId },
      data: {
        status: 'RESOLVED' as any,
        resolution: notes,
        actionTaken: 'RECONCILED' as any,
        resolvedBy: adminUserId,
        resolvedAt: new Date(),
      },
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      action: 'payment_issue.reconciled',
      entity: 'PaymentIssue',
      entityId: issueId,
      userId: adminUserId,
      userEmail: '', // Admin email not available in context
      userRole: UserRole.ADMIN,
      description: `Payment reconciled`,
      changes: {
        notes,
      },
    });

    return this.mapToResponseDto(updatedIssue);
  }

  /**
   * Update payment issue status
   */
  async updatePaymentIssueStatus(
    issueId: string,
    dto: UpdatePaymentIssueStatusDto,
    adminUserId: string,
  ): Promise<PaymentIssueResponseDto> {
    const issue = await this.prisma.paymentIssue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new NotFoundException('Payment issue not found');
    }

    const updateData: any = {
      status: dto.status as any,
    };

    if (dto.adminNotes) {
      updateData.adminNotes = dto.adminNotes;
    }

    const updatedIssue = await this.prisma.paymentIssue.update({
      where: { id: issueId },
      data: updateData,
    });

    // Log audit trail
    await this.auditService.logAdminAction({
      action: 'payment_issue.status_updated',
      entity: 'PaymentIssue',
      entityId: issueId,
      userId: adminUserId,
      userEmail: '', // Admin email not available in context
      userRole: UserRole.ADMIN,
      description: `Payment issue status updated to ${dto.status}`,
      changes: {
        previousStatus: issue.status,
        newStatus: dto.status,
        adminNotes: dto.adminNotes,
      },
    });

    return this.mapToResponseDto(updatedIssue);
  }

  /**
   * Get payment issue statistics for dashboard
   */
  async getPaymentIssueStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    totalAmount: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const [
      total,
      open,
      inProgress,
      resolved,
      byType,
      byPriority,
    ] = await Promise.all([
      this.prisma.paymentIssue.count(),
      this.prisma.paymentIssue.count({ where: { status: 'OPEN' } }),
      this.prisma.paymentIssue.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.paymentIssue.count({ where: { status: 'RESOLVED' } }),
      this.prisma.paymentIssue.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
      this.prisma.paymentIssue.groupBy({
        by: ['priority'],
        _count: { priority: true },
      }),
    ]);

    // Calculate total amount of open issues
    const openIssues = await this.prisma.paymentIssue.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] as any[] } },
      select: { amount: true },
    });
    const totalAmount = openIssues.reduce(
      (sum, issue) => sum + parseFloat(issue.amount.toString()),
      0,
    );

    return {
      total,
      open,
      inProgress,
      resolved,
      totalAmount,
      byType: byType.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {} as Record<string, number>),
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count.priority;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * Map Prisma payment issue to response DTO
   */
  private mapToResponseDto(issue: any): PaymentIssueResponseDto {
    return {
      id: issue.id,
      userId: issue.userId,
      userRole: issue.userRole,
      type: issue.type,
      amount: parseFloat(issue.amount.toString()),
      currency: issue.currency,
      description: issue.description,
      stripePaymentId: issue.stripePaymentId,
      stripeRefundId: issue.stripeRefundId,
      status: issue.status,
      priority: issue.priority,
      resolution: issue.resolution,
      actionTaken: issue.actionTaken,
      resolvedBy: issue.resolvedBy,
      resolvedAt: issue.resolvedAt,
      adminNotes: issue.adminNotes,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    };
  }
}
