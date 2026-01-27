import { IsString, IsUrl, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a Stripe checkout session for keyword research
 */
export class CreateKeywordResearchCheckoutDto {
  @ApiProperty({
    description: 'URL to redirect after successful payment',
    example: 'https://bookproof.app/author/keyword-research/123?success=true',
  })
  @IsString()
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  successUrl: string;

  @ApiProperty({
    description: 'URL to redirect if payment is cancelled',
    example: 'https://bookproof.app/author/keyword-research/123?cancelled=true',
  })
  @IsString()
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  cancelUrl: string;
}

/**
 * Response from creating a checkout session
 */
export class KeywordResearchCheckoutResponseDto {
  @ApiProperty({ description: 'Stripe checkout session ID' })
  sessionId: string;

  @ApiProperty({ description: 'URL to redirect user for payment' })
  checkoutUrl: string;

  @ApiProperty({ description: 'Keyword research order ID' })
  keywordResearchId: string;

  @ApiProperty({ description: 'Amount to be charged' })
  amount: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;
}
