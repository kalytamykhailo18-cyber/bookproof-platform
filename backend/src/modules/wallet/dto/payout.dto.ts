import {
  IsNumber,
  IsString,
  IsEnum,
  IsObject,
  IsOptional,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PayoutRequestStatus, WalletTransactionType } from '@prisma/client';

export class PayoutPaymentDetailsDto {
  // PayPal
  @IsString()
  @IsOptional()
  paypalEmail?: string;

  // Bank Transfer
  @IsString()
  @IsOptional()
  accountNumber?: string;

  @IsString()
  @IsOptional()
  routingNumber?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsString()
  @IsOptional()
  accountHolderName?: string;

  // Wise
  @IsString()
  @IsOptional()
  wiseEmail?: string;

  // Crypto
  @IsString()
  @IsOptional()
  walletAddress?: string;

  @IsString()
  @IsOptional()
  network?: string; // ETH, BTC, USDT, etc.
}

export class RequestPayoutDto {
  @IsNumber()
  @Min(1, { message: 'Amount must be positive' })
  amount: number; // Actual minimum enforced by service based on MINIMUM_PAYOUT_AMOUNT config

  @IsEnum(['PayPal', 'Bank Transfer', 'Wise', 'Crypto'], {
    message: 'Payment method must be one of: PayPal, Bank Transfer, Wise, Crypto',
  })
  paymentMethod: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PayoutPaymentDetailsDto)
  paymentDetails: PayoutPaymentDetailsDto;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ApprovePayoutDto {
  @IsString()
  @IsOptional()
  notes?: string;
}

export class RejectPayoutDto {
  @IsString()
  @MinLength(10, { message: 'Rejection reason must be at least 10 characters' })
  reason: string;
}

export class CompletePayoutDto {
  @IsString()
  @MinLength(5, { message: 'Transaction ID must be at least 5 characters' })
  transactionId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class PayoutResponseDto {
  id: string;
  readerProfileId: string;
  amount: number;
  status: PayoutRequestStatus;
  paymentMethod: string;
  paymentDetails?: any; // Only for admin, will be decrypted
  processedBy?: string;
  processedAt?: Date;
  rejectionReason?: string;
  notes?: string;
  transactionId?: string;
  paidAt?: Date;
  requestedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Wallet Transaction DTOs
export class WalletTransactionResponseDto {
  id: string;
  readerProfileId: string;
  reviewId?: string;
  amount: number;
  type: WalletTransactionType;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  performedBy?: string;
  notes?: string;
  createdAt: Date;
}

export class WalletSummaryResponseDto {
  walletBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  pendingPayouts: number;
  transactions: WalletTransactionResponseDto[];
}
