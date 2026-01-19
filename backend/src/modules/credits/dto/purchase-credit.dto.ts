import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class PurchaseCreditDto {
  @ApiProperty({ description: 'Package tier ID to purchase' })
  @IsString()
  packageTierId: string;

  @ApiProperty({ description: 'Coupon code', required: false })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiProperty({ description: 'Include keyword research service', required: false })
  @IsBoolean()
  @IsOptional()
  includeKeywordResearch?: boolean;

  @ApiProperty({ description: 'Success URL for Stripe redirect' })
  @IsString()
  successUrl: string;

  @ApiProperty({ description: 'Cancel URL for Stripe redirect' })
  @IsString()
  cancelUrl: string;
}
