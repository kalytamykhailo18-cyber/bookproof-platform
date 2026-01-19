import { ApiProperty } from '@nestjs/swagger';

export class CreditPurchaseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  authorProfileId: string;

  @ApiProperty()
  credits: number;

  @ApiProperty()
  amountPaid: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  validityDays: number;

  @ApiProperty()
  purchaseDate: Date;

  @ApiProperty()
  activationWindowExpiresAt: Date;

  @ApiProperty()
  activated: boolean;

  @ApiProperty({ required: false })
  activatedAt?: Date;

  @ApiProperty()
  paymentStatus: string;

  @ApiProperty({ required: false })
  discountApplied?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
