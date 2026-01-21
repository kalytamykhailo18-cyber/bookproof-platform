import { IsString, IsEnum, IsOptional, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';

export enum RefundReason {
  DIDNT_NEED_CREDITS = 'DIDNT_NEED_CREDITS',
  WRONG_PACKAGE = 'WRONG_PACKAGE',
  ACCIDENTAL_PURCHASE = 'ACCIDENTAL_PURCHASE',
  SERVICE_NOT_AS_EXPECTED = 'SERVICE_NOT_AS_EXPECTED',
  OTHER = 'OTHER',
}

export enum RefundRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PARTIALLY_APPROVED = 'PARTIALLY_APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
}

/**
 * DTO for creating a refund request
 */
export class CreateRefundRequestDto {
  @ApiProperty({
    description: 'ID of the credit purchase to refund',
    example: 'cm1abc123xyz',
  })
  @IsUUID()
  @IsNotEmpty()
  creditPurchaseId: string;

  @ApiProperty({
    description: 'Reason for refund request',
    enum: RefundReason,
    example: RefundReason.DIDNT_NEED_CREDITS,
  })
  @IsEnum(RefundReason)
  @IsNotEmpty()
  reason: RefundReason;

  @ApiPropertyOptional({
    description: 'Additional explanation for the refund request',
    example: 'I purchased the wrong package size and would like to get a refund to purchase the correct one.',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  explanation?: string;
}

/**
 * DTO for admin refund request response
 */
export class AdminRefundDecisionDto {
  @ApiProperty({
    description: 'Decision on the refund request',
    enum: ['approve', 'approve_partial', 'reject'],
    example: 'approve',
  })
  @IsEnum(['approve', 'approve_partial', 'reject'])
  @IsNotEmpty()
  decision: 'approve' | 'approve_partial' | 'reject';

  @ApiPropertyOptional({
    description: 'Reason for the decision',
    example: 'Refund approved as credits were not used',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  adminNotes?: string;

  @ApiPropertyOptional({
    description: 'Refund amount for partial refunds',
    example: 50.00,
  })
  @IsOptional()
  refundAmount?: number;
}

/**
 * Refund request response DTO
 */
export class RefundRequestResponseDto {
  @ApiProperty({
    description: 'Refund request ID',
    example: 'cm1refund123',
  })
  id: string;

  @ApiProperty({
    description: 'Credit purchase ID',
    example: 'cm1purchase123',
  })
  creditPurchaseId: string;

  @ApiProperty({
    description: 'Author profile ID',
    example: 'cm1author123',
  })
  authorProfileId: string;

  @ApiProperty({
    description: 'Author name',
    example: 'John Doe',
  })
  authorName: string;

  @ApiProperty({
    description: 'Author email',
    example: 'author@example.com',
  })
  authorEmail: string;

  @ApiProperty({
    description: 'Original purchase amount',
    example: 100.00,
  })
  originalAmount: number;

  @ApiProperty({
    description: 'Currency',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Credits from purchase',
    example: 50,
  })
  creditsAmount: number;

  @ApiProperty({
    description: 'Credits already used',
    example: 10,
  })
  creditsUsed: number;

  @ApiProperty({
    description: 'Credits remaining (unused)',
    example: 40,
  })
  creditsRemaining: number;

  @ApiProperty({
    description: 'Purchase date',
    example: '2024-01-15T10:30:00Z',
  })
  purchaseDate: string;

  @ApiProperty({
    description: 'Days since purchase',
    example: 5,
  })
  daysSincePurchase: number;

  @ApiProperty({
    description: 'Whether eligible for refund based on policy (within 30 days, credits not used)',
    example: true,
  })
  isEligible: boolean;

  @ApiProperty({
    description: 'Reason for ineligibility if not eligible',
    example: 'Purchase was made more than 30 days ago',
  })
  ineligibilityReason?: string;

  @ApiProperty({
    description: 'Refund reason',
    enum: RefundReason,
    example: RefundReason.DIDNT_NEED_CREDITS,
  })
  reason: RefundReason;

  @ApiPropertyOptional({
    description: 'Additional explanation from author',
    example: 'I purchased the wrong package',
  })
  explanation?: string;

  @ApiProperty({
    description: 'Refund request status',
    enum: RefundRequestStatus,
    example: RefundRequestStatus.PENDING,
  })
  status: RefundRequestStatus;

  @ApiPropertyOptional({
    description: 'Admin notes on the decision',
    example: 'Approved - credits not used',
  })
  adminNotes?: string;

  @ApiPropertyOptional({
    description: 'Refund amount (for partial refunds)',
    example: 75.00,
  })
  refundAmount?: number;

  @ApiProperty({
    description: 'Request created date',
    example: '2024-01-20T14:30:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Request last updated date',
    example: '2024-01-20T15:45:00Z',
  })
  updatedAt: string;

  @ApiPropertyOptional({
    description: 'Date when request was processed',
    example: '2024-01-21T09:15:00Z',
  })
  processedAt?: string;
}

/**
 * Refund eligibility check response
 */
export class RefundEligibilityDto {
  @ApiProperty({
    description: 'Whether the purchase is eligible for refund',
    example: true,
  })
  isEligible: boolean;

  @ApiProperty({
    description: 'Reason for ineligibility if not eligible',
    example: 'Credits have been used',
  })
  reason?: string;

  @ApiProperty({
    description: 'Days since purchase',
    example: 5,
  })
  daysSincePurchase: number;

  @ApiProperty({
    description: 'Credits purchased',
    example: 50,
  })
  creditsAmount: number;

  @ApiProperty({
    description: 'Credits used',
    example: 0,
  })
  creditsUsed: number;

  @ApiProperty({
    description: 'Credits remaining',
    example: 50,
  })
  creditsRemaining: number;

  @ApiProperty({
    description: 'Original purchase amount',
    example: 100.00,
  })
  originalAmount: number;

  @ApiProperty({
    description: 'Whether purchase has active campaigns using credits',
    example: false,
  })
  hasActiveCampaigns: boolean;
}
