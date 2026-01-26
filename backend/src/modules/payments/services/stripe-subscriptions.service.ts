import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  CreateSubscriptionPlanDto,
  CreateSubscriptionCheckoutDto,
  SubscriptionCheckoutResponseDto,
  SubscriptionDetailsDto,
  CancelSubscriptionDto,
  SubscriptionCancellationResponseDto,
  SubscriptionRenewalDto,
  SubscriptionStatusDto,
  SubscriptionManagementDto,
} from '../dto/stripe-subscriptions.dto';
import { SubscriptionStatus, CreditTransactionType } from '@prisma/client';

@Injectable()
export class StripeSubscriptionsService {
  private stripe: Stripe | null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey || !this.isValidStripeKey(stripeSecretKey)) {
      console.warn('STRIPE_SECRET_KEY is not configured or invalid - subscription features will be disabled');
      this.stripe = null;
      return;
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
  }

  private isValidStripeKey(key: string): boolean {
    return (key.startsWith('sk_test_') || key.startsWith('sk_live_')) && key.length >= 30;
  }

  private ensureStripeConfigured(): void {
    if (!this.stripe) {
      throw new BadRequestException(
        'Payment system is not configured. Please contact the administrator.',
      );
    }
  }

  /**
   * Create subscription plan (Admin only)
   */
  async createSubscriptionPlan(dto: CreateSubscriptionPlanDto): Promise<any> {
    this.ensureStripeConfigured();

    // Create Stripe product
    const product = await this.stripe!.products.create({
      name: dto.planName,
      description: dto.description,
      metadata: {
        creditsPerMonth: dto.creditsPerMonth.toString(),
      },
    });

    // Create Stripe price
    const price = await this.stripe!.prices.create({
      product: product.id,
      currency: dto.currency.toLowerCase(),
      unit_amount: Math.round(dto.pricePerMonth * 100), // Convert to cents
      recurring: {
        interval: 'month',
      },
    });

    return {
      productId: product.id,
      priceId: price.id,
      planName: dto.planName,
      creditsPerMonth: dto.creditsPerMonth,
      pricePerMonth: dto.pricePerMonth,
      currency: dto.currency,
    };
  }

  /**
   * Create subscription checkout session
   */
  async createSubscriptionCheckout(
    authorProfileId: string,
    dto: CreateSubscriptionCheckoutDto,
  ): Promise<SubscriptionCheckoutResponseDto> {
    this.ensureStripeConfigured();

    // Get author profile
    const authorProfile = await this.prisma.authorProfile.findUnique({
      where: { id: authorProfileId },
      include: { user: true },
    });

    if (!authorProfile) {
      throw new NotFoundException('Author profile not found');
    }

    // Check if author already has active subscription
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        authorProfileId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (existingSubscription) {
      throw new BadRequestException('Author already has an active subscription');
    }

    // Create or get Stripe customer
    let stripeCustomerId = authorProfile.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await this.stripe!.customers.create({
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

    // Get price details from Stripe
    const price = await this.stripe!.prices.retrieve(dto.stripePriceId);
    const product = await this.stripe!.products.retrieve(price.product as string);

    // Create Stripe checkout session for subscription
    const session = await this.stripe!.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: dto.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: dto.successUrl,
      cancel_url: dto.cancelUrl,
      metadata: {
        authorProfileId: authorProfileId,
        stripePriceId: dto.stripePriceId,
      },
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url!,
      plan: {
        name: product.name,
        creditsPerMonth: parseInt(product.metadata.creditsPerMonth || '0'),
        pricePerMonth: price.unit_amount! / 100,
        currency: price.currency.toUpperCase(),
      },
    };
  }

  /**
   * Handle subscription created webhook
   */
  async handleSubscriptionCreated(stripeSubscriptionId: string): Promise<void> {
    const subscription = await this.stripe!.subscriptions.retrieve(stripeSubscriptionId);

    const authorProfileId = subscription.metadata.authorProfileId;
    const price = await this.stripe!.prices.retrieve(subscription.items.data[0].price.id);
    const product = await this.stripe!.products.retrieve(price.product as string);

    // Create subscription record
    await this.prisma.subscription.create({
      data: {
        authorProfileId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: price.id,
        planName: product.name,
        creditsPerMonth: parseInt(product.metadata.creditsPerMonth || '0'),
        pricePerMonth: price.unit_amount! / 100,
        currency: price.currency.toUpperCase(),
        status: this.mapStripeStatusToPrismaStatus(subscription.status),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    // Allocate initial credits
    await this.allocateCreditsForSubscription(stripeSubscriptionId);
  }

  /**
   * Handle subscription renewed webhook
   */
  async handleSubscriptionRenewed(stripeSubscriptionId: string): Promise<SubscriptionRenewalDto> {
    const stripeSubscription = await this.stripe!.subscriptions.retrieve(stripeSubscriptionId);

    // Update subscription record
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        status: this.mapStripeStatusToPrismaStatus(stripeSubscription.status),
      },
    });

    // Allocate credits for new period
    await this.allocateCreditsForSubscription(stripeSubscriptionId);

    return {
      subscriptionId: subscription.id,
      authorProfileId: subscription.authorProfileId,
      creditsAllocated: subscription.creditsPerMonth,
      amountCharged: parseFloat(subscription.pricePerMonth.toString()),
      currency: subscription.currency,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      renewedAt: new Date().toISOString(),
    };
  }

  /**
   * Allocate credits for subscription period
   */
  private async allocateCreditsForSubscription(stripeSubscriptionId: string): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
      include: { authorProfile: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const creditsToAllocate = subscription.creditsPerMonth;
    const newBalance = subscription.authorProfile.availableCredits + creditsToAllocate;
    const newTotalPurchased = subscription.authorProfile.totalCreditsPurchased + creditsToAllocate;

    // Update author credits
    await this.prisma.authorProfile.update({
      where: { id: subscription.authorProfileId },
      data: {
        availableCredits: newBalance,
        totalCreditsPurchased: newTotalPurchased,
      },
    });

    // Update subscription total allocated
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        totalCreditsAllocated: { increment: creditsToAllocate },
      },
    });

    // Create credit transaction
    await this.prisma.creditTransaction.create({
      data: {
        authorProfileId: subscription.authorProfileId,
        amount: creditsToAllocate,
        type: CreditTransactionType.SUBSCRIPTION_RENEWAL,
        description: `Subscription renewal: ${subscription.planName}`,
        balanceAfter: newBalance,
      },
    });
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    dto: CancelSubscriptionDto,
  ): Promise<SubscriptionCancellationResponseDto> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Cancel in Stripe
    if (dto.cancelImmediately) {
      await this.stripe!.subscriptions.cancel(subscription.stripeSubscriptionId);
    } else {
      await this.stripe!.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // Update local record
    await this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        cancelAtPeriodEnd: !dto.cancelImmediately,
        canceledAt: dto.cancelImmediately ? new Date() : null,
        status: dto.cancelImmediately ? SubscriptionStatus.CANCELED : subscription.status,
      },
    });

    return {
      subscriptionId: subscription.id,
      success: true,
      canceledImmediately: dto.cancelImmediately,
      creditsValidUntil: subscription.currentPeriodEnd.toISOString(),
      message: dto.cancelImmediately
        ? 'Subscription canceled immediately'
        : `Subscription will cancel at end of current period (${subscription.currentPeriodEnd.toISOString()}). Credits remain valid until then.`,
    };
  }

  /**
   * Get subscription details
   */
  async getSubscriptionDetails(subscriptionId: string): Promise<SubscriptionDetailsDto> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const now = new Date();
    const daysUntilBilling = Math.ceil(
      (subscription.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      id: subscription.id,
      authorProfileId: subscription.authorProfileId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      stripePriceId: subscription.stripePriceId,
      planName: subscription.planName,
      creditsPerMonth: subscription.creditsPerMonth,
      pricePerMonth: parseFloat(subscription.pricePerMonth.toString()),
      currency: subscription.currency,
      totalCreditsAllocated: subscription.totalCreditsAllocated,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart.toISOString(),
      currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      canceledAt: subscription.canceledAt?.toISOString(),
      endedAt: subscription.endedAt?.toISOString(),
      createdAt: subscription.createdAt.toISOString(),
      nextBillingDate: subscription.currentPeriodEnd.toISOString(),
      daysUntilBilling,
    };
  }

  /**
   * Get subscription management details
   */
  async getSubscriptionManagement(authorProfileId: string): Promise<SubscriptionManagementDto> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        authorProfileId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    const details = await this.getSubscriptionDetails(subscription.id);
    const status = await this.getSubscriptionStatus(subscription.id);

    // Get billing history (stub - would query Stripe invoices)
    const billingHistory: any[] = [];

    return {
      subscription: details,
      status,
      billingHistory,
      availableActions: {
        canCancel: subscription.status === SubscriptionStatus.ACTIVE && !subscription.cancelAtPeriodEnd,
        canUpdatePaymentMethod: subscription.status === SubscriptionStatus.ACTIVE,
        canResume: subscription.cancelAtPeriodEnd,
      },
    };
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatusDto> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const statusDisplay = this.getStatusDisplay(subscription.status);
    const isActive = subscription.status === SubscriptionStatus.ACTIVE;
    const requiresAction = subscription.status === SubscriptionStatus.PAST_DUE;

    return {
      id: subscription.id,
      status: subscription.status,
      statusDisplay,
      isActive,
      requiresAction,
      actionMessage: requiresAction ? 'Payment failed. Please update your payment method.' : undefined,
      lastPaymentStatus: 'SUCCEEDED' as any,
      failedPaymentReason: undefined,
    };
  }

  /**
   * Map Stripe subscription status to Prisma enum
   */
  private mapStripeStatusToPrismaStatus(stripeStatus: string): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      past_due: SubscriptionStatus.PAST_DUE,
      canceled: SubscriptionStatus.CANCELED,
      incomplete: SubscriptionStatus.INCOMPLETE,
      incomplete_expired: SubscriptionStatus.INCOMPLETE_EXPIRED,
      trialing: SubscriptionStatus.TRIALING,
      unpaid: SubscriptionStatus.UNPAID,
    };

    return statusMap[stripeStatus] || SubscriptionStatus.ACTIVE;
  }

  /**
   * Get human-readable status display
   */
  private getStatusDisplay(status: SubscriptionStatus): string {
    const displayMap: Record<SubscriptionStatus, string> = {
      ACTIVE: 'Active',
      PAST_DUE: 'Past Due',
      CANCELED: 'Canceled',
      INCOMPLETE: 'Incomplete',
      INCOMPLETE_EXPIRED: 'Incomplete (Expired)',
      TRIALING: 'Trialing',
      UNPAID: 'Unpaid',
    };

    return displayMap[status] || status;
  }
}
