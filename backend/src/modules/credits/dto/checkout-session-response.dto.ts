import { ApiProperty } from '@nestjs/swagger';

export class CheckoutSessionResponseDto {
  @ApiProperty({ description: 'Stripe checkout session URL' })
  url: string;

  @ApiProperty({ description: 'Checkout session ID' })
  sessionId: string;
}
