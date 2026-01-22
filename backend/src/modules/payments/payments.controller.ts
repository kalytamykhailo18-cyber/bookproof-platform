import {
  Controller,
  Post,
  Get,
  Headers,
  Body,
  Param,
  BadRequestException,
  RawBodyRequest,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { StripePaymentsService } from './services/stripe-payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  CreateCheckoutSessionDto,
  CheckoutSessionResponseDto,
  PaymentTransactionDto,
  InvoiceResponseDto,
  CustomPackagePublicDto,
  CreateCustomPackageCheckoutDto,
  CustomPackageCheckoutResponseDto,
} from './dto/stripe-payments.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  private stripe: Stripe;

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly stripePaymentsService: StripePaymentsService,
    private readonly configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
  }

  @Post('checkout/create')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AUTHOR)
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  @ApiResponse({ status: 200, description: 'Checkout session created', type: CheckoutSessionResponseDto })
  async createCheckout(
    @Body() dto: CreateCheckoutSessionDto,
    @Req() req: Request,
  ): Promise<CheckoutSessionResponseDto> {
    return this.stripePaymentsService.createCheckoutSession(req.user!.authorProfileId!, dto);
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiExcludeEndpoint() // Exclude from Swagger docs (internal endpoint)
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
    @Body() body: any,
  ): Promise<{ received: boolean }> {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    // Get raw body for signature verification
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    await this.paymentsService.handleWebhook(rawBody, signature);

    // Also handle Week 5 specific webhook events
    try {
      const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
      if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
      }
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.mode === 'payment') {
            // Check if this is a custom package payment
            if (session.metadata?.type === 'custom_package') {
              await this.stripePaymentsService.handleCustomPackagePaymentSuccess(session.id);
            } else if (session.metadata?.type === 'keyword_research') {
              // Keyword research payments are handled by paymentsService.handleWebhook above
              // Skip processing here to avoid duplicate handling
            } else {
              // Standard package purchase
              await this.stripePaymentsService.handlePaymentSuccess(session.id);
            }
          }
          break;
        }

        case 'checkout.session.expired':
        case 'payment_intent.payment_failed': {
          const session = event.data.object as any;
          if (session.id) {
            await this.stripePaymentsService.handlePaymentFailure(session.id);
          }
          break;
        }
      }
    } catch (error) {
      console.error('Week 5 webhook handling error:', error);
    }

    return { received: true };
  }

  @Get('transactions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AUTHOR)
  @ApiOperation({ summary: 'Get payment transactions' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved', type: [PaymentTransactionDto] })
  async getTransactions(@Req() req: Request): Promise<PaymentTransactionDto[]> {
    return this.stripePaymentsService.getPaymentTransactions(req.user!.authorProfileId!);
  }

  @Get('transactions/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AUTHOR)
  @ApiOperation({ summary: 'Get single payment transaction' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved', type: PaymentTransactionDto })
  async getTransaction(@Param('id') transactionId: string): Promise<PaymentTransactionDto> {
    return this.stripePaymentsService.getPaymentTransaction(transactionId);
  }

  @Get('invoice/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AUTHOR)
  @ApiOperation({ summary: 'Get invoice for purchase' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved', type: InvoiceResponseDto })
  async getInvoice(@Param('id') creditPurchaseId: string): Promise<InvoiceResponseDto> {
    return this.stripePaymentsService.generateInvoice(creditPurchaseId);
  }

  // ============================================
  // CUSTOM PACKAGE PUBLIC ENDPOINTS (no auth)
  // ============================================

  @Get('custom-package/:token')
  @ApiOperation({ summary: 'Get custom package details by payment link token (public)' })
  @ApiResponse({ status: 200, description: 'Package details', type: CustomPackagePublicDto })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async getCustomPackage(@Param('token') token: string): Promise<CustomPackagePublicDto> {
    return this.stripePaymentsService.getCustomPackageByToken(token);
  }

  @Post('custom-package/:token/checkout')
  @ApiOperation({ summary: 'Create Stripe checkout session for custom package (public)' })
  @ApiResponse({ status: 200, description: 'Checkout session created', type: CustomPackageCheckoutResponseDto })
  @ApiResponse({ status: 400, description: 'Package already paid or expired' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async createCustomPackageCheckout(
    @Param('token') token: string,
    @Body() dto: CreateCustomPackageCheckoutDto,
  ): Promise<CustomPackageCheckoutResponseDto> {
    return this.stripePaymentsService.createCustomPackageCheckout(token, dto);
  }
}
