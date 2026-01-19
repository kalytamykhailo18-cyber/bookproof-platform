import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ManualApplyCouponDto {
  @ApiProperty({
    description: 'Coupon code to apply',
    example: 'SUMMER2024',
  })
  @IsString()
  @IsNotEmpty()
  couponCode: string;

  @ApiProperty({
    description: 'User ID to apply coupon for',
    example: 'clxxx...',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({
    description: 'Credit purchase ID if applying to existing purchase',
    example: 'clxxx...',
  })
  @IsOptional()
  @IsString()
  creditPurchaseId?: string;

  @ApiPropertyOptional({
    description: 'Keyword research ID if applying to existing research order',
    example: 'clxxx...',
  })
  @IsOptional()
  @IsString()
  keywordResearchId?: string;

  @ApiPropertyOptional({
    description: 'Admin note explaining why coupon was manually applied',
    example: 'Customer forgot to apply coupon at checkout',
  })
  @IsOptional()
  @IsString()
  adminNote?: string;
}
