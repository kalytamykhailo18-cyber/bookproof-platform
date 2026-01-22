import {
  IsString,
  IsNumber,
  IsEmail,
  IsOptional,
  IsBoolean,
  Min,
  MinLength,
  IsEnum,
  IsArray,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CustomPackageStatus, PackageApprovalStatus } from '@prisma/client';

// ============================================
// ENUMS (for frontend/backend alignment)
// ============================================

export { CustomPackageStatus, PackageApprovalStatus };

// ============================================
// CREATE CUSTOM PACKAGE
// ============================================

export class CreateCustomPackageDto {
  @ApiProperty({ example: 'Enterprise Package - Publisher XYZ', description: 'Package name' })
  @IsString()
  @MinLength(3)
  packageName: string;

  @ApiPropertyOptional({ example: 'Custom package for 10 books', description: 'Package description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 500, description: 'Number of credits in the package' })
  @IsNumber()
  @Min(1)
  credits: number;

  @ApiProperty({ example: 2500, description: 'Package price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Currency code' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: 90, description: 'Validity days for credit activation' })
  @IsNumber()
  @Min(1)
  validityDays: number;

  @ApiPropertyOptional({ example: 'Payment due within 30 days', description: 'Special terms' })
  @IsString()
  @IsOptional()
  specialTerms?: string;

  @ApiPropertyOptional({ example: 'Negotiated by John on 01/15/2024', description: 'Internal notes (not visible to client)' })
  @IsString()
  @IsOptional()
  internalNotes?: string;

  @ApiProperty({ example: 'John Publisher', description: 'Client name' })
  @IsString()
  @MinLength(2)
  clientName: string;

  @ApiProperty({ example: 'john@publisher.com', description: 'Client email' })
  @IsEmail()
  clientEmail: string;

  @ApiPropertyOptional({ example: 'XYZ Publishing House', description: 'Client company' })
  @IsString()
  @IsOptional()
  clientCompany?: string;

  @ApiPropertyOptional({ example: '+1-555-123-4567', description: 'Client phone number' })
  @IsString()
  @IsOptional()
  clientPhone?: string;

  @ApiPropertyOptional({ example: true, description: 'Include keyword research credits' })
  @IsBoolean()
  @IsOptional()
  includeKeywordResearch?: boolean;

  @ApiPropertyOptional({ example: 5, description: 'Number of keyword research credits to include' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  keywordResearchCredits?: number;
}

// ============================================
// UPDATE CUSTOM PACKAGE
// ============================================

export class UpdateCustomPackageDto {
  @ApiPropertyOptional({ example: 'Updated Package Name', description: 'Package name' })
  @IsString()
  @MinLength(3)
  @IsOptional()
  packageName?: string;

  @ApiPropertyOptional({ example: 'Updated description', description: 'Package description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 600, description: 'Number of credits' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  credits?: number;

  @ApiPropertyOptional({ example: 3000, description: 'Package price' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 'EUR', description: 'Currency code' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 120, description: 'Validity days' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  validityDays?: number;

  @ApiPropertyOptional({ example: 'Updated terms', description: 'Special terms' })
  @IsString()
  @IsOptional()
  specialTerms?: string;

  @ApiPropertyOptional({ example: 'Updated internal notes', description: 'Internal notes (not visible to client)' })
  @IsString()
  @IsOptional()
  internalNotes?: string;

  @ApiPropertyOptional({ example: 'Jane Publisher', description: 'Client name' })
  @IsString()
  @MinLength(2)
  @IsOptional()
  clientName?: string;

  @ApiPropertyOptional({ example: 'jane@publisher.com', description: 'Client email' })
  @IsEmail()
  @IsOptional()
  clientEmail?: string;

  @ApiPropertyOptional({ example: 'ABC Publishing', description: 'Client company' })
  @IsString()
  @IsOptional()
  clientCompany?: string;

  @ApiPropertyOptional({ example: '+1-555-123-4567', description: 'Client phone number' })
  @IsString()
  @IsOptional()
  clientPhone?: string;

  @ApiPropertyOptional({ example: true, description: 'Include keyword research credits' })
  @IsBoolean()
  @IsOptional()
  includeKeywordResearch?: boolean;

  @ApiPropertyOptional({ example: 5, description: 'Number of keyword research credits to include' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  keywordResearchCredits?: number;
}

// ============================================
// SEND PACKAGE (generate payment link)
// ============================================

export class SendPackageDto {
  @ApiPropertyOptional({ example: 30, description: 'Days until payment link expires (default: 30, max: 30)' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  expirationDays?: number; // Default is 30 days per Section 5.3 requirements

  @ApiPropertyOptional({
    example: 'Please review and complete payment at your earliest convenience',
    description: 'Custom message to include in email',
  })
  @IsString()
  @IsOptional()
  customMessage?: string;
}

// ============================================
// QUERY FILTERS
// ============================================

export class GetPackagesQueryDto {
  @ApiPropertyOptional({ enum: CustomPackageStatus, description: 'Filter by status' })
  @IsEnum(CustomPackageStatus)
  @IsOptional()
  status?: CustomPackageStatus;

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

export class CustomPackageResponseDto {
  @ApiProperty({ description: 'Package ID' })
  id: string;

  @ApiProperty({ description: 'Closer profile ID' })
  closerProfileId: string;

  @ApiProperty({ description: 'Package name' })
  packageName: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiProperty({ description: 'Number of credits' })
  credits: number;

  @ApiProperty({ description: 'Price' })
  price: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiProperty({ description: 'Validity days for activation' })
  validityDays: number;

  @ApiPropertyOptional({ description: 'Special terms' })
  specialTerms?: string;

  @ApiPropertyOptional({ description: 'Internal notes (not visible to client)' })
  internalNotes?: string;

  @ApiProperty({ description: 'Client name' })
  clientName: string;

  @ApiProperty({ description: 'Client email' })
  clientEmail: string;

  @ApiPropertyOptional({ description: 'Client company' })
  clientCompany?: string;

  @ApiPropertyOptional({ description: 'Client phone number' })
  clientPhone?: string;

  @ApiProperty({ description: 'Include keyword research credits' })
  includeKeywordResearch: boolean;

  @ApiProperty({ description: 'Number of keyword research credits included' })
  keywordResearchCredits: number;

  @ApiProperty({ enum: CustomPackageStatus, description: 'Package status' })
  status: CustomPackageStatus;

  // Approval workflow fields
  @ApiProperty({ description: 'Whether this package requires Super Admin approval (pricing below 80% threshold)' })
  approvalRequired: boolean;

  @ApiProperty({ enum: PackageApprovalStatus, description: 'Approval status' })
  approvalStatus: PackageApprovalStatus;

  @ApiPropertyOptional({ description: 'Admin user ID who approved/rejected' })
  approvedBy?: string;

  @ApiPropertyOptional({ description: 'When the package was approved/rejected' })
  approvedAt?: Date;

  @ApiPropertyOptional({ description: 'Reason for rejection (if rejected)' })
  rejectionReason?: string;

  @ApiPropertyOptional({ description: 'Payment link URL' })
  paymentLink?: string;

  @ApiPropertyOptional({ description: 'Payment link expiration date' })
  paymentLinkExpiresAt?: Date;

  @ApiPropertyOptional({ description: 'When package was sent to client' })
  sentAt?: Date;

  @ApiPropertyOptional({ description: 'When client viewed the offer' })
  viewedAt?: Date;

  @ApiProperty({ description: 'Number of times viewed' })
  viewCount: number;

  @ApiPropertyOptional({ description: 'When payment was completed' })
  paidAt?: Date;

  @ApiPropertyOptional({ description: 'Stripe payment/transaction ID' })
  stripePaymentId?: string;

  @ApiPropertyOptional({ description: 'Whether client account was created after payment' })
  accountCreated?: boolean;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;
}

export class PackageStatsDto {
  @ApiProperty({ description: 'Total packages created' })
  totalPackages: number;

  @ApiProperty({ description: 'Packages in draft' })
  draft: number;

  @ApiProperty({ description: 'Packages pending Super Admin approval' })
  pendingApproval: number;

  @ApiProperty({ description: 'Packages sent to clients' })
  sent: number;

  @ApiProperty({ description: 'Packages viewed by clients' })
  viewed: number;

  @ApiProperty({ description: 'Packages paid' })
  paid: number;

  @ApiProperty({ description: 'Packages expired' })
  expired: number;

  @ApiProperty({ description: 'Packages cancelled' })
  cancelled: number;

  @ApiProperty({ description: 'Total revenue from paid packages' })
  totalRevenue: number;

  @ApiProperty({ description: 'Total credits sold' })
  totalCreditsSold: number;
}
