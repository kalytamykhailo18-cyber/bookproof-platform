import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Hero Section Content (Section 10.4)
 */
export class HeroContentDto {
  @ApiProperty({ example: 'Get Real Amazon Reviews' })
  @IsString()
  titleLine1: string;

  @ApiProperty({ example: 'From Verified Readers' })
  @IsString()
  titleLine2: string;

  @ApiPropertyOptional({ example: 'Launch Your Book to Success' })
  @IsString()
  @IsOptional()
  titleLine3?: string;

  @ApiProperty({ example: 'Connect with passionate readers who will provide honest reviews...' })
  @IsString()
  subtitle: string;

  @ApiProperty({ example: 'Get Started Free' })
  @IsString()
  ctaPrimary: string;

  @ApiProperty({ example: 'See How It Works' })
  @IsString()
  ctaSecondary: string;

  @ApiPropertyOptional({ example: '/images/hero.png' })
  @IsString()
  @IsOptional()
  heroImage?: string;
}

/**
 * How It Works Step
 */
export class HowItWorksStepDto {
  @ApiProperty({ example: 'Sign Up' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Create your free author account in minutes' })
  @IsString()
  description: string;

  @ApiProperty({ type: [String], example: ['Quick registration', 'No credit card required'] })
  @IsArray()
  @IsString({ each: true })
  details: string[];

  @ApiPropertyOptional({ example: '/images/step1.png' })
  @IsString()
  @IsOptional()
  image?: string;
}

/**
 * How It Works Section
 */
export class HowItWorksContentDto {
  @ApiProperty({ example: 'Simple Process' })
  @IsString()
  badge: string;

  @ApiProperty({ example: 'From Zero Reviews to Bestseller in 4 Steps' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Our streamlined process makes it easy...' })
  @IsString()
  subtitle: string;

  @ApiProperty({ type: [HowItWorksStepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HowItWorksStepDto)
  steps: HowItWorksStepDto[];

  @ApiProperty({ example: 'Start Your Campaign' })
  @IsString()
  ctaText: string;
}

/**
 * Benefit Item (For Authors / For Readers)
 */
export class BenefitItemDto {
  @ApiProperty({ example: 'dashboard' })
  @IsString()
  key: string;

  @ApiProperty({ example: 'Author Dashboard' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Track your campaigns and reviews in real-time' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'LayoutDashboard' })
  @IsString()
  @IsOptional()
  icon?: string;
}

/**
 * Benefits Section (For Authors / For Readers)
 */
export class BenefitsSectionDto {
  @ApiProperty({ example: 'For Authors' })
  @IsString()
  badge: string;

  @ApiProperty({ example: 'Everything an Author Needs to Launch Successfully' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Comprehensive tools and features...' })
  @IsString()
  subtitle: string;

  @ApiProperty({ type: [BenefitItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BenefitItemDto)
  items: BenefitItemDto[];

  @ApiProperty({ example: 'Start Your Campaign' })
  @IsString()
  ctaText: string;

  @ApiPropertyOptional({ example: 'No monthly subscription required' })
  @IsString()
  @IsOptional()
  note?: string;
}

/**
 * Pricing Package
 */
export class PricingPackageDto {
  @ApiProperty({ example: 'starter' })
  @IsString()
  key: string;

  @ApiProperty({ example: 'Starter' })
  @IsString()
  name: string;

  @ApiProperty({ example: '5 Credits' })
  @IsString()
  credits: string;

  @ApiProperty({ example: '5 Reviews' })
  @IsString()
  reviews: string;

  @ApiProperty({ example: '2-3 weeks' })
  @IsString()
  duration: string;

  @ApiProperty({ example: '6 months' })
  @IsString()
  validity: string;

  @ApiProperty({ type: [String], example: ['Priority support', 'Campaign dashboard'] })
  @IsArray()
  @IsString({ each: true })
  features: string[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isPopular?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isEnterprise?: boolean;
}

/**
 * Pricing Section
 */
export class PricingSectionDto {
  @ApiProperty({ example: 'Pricing' })
  @IsString()
  badge: string;

  @ApiProperty({ example: 'Simple, Transparent Pricing' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Choose the package that fits your needs' })
  @IsString()
  subtitle: string;

  @ApiProperty({ type: [PricingPackageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingPackageDto)
  packages: PricingPackageDto[];

  @ApiProperty({ example: 'Get Started' })
  @IsString()
  ctaText: string;

  @ApiProperty({ example: 'Contact Sales' })
  @IsString()
  enterpriseCta: string;

  @ApiPropertyOptional({ example: 'Prices set by admin' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ type: [String], example: ['Money-back guarantee', 'Real verified readers'] })
  @IsArray()
  @IsString({ each: true })
  allInclude: string[];
}

/**
 * Testimonial Item
 */
export class TestimonialDto {
  @ApiProperty({ example: 't1' })
  @IsString()
  key: string;

  @ApiProperty({ example: 'This platform changed my book launch completely!' })
  @IsString()
  quote: string;

  @ApiProperty({ example: 'Sarah Johnson' })
  @IsString()
  author: string;

  @ApiProperty({ example: 'Romance Author' })
  @IsString()
  title: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Romance' })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({ example: 'https://i.pravatar.cc/40?img=1' })
  @IsString()
  @IsOptional()
  avatar?: string;
}

/**
 * Testimonials Section
 */
export class TestimonialsSectionDto {
  @ApiProperty({ example: 'Success Stories' })
  @IsString()
  badge: string;

  @ApiProperty({ example: 'Authors Who Transformed Their Amazon Presence' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Join hundreds of successful authors' })
  @IsString()
  subtitle: string;

  @ApiProperty({ example: '4.9 average from 500+ authors' })
  @IsString()
  rating: string;

  @ApiProperty({ type: [TestimonialDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestimonialDto)
  items: TestimonialDto[];
}

/**
 * FAQ Item
 */
export class FaqItemDto {
  @ApiProperty({ example: 'q1' })
  @IsString()
  key: string;

  @ApiProperty({ example: 'How does BookProof work?' })
  @IsString()
  question: string;

  @ApiProperty({ example: 'BookProof connects authors with verified readers...' })
  @IsString()
  answer: string;
}

/**
 * FAQ Section
 */
export class FaqSectionDto {
  @ApiProperty({ example: 'FAQ' })
  @IsString()
  badge: string;

  @ApiProperty({ example: 'Frequently Asked Questions' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Everything you need to know' })
  @IsString()
  subtitle: string;

  @ApiProperty({ type: [FaqItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  items: FaqItemDto[];

  @ApiProperty({ example: 'Still have questions?' })
  @IsString()
  stillHaveTitle: string;

  @ApiProperty({ example: 'Our team is here to help' })
  @IsString()
  stillHaveDesc: string;
}

/**
 * Complete Landing Page Content Structure
 */
export class LandingPageContentDto {
  @ApiPropertyOptional({ type: HeroContentDto })
  @ValidateNested()
  @Type(() => HeroContentDto)
  @IsOptional()
  hero?: HeroContentDto;

  @ApiPropertyOptional({ type: HowItWorksContentDto })
  @ValidateNested()
  @Type(() => HowItWorksContentDto)
  @IsOptional()
  howItWorks?: HowItWorksContentDto;

  @ApiPropertyOptional({ type: BenefitsSectionDto })
  @ValidateNested()
  @Type(() => BenefitsSectionDto)
  @IsOptional()
  forAuthors?: BenefitsSectionDto;

  @ApiPropertyOptional({ type: BenefitsSectionDto })
  @ValidateNested()
  @Type(() => BenefitsSectionDto)
  @IsOptional()
  forReaders?: BenefitsSectionDto;

  @ApiPropertyOptional({ type: PricingSectionDto })
  @ValidateNested()
  @Type(() => PricingSectionDto)
  @IsOptional()
  pricing?: PricingSectionDto;

  @ApiPropertyOptional({ type: TestimonialsSectionDto })
  @ValidateNested()
  @Type(() => TestimonialsSectionDto)
  @IsOptional()
  testimonials?: TestimonialsSectionDto;

  @ApiPropertyOptional({ type: FaqSectionDto })
  @ValidateNested()
  @Type(() => FaqSectionDto)
  @IsOptional()
  faq?: FaqSectionDto;
}
