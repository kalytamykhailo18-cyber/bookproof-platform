import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PayoutAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  COMPLETE = 'COMPLETE',
}

export class ProcessPayoutDto {
  @ApiProperty({
    description: 'Action to take on the payout request',
    enum: PayoutAction,
    example: PayoutAction.APPROVE,
  })
  @IsEnum(PayoutAction)
  action: PayoutAction;

  @ApiPropertyOptional({
    description: 'Reason for rejection (required if action=REJECT)',
    example: 'Payment details incomplete',
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiPropertyOptional({
    description: 'Transaction ID or reference (for completed payouts)',
    example: 'TXN-20260114-12345',
  })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({
    description: 'Admin notes',
    example: 'Paid via PayPal on 2026-01-14',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
