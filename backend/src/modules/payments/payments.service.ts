import {
  Injectable,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Stripe from 'stripe';
import { PaymentSuccessEvent, PaymentFailedEvent, RefundProcessedEvent, DisputeCreatedEvent } from './events/payment-events';
import { KeywordsService } from '../keywords/keywords.service';
import { StripePaymentsService } from './services/stripe-payments.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2, // Event-driven architecture - no circular dependency!
    private prisma: PrismaService,
    private emailService: EmailService,
    @Inject(forwardRef(() => KeywordsService))
    private keywordsService: KeywordsService,
    @Inject(forwardRef(() => StripePaymentsService))
    private stripePaymentsService: StripePaymentsService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook signature verification failed`);
    }

    this.logger.log(`Processing webhook event: ${event.type}`);

    // Handle different event types
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;

        case 'checkout.session.async_payment_succeeded':
          await this.handleCheckoutSessionCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;

        case 'checkout.session.async_payment_failed':
          await this.handlePaymentFailed(
            event.data.object as Stripe.Checkout.Session,
          );
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          // Subscription handling will be added in Week 5
          this.logger.log(`Subscription event ${event.type} - handling later`);
          break;

        // Refund handling
        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object as Stripe.Charge);
          break;

        // Dispute handling
        case 'charge.dispute.created':
          await this.handleDisputeCreated(event.data.object as Stripe.Dispute);
          break;

        case 'charge.dispute.updated':
        case 'charge.dispute.closed':
          await this.handleDisputeUpdated(event.data.object as Stripe.Dispute);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(
        `Error processing webhook event ${event.type}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Handle successful checkout session
   */
  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    this.logger.log(
      `Processing completed checkout session: ${session.id}`,
    );

    const paymentType = session.metadata?.type;

    if (session.mode === 'payment') {
      // Check if this is a keyword research payment
      if (paymentType === 'keyword_research') {
        const keywordResearchId = session.metadata?.keywordResearchId;
        if (keywordResearchId) {
          this.logger.log(`Processing keyword research payment for ID: ${keywordResearchId}`);
          await this.keywordsService.handlePaymentSuccess(keywordResearchId);
          return;
        }
      }

      // Check if this is a custom package payment
      if (paymentType === 'custom_package') {
        const customPackageId = session.metadata?.customPackageId;
        if (customPackageId) {
          this.logger.log(`Processing custom package payment for ID: ${customPackageId}`);
          await this.stripePaymentsService.handleCustomPackagePaymentSuccess(session.id);
          return;
        }
      }

      // Default: One-time payment for credits - emit event for CreditsModule to handle
      this.eventEmitter.emit(
        'payment.success',
        new PaymentSuccessEvent(
          session.id, // Will be used to find the CreditPurchase record
          session.metadata?.authorProfileId || '',
          session.id,
          (session.amount_total || 0) / 100, // Convert cents to dollars
          parseInt(session.metadata?.credits || '0', 10),
        ),
      );
      this.logger.log(`Payment success event emitted for session: ${session.id}`);
    } else if (session.mode === 'subscription') {
      // Subscription handling will be added in Week 5
      this.logger.log(`Subscription creation for session: ${session.id}`);
    }
  }

  /**
   * Handle failed payment
   * Sends notification email to author and updates pending purchase records
   */
  private async handlePaymentFailed(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    this.logger.warn(
      `Payment failed for checkout session: ${session.id}`,
    );

    const authorProfileId = session.metadata?.authorProfileId;
    const packageTierId = session.metadata?.packageTierId;
    const paymentType = session.metadata?.type;

    // For custom package payments, handle differently
    if (paymentType === 'custom_package') {
      this.logger.warn(`Custom package payment failed for session: ${session.id}`);
      // Custom packages don't have a pre-created purchase record
      return;
    }

    // Find the author profile and user to send notification
    if (authorProfileId) {
      const authorProfile = await this.prisma.authorProfile.findUnique({
        where: { id: authorProfileId },
        include: { user: true },
      });

      if (authorProfile?.user) {
        // Send payment failed notification email
        try {
          const packageTier = packageTierId
            ? await this.prisma.packageTier.findUnique({ where: { id: packageTierId } })
            : null;

          await this.emailService.sendTemplatedEmail(
            authorProfile.user.email,
            'PAYMENT_FAILED' as any,
            {
              userName: authorProfile.user.name || 'Author',
              packageName: packageTier?.name || 'Credit Package',
              amount: (session.amount_total || 0) / 100,
              currency: session.currency?.toUpperCase() || 'USD',
              actionUrl: `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/author/credits/purchase`,
              dashboardUrl: `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/author/credits`,
            },
            authorProfile.userId,
            (authorProfile.user.preferredLanguage as any) || 'EN',
          );
          this.logger.log(`Payment failed notification sent to ${authorProfile.user.email}`);
        } catch (error) {
          this.logger.error(`Failed to send payment failed notification: ${error.message}`);
        }
      }

      // Emit payment failed event
      this.eventEmitter.emit(
        'payment.failed',
        new PaymentFailedEvent(
          session.id,
          authorProfileId,
          'Payment was not completed',
        ),
      );
    }
  }

  /**
   * Handle charge refunded webhook
   * Updates the credit purchase record and deducts credits from author account
   */
  private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    this.logger.log(`Processing refund for charge: ${charge.id}`);

    const paymentIntentId = typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : charge.payment_intent?.id;

    if (!paymentIntentId) {
      this.logger.warn('No payment intent found for refunded charge');
      return;
    }

    // Find the credit purchase by Stripe payment ID
    const creditPurchase = await this.prisma.creditPurchase.findFirst({
      where: {
        stripePaymentId: paymentIntentId,
      },
      include: {
        authorProfile: true,
      },
    });

    if (!creditPurchase) {
      this.logger.warn(`No credit purchase found for payment intent: ${paymentIntentId}`);
      // Emit event anyway for logging/monitoring purposes
      this.eventEmitter.emit(
        'refund.processed',
        new RefundProcessedEvent(
          charge.id,
          charge.id,
          paymentIntentId,
          (charge.amount_refunded || 0) / 100,
          charge.currency,
          null,
          null,
          charge.refunds?.data[0]?.reason || null,
        ),
      );
      return;
    }

    const refundAmount = (charge.amount_refunded || 0) / 100;
    const isFullRefund = charge.refunded;

    // Calculate credits to deduct (proportional to refund amount)
    const originalAmount = parseFloat(creditPurchase.amountPaid.toString());
    const creditsToDeduct = isFullRefund
      ? creditPurchase.credits
      : Math.floor((refundAmount / originalAmount) * creditPurchase.credits);

    // Update credit purchase record
    // Note: PaymentStatus enum only has REFUNDED, partial refund is tracked via refundAmount field
    await this.prisma.creditPurchase.update({
      where: { id: creditPurchase.id },
      data: {
        refundedAt: new Date(),
        refundAmount: refundAmount,
        refundReason: charge.refunds?.data[0]?.reason || (isFullRefund ? 'Full refund processed' : 'Partial refund processed'),
        paymentStatus: 'REFUNDED',
      },
    });

    // Deduct credits from author account if they haven't been used
    if (creditPurchase.authorProfile) {
      const currentCredits = creditPurchase.authorProfile.availableCredits;
      const newBalance = Math.max(0, currentCredits - creditsToDeduct);

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
          amount: -creditsToDeduct,
          type: 'REFUND',
          description: `Refund processed: ${creditsToDeduct} credits deducted`,
          balanceAfter: newBalance,
        },
      });

      this.logger.log(
        `Refund processed: ${creditsToDeduct} credits deducted from author ${creditPurchase.authorProfileId}`,
      );
    }

    // Emit refund event for notifications
    this.eventEmitter.emit(
      'refund.processed',
      new RefundProcessedEvent(
        charge.id,
        charge.id,
        paymentIntentId,
        refundAmount,
        charge.currency,
        creditPurchase.id,
        creditPurchase.authorProfileId,
        charge.refunds?.data[0]?.reason || null,
      ),
    );
  }

  /**
   * Handle dispute created webhook
   * Logs the dispute and notifies admin
   */
  private async handleDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
    this.logger.warn(`Payment dispute created: ${dispute.id}`);

    const chargeId = typeof dispute.charge === 'string'
      ? dispute.charge
      : dispute.charge?.id;

    const paymentIntentId = typeof dispute.payment_intent === 'string'
      ? dispute.payment_intent
      : dispute.payment_intent?.id;

    // Try to find the related credit purchase
    let creditPurchase = null;
    if (paymentIntentId) {
      creditPurchase = await this.prisma.creditPurchase.findFirst({
        where: { stripePaymentId: paymentIntentId },
      });
    }

    // Log the dispute in the database (you may want to create a Dispute model)
    // For now, we'll just emit an event and log it

    const evidenceDueBy = dispute.evidence_details?.due_by
      ? new Date(dispute.evidence_details.due_by * 1000)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default to 7 days if not provided

    this.logger.warn(`Dispute details:
      - ID: ${dispute.id}
      - Amount: ${dispute.amount / 100} ${dispute.currency}
      - Reason: ${dispute.reason}
      - Status: ${dispute.status}
      - Evidence due by: ${evidenceDueBy.toISOString()}
      - Related purchase: ${creditPurchase?.id || 'Not found'}
    `);

    // Emit dispute event for admin notifications
    this.eventEmitter.emit(
      'dispute.created',
      new DisputeCreatedEvent(
        dispute.id,
        chargeId || '',
        paymentIntentId || '',
        dispute.amount / 100,
        dispute.currency,
        dispute.reason,
        dispute.status,
        evidenceDueBy,
        creditPurchase?.id || null,
        creditPurchase?.authorProfileId || null,
      ),
    );
  }

  /**
   * Handle dispute updated/closed webhook
   * Updates the dispute status and adjusts author account if needed
   */
  private async handleDisputeUpdated(dispute: Stripe.Dispute): Promise<void> {
    this.logger.log(`Dispute updated: ${dispute.id} - Status: ${dispute.status}`);

    const paymentIntentId = typeof dispute.payment_intent === 'string'
      ? dispute.payment_intent
      : dispute.payment_intent?.id;

    let creditPurchase = null;
    if (paymentIntentId) {
      creditPurchase = await this.prisma.creditPurchase.findFirst({
        where: { stripePaymentId: paymentIntentId },
      });
    }

    // If dispute was lost, the refund webhook will handle credit deduction
    // If dispute was won, no action needed on credits
    if (dispute.status === 'lost' && creditPurchase) {
      this.logger.warn(`Dispute lost for purchase ${creditPurchase.id}. Credits will be handled by refund webhook.`);
    } else if (dispute.status === 'won') {
      this.logger.log(`Dispute won: ${dispute.id}. No credit adjustment needed.`);
    }

    // Emit event for logging/monitoring
    this.eventEmitter.emit(
      'dispute.updated',
      {
        disputeId: dispute.id,
        status: dispute.status,
        creditPurchaseId: creditPurchase?.id || null,
        authorProfileId: creditPurchase?.authorProfileId || null,
      },
    );
  }
}
