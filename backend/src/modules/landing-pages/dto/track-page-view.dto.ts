import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional } from 'class-validator';
import { Language } from '@prisma/client';

export class TrackPageViewDto {
  @ApiProperty({ enum: Language, example: Language.EN })
  @IsEnum(Language)
  language: Language;

  @ApiProperty({ example: 'google', required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ example: 'cpc', required: false })
  @IsString()
  @IsOptional()
  medium?: string;

  @ApiProperty({ example: 'spring_2024', required: false })
  @IsString()
  @IsOptional()
  campaign?: string;

  @ApiProperty({ example: 'banner_ad', required: false, description: 'utm_content parameter' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ example: 'book_marketing', required: false, description: 'utm_term parameter' })
  @IsString()
  @IsOptional()
  term?: string;

  @ApiProperty({ example: 'AFF123', required: false, description: 'Affiliate referral code (ref parameter)' })
  @IsString()
  @IsOptional()
  affiliateRef?: string;

  @ApiProperty({ example: 'https://google.com', required: false })
  @IsString()
  @IsOptional()
  referrer?: string;

  @ApiProperty({ example: '192.168.1.1', required: false })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiProperty({ example: 'US', required: false })
  @IsString()
  @IsOptional()
  country?: string;
}

export class TrackPageViewResponseDto {
  @ApiProperty()
  success: boolean;
}
