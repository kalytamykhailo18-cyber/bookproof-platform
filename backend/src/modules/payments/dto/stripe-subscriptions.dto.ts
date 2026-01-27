import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';

/**
 * DTO for creating a subscription plan
 */
export class CreateSubscriptionPlanDto {
  @ApiProperty({
    description: 'Plan name',
    example: 'Professional Monthly - 100 Credits',
  })
  @IsString()
  @IsNotEmpty()
  planName: string;

  @ApiProperty({
    description: 'Credits allocated per month',
    example: 100,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  creditsPerMonth: number;

  @ApiProperty({
    description: 'Price per month',
    example: 99.99,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01)
  pricePerMonth: number;

  @ApiProperty({
    description: 'Currency',
    example: 'USD',
    default: 'USD',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiPropertyOptional({
    description: 'Plan description',
    example: 'Perfect for authors with multiple campaigns',
  })
  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * DTO for creating a subscription checkout session
 */
export class CreateSubscriptionCheckoutDto {
  @ApiProperty({
    description: 'Stripe price ID for the subscription plan',
    example: 'price_1234567890',
  })
  @IsString()
  @IsNotEmpty()
  stripePriceId: string;

  @ApiProperty({
    description: 'Success redirect URL',
    example: 'https://bookproof.app/author/subscription/success',
  })
  @IsUrl()
  @IsNotEmpty()
  successUrl: string;

  @ApiProperty({
    description: 'Cancel redirect URL',
    example: 'https://bookproof.app/author/subscription/cancel',
  })
  @IsUrl()
  @IsNotEmpty()
  cancelUrl: string;
}

/**
 * Response DTO for subscription checkout session
 */
export class SubscriptionCheckoutResponseDto {
  @ApiProperty({ description: 'Stripe checkout session ID' })
  sessionId: string;

  @ApiProperty({ description: 'Checkout session URL for redirect' })
  checkoutUrl: string;

  @ApiProperty({ description: 'Plan details' })
  plan: {
    name: string;
    creditsPerMonth: number;
    pricePerMonth: number;
    currency: string;
  };
}

/**
 * Response DTO for subscription details
 */
export class SubscriptionDetailsDto {
  @ApiProperty({ description: 'Subscription ID' })
  id: string;

  @ApiProperty({ description: 'Author profile ID' })
  authorProfileId: string;

  @ApiProperty({ description: 'Stripe subscription ID' })
  stripeSubscriptionId: string;

  @ApiProperty({ description: 'Stripe price ID' })
  stripePriceId: string;

  @ApiProperty({ description: 'Plan name' })
  planName: string;

  @ApiProperty({ description: 'Credits per month' })
  creditsPerMonth: number;

  @ApiProperty({ description: 'Price per month' })
  pricePerMonth: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Total credits allocated so far' })
  totalCreditsAllocated: number;

  @ApiProperty({ description: 'Subscription status' })
  status: string;

  @ApiProperty({ description: 'Current period start' })
  currentPeriodStart: string;

  @ApiProperty({ description: 'Current period end' })
  currentPeriodEnd: string;

  @ApiProperty({ description: 'Cancel at period end' })
  cancelAtPeriodEnd: boolean;

  @ApiPropertyOptional({ description: 'Canceled at' })
  canceledAt?: string;

  @ApiPropertyOptional({ description: 'Ended at' })
  endedAt?: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Next billing date' })
  nextBillingDate: string;

  @ApiProperty({ description: 'Days until next billing' })
  daysUntilBilling: number;
}

/**
 * DTO for canceling a subscription
 */
export class CancelSubscriptionDto {
  @ApiProperty({
    description: 'Cancel immediately or at period end',
    example: false,
    default: false,
  })
  @IsBoolean()
  cancelImmediately: boolean;

  @ApiPropertyOptional({
    description: 'Reason for cancellation',
    example: 'Switching to one-time payment model',
  })
  @IsString()
  @IsOptional()
  cancellationReason?: string;
}

/**
 * Response DTO for subscription cancellation
 */
export class SubscriptionCancellationResponseDto {
  @ApiProperty({ description: 'Subscription ID' })
  subscriptionId: string;

  @ApiProperty({ description: 'Cancellation success' })
  success: boolean;

  @ApiProperty({ description: 'Canceled immediately or at period end' })
  canceledImmediately: boolean;

  @ApiProperty({ description: 'Credits remain valid until' })
  creditsValidUntil: string;

  @ApiProperty({ description: 'Message for user' })
  message: string;
}

/**
 * Response DTO for subscription renewal event
 */
export class SubscriptionRenewalDto {
  @ApiProperty({ description: 'Subscription ID' })
  subscriptionId: string;

  @ApiProperty({ description: 'Author profile ID' })
  authorProfileId: string;

  @ApiProperty({ description: 'Credits allocated' })
  creditsAllocated: number;

  @ApiProperty({ description: 'Amount charged' })
  amountCharged: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Current period start' })
  currentPeriodStart: string;

  @ApiProperty({ description: 'Current period end' })
  currentPeriodEnd: string;

  @ApiProperty({ description: 'Renewed at' })
  renewedAt: string;
}

/**
 * Response DTO for subscription status tracking
 */
export class SubscriptionStatusDto {
  @ApiProperty({ description: 'Subscription ID' })
  id: string;

  @ApiProperty({ description: 'Status' })
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED' | 'TRIALING' | 'UNPAID';

  @ApiProperty({ description: 'Status display name' })
  statusDisplay: string;

  @ApiProperty({ description: 'Is subscription active' })
  isActive: boolean;

  @ApiProperty({ description: 'Requires action' })
  requiresAction: boolean;

  @ApiPropertyOptional({ description: 'Action required message' })
  actionMessage?: string;

  @ApiProperty({ description: 'Last payment status' })
  lastPaymentStatus: 'SUCCEEDED' | 'PENDING' | 'FAILED';

  @ApiPropertyOptional({ description: 'Failed payment reason' })
  failedPaymentReason?: string;
}

/**
 * Response DTO for subscription management
 */
export class SubscriptionManagementDto {
  @ApiProperty({ description: 'Subscription details' })
  subscription: SubscriptionDetailsDto;

  @ApiProperty({ description: 'Current status' })
  status: SubscriptionStatusDto;

  @ApiProperty({ description: 'Billing history (last 5 invoices)' })
  billingHistory: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: string;
    invoiceUrl?: string;
  }>;

  @ApiProperty({ description: 'Available actions' })
  availableActions: {
    canCancel: boolean;
    canUpdatePaymentMethod: boolean;
    canResume: boolean;
  };
}
