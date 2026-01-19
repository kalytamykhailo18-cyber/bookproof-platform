import {
  IsString,
  IsNumber,
  IsEmail,
  IsOptional,
  Min,
  MinLength,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';

// ============================================
// CREATE INVOICE
// ============================================

export class CreateInvoiceDto {
  @ApiPropertyOptional({ description: 'Custom package ID to link this invoice to' })
  @IsString()
  @IsOptional()
  customPackageId?: string;

  @ApiProperty({ example: 2500, description: 'Invoice amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Currency code' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 'Enterprise package for 500 credits', description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2024-02-15', description: 'Due date' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ example: 'john@publisher.com', description: 'Client email' })
  @IsEmail()
  clientEmail: string;

  @ApiProperty({ example: 'John Publisher', description: 'Client name' })
  @IsString()
  @MinLength(2)
  clientName: string;
}

// ============================================
// UPDATE INVOICE
// ============================================

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ example: 3000, description: 'Invoice amount' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ example: 'EUR', description: 'Currency code' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 'Updated description', description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '2024-03-01', description: 'Due date' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

// ============================================
// MARK INVOICE PAID
// ============================================

export class MarkInvoicePaidDto {
  @ApiPropertyOptional({ example: 'pi_1234567890', description: 'Stripe payment ID' })
  @IsString()
  @IsOptional()
  stripePaymentId?: string;

  @ApiPropertyOptional({ example: 'card', description: 'Payment method' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;
}

// ============================================
// QUERY FILTERS
// ============================================

export class GetInvoicesQueryDto {
  @ApiPropertyOptional({ enum: PaymentStatus, description: 'Filter by payment status' })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;

  @ApiPropertyOptional({ example: 'john@example.com', description: 'Filter by client email' })
  @IsEmail()
  @IsOptional()
  clientEmail?: string;

  @ApiPropertyOptional({ example: 10, description: 'Limit results' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: 0, description: 'Offset for pagination' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  offset?: number;
}

// ============================================
// RESPONSE DTOs
// ============================================

export class InvoiceResponseDto {
  @ApiProperty({ description: 'Invoice ID' })
  id: string;

  @ApiProperty({ description: 'Invoice number' })
  invoiceNumber: string;

  @ApiPropertyOptional({ description: 'Closer profile ID' })
  closerProfileId?: string;

  @ApiPropertyOptional({ description: 'Author profile ID' })
  authorProfileId?: string;

  @ApiPropertyOptional({ description: 'Custom package ID' })
  customPackageId?: string;

  @ApiProperty({ description: 'Invoice amount' })
  amount: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiPropertyOptional({ description: 'Due date' })
  dueDate?: Date;

  @ApiPropertyOptional({ description: 'Payment link URL' })
  paymentLink?: string;

  @ApiProperty({ enum: PaymentStatus, description: 'Payment status' })
  paymentStatus: PaymentStatus;

  @ApiPropertyOptional({ description: 'Date when paid' })
  paidAt?: Date;

  @ApiPropertyOptional({ description: 'Stripe payment ID' })
  stripePaymentId?: string;

  @ApiPropertyOptional({ description: 'Payment method used' })
  paymentMethod?: string;

  @ApiProperty({ description: 'Whether author account was created' })
  accountCreated: boolean;

  @ApiPropertyOptional({ description: 'When account was created' })
  accountCreatedAt?: Date;

  @ApiPropertyOptional({ description: 'Created user ID' })
  autoCreatedUserId?: string;

  @ApiPropertyOptional({ description: 'PDF URL' })
  pdfUrl?: string;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;

  // Additional fields for display
  @ApiPropertyOptional({ description: 'Client name (from custom package)' })
  clientName?: string;

  @ApiPropertyOptional({ description: 'Client email (from custom package)' })
  clientEmail?: string;
}

export class InvoiceStatsDto {
  @ApiProperty({ description: 'Total invoices' })
  totalInvoices: number;

  @ApiProperty({ description: 'Pending invoices' })
  pending: number;

  @ApiProperty({ description: 'Completed/Paid invoices' })
  completed: number;

  @ApiProperty({ description: 'Failed invoices' })
  failed: number;

  @ApiProperty({ description: 'Refunded invoices' })
  refunded: number;

  @ApiProperty({ description: 'Total amount pending' })
  totalPending: number;

  @ApiProperty({ description: 'Total amount collected' })
  totalCollected: number;
}
