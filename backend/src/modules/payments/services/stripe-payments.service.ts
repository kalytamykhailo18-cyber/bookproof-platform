import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  CreateCheckoutSessionDto,
  CheckoutSessionResponseDto,
  PaymentTransactionDto,
  InvoiceResponseDto,
  PaymentReceiptDto,
  PaymentFailureDto,
  CustomPackagePublicDto,
  CreateCustomPackageCheckoutDto,
  CustomPackageCheckoutResponseDto,
  CustomPackagePaymentSuccessDto,
} from '../dto/stripe-payments.dto';
import { PaymentStatus, CreditTransactionType, CustomPackageStatus, UserRole } from '@prisma/client';
import { PasswordUtil } from '@common/utils/password.util';
import { EmailService } from '@modules/email/email.service';
import { NotificationsService } from '@modules/notifications/notifications.service';
import { PaymentPdfService } from './payment-pdf.service';
import { FilesService } from '@modules/files/files.service';

@Injectable()
export class StripePaymentsService {
  private stripe: Stripe | null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private emailService: EmailService,
    private notificationsService: NotificationsService,
    private paymentPdfService: PaymentPdfService,
    private filesService: FilesService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey || !this.isValidStripeKey(stripeSecretKey)) {
      console.warn('STRIPE_SECRET_KEY is not configured or invalid - payment features will be disabled');
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
   * Create Stripe checkout session for credit package purchase
   */
  async createCheckoutSession(
    authorProfileId: string,
    dto: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResponseDto> {
    this.ensureStripeConfigured();

    // Get package tier details
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

    let finalAmount = parseFloat(packageTier.basePrice.toString());
    let couponDetails: any = null;

    // Apply coupon if provided
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode },
      });

      if (coupon && coupon.isActive) {
        // Validate coupon
        const now = new Date();
        if (coupon.validUntil && now > coupon.validUntil) {
          throw new BadRequestException('Coupon has expired');
        }

        if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
          throw new BadRequestException('Coupon usage limit reached');
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.type === 'PERCENTAGE' && coupon.discountPercent) {
          discountAmount = finalAmount * (parseFloat(coupon.discountPercent.toString()) / 100);
        } else if (coupon.type === 'FIXED_AMOUNT' && coupon.discountAmount) {
          discountAmount = parseFloat(coupon.discountAmount.toString());
        }

        finalAmount = Math.max(0, finalAmount - discountAmount);
        couponDetails = {
          code: coupon.code,
          discountAmount,
          discountPercent: coupon.discountPercent
            ? parseFloat(coupon.discountPercent.toString())
            : undefined,
        };
      }
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

      // Update author profile with Stripe customer ID
      await this.prisma.authorProfile.update({
        where: { id: authorProfileId },
        data: { stripeCustomerId },
      });
    }

    // Create Stripe checkout session
    const session = await this.stripe!.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: packageTier.currency.toLowerCase(),
            product_data: {
              name: packageTier.name,
              description: `${packageTier.credits} credits - ${packageTier.validityDays} days validity`,
            },
            unit_amount: Math.round(finalAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: dto.successUrl,
      cancel_url: dto.cancelUrl,
      metadata: {
        authorProfileId: authorProfileId,
        packageTierId: packageTier.id,
        couponCode: dto.couponCode || '',
      },
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url!,
      package: {
        name: packageTier.name,
        credits: packageTier.credits,
        price: parseFloat(packageTier.basePrice.toString()),
        currency: packageTier.currency,
      },
      coupon: couponDetails,
      finalAmount,
    };
  }

  /**
   * Handle successful payment webhook
   */
  async handlePaymentSuccess(sessionId: string): Promise<void> {
    const session = await this.stripe!.checkout.sessions.retrieve(sessionId);

    const authorProfileId = session.metadata!.authorProfileId;
    const packageTierId = session.metadata!.packageTierId;
    const couponCode = session.metadata!.couponCode;

    // Get package tier
    const packageTier = await this.prisma.packageTier.findUnique({
      where: { id: packageTierId },
    });

    if (!packageTier) {
      throw new NotFoundException('Package tier not found');
    }

    // Calculate activation window expiration
    const now = new Date();
    const activationWindowExpiresAt = new Date(now);
    activationWindowExpiresAt.setDate(activationWindowExpiresAt.getDate() + packageTier.validityDays);

    // Create credit purchase record
    const creditPurchase = await this.prisma.creditPurchase.create({
      data: {
        authorProfileId,
        packageTierId,
        credits: packageTier.credits,
        amountPaid: session.amount_total! / 100, // Convert from cents
        currency: packageTier.currency,
        validityDays: packageTier.validityDays,
        purchaseDate: now,
        activationWindowExpiresAt,
        stripePaymentId: session.payment_intent as string,
        paymentStatus: PaymentStatus.COMPLETED,
        paymentMethod: 'card',
        couponId: couponCode ? (await this.prisma.coupon.findUnique({ where: { code: couponCode } }))?.id : null,
      },
    });

    // Update author credits
    const authorProfile = await this.prisma.authorProfile.findUnique({
      where: { id: authorProfileId },
    });

    const newBalance = authorProfile!.availableCredits + packageTier.credits;
    const newTotalPurchased = authorProfile!.totalCreditsPurchased + packageTier.credits;

    await this.prisma.authorProfile.update({
      where: { id: authorProfileId },
      data: {
        availableCredits: newBalance,
        totalCreditsPurchased: newTotalPurchased,
      },
    });

    // Create credit transaction
    await this.prisma.creditTransaction.create({
      data: {
        authorProfileId,
        amount: packageTier.credits,
        type: CreditTransactionType.PURCHASE,
        description: `Credit purchase: ${packageTier.name}`,
        balanceAfter: newBalance,
      },
    });

    // Update coupon usage if applicable
    if (couponCode) {
      const coupon = await this.prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon) {
        // Calculate the discount amount
        const basePrice = parseFloat(packageTier.basePrice.toString());
        const amountPaid = session.amount_total! / 100;
        const discountAmount = basePrice - amountPaid;

        await this.prisma.coupon.update({
          where: { id: coupon.id },
          data: { currentUses: { increment: 1 } },
        });

        const user = await this.prisma.user.findUnique({ where: { id: authorProfile!.userId } });
        await this.prisma.couponUsage.create({
          data: {
            couponId: coupon.id,
            userId: authorProfile!.userId,
            userEmail: user!.email,
            creditPurchaseId: creditPurchase.id,
            discountApplied: Math.max(0, discountAmount),
          },
        });

        // Update credit purchase with discount info
        await this.prisma.creditPurchase.update({
          where: { id: creditPurchase.id },
          data: {
            baseAmount: basePrice,
            discountAmount: Math.max(0, discountAmount),
          },
        });
      }
    }

    // Generate invoice and receipt (to be implemented)
    await this.generateInvoice(creditPurchase.id);
    await this.generateReceipt(creditPurchase.id);

    // Send in-app payment confirmation notification (Requirements Section 13.2)
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: authorProfile!.userId },
      });

      if (user) {
        await this.notificationsService.createNotification({
          userId: user.id,
          type: 'PAYMENT' as any,
          title: 'Payment Confirmed',
          message: `Your payment of $${(session.amount_total! / 100).toFixed(2)} has been confirmed. ${packageTier.credits} credits added to your account.`,
          actionUrl: '/author/credits',
          metadata: {
            amount: session.amount_total! / 100,
            credits: packageTier.credits,
            transactionId: creditPurchase.id,
            packageName: packageTier.name,
          },
        });
      }
    } catch (notifError) {
      // Don't fail the payment if notification fails
      console.error(`Failed to send payment confirmation notification: ${notifError.message}`);
    }
  }

  /**
   * Handle failed payment webhook
   */
  async handlePaymentFailure(sessionId: string): Promise<PaymentFailureDto> {
    const session = await this.stripe!.checkout.sessions.retrieve(sessionId);

    // Create failed payment record
    const authorProfileId = session.metadata!.authorProfileId;
    const packageTierId = session.metadata!.packageTierId;

    const packageTier = await this.prisma.packageTier.findUnique({
      where: { id: packageTierId },
    });

    const now = new Date();
    const activationWindowExpiresAt = new Date(now);
    activationWindowExpiresAt.setDate(activationWindowExpiresAt.getDate() + packageTier!.validityDays);

    const creditPurchase = await this.prisma.creditPurchase.create({
      data: {
        authorProfileId,
        packageTierId,
        credits: packageTier!.credits,
        amountPaid: session.amount_total! / 100,
        currency: packageTier!.currency,
        validityDays: packageTier!.validityDays,
        purchaseDate: now,
        activationWindowExpiresAt,
        paymentStatus: PaymentStatus.FAILED,
        stripePaymentId: session.payment_intent as string,
      },
    });

    return {
      transactionId: creditPurchase.id,
      failureReason: 'Payment failed',
      failureCode: 'PAYMENT_FAILED',
      failedAt: now.toISOString(),
      customerNotified: false,
    };
  }

  /**
   * Generate invoice for purchase
   */
  async generateInvoice(creditPurchaseId: string): Promise<InvoiceResponseDto> {
    const purchase = await this.prisma.creditPurchase.findUnique({
      where: { id: creditPurchaseId },
      include: { authorProfile: { include: { user: true } }, packageTier: true, coupon: true },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`;

    // Generate PDF invoice
    const pdfBuffer = await this.paymentPdfService.generateInvoicePdf({
      invoiceNumber,
      customerName: purchase.authorProfile.user.name || purchase.authorProfile.user.email,
      customerEmail: purchase.authorProfile.user.email,
      customerCompany: purchase.authorProfile.user.companyName || undefined,
      packageName: purchase.packageTier?.name || 'Custom Package',
      credits: purchase.credits,
      baseAmount: parseFloat(purchase.baseAmount?.toString() || purchase.amountPaid.toString()),
      discountAmount: purchase.discountAmount ? parseFloat(purchase.discountAmount.toString()) : undefined,
      finalAmount: parseFloat(purchase.amountPaid.toString()),
      currency: purchase.currency,
      activationWindowDays: purchase.activationWindowDays || 30,
      couponCode: purchase.coupon?.code || undefined,
      purchaseDate: purchase.purchaseDate,
      paymentMethod: 'Credit Card (Stripe)',
      stripePaymentId: purchase.stripePaymentId || undefined,
    });

    // Upload PDF to storage
    const pdfKey = `invoices/${invoiceNumber}.pdf`;
    const { url: pdfUrl } = await this.filesService.uploadFile(
      pdfBuffer,
      pdfKey,
      'application/pdf',
    );

    // Create invoice record
    const invoice = await this.prisma.invoice.create({
      data: {
        authorProfileId: purchase.authorProfileId,
        invoiceNumber,
        amount: purchase.amountPaid,
        currency: purchase.currency,
        description: `Credit package purchase: ${purchase.packageTier?.name || 'Custom'}`,
        paymentStatus: purchase.paymentStatus,
        paidAt: purchase.paymentStatus === PaymentStatus.COMPLETED ? purchase.purchaseDate : null,
        stripePaymentId: purchase.stripePaymentId,
        pdfUrl,
      },
    });

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amount: parseFloat(invoice.amount.toString()),
      currency: invoice.currency,
      paymentStatus: invoice.paymentStatus,
      createdAt: invoice.createdAt.toISOString(),
      paidAt: invoice.paidAt?.toISOString(),
      pdfUrl: invoice.pdfUrl ?? undefined,
      description: invoice.description!,
    };
  }

  /**
   * Generate receipt for purchase
   */
  async generateReceipt(creditPurchaseId: string): Promise<PaymentReceiptDto> {
    const purchase = await this.prisma.creditPurchase.findUnique({
      where: { id: creditPurchaseId },
      include: { authorProfile: { include: { user: true } }, packageTier: true },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    // Generate receipt number
    const receiptNumber = `REC-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`;

    // Generate PDF receipt
    const pdfBuffer = await this.paymentPdfService.generateReceiptPdf({
      receiptNumber,
      customerName: purchase.authorProfile.user.name || purchase.authorProfile.user.email,
      customerEmail: purchase.authorProfile.user.email,
      customerCompany: purchase.authorProfile.user.companyName || undefined,
      packageName: purchase.packageTier?.name || 'Custom Package',
      credits: purchase.credits,
      amount: parseFloat(purchase.amountPaid.toString()),
      currency: purchase.currency,
      paymentDate: purchase.purchaseDate,
      paymentMethod: 'Credit Card (Stripe)',
      transactionId: purchase.stripePaymentId || purchase.id,
    });

    // Upload PDF to storage
    const pdfKey = `receipts/${receiptNumber}.pdf`;
    const { url: pdfUrl } = await this.filesService.uploadFile(
      pdfBuffer,
      pdfKey,
      'application/pdf',
    );

    const transaction = await this.mapToPaymentTransactionDto(purchase);

    return {
      id: purchase.id,
      transaction,
      receiptPdfUrl: pdfUrl,
      emailSent: false,
      emailSentAt: undefined,
    };
  }

  /**
   * Get payment transactions for author
   */
  async getPaymentTransactions(authorProfileId: string): Promise<PaymentTransactionDto[]> {
    const purchases = await this.prisma.creditPurchase.findMany({
      where: { authorProfileId },
      include: { packageTier: true, coupon: true },
      orderBy: { purchaseDate: 'desc' },
    });

    return purchases.map((purchase) => this.mapToPaymentTransactionDto(purchase));
  }

  /**
   * Get single payment transaction
   */
  async getPaymentTransaction(transactionId: string): Promise<PaymentTransactionDto> {
    const purchase = await this.prisma.creditPurchase.findUnique({
      where: { id: transactionId },
      include: { packageTier: true, coupon: true },
    });

    if (!purchase) {
      throw new NotFoundException('Transaction not found');
    }

    return this.mapToPaymentTransactionDto(purchase);
  }

  /**
   * Map CreditPurchase to PaymentTransactionDto
   */
  private mapToPaymentTransactionDto(purchase: any): PaymentTransactionDto {
    return {
      id: purchase.id,
      authorProfileId: purchase.authorProfileId,
      package: {
        id: purchase.packageTierId,
        name: purchase.packageTier?.name || 'Custom Package',
        credits: purchase.credits,
      },
      amountPaid: parseFloat(purchase.amountPaid.toString()),
      currency: purchase.currency,
      paymentStatus: purchase.paymentStatus,
      stripePaymentId: purchase.stripePaymentId,
      credits: purchase.credits,
      validityDays: purchase.validityDays,
      activationWindowExpiresAt: purchase.activationWindowExpiresAt.toISOString(),
      coupon: purchase.coupon
        ? {
            code: purchase.coupon.code,
            discountApplied: parseFloat(purchase.discountApplied?.toString() || '0'),
          }
        : undefined,
      purchaseDate: purchase.purchaseDate.toISOString(),
      activated: purchase.activated,
      activatedAt: purchase.activatedAt?.toISOString(),
    };
  }

  // ============================================
  // CUSTOM PACKAGE PAYMENT METHODS
  // ============================================

  /**
   * Get custom package by payment link token (public - no auth required)
   */
  async getCustomPackageByToken(token: string): Promise<CustomPackagePublicDto> {
    // Extract token from full URL if needed
    const paymentLink = token.startsWith('http')
      ? token
      : `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/checkout/custom/${token}`;

    const pkg = await this.prisma.customPackage.findFirst({
      where: {
        OR: [
          { paymentLink },
          { paymentLink: { contains: token } },
        ],
      },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found or link is invalid');
    }

    // Check if expired
    const isExpired = pkg.paymentLinkExpiresAt
      ? new Date() > pkg.paymentLinkExpiresAt
      : false;

    // Update view count and viewedAt if first view
    if (!pkg.viewedAt) {
      await this.prisma.customPackage.update({
        where: { id: pkg.id },
        data: {
          viewedAt: new Date(),
          viewCount: { increment: 1 },
          status: CustomPackageStatus.VIEWED,
        },
      });
    } else {
      await this.prisma.customPackage.update({
        where: { id: pkg.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return {
      packageName: pkg.packageName,
      description: pkg.description || undefined,
      credits: pkg.credits,
      price: parseFloat(pkg.price.toString()),
      currency: pkg.currency,
      validityDays: pkg.validityDays,
      specialTerms: pkg.specialTerms || undefined,
      clientName: pkg.clientName,
      clientEmail: pkg.clientEmail,
      clientCompany: pkg.clientCompany || undefined,
      status: pkg.status,
      expiresAt: pkg.paymentLinkExpiresAt || undefined,
      isExpired,
    };
  }

  /**
   * Create Stripe checkout session for custom package (public - no auth)
   */
  async createCustomPackageCheckout(
    token: string,
    dto: CreateCustomPackageCheckoutDto,
  ): Promise<CustomPackageCheckoutResponseDto> {
    // Find the package by token
    const pkg = await this.prisma.customPackage.findFirst({
      where: {
        paymentLink: { contains: token },
      },
      include: {
        closerProfile: true,
      },
    });

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    if (pkg.status === CustomPackageStatus.PAID) {
      throw new BadRequestException('This package has already been paid');
    }

    if (pkg.status === CustomPackageStatus.EXPIRED) {
      throw new BadRequestException('This payment link has expired');
    }

    if (pkg.status === CustomPackageStatus.CANCELLED) {
      throw new BadRequestException('This package has been cancelled');
    }

    // Check expiration
    if (pkg.paymentLinkExpiresAt && new Date() > pkg.paymentLinkExpiresAt) {
      // Update status to expired
      await this.prisma.customPackage.update({
        where: { id: pkg.id },
        data: { status: CustomPackageStatus.EXPIRED },
      });
      throw new BadRequestException('This payment link has expired');
    }

    // Create Stripe checkout session
    const session = await this.stripe!.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: pkg.clientEmail,
      line_items: [
        {
          price_data: {
            currency: pkg.currency.toLowerCase(),
            product_data: {
              name: pkg.packageName,
              description: `${pkg.credits} credits - ${pkg.validityDays} days validity`,
            },
            unit_amount: Math.round(parseFloat(pkg.price.toString()) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: dto.successUrl,
      cancel_url: dto.cancelUrl,
      metadata: {
        type: 'custom_package',
        customPackageId: pkg.id,
        closerProfileId: pkg.closerProfileId,
        clientEmail: pkg.clientEmail,
        clientName: pkg.clientName,
        credits: pkg.credits.toString(),
        validityDays: pkg.validityDays.toString(),
      },
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url!,
      package: {
        name: pkg.packageName,
        credits: pkg.credits,
        price: parseFloat(pkg.price.toString()),
        currency: pkg.currency,
      },
    };
  }

  /**
   * Handle custom package payment success (called from webhook)
   */
  async handleCustomPackagePaymentSuccess(
    sessionId: string,
  ): Promise<CustomPackagePaymentSuccessDto> {
    const session = await this.stripe!.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.type !== 'custom_package') {
      throw new BadRequestException('Invalid session type');
    }

    const customPackageId = session.metadata.customPackageId;
    const clientEmail = session.metadata.clientEmail;
    const clientName = session.metadata.clientName;
    const credits = parseInt(session.metadata.credits, 10);
    const validityDays = parseInt(session.metadata.validityDays, 10);

    // Get the custom package
    const pkg = await this.prisma.customPackage.findUnique({
      where: { id: customPackageId },
      include: { closerProfile: true },
    });

    if (!pkg) {
      throw new NotFoundException('Custom package not found');
    }

    // Check if already processed
    if (pkg.status === CustomPackageStatus.PAID) {
      return {
        success: true,
        packageId: pkg.id,
        credits: pkg.credits,
        accountCreated: false,
        message: 'Payment already processed',
      };
    }

    // Update package status to PAID
    await this.prisma.customPackage.update({
      where: { id: customPackageId },
      data: {
        status: CustomPackageStatus.PAID,
      },
    });

    // Check if user already exists
    let existingUser = await this.prisma.user.findUnique({
      where: { email: clientEmail },
      include: { authorProfile: true },
    });

    let accountCreated = false;
    let userId: string | undefined;
    let authorProfileId: string | undefined;

    if (existingUser && existingUser.authorProfile) {
      // User exists - add credits to their account
      authorProfileId = existingUser.authorProfile.id;
      userId = existingUser.id;

      const newBalance = existingUser.authorProfile.availableCredits + credits;
      const newTotalPurchased = existingUser.authorProfile.totalCreditsPurchased + credits;

      await this.prisma.authorProfile.update({
        where: { id: authorProfileId },
        data: {
          availableCredits: newBalance,
          totalCreditsPurchased: newTotalPurchased,
        },
      });

      // Create credit transaction
      await this.prisma.creditTransaction.create({
        data: {
          authorProfileId,
          amount: credits,
          type: CreditTransactionType.PURCHASE,
          description: `Custom package purchase: ${pkg.packageName}`,
          balanceAfter: newBalance,
        },
      });
    } else {
      // Create new author account
      accountCreated = true;

      // Generate temporary password
      const temporaryPassword = PasswordUtil.generateToken(12);
      const passwordHash = await PasswordUtil.hash(temporaryPassword);

      // Generate email verification token
      const verificationToken = PasswordUtil.generateToken(32);

      // Create user
      const newUser = await this.prisma.user.create({
        data: {
          email: clientEmail,
          passwordHash,
          role: UserRole.AUTHOR,
          name: clientName,
          preferredLanguage: 'EN',
          preferredCurrency: pkg.currency,
          emailVerified: false,
        },
      });

      userId = newUser.id;

      // Create author profile
      const newAuthorProfile = await this.prisma.authorProfile.create({
        data: {
          userId: newUser.id,
          totalCreditsPurchased: credits,
          totalCreditsUsed: 0,
          availableCredits: credits,
          termsAccepted: false,
          accountCreatedByCloser: true,
        },
      });

      authorProfileId = newAuthorProfile.id;

      // Store verification token
      await this.prisma.passwordReset.create({
        data: {
          userId: newUser.id,
          token: verificationToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          used: false,
        },
      });

      // Create credit transaction
      await this.prisma.creditTransaction.create({
        data: {
          authorProfileId,
          amount: credits,
          type: CreditTransactionType.PURCHASE,
          description: `Custom package purchase: ${pkg.packageName}`,
          balanceAfter: credits,
        },
      });

      // Send welcome email with credentials
      await this.emailService.sendCloserCreatedAccountEmail(
        clientEmail,
        clientName,
        temporaryPassword,
        verificationToken,
      );
    }

    // Create invoice for this payment
    const invoiceNumber = `INV-CP-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    await this.prisma.invoice.create({
      data: {
        closerProfileId: pkg.closerProfileId,
        authorProfileId,
        customPackageId: pkg.id,
        invoiceNumber,
        amount: pkg.price,
        currency: pkg.currency,
        description: `Custom package: ${pkg.packageName}`,
        paymentStatus: PaymentStatus.COMPLETED,
        paidAt: new Date(),
        stripePaymentId: session.payment_intent as string,
        paymentMethod: 'card',
        accountCreated,
        accountCreatedAt: accountCreated ? new Date() : undefined,
        autoCreatedUserId: accountCreated ? userId : undefined,
      },
    });

    // Update closer profile stats
    await this.prisma.closerProfile.update({
      where: { id: pkg.closerProfileId },
      data: {
        totalSales: { increment: parseFloat(pkg.price.toString()) },
        totalPackagesSold: { increment: 1 },
        totalClients: { increment: accountCreated ? 1 : 0 },
      },
    });

    // Send notification email to closer
    const closerProfile = await this.prisma.closerProfile.findUnique({
      where: { id: pkg.closerProfileId },
      include: { user: true },
    });

    if (closerProfile?.user) {
      try {
        await this.emailService.sendTemplatedEmail(
          closerProfile.user.email,
          'CLOSER_PAYMENT_RECEIVED' as any,
          {
            userName: closerProfile.user.name || 'Sales Team Member',
            clientName: pkg.clientName,
            clientEmail: pkg.clientEmail,
            packageName: pkg.packageName,
            credits: pkg.credits,
            amount: parseFloat(pkg.price.toString()),
            currency: pkg.currency,
            accountCreated,
            dashboardUrl: `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/closer`,
          },
          closerProfile.userId,
          (closerProfile.user as any).preferredLanguage || 'EN',
        );
      } catch (error) {
        console.error('Failed to send closer notification email:', error);
        // Don't throw - payment was successful, just notification failed
      }
    }

    return {
      success: true,
      packageId: pkg.id,
      credits,
      accountCreated,
      userId,
      authorProfileId,
      message: accountCreated
        ? 'Payment successful! Your account has been created. Check your email for login credentials.'
        : 'Payment successful! Credits have been added to your account.',
    };
  }
}
