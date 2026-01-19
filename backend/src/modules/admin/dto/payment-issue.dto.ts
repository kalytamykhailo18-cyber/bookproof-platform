import {
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Enums matching Prisma schema
export enum PaymentIssueType {
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_DISPUTE = 'PAYMENT_DISPUTE',
  REFUND_REQUEST = 'REFUND_REQUEST',
  PAYOUT_ISSUE = 'PAYOUT_ISSUE',
  DUPLICATE_PAYMENT = 'DUPLICATE_PAYMENT',
  CREDIT_MISMATCH = 'CREDIT_MISMATCH',
  OTHER = 'OTHER',
}

export enum PaymentIssueStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
}

export enum PaymentIssueAction {
  REFUNDED = 'REFUNDED',
  CORRECTED = 'CORRECTED',
  RECONCILED = 'RECONCILED',
  CREDITED = 'CREDITED',
  NO_ACTION = 'NO_ACTION',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
  PENDING_STRIPE = 'PENDING_STRIPE',
}

export enum PaymentIssuePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// DTO for creating a payment issue
export class CreatePaymentIssueDto {
  @ApiProperty({
    description: 'Type of payment issue',
    enum: PaymentIssueType,
    example: PaymentIssueType.REFUND_REQUEST,
  })
  @IsEnum(PaymentIssueType)
  type: PaymentIssueType;

  @ApiProperty({
    description: 'User ID affected by this issue',
    example: 'cly1abc123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Amount involved in the issue',
    example: 49.99,
  })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({
    description: 'Currency (defaults to USD)',
    example: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: 'Detailed description of the payment issue',
    example: 'Customer reports charge but credits not received',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiPropertyOptional({
    description: 'Stripe payment ID if applicable',
    example: 'pi_1234567890',
  })
  @IsString()
  @IsOptional()
  stripePaymentId?: string;

  @ApiPropertyOptional({
    description: 'Priority level (defaults to HIGH for payment issues)',
    enum: PaymentIssuePriority,
    example: PaymentIssuePriority.HIGH,
  })
  @IsEnum(PaymentIssuePriority)
  @IsOptional()
  priority?: PaymentIssuePriority;
}

// DTO for resolving a payment issue
export class ResolvePaymentIssueDto {
  @ApiProperty({
    description: 'Resolution notes',
    example: 'Refund processed via Stripe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  resolution: string;

  @ApiProperty({
    description: 'Action taken to resolve the issue',
    enum: PaymentIssueAction,
    example: PaymentIssueAction.REFUNDED,
  })
  @IsEnum(PaymentIssueAction)
  action: PaymentIssueAction;

  @ApiPropertyOptional({
    description: 'Stripe refund ID if a refund was processed',
    example: 're_1234567890',
  })
  @IsString()
  @IsOptional()
  stripeRefundId?: string;
}

// DTO for processing a refund
export class ProcessRefundDto {
  @ApiProperty({
    description: 'Amount to refund',
    example: 49.99,
  })
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @ApiProperty({
    description: 'Reason for the refund',
    example: 'Customer requested refund within 14-day window',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(500)
  reason: string;
}

// DTO for updating payment issue status
export class UpdatePaymentIssueStatusDto {
  @ApiProperty({
    description: 'New status',
    enum: PaymentIssueStatus,
    example: PaymentIssueStatus.IN_PROGRESS,
  })
  @IsEnum(PaymentIssueStatus)
  status: PaymentIssueStatus;

  @ApiPropertyOptional({
    description: 'Admin notes about the status change',
    example: 'Contacting Stripe support...',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  adminNotes?: string;
}

// DTO for filtering payment issues
export class GetPaymentIssuesQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: PaymentIssueStatus,
  })
  @IsEnum(PaymentIssueStatus)
  @IsOptional()
  status?: PaymentIssueStatus;

  @ApiPropertyOptional({
    description: 'Filter by type',
    enum: PaymentIssueType,
  })
  @IsEnum(PaymentIssueType)
  @IsOptional()
  type?: PaymentIssueType;

  @ApiPropertyOptional({
    description: 'Filter by priority',
    enum: PaymentIssuePriority,
  })
  @IsEnum(PaymentIssuePriority)
  @IsOptional()
  priority?: PaymentIssuePriority;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
  })
  @IsString()
  @IsOptional()
  userId?: string;
}

// Response DTO for payment issue
export class PaymentIssueResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  userRole: string;

  @ApiProperty({ enum: PaymentIssueType })
  type: PaymentIssueType;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional()
  stripePaymentId?: string;

  @ApiPropertyOptional()
  stripeRefundId?: string;

  @ApiProperty({ enum: PaymentIssueStatus })
  status: PaymentIssueStatus;

  @ApiProperty({ enum: PaymentIssuePriority })
  priority: PaymentIssuePriority;

  @ApiPropertyOptional()
  resolution?: string;

  @ApiPropertyOptional({ enum: PaymentIssueAction })
  actionTaken?: PaymentIssueAction;

  @ApiPropertyOptional()
  resolvedBy?: string;

  @ApiPropertyOptional()
  resolvedAt?: Date;

  @ApiPropertyOptional()
  adminNotes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
