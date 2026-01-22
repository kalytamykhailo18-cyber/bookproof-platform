import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommissionStatus } from '@prisma/client';

export class CommissionResponseDto {
  @ApiProperty({ description: 'Commission ID' })
  id: string;

  @ApiProperty({ description: 'Affiliate profile ID' })
  affiliateProfileId: string;

  @ApiProperty({ description: 'Credit purchase ID' })
  creditPurchaseId: string;

  @ApiProperty({ description: 'Referred author ID' })
  referredAuthorId: string;

  @ApiProperty({ description: 'Author identifier (partial email for privacy)' })
  authorIdentifier: string;

  @ApiProperty({ description: 'Purchase amount' })
  purchaseAmount: number;

  @ApiProperty({ description: 'Commission amount' })
  commissionAmount: number;

  @ApiProperty({ description: 'Commission rate applied' })
  commissionRate: number;

  @ApiProperty({
    description: 'Commission status',
    enum: CommissionStatus,
  })
  status: CommissionStatus;

  @ApiPropertyOptional({ description: 'Date when commission becomes approved' })
  pendingUntil?: Date;

  @ApiPropertyOptional({ description: 'Approval date' })
  approvedAt?: Date;

  @ApiPropertyOptional({ description: 'Payment date' })
  paidAt?: Date;

  @ApiPropertyOptional({ description: 'Cancellation date' })
  cancelledAt?: Date;

  @ApiPropertyOptional({ description: 'Cancellation reason' })
  cancellationReason?: string;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}

export class CommissionListItemDto {
  @ApiProperty({ description: 'Commission ID' })
  id: string;

  @ApiProperty({ description: 'Purchase amount' })
  purchaseAmount: number;

  @ApiProperty({ description: 'Commission amount' })
  commissionAmount: number;

  @ApiProperty({ description: 'Commission status' })
  status: CommissionStatus;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Approval date' })
  approvedAt?: Date;
}
