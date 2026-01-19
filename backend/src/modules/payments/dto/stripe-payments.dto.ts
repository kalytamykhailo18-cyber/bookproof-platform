import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Min } from 'class-validator';

/**
 * DTO for creating a Stripe checkout session for credit package purchase
 */
export class CreateCheckoutSessionDto {
  @ApiProperty({
    description: 'Package tier ID to purchase',
    example: 'cm1pkg123',
  })
  @IsString()
  @IsNotEmpty()
  packageTierId: string;

  @ApiPropertyOptional({
    description: 'Coupon code to apply',
    example: 'SUMMER2024',
  })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiProperty({
    description: 'Success redirect URL',
    example: 'https://bookproof.com/author/payment/success',
  })
  @IsUrl()
  @IsNotEmpty()
  successUrl: string;

  @ApiProperty({
    description: 'Cancel redirect URL',
    example: 'https://bookproof.com/author/payment/cancel',
  })
  @IsUrl()
  @IsNotEmpty()
  cancelUrl: string;
}

/**
 * Response DTO for checkout session creation
 */
export class CheckoutSessionResponseDto {
  @ApiProperty({ description: 'Stripe checkout session ID' })
  sessionId: string;

  @ApiProperty({ description: 'Checkout session URL for redirect' })
  checkoutUrl: string;

  @ApiProperty({ description: 'Package details' })
  package: {
    name: string;
    credits: number;
    price: number;
    currency: string;
  };

  @ApiPropertyOptional({ description: 'Applied coupon details' })
  coupon?: {
    code: string;
    discountAmount: number;
    discountPercent?: number;
  };

  @ApiProperty({ description: 'Final amount after discounts' })
  finalAmount: number;
}

/**
 * DTO for Stripe webhook events
 */
export class StripeWebhookDto {
  @ApiProperty({ description: 'Stripe event type' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Stripe event data (any)' })
  data: any;
}

/**
 * Response DTO for payment transaction
 */
export class PaymentTransactionDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: string;

  @ApiProperty({ description: 'Author profile ID' })
  authorProfileId: string;

  @ApiProperty({ description: 'Package tier details' })
  package: {
    id: string;
    name: string;
    credits: number;
  };

  @ApiProperty({ description: 'Amount paid' })
  amountPaid: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Payment status' })
  paymentStatus: string;

  @ApiProperty({ description: 'Stripe payment ID' })
  stripePaymentId: string;

  @ApiProperty({ description: 'Credits purchased' })
  credits: number;

  @ApiProperty({ description: 'Validity days' })
  validityDays: number;

  @ApiProperty({ description: 'Activation window expires at' })
  activationWindowExpiresAt: string;

  @ApiPropertyOptional({ description: 'Coupon applied' })
  coupon?: {
    code: string;
    discountApplied: number;
  };

  @ApiProperty({ description: 'Purchase date' })
  purchaseDate: string;

  @ApiProperty({ description: 'Activated status' })
  activated: boolean;

  @ApiPropertyOptional({ description: 'Activated at' })
  activatedAt?: string;
}

/**
 * Response DTO for invoice generation
 */
export class InvoiceResponseDto {
  @ApiProperty({ description: 'Invoice ID' })
  id: string;

  @ApiProperty({ description: 'Invoice number' })
  invoiceNumber: string;

  @ApiProperty({ description: 'Amount' })
  amount: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Payment status' })
  paymentStatus: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Paid at' })
  paidAt?: string;

  @ApiProperty({ description: 'PDF URL' })
  pdfUrl?: string;

  @ApiProperty({ description: 'Description' })
  description: string;
}

/**
 * Response DTO for payment receipt
 */
export class PaymentReceiptDto {
  @ApiProperty({ description: 'Receipt ID' })
  id: string;

  @ApiProperty({ description: 'Transaction details' })
  transaction: PaymentTransactionDto;

  @ApiProperty({ description: 'Receipt PDF URL' })
  receiptPdfUrl: string;

  @ApiProperty({ description: 'Receipt email sent' })
  emailSent: boolean;

  @ApiProperty({ description: 'Receipt email sent at' })
  emailSentAt?: string;
}

/**
 * Response DTO for payment failure details
 */
export class PaymentFailureDto {
  @ApiProperty({ description: 'Transaction ID' })
  transactionId: string;

  @ApiProperty({ description: 'Failure reason' })
  failureReason: string;

  @ApiProperty({ description: 'Failure code' })
  failureCode: string;

  @ApiProperty({ description: 'Failed at timestamp' })
  failedAt: string;

  @ApiProperty({ description: 'Customer notified' })
  customerNotified: boolean;
}

// ============================================
// CUSTOM PACKAGE PAYMENT DTOs
// ============================================

/**
 * Response DTO for custom package details (public - via token)
 */
export class CustomPackagePublicDto {
  @ApiProperty({ description: 'Package name' })
  packageName: string;

  @ApiProperty({ description: 'Package description' })
  description?: string;

  @ApiProperty({ description: 'Number of credits included' })
  credits: number;

  @ApiProperty({ description: 'Package price' })
  price: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Credit validity in days' })
  validityDays: number;

  @ApiProperty({ description: 'Special terms if any' })
  specialTerms?: string;

  @ApiProperty({ description: 'Client name' })
  clientName: string;

  @ApiProperty({ description: 'Client email' })
  clientEmail: string;

  @ApiProperty({ description: 'Client company' })
  clientCompany?: string;

  @ApiProperty({ description: 'Package status' })
  status: string;

  @ApiProperty({ description: 'Payment link expiration' })
  expiresAt?: Date;

  @ApiProperty({ description: 'Whether the link has expired' })
  isExpired: boolean;
}

/**
 * DTO for creating Stripe checkout session for custom package
 */
export class CreateCustomPackageCheckoutDto {
  @ApiProperty({
    description: 'Success redirect URL',
    example: 'https://bookproof.com/checkout/custom/success',
  })
  @IsUrl()
  @IsNotEmpty()
  successUrl: string;

  @ApiProperty({
    description: 'Cancel redirect URL',
    example: 'https://bookproof.com/checkout/custom/cancel',
  })
  @IsUrl()
  @IsNotEmpty()
  cancelUrl: string;
}

/**
 * Response DTO for custom package checkout session
 */
export class CustomPackageCheckoutResponseDto {
  @ApiProperty({ description: 'Stripe checkout session ID' })
  sessionId: string;

  @ApiProperty({ description: 'Checkout session URL for redirect' })
  checkoutUrl: string;

  @ApiProperty({ description: 'Package details' })
  package: {
    name: string;
    credits: number;
    price: number;
    currency: string;
  };
}

/**
 * Response DTO for custom package payment success
 */
export class CustomPackagePaymentSuccessDto {
  @ApiProperty({ description: 'Whether payment was successful' })
  success: boolean;

  @ApiProperty({ description: 'Custom package ID' })
  packageId: string;

  @ApiProperty({ description: 'Credits purchased' })
  credits: number;

  @ApiProperty({ description: 'Whether a new account was created' })
  accountCreated: boolean;

  @ApiProperty({ description: 'Created user ID (if new account)' })
  userId?: string;

  @ApiProperty({ description: 'Created author profile ID' })
  authorProfileId?: string;

  @ApiProperty({ description: 'Message for the user' })
  message: string;
}

// ============================================
// REFUND AND DISPUTE DTOs
// ============================================

/**
 * DTO for admin to process a refund
 */
export class ProcessRefundDto {
  @ApiProperty({
    description: 'Credit purchase ID to refund',
    example: 'cm1purchase123',
  })
  @IsString()
  @IsNotEmpty()
  creditPurchaseId: string;

  @ApiPropertyOptional({
    description: 'Partial refund amount (leave empty for full refund)',
    example: 50.0,
  })
  @IsOptional()
  partialAmount?: number;

  @ApiProperty({
    description: 'Reason for refund',
    example: 'Customer requested refund due to service issues',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

/**
 * Response DTO for refund processing
 */
export class RefundResponseDto {
  @ApiProperty({ description: 'Refund ID from Stripe' })
  refundId: string;

  @ApiProperty({ description: 'Credit purchase ID' })
  creditPurchaseId: string;

  @ApiProperty({ description: 'Refund amount' })
  amount: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Refund status' })
  status: string;

  @ApiProperty({ description: 'Refund reason' })
  reason: string;

  @ApiProperty({ description: 'Credits deducted from author account' })
  creditsDeducted: number;

  @ApiProperty({ description: 'Refund processed at' })
  processedAt: string;

  @ApiProperty({ description: 'Whether customer was notified' })
  customerNotified: boolean;
}

/**
 * Response DTO for dispute details
 */
export class DisputeResponseDto {
  @ApiProperty({ description: 'Dispute ID from Stripe' })
  disputeId: string;

  @ApiProperty({ description: 'Payment intent ID' })
  paymentIntentId: string;

  @ApiProperty({ description: 'Charge ID' })
  chargeId: string;

  @ApiProperty({ description: 'Amount disputed' })
  amount: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Dispute reason' })
  reason: string;

  @ApiProperty({ description: 'Dispute status' })
  status: string;

  @ApiProperty({ description: 'Evidence due by timestamp' })
  evidenceDueBy: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Related credit purchase ID (if found)' })
  creditPurchaseId?: string;

  @ApiProperty({ description: 'Author profile ID (if found)' })
  authorProfileId?: string;
}

// ============================================
// BRAZIL PAYMENT PLACEHOLDER DTOs
// ============================================

/**
 * Enum for supported payment providers
 */
export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PIX = 'PIX',
  MERCADO_PAGO = 'MERCADO_PAGO',
  BOLETO = 'BOLETO',
}

/**
 * DTO for payment method configuration
 */
export class PaymentMethodConfigDto {
  @ApiProperty({ description: 'Payment provider name', enum: PaymentProvider })
  provider: PaymentProvider;

  @ApiProperty({ description: 'Whether this provider is enabled' })
  isEnabled: boolean;

  @ApiProperty({ description: 'Countries this provider is available in' })
  availableCountries: string[];

  @ApiProperty({ description: 'Supported currencies' })
  supportedCurrencies: string[];

  @ApiPropertyOptional({ description: 'Configuration details' })
  configuration?: Record<string, any>;
}

/**
 * Response DTO for available payment methods
 */
export class AvailablePaymentMethodsDto {
  @ApiProperty({ description: 'User country (detected or specified)' })
  userCountry: string;

  @ApiProperty({ description: 'Available payment methods for user', type: [PaymentMethodConfigDto] })
  paymentMethods: PaymentMethodConfigDto[];

  @ApiProperty({ description: 'Default/recommended payment method' })
  recommendedMethod: PaymentProvider;
}
