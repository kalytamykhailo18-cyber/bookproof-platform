import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Optional,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  PackageTierResponseDto,
  CreditPurchaseResponseDto,
  CreditBalanceResponseDto,
  CheckoutSessionResponseDto,
  PurchaseCreditDto,
} from './dto';
import { CommissionService } from '@modules/affiliates/services/commission.service';
import { EmailService } from '@modules/email/email.service';
import { EmailType, Language } from '@prisma/client';

@Injectable()
export class CreditsService {
  private stripe: Stripe;
  private readonly logger = new Logger(CreditsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private emailService: EmailService,
    @Optional() // CommissionService is optional - no forwardRef needed!
    private commissionService?: CommissionService,
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
   * Get all active package tiers
   */
  async getPackageTiers(): Promise<PackageTierResponseDto[]> {
    const tiers = await this.prisma.packageTier.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    return tiers.map((tier) => ({
      ...tier,
      basePrice: tier.basePrice.toNumber(),
      description: tier.description ?? undefined,
      features: tier.features ? JSON.parse(tier.features) : undefined,
    }));
  }

  /**
   * Get author's credit balance
   */
  async getCreditBalance(authorProfileId: string): Promise<CreditBalanceResponseDto> {
    const now = new Date();

    const profile = await this.prisma.authorProfile.findUnique({
      where: { id: authorProfileId },
      include: {
        creditPurchases: {
          where: {
            activated: false,
            paymentStatus: 'COMPLETED',
            activationWindowExpiresAt: { gte: now },
          },
          orderBy: { activationWindowExpiresAt: 'asc' },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Author profile not found');
    }

    // CRITICAL: Calculate expired credits that haven't been processed by the cron job yet
    // This ensures real-time accuracy of the balance shown to users
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
      (sum, p) => sum + p.credits,
      0,
    );

    // Calculate the true available credits
    const trueAvailableCredits = Math.max(0, profile.availableCredits - pendingExpiredCredits);

    // Calculate expiring credits (within next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const expiringPurchases = profile.creditPurchases.filter(
      (p) => p.activationWindowExpiresAt <= sevenDaysFromNow,
    );

    const expiringCredits = expiringPurchases.reduce(
      (sum, p) => sum + p.credits,
      0,
    );

    const nextExpirationDate =
      profile.creditPurchases.length > 0
        ? profile.creditPurchases[0].activationWindowExpiresAt
        : undefined;

    return {
      totalCreditsPurchased: profile.totalCreditsPurchased,
      totalCreditsUsed: profile.totalCreditsUsed,
      availableCredits: trueAvailableCredits,
      activePurchases: profile.creditPurchases.length,
      expiringCredits,
      nextExpirationDate,
    };
  }

  /**
   * Get author's purchase history
   */
  async getPurchaseHistory(
    authorProfileId: string,
  ): Promise<CreditPurchaseResponseDto[]> {
    const purchases = await this.prisma.creditPurchase.findMany({
      where: { authorProfileId },
      orderBy: { purchaseDate: 'desc' },
    });

    return purchases.map((purchase) => ({
      ...purchase,
      amountPaid: purchase.amountPaid.toNumber(),
      activatedAt: purchase.activatedAt ?? undefined,
      discountApplied: purchase.discountApplied?.toNumber(),
    }));
  }

  /**
   * Create Stripe checkout session for credit purchase
   */
  async createCheckoutSession(
    authorProfileId: string,
    dto: PurchaseCreditDto,
  ): Promise<CheckoutSessionResponseDto> {
    // Get package tier
    const packageTier = await this.prisma.packageTier.findUnique({
      where: { id: dto.packageTierId },
    });

    if (!packageTier || !packageTier.isActive) {
      throw new NotFoundException('Package tier not found or inactive');
    }

    // Get author profile
    const authorProfile = await this.prisma.authorProfile.findUnique({
      where: { id: authorProfileId },
      include: { user: true },
    });

    if (!authorProfile) {
      throw new NotFoundException('Author profile not found');
    }

    // Handle Stripe customer creation/retrieval
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

      // Update author profile with Stripe customer ID
      await this.prisma.authorProfile.update({
        where: { id: authorProfileId },
        data: { stripeCustomerId: customer.id },
      });
    }

    // Calculate price and apply coupon if provided
    let finalPrice = packageTier.basePrice.toNumber();
    let discountAmount = 0;
    let couponId: string | undefined;

    // Apply coupon if provided
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode.toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        // Validate coupon is within valid date range
        const now = new Date();
        if (coupon.validFrom > now) {
          throw new BadRequestException('Coupon is not yet valid');
        }
        if (coupon.validUntil && coupon.validUntil < now) {
          throw new BadRequestException('Coupon has expired');
        }

        // Check usage limits
        if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
          throw new BadRequestException('Coupon usage limit reached');
        }

        // Check per-user usage limit
        const userUsageCount = await this.prisma.couponUsage.count({
          where: {
            couponId: coupon.id,
            userId: authorProfile.userId,
          },
        });
        if (userUsageCount >= coupon.maxUsesPerUser) {
          throw new BadRequestException('You have already used this coupon the maximum number of times');
        }

        // Check minimum purchase requirement
        if (coupon.minimumPurchase && finalPrice < coupon.minimumPurchase.toNumber()) {
          throw new BadRequestException(`Minimum purchase of $${coupon.minimumPurchase} required for this coupon`);
        }

        // Check minimum credits requirement
        if (coupon.minimumCredits && packageTier.credits < coupon.minimumCredits) {
          throw new BadRequestException(`Minimum ${coupon.minimumCredits} credits required for this coupon`);
        }

        // Check if coupon applies to credit purchases
        if (coupon.appliesTo !== 'CREDITS' && coupon.appliesTo !== 'ALL') {
          throw new BadRequestException('This coupon does not apply to credit purchases');
        }

        // Calculate discount
        if (coupon.type === 'PERCENTAGE' && coupon.discountPercent) {
          discountAmount = (finalPrice * coupon.discountPercent.toNumber()) / 100;
        } else if (coupon.type === 'FIXED_AMOUNT' && coupon.discountAmount) {
          discountAmount = coupon.discountAmount.toNumber();
        } else if (coupon.type === 'FREE_ADDON') {
          // FREE_ADDON doesn't apply to credit purchases
          throw new BadRequestException('This coupon is for add-ons only');
        }

        finalPrice = Math.max(0, finalPrice - discountAmount);
        couponId = coupon.id;

        this.logger.log(`Coupon ${coupon.code} applied: $${discountAmount} discount`);
      } else {
        throw new BadRequestException('Invalid or inactive coupon code');
      }
    }

    // Create checkout session
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: packageTier.currency.toLowerCase(),
              product_data: {
                name: `${packageTier.name} - ${packageTier.credits} Credits`,
                description: packageTier.description || undefined,
              },
              unit_amount: Math.round(finalPrice * 100), // Stripe uses cents
            },
            quantity: 1,
          },
        ],
        success_url: dto.successUrl,
        cancel_url: dto.cancelUrl,
        metadata: {
          authorProfileId,
          packageTierId: packageTier.id,
          credits: packageTier.credits.toString(),
          validityDays: packageTier.validityDays.toString(),
          couponCode: dto.couponCode || '',
          couponId: couponId || '',
          discountAmount: discountAmount.toString(),
        },
      });

      return {
        url: session.url!,
        sessionId: session.id,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create checkout session: ${error.message}`,
      );
    }
  }

  /**
   * Process successful payment (called from webhook)
   */
  async processSuccessfulPayment(sessionId: string): Promise<void> {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      throw new BadRequestException('Payment not completed');
    }

    const {
      authorProfileId,
      packageTierId,
      credits,
      validityDays,
      couponCode,
      couponId,
      discountAmount,
    } = session.metadata!;

    // Check if purchase already recorded
    const existingPurchase = await this.prisma.creditPurchase.findUnique({
      where: { stripePaymentId: session.payment_intent as string },
    });

    if (existingPurchase) {
      return; // Already processed (idempotency)
    }

    // Calculate activation window expiration
    const activationWindowExpiresAt = new Date();
    activationWindowExpiresAt.setDate(
      activationWindowExpiresAt.getDate() + parseInt(validityDays),
    );

    // Create credit purchase record and update author profile in transaction
    const creditPurchase = await this.prisma.$transaction(async (tx) => {
      // Create purchase record
      const purchase = await tx.creditPurchase.create({
        data: {
          authorProfileId,
          packageTierId,
          credits: parseInt(credits),
          amountPaid: session.amount_total! / 100, // Convert from cents
          currency: session.currency!.toUpperCase(),
          validityDays: parseInt(validityDays),
          activationWindowExpiresAt,
          stripePaymentId: session.payment_intent as string,
          paymentStatus: 'COMPLETED',
          paymentMethod: 'card',
          couponId: couponId || null,
          discountApplied: discountAmount ? parseFloat(discountAmount) : null,
        },
      });

      // Update author profile credits
      await tx.authorProfile.update({
        where: { id: authorProfileId },
        data: {
          totalCreditsPurchased: { increment: parseInt(credits) },
          availableCredits: { increment: parseInt(credits) },
        },
      });

      // Create credit transaction record
      const updatedProfile = await tx.authorProfile.findUnique({
        where: { id: authorProfileId },
      });

      await tx.creditTransaction.create({
        data: {
          authorProfileId,
          amount: parseInt(credits),
          type: 'PURCHASE',
          description: `Purchased ${credits} credits - ${session.metadata!.packageTierId}`,
          balanceAfter: updatedProfile!.availableCredits,
        },
      });

      return purchase;
    });

    // Record coupon usage if a coupon was applied
    if (couponId) {
      try {
        // Get author's user info for email
        const authorProfile = await this.prisma.authorProfile.findUnique({
          where: { id: authorProfileId },
          include: { user: true },
        });

        if (authorProfile) {
          // Create coupon usage record
          await this.prisma.couponUsage.create({
            data: {
              couponId,
              userId: authorProfile.userId,
              userEmail: authorProfile.user.email,
              creditPurchaseId: creditPurchase.id,
              discountApplied: discountAmount ? parseFloat(discountAmount) : 0,
            },
          });

          // Increment coupon usage count
          await this.prisma.coupon.update({
            where: { id: couponId },
            data: {
              currentUses: { increment: 1 },
            },
          });

          this.logger.log(`Coupon usage recorded for coupon ${couponId}, purchase ${creditPurchase.id}`);
        }
      } catch (error) {
        // Log error but don't fail the payment processing
        this.logger.error(
          `Failed to record coupon usage for purchase ${creditPurchase.id}: ${error.message}`,
        );
      }
    }

    // Create affiliate commission if applicable
    if (this.commissionService) {
      try {
        await this.commissionService.createCommission(
          creditPurchase.id,
          authorProfileId,
        );
        this.logger.log(
          `Commission creation attempted for credit purchase: ${creditPurchase.id}`,
        );
      } catch (error) {
        // Log error but don't fail the payment processing
        this.logger.error(
          `Failed to create commission for credit purchase ${creditPurchase.id}: ${error.message}`,
        );
      }
    }

    // Send purchase receipt email to author
    try {
      const authorProfile = await this.prisma.authorProfile.findUnique({
        where: { id: authorProfileId },
        include: { user: true },
      });

      if (authorProfile) {
        const packageTier = packageTierId
          ? await this.prisma.packageTier.findUnique({ where: { id: packageTierId } })
          : null;

        await this.emailService.sendTemplatedEmail(
          authorProfile.user.email,
          EmailType.AUTHOR_PAYMENT_RECEIVED,
          {
            userName: authorProfile.user.name,
            creditsPurchased: parseInt(credits, 10),
            packageName: packageTier?.name || 'Credit Package',
            amountPaid: (session.amount_total! / 100).toFixed(2),
            currency: session.currency!.toUpperCase(),
            validityDays: parseInt(validityDays, 10),
            activationDeadline: activationWindowExpiresAt.toLocaleDateString(),
            transactionId: session.payment_intent as string,
            dashboardUrl: `${this.configService.get<string>('FRONTEND_URL')}/author/credits`,
          },
          authorProfile.userId,
          authorProfile.user.preferredLanguage || Language.EN,
        );

        this.logger.log(
          `Purchase receipt email sent to ${authorProfile.user.email} for purchase ${creditPurchase.id}`,
        );
      }
    } catch (error) {
      // Log error but don't fail the payment processing
      this.logger.error(
        `Failed to send purchase receipt email for credit purchase ${creditPurchase.id}: ${error.message}`,
      );
    }
  }

  /**
   * Allocate credits to a book campaign
   */
  async allocateCredits(
    authorProfileId: string,
    bookId: string,
    creditsToAllocate: number,
  ): Promise<void> {
    if (creditsToAllocate <= 0) {
      throw new BadRequestException('Credits to allocate must be positive');
    }

    await this.prisma.$transaction(async (tx) => {
      const authorProfile = await tx.authorProfile.findUnique({
        where: { id: authorProfileId },
      });

      if (!authorProfile) {
        throw new NotFoundException('Author profile not found');
      }

      if (authorProfile.availableCredits < creditsToAllocate) {
        throw new BadRequestException('Insufficient credits available');
      }

      // Update author profile
      await tx.authorProfile.update({
        where: { id: authorProfileId },
        data: {
          availableCredits: { decrement: creditsToAllocate },
          totalCreditsUsed: { increment: creditsToAllocate },
        },
      });

      // Update book campaign
      await tx.book.update({
        where: { id: bookId },
        data: {
          creditsAllocated: { increment: creditsToAllocate },
          creditsRemaining: { increment: creditsToAllocate },
        },
      });

      // Create transaction record
      await tx.creditTransaction.create({
        data: {
          authorProfileId,
          bookId,
          amount: -creditsToAllocate,
          type: 'ALLOCATION',
          description: `Allocated ${creditsToAllocate} credits to campaign`,
          balanceAfter: authorProfile.availableCredits - creditsToAllocate,
        },
      });
    });
  }
}
