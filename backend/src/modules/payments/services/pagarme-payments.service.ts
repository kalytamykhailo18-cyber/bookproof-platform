import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentStatus, CreditTransactionType } from '@prisma/client';
import { PaymentSuccessEvent } from '../events/payment-events';

// Pagar.me client
const pagarme = require('pagarme');

export interface PagarmeCheckoutDto {
  packageTierId: string;
  couponCode?: string;
  currency?: string;
  includeKeywordResearch?: boolean;
  successUrl: string;
  cancelUrl: string;
  paymentMethod?: 'credit_card' | 'pix' | 'boleto';
  installments?: number; // 1-3 for credit card
}

export interface PagarmeCheckoutResponseDto {
  checkoutUrl: string;
  transactionId: string;
  amount: number;
  currency: string;
}

export interface PagarmeWebhookPayload {
  id: string;
  event: string;
  data: {
    id: string;
    status: string;
    amount: number;
    metadata?: {
      authorProfileId?: string;
      packageTierId?: string;
      creditPurchaseId?: string;
    };
  };
}

@Injectable()
export class PagarmePaymentsService {
  private readonly logger = new Logger(PagarmePaymentsService.name);
  private client: any = null;
  private apiKey: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    this.apiKey = this.configService.get<string>('PAGARME_API_KEY') || '';

    if (this.apiKey && this.isValidPagarmeKey(this.apiKey)) {
      this.initializeClient();
    } else {
      this.logger.warn('PAGARME_API_KEY is not configured - Brazilian payment features will be disabled');
    }
  }

  private async initializeClient() {
    try {
      this.client = await pagarme.client.connect({ api_key: this.apiKey });
      this.logger.log('Pagar.me client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Pagar.me client:', error);
      this.client = null;
    }
  }

  private isValidPagarmeKey(key: string): boolean {
    return (key.startsWith('sk_test_') || key.startsWith('sk_')) && key.length >= 20;
  }

  private ensurePagarmeConfigured(): void {
    if (!this.client) {
      throw new BadRequestException(
        'Brazilian payment system is not configured. Please contact the administrator.',
      );
    }
  }

  /**
   * Create Pagar.me checkout for credit package purchase (BRL)
   * Supports: PIX, Boleto, Credit Card with up to 3 installments
   */
  async createCheckoutSession(
    authorProfileId: string,
    dto: PagarmeCheckoutDto,
  ): Promise<PagarmeCheckoutResponseDto> {
    this.ensurePagarmeConfigured();

    // Get package tier with BRL pricing
    const packageTier = await this.prisma.packageTier.findUnique({
      where: { id: dto.packageTierId },
      include: {
        prices: {
          where: { currency: 'BRL' },
        },
      },
    });

    if (!packageTier || !packageTier.isActive) {
      throw new NotFoundException('Package tier not found or inactive');
    }

    // Get BRL price
    const brlPrice = packageTier.prices.find(p => p.currency === 'BRL');
    if (!brlPrice) {
      throw new BadRequestException('BRL pricing not available for this package');
    }

    // Get author profile with user data (including CPF and phone)
    const authorProfile = await this.prisma.authorProfile.findUnique({
      where: { id: authorProfileId },
      include: { user: true },
    });

    if (!authorProfile) {
      throw new NotFoundException('Author profile not found');
    }

    // Validate required Brazilian payment data
    const user = authorProfile.user;
    if (!user.cpf || !user.phone) {
      throw new BadRequestException(
        'CPF and phone number are required for Brazilian payments. Please update your profile.',
      );
    }

    let finalAmount = parseFloat(brlPrice.price.toString());

    // Apply coupon if provided
    if (dto.couponCode) {
      const coupon = await this.prisma.coupon.findUnique({
        where: { code: dto.couponCode },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        if (coupon.validUntil && now > coupon.validUntil) {
          throw new BadRequestException('Coupon has expired');
        }

        // Apply discount based on coupon type
        if (coupon.discountPercent) {
          finalAmount = finalAmount * (1 - parseFloat(coupon.discountPercent.toString()) / 100);
        } else if (coupon.discountAmount) {
          finalAmount = Math.max(0, finalAmount - parseFloat(coupon.discountAmount.toString()));
        }
      }
    }

    // Convert to centavos (Pagar.me uses smallest currency unit)
    const amountInCentavos = Math.round(finalAmount * 100);

    // Create credit purchase record
    const activationWindowExpiresAt = new Date(Date.now() + packageTier.validityDays * 24 * 60 * 60 * 1000);
    const creditPurchase = await this.prisma.creditPurchase.create({
      data: {
        authorProfileId,
        packageTierId: dto.packageTierId,
        credits: packageTier.credits,
        amountPaid: finalAmount,
        baseAmount: parseFloat(brlPrice.price.toString()),
        discountAmount: dto.couponCode ? parseFloat(brlPrice.price.toString()) - finalAmount : null,
        currency: 'BRL',
        paymentStatus: PaymentStatus.PENDING,
        validityDays: packageTier.validityDays,
        activationWindowExpiresAt,
      },
    });

    try {
      // Parse customer name for Pagar.me
      const nameParts = user.name.split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || 'User';

      // Format phone for Pagar.me (remove non-digits, extract DDD and number)
      const phoneDigits = user.phone.replace(/\D/g, '');
      const phoneDdd = phoneDigits.length >= 10 ? phoneDigits.slice(-11, -9) || phoneDigits.slice(0, 2) : '11';
      const phoneNumber = phoneDigits.length >= 10 ? phoneDigits.slice(-9) : phoneDigits;

      // Create Pagar.me order with multiple payment methods
      const order = await this.client.orders.create({
        items: [
          {
            amount: amountInCentavos,
            description: `${packageTier.name} - ${packageTier.credits} credits`,
            quantity: 1,
            code: packageTier.id,
          },
        ],
        customer: {
          name: user.name,
          email: user.email,
          document: user.cpf.replace(/\D/g, ''), // CPF digits only
          document_type: 'cpf',
          type: 'individual',
          phones: {
            mobile_phone: {
              country_code: '55',
              area_code: phoneDdd,
              number: phoneNumber,
            },
          },
        },
        payments: [
          {
            payment_method: 'checkout',
            checkout: {
              expires_in: 3600, // 1 hour
              billing_address_editable: false,
              customer_editable: false,
              accepted_payment_methods: ['credit_card', 'pix', 'boleto'],
              success_url: dto.successUrl,
              skip_checkout_success_page: false,
              credit_card: {
                capture: true,
                statement_descriptor: 'BOOKPROOF',
                installments: [
                  { number: 1, total: amountInCentavos },
                  { number: 2, total: amountInCentavos },
                  { number: 3, total: amountInCentavos },
                ],
              },
              pix: {
                expires_in: 3600,
              },
              boleto: {
                due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
                instructions: 'Pagamento para créditos BookProof',
              },
            },
          },
        ],
        metadata: {
          authorProfileId,
          packageTierId: dto.packageTierId,
          creditPurchaseId: creditPurchase.id,
        },
      });

      // Update credit purchase with Pagar.me order ID
      await this.prisma.creditPurchase.update({
        where: { id: creditPurchase.id },
        data: {
          stripePaymentId: `pagarme_${order.id}`,
        },
      });

      this.logger.log(`Pagar.me order created: ${order.id} for amount ${finalAmount} BRL`);

      // Get checkout URL from the response
      const checkoutPayment = order.charges?.[0]?.last_transaction;
      const checkoutUrl = checkoutPayment?.checkout_url || order.checkouts?.[0]?.payment_url;

      if (!checkoutUrl) {
        throw new Error('No checkout URL returned from Pagar.me');
      }

      return {
        checkoutUrl,
        transactionId: order.id,
        amount: finalAmount,
        currency: 'BRL',
      };
    } catch (error: any) {
      this.logger.error('Pagar.me payment setup failed:', error?.message || error);

      // Mark purchase as failed
      await this.prisma.creditPurchase.update({
        where: { id: creditPurchase.id },
        data: { paymentStatus: PaymentStatus.FAILED },
      });

      // Provide user-friendly error message
      if (error?.response?.errors) {
        const errors = error.response.errors.map((e: any) => e.message).join(', ');
        throw new BadRequestException(`Payment setup failed: ${errors}`);
      }

      throw new BadRequestException('Failed to create payment. Please try again.');
    }
  }

  /**
   * Handle Pagar.me webhook (postback)
   */
  async handleWebhook(payload: PagarmeWebhookPayload): Promise<void> {
    this.logger.log(`Pagar.me webhook received: ${payload.event} for transaction ${payload.data?.id}`);

    const transactionId = payload.data?.id?.toString();
    if (!transactionId) {
      this.logger.warn('Webhook missing transaction ID');
      return;
    }

    // Find credit purchase by gateway transaction ID (stored in stripePaymentId with pagarme_ prefix)
    const creditPurchase = await this.prisma.creditPurchase.findFirst({
      where: { stripePaymentId: `pagarme_${transactionId}` },
      include: {
        authorProfile: {
          include: { user: true },
        },
        packageTier: true,
      },
    });

    if (!creditPurchase) {
      this.logger.warn(`Credit purchase not found for transaction: ${transactionId}`);
      return;
    }

    const status = payload.data?.status;

    switch (status) {
      case 'paid':
        await this.handlePaymentSuccess(creditPurchase);
        break;
      case 'refused':
      case 'refunded':
      case 'chargedback':
        await this.handlePaymentFailed(creditPurchase, status);
        break;
      case 'waiting_payment':
      case 'processing':
        // Payment is pending, no action needed
        this.logger.log(`Transaction ${transactionId} is ${status}`);
        break;
      default:
        this.logger.log(`Unhandled transaction status: ${status}`);
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSuccess(creditPurchase: any): Promise<void> {
    if (creditPurchase.paymentStatus === PaymentStatus.COMPLETED) {
      this.logger.log(`Payment already processed for purchase: ${creditPurchase.id}`);
      return;
    }

    // Update credit purchase status
    await this.prisma.creditPurchase.update({
      where: { id: creditPurchase.id },
      data: {
        paymentStatus: PaymentStatus.COMPLETED,
      },
    });

    // Add credits to author profile and get updated balance
    const updatedAuthorProfile = await this.prisma.authorProfile.update({
      where: { id: creditPurchase.authorProfileId },
      data: {
        availableCredits: {
          increment: creditPurchase.credits,
        },
        totalCreditsPurchased: {
          increment: creditPurchase.credits,
        },
      },
    });

    // Create credit transaction record
    await this.prisma.creditTransaction.create({
      data: {
        authorProfileId: creditPurchase.authorProfileId,
        type: CreditTransactionType.PURCHASE,
        amount: creditPurchase.credits,
        balanceAfter: updatedAuthorProfile.availableCredits,
        description: `Purchased ${creditPurchase.packageTier?.name || 'Custom'} package (${creditPurchase.credits} credits)`,
      },
    });

    // Emit payment success event
    this.eventEmitter.emit('payment.success', new PaymentSuccessEvent(
      creditPurchase.id,
      creditPurchase.authorProfileId,
      creditPurchase.stripePaymentId || '',
      parseFloat(creditPurchase.amountPaid.toString()),
      creditPurchase.credits,
    ));

    this.logger.log(`Payment completed for purchase: ${creditPurchase.id}, credits: ${creditPurchase.credits}`);
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(creditPurchase: any, reason: string): Promise<void> {
    await this.prisma.creditPurchase.update({
      where: { id: creditPurchase.id },
      data: {
        paymentStatus: PaymentStatus.FAILED,
        adminNotes: `Payment failed: ${reason}`,
      },
    });

    this.logger.log(`Payment failed for purchase: ${creditPurchase.id}, reason: ${reason}`);
  }

  /**
   * Check if Pagar.me is configured
   */
  isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Get transaction status from Pagar.me
   */
  async getTransactionStatus(transactionId: string): Promise<string> {
    this.ensurePagarmeConfigured();

    try {
      const transaction = await this.client.transactions.find({ id: transactionId });
      return transaction.status;
    } catch (error) {
      this.logger.error(`Failed to get transaction status: ${transactionId}`, error);
      throw new BadRequestException('Failed to get payment status');
    }
  }
}
