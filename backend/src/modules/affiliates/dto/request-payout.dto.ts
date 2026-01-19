import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentMethod {
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WISE = 'WISE',
  CRYPTO = 'CRYPTO',
}

export class RequestPayoutDto {
  @ApiProperty({
    description: 'Amount to withdraw (must be available in approved earnings)',
    example: 250.00,
    minimum: 50,
  })
  @IsNumber()
  @Min(50, { message: 'Minimum payout amount is $50' })
  amount: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.PAYPAL,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Payment details (e.g., PayPal email, bank account, wallet address)',
    example: 'affiliate@example.com',
  })
  @IsString()
  @IsNotEmpty()
  paymentDetails: string;

  @ApiPropertyOptional({
    description: 'Additional notes for admin',
    example: 'Please process ASAP, thank you!',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
