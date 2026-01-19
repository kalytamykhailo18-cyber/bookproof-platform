import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrackClickDto {
  @ApiProperty({
    description: 'Affiliate referral code from URL',
    example: 'ABC123',
  })
  @IsString()
  @IsNotEmpty()
  referralCode: string;

  @ApiPropertyOptional({
    description: 'Landing page URL',
    example: '/author/credits/purchase',
  })
  @IsOptional()
  @IsString()
  landingPage?: string;

  @ApiPropertyOptional({
    description: 'Referer URL (where the user came from)',
    example: 'https://www.mybookblog.com/bookproof-review',
  })
  @IsOptional()
  @IsString()
  refererUrl?: string;

  @ApiPropertyOptional({
    description: 'IP address (will be extracted from request if not provided)',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'User agent (will be extracted from request if not provided)',
    example: 'Mozilla/5.0...',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
