import { ApiProperty } from '@nestjs/swagger';

export class CreditBalanceResponseDto {
  @ApiProperty()
  totalCreditsPurchased: number;

  @ApiProperty()
  totalCreditsUsed: number;

  @ApiProperty()
  availableCredits: number;

  @ApiProperty()
  activePurchases: number;

  @ApiProperty()
  expiringCredits: number;

  @ApiProperty({ required: false })
  nextExpirationDate?: Date;
}
