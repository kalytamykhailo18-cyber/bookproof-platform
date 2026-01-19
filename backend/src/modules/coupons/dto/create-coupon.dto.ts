import { IsString, IsEnum, IsOptional, IsInt, IsBoolean, IsDateString, IsNumber, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponType, CouponAppliesTo } from '@prisma/client';

export class CreateCouponDto {
  @ApiProperty({
    description: 'Unique coupon code (will be converted to uppercase)',
    example: 'SUMMER2024',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Type of discount',
    enum: CouponType,
    example: CouponType.PERCENTAGE,
  })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({
    description: 'What the coupon applies to',
    enum: CouponAppliesTo,
    example: CouponAppliesTo.CREDITS,
  })
  @IsEnum(CouponAppliesTo)
  appliesTo: CouponAppliesTo;

  @ApiPropertyOptional({
    description: 'Discount percentage (0-100, required if type is PERCENTAGE)',
    example: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @ApiPropertyOptional({
    description: 'Discount amount in dollars (required if type is FIXED_AMOUNT)',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({
    description: 'Minimum purchase amount required to use coupon',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumPurchase?: number;

  @ApiPropertyOptional({
    description: 'Minimum credits required to use coupon',
    example: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  minimumCredits?: number;

  @ApiPropertyOptional({
    description: 'Maximum total uses (null = unlimited)',
    example: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @ApiProperty({
    description: 'Maximum uses per user',
    example: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  maxUsesPerUser: number;

  @ApiProperty({
    description: 'Whether the coupon is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Date when coupon becomes valid',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  validFrom: string;

  @ApiPropertyOptional({
    description: 'Date when coupon expires (null = no expiration)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @ApiPropertyOptional({
    description: 'Purpose or description of the coupon',
    example: 'Summer promotion for new authors',
  })
  @IsOptional()
  @IsString()
  purpose?: string;
}
