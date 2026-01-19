import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidateCouponDto {
  @ApiProperty({
    description: 'Coupon code to validate',
    example: 'SUMMER2024',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({
    description: 'Purchase amount to check minimum requirements',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchaseAmount?: number;

  @ApiPropertyOptional({
    description: 'Number of credits to check minimum requirements',
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  credits?: number;
}
