import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponType, CouponAppliesTo } from '@prisma/client';

export class CouponResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty({ enum: CouponType })
  type: CouponType;

  @ApiProperty({ enum: CouponAppliesTo })
  appliesTo: CouponAppliesTo;

  @ApiPropertyOptional()
  discountPercent?: number;

  @ApiPropertyOptional()
  discountAmount?: number;

  @ApiPropertyOptional()
  minimumPurchase?: number;

  @ApiPropertyOptional()
  minimumCredits?: number;

  @ApiPropertyOptional()
  maxUses?: number;

  @ApiProperty()
  maxUsesPerUser: number;

  @ApiProperty()
  currentUses: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  validFrom: Date;

  @ApiPropertyOptional()
  validUntil?: Date;

  @ApiProperty()
  createdBy: string;

  @ApiPropertyOptional()
  purpose?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<CouponResponseDto>) {
    Object.assign(this, partial);
  }
}

export class CouponValidationResponseDto {
  @ApiProperty()
  valid: boolean;

  @ApiPropertyOptional()
  coupon?: CouponResponseDto;

  @ApiPropertyOptional()
  error?: string;

  @ApiPropertyOptional({
    description: 'Calculated discount amount based on purchase',
  })
  discountAmount?: number;

  @ApiPropertyOptional({
    description: 'Final price after discount',
  })
  finalPrice?: number;
}

export class CouponUsageStatsDto {
  @ApiProperty()
  couponId: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  totalUses: number;

  @ApiProperty()
  uniqueUsers: number;

  @ApiProperty()
  totalDiscountGiven: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  usageByDate: Record<string, number>;

  @ApiProperty()
  recentUsages: CouponUsageDto[];
}

export class CouponUsageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  couponId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  userEmail: string;

  @ApiProperty()
  discountApplied: number;

  @ApiProperty()
  usedAt: Date;

  @ApiPropertyOptional()
  creditPurchaseId?: string;

  @ApiPropertyOptional()
  keywordResearchId?: string;
}
