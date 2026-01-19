import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PayoutRequestStatus } from '@prisma/client';

export class PayoutResponseDto {
  @ApiProperty({ description: 'Payout ID' })
  id: string;

  @ApiProperty({ description: 'Affiliate profile ID' })
  affiliateProfileId: string;

  @ApiProperty({ description: 'Payout amount' })
  amount: number;

  @ApiProperty({
    description: 'Payout status',
    enum: PayoutRequestStatus,
  })
  status: PayoutRequestStatus;

  @ApiProperty({ description: 'Payment method' })
  paymentMethod: string;

  @ApiPropertyOptional({ description: 'Payment details (masked)' })
  paymentDetailsMasked?: string;

  @ApiPropertyOptional({ description: 'Processed by admin user ID' })
  processedBy?: string;

  @ApiPropertyOptional({ description: 'Processing date' })
  processedAt?: Date;

  @ApiPropertyOptional({ description: 'Rejection reason' })
  rejectionReason?: string;

  @ApiPropertyOptional({ description: 'Admin notes' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Transaction ID' })
  transactionId?: string;

  @ApiPropertyOptional({ description: 'Payment completion date' })
  paidAt?: Date;

  @ApiProperty({ description: 'Request date' })
  requestedAt: Date;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class PayoutListItemDto {
  @ApiProperty({ description: 'Payout ID' })
  id: string;

  @ApiProperty({ description: 'Amount' })
  amount: number;

  @ApiProperty({ description: 'Status' })
  status: PayoutRequestStatus;

  @ApiProperty({ description: 'Payment method' })
  paymentMethod: string;

  @ApiProperty({ description: 'Request date' })
  requestedAt: Date;

  @ApiPropertyOptional({ description: 'Processing date' })
  processedAt?: Date;

  @ApiPropertyOptional({ description: 'Paid date' })
  paidAt?: Date;
}
