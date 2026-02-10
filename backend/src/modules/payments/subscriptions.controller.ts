import { Controller, Post, Get, Body, Param, UseGuards, Req, Headers, RawBodyRequest, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { StripeSubscriptionsService } from './services/stripe-subscriptions.service';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  CreateSubscriptionPlanDto,
  CreateSubscriptionCheckoutDto,
  CancelSubscriptionDto,
  SubscriptionCheckoutResponseDto,
  SubscriptionDetailsDto,
  SubscriptionCancellationResponseDto,
  SubscriptionManagementDto,
} from './dto/stripe-subscriptions.dto';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  private stripe: Stripe;

  constructor(
    private subscriptionsService: StripeSubscriptionsService,
    private configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
  }

  @Post('plans')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN' as any)
  @ApiOperation({ summary: 'Create subscription plan (Admin only)' })
  @ApiResponse({ status: 200, description: 'Plan created successfully' })
  async createPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return this.subscriptionsService.createSubscriptionPlan(dto);
  }

  @Post('checkout/create')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AUTHOR' as any)
  @ApiOperation({ summary: 'Create subscription checkout session' })
  @ApiResponse({ status: 200, description: 'Checkout session created', type: SubscriptionCheckoutResponseDto })
  async createCheckout(
    @Body() dto: CreateSubscriptionCheckoutDto,
    @Req() req: any,
  ): Promise<SubscriptionCheckoutResponseDto> {
    return this.subscriptionsService.createSubscriptionCheckout(req.user.authorProfileId, dto);
  }

  @Post('webhooks')
  @HttpCode(200)
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Stripe subscription webhook endpoint' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }
    const rawBody = req.rawBody;

    if (!rawBody) {
      throw new Error('Raw body not available');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (error) {
      console.error('Webhook signature verification failed:');
      throw new Error('Webhook signature verification failed');
    }

    // Handle subscription events
    try {
      switch (event.type) {
        case 'customer.subscription.created': {
          const subscription = event.data.object as Stripe.Subscription;
          await this.subscriptionsService.handleSubscriptionCreated(subscription.id);
          break;
        }

        case 'customer.subscription.updated':
        case 'invoice.payment_succeeded': {
          const subscription = event.data.object as any;
          const subscriptionId = subscription.subscription || subscription.id;
          if (subscriptionId) {
            await this.subscriptionsService.handleSubscriptionRenewed(subscriptionId);
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          // Handle cancellation
          console.log('Subscription cancelled:', subscription.id);
          break;
        }

        default:
          console.log(`Unhandled subscription event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Error processing subscription webhook:', error);
      throw error;
    }
  }

  @Get('my-subscription')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AUTHOR' as any)
  @ApiOperation({ summary: 'Get my active subscription' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved', type: SubscriptionManagementDto })
  async getMySubscription(@Req() req: any): Promise<SubscriptionManagementDto> {
    return this.subscriptionsService.getSubscriptionManagement(req.user.authorProfileId);
  }

  @Post(':id/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AUTHOR' as any)
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled', type: SubscriptionCancellationResponseDto })
  async cancelSubscription(
    @Param('id') subscriptionId: string,
    @Body() dto: CancelSubscriptionDto,
  ): Promise<SubscriptionCancellationResponseDto> {
    return this.subscriptionsService.cancelSubscription(subscriptionId, dto);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AUTHOR' as any)
  @ApiOperation({ summary: 'Get subscription details' })
  @ApiResponse({ status: 200, description: 'Subscription details retrieved', type: SubscriptionDetailsDto })
  async getSubscriptionDetails(@Param('id') subscriptionId: string): Promise<SubscriptionDetailsDto> {
    return this.subscriptionsService.getSubscriptionDetails(subscriptionId);
  }

  @Get(':id/management')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('AUTHOR' as any)
  @ApiOperation({ summary: 'Get subscription management details' })
  @ApiResponse({ status: 200, description: 'Management details retrieved', type: SubscriptionManagementDto })
  async getSubscriptionManagement(@Param('id') subscriptionId: string) {
    // Get subscription and return management details
    const subscription = await this.subscriptionsService.getSubscriptionDetails(subscriptionId);
    return {
      subscription,
      status: await this.subscriptionsService.getSubscriptionStatus(subscriptionId),
      billingHistory: [],
      availableActions: {
        canCancel: subscription.status === 'ACTIVE' && !subscription.cancelAtPeriodEnd,
        canUpdatePaymentMethod: subscription.status === 'ACTIVE',
        canResume: subscription.cancelAtPeriodEnd,
      },
    };
  }
}
