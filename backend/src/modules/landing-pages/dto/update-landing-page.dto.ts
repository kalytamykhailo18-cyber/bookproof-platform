import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Language } from '@prisma/client';

export class LandingPageCtaDto {
  @ApiProperty({ example: 'Join Waitlist' })
  @IsString()
  ctaText: string;

  @ApiProperty({ example: '/auth/register' })
  @IsString()
  ctaLink: string;

  @ApiProperty({ enum: ['PRE_LAUNCH', 'LIVE'], example: 'PRE_LAUNCH' })
  @IsString()
  ctaMode: 'PRE_LAUNCH' | 'LIVE';
}

export class LandingPageSeoDto {
  @ApiProperty({ example: 'BookProof - Get Real Amazon Reviews', required: false })
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiProperty({
    example: 'Connect with verified readers to get authentic Amazon reviews for your book.',
    required: false,
  })
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiProperty({
    example: 'amazon reviews, book marketing, author marketing',
    required: false,
  })
  @IsString()
  @IsOptional()
  metaKeywords?: string;
}

export class LandingPageContentBlockDto {
  @ApiProperty({ example: 'hero' })
  @IsString()
  section: string;

  @ApiProperty({ example: { title: 'Welcome', subtitle: 'Get started' } })
  content: Record<string, unknown>;
}

export class UpdateLandingPageDto {
  @ApiProperty({ enum: Language, example: Language.EN })
  @IsEnum(Language)
  language: Language;

  @ApiProperty({ required: false, description: 'JSON content blocks for the landing page' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ required: false, type: LandingPageSeoDto })
  @ValidateNested()
  @Type(() => LandingPageSeoDto)
  @IsOptional()
  seo?: LandingPageSeoDto;

  @ApiProperty({ required: false, type: LandingPageCtaDto })
  @ValidateNested()
  @Type(() => LandingPageCtaDto)
  @IsOptional()
  cta?: LandingPageCtaDto;

  @ApiProperty({ required: false, example: true })
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class LandingPageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: Language })
  language: Language;

  @ApiProperty()
  content: string;

  @ApiProperty({ required: false })
  metaTitle?: string;

  @ApiProperty({ required: false })
  metaDescription?: string;

  @ApiProperty({ required: false })
  metaKeywords?: string;

  @ApiProperty()
  isPublished: boolean;

  @ApiProperty({ required: false })
  publishedAt?: Date;

  @ApiProperty()
  ctaText: string;

  @ApiProperty()
  ctaLink: string;

  @ApiProperty()
  ctaMode: string;

  @ApiProperty()
  totalViews: number;

  @ApiProperty()
  totalLeads: number;

  @ApiProperty({ required: false })
  conversionRate?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class GetLandingPageLeadsDto {
  @ApiProperty({ enum: Language, required: false })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  userType?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ required: false, default: 1 })
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  limit?: number;
}

export class LandingPageLeadResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ enum: Language })
  language: Language;

  @ApiProperty({ required: false })
  userType?: string;

  @ApiProperty({ required: false })
  source?: string;

  @ApiProperty({ required: false })
  medium?: string;

  @ApiProperty({ required: false })
  campaign?: string;

  @ApiProperty({ required: false, description: 'utm_content parameter' })
  content?: string;

  @ApiProperty({ required: false, description: 'utm_term parameter' })
  term?: string;

  @ApiProperty({ required: false, description: 'Affiliate referral code' })
  affiliateRef?: string;

  @ApiProperty({ required: false })
  country?: string;

  @ApiProperty()
  marketingConsent: boolean;

  @ApiProperty()
  welcomeEmailSent: boolean;

  @ApiProperty()
  converted: boolean;

  @ApiProperty({ required: false })
  convertedAt?: Date;

  @ApiProperty()
  createdAt: Date;
}

export class LeadsListResponseDto {
  @ApiProperty({ type: [LandingPageLeadResponseDto] })
  leads: LandingPageLeadResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class ExportLeadsDto {
  @ApiProperty({ enum: Language, required: false })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;

  @ApiProperty({ enum: ['csv', 'json'], default: 'csv' })
  @IsString()
  @IsOptional()
  format?: 'csv' | 'json';
}
