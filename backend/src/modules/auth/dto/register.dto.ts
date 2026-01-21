import { IsEmail, IsString, IsEnum, IsOptional, IsBoolean, Equals, IsArray, IsUrl, MaxLength, MinLength, ArrayMaxSize, ValidateIf, Matches, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, Language, ContentPreference } from '@prisma/client';
import { IsStrongPassword } from '@common/decorators/strong-password.decorator';

/**
 * Allowed roles for self-registration.
 * Per requirements.md:
 * - Section 1.1: Authors can self-register
 * - Section 1.2: Readers can self-register
 * - Section 1.3: Admins are created by Super Admin ONLY (not self-registration)
 * - Section 1.4: Closers are created by Admin ONLY (not self-registration)
 * - Section 1.5: Affiliates can self-register (pending approval)
 */
const ALLOWED_REGISTRATION_ROLES = [UserRole.AUTHOR, UserRole.READER, UserRole.AFFILIATE] as const;

/**
 * Registration DTO matching requirements.md Sections 1.1, 1.2, and 1.5
 *
 * Author Registration Fields (Section 1.1):
 * - email (required, unique, validated)
 * - password (min 8 chars, uppercase, lowercase, number, special char)
 * - name (required)
 * - companyName (optional) - for authors
 * - country (required)
 * - preferredLanguage (required: EN, PT, ES)
 * - termsAccepted (required)
 * - marketingConsent (optional)
 *
 * Reader Registration Additional Fields (Section 1.2):
 * - contentPreference (required: EBOOK, AUDIOBOOK, BOTH)
 * - amazonProfileLinks (optional, max 3, validated URLs)
 *
 * Affiliate Registration Additional Fields (Section 1.5):
 * - websiteUrl (required)
 * - socialMediaUrls (optional)
 * - promotionPlan (required, 50-1000 chars)
 * - estimatedReach (optional)
 * - preferredSlug (optional, lowercase/numbers/hyphens only)
 * - paypalEmail (optional, for payments)
 */
export class RegisterDto {
  @ApiPropertyOptional({
    description: 'reCAPTCHA v3 token for bot protection (required when CAPTCHA is enabled)',
    example: '03AGdBq24PBCb...',
  })
  @IsString()
  @IsOptional()
  captchaToken?: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address (required, must be unique)'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
    minLength: 8,
  })
  @IsString()
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name (required)'
  })
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty({
    enum: [UserRole.AUTHOR, UserRole.READER, UserRole.AFFILIATE],
    example: UserRole.AUTHOR,
    description: 'User role (AUTHOR, READER, or AFFILIATE only - ADMIN and CLOSER cannot self-register)'
  })
  @IsIn(ALLOWED_REGISTRATION_ROLES, {
    message: 'Role must be AUTHOR, READER, or AFFILIATE. Admin and Closer accounts must be created by administrators.',
  })
  role: UserRole;

  @ApiPropertyOptional({
    example: 'Acme Publishing',
    description: 'Company name (optional, for authors only)'
  })
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Company name must not exceed 200 characters' })
  companyName?: string;

  @ApiProperty({
    enum: Language,
    example: Language.EN,
    description: 'Preferred language (required: EN, PT, ES)'
  })
  @IsEnum(Language)
  preferredLanguage: Language;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'Preferred currency'
  })
  @IsString()
  @IsOptional()
  preferredCurrency?: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Phone number (optional)'
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'US',
    description: 'Country code (required)'
  })
  @IsString()
  @MinLength(2, { message: 'Country is required' })
  country: string;

  @ApiProperty({
    example: true,
    description: 'User must accept terms of service (required, must be true)'
  })
  @IsBoolean()
  @Equals(true, { message: 'You must accept the terms of service to register' })
  termsAccepted: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Marketing consent checkbox (optional)'
  })
  @IsBoolean()
  @IsOptional()
  marketingConsent?: boolean;

  @ApiPropertyOptional({
    enum: ContentPreference,
    example: ContentPreference.BOTH,
    description: 'Content format preference for readers (required when role is READER)'
  })
  @IsEnum(ContentPreference)
  @ValidateIf(o => o.role === UserRole.READER)
  contentPreference?: ContentPreference;

  @ApiPropertyOptional({
    example: ['https://www.amazon.com/gp/profile/amzn1.account.ABC123'],
    description: 'Amazon profile URLs for readers (optional, maximum 3 links, validated URL format)'
  })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(3, { message: 'Maximum 3 Amazon profile links allowed' })
  @IsUrl({}, { each: true, message: 'Each Amazon profile link must be a valid URL' })
  amazonProfileLinks?: string[];

  // =====================
  // Affiliate-specific fields (Section 1.5)
  // =====================

  @ApiPropertyOptional({
    example: 'https://mybookblog.com',
    description: 'Website URL (required for affiliates)'
  })
  @IsUrl({}, { message: 'Please provide a valid website URL' })
  @ValidateIf(o => o.role === UserRole.AFFILIATE)
  websiteUrl?: string;

  @ApiPropertyOptional({
    example: 'https://twitter.com/myblog, https://instagram.com/myblog',
    description: 'Social media URLs (optional, comma-separated)'
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Social media URLs must not exceed 1000 characters' })
  socialMediaUrls?: string;

  @ApiPropertyOptional({
    example: 'I run a book review blog with 50k monthly visitors and will promote BookProof through dedicated blog posts and email newsletters.',
    description: 'Promotion plan description (required for affiliates, 50-1000 characters)'
  })
  @IsString()
  @ValidateIf(o => o.role === UserRole.AFFILIATE)
  @MinLength(50, { message: 'Promotion plan must be at least 50 characters' })
  @MaxLength(1000, { message: 'Promotion plan must not exceed 1000 characters' })
  promotionPlan?: string;

  @ApiPropertyOptional({
    example: '50,000 monthly blog visitors, 10,000 email subscribers',
    description: 'Estimated audience reach (optional)'
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Estimated reach must not exceed 500 characters' })
  estimatedReach?: string;

  @ApiPropertyOptional({
    example: 'my-book-blog',
    description: 'Preferred custom referral slug (optional, lowercase letters, numbers, hyphens only)'
  })
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9-]+$/, { message: 'Referral slug must contain only lowercase letters, numbers, and hyphens' })
  @MinLength(3, { message: 'Referral slug must be at least 3 characters' })
  @MaxLength(50, { message: 'Referral slug must not exceed 50 characters' })
  preferredSlug?: string;

  @ApiPropertyOptional({
    example: 'payments@mybookblog.com',
    description: 'PayPal email for receiving payments (optional)'
  })
  @IsEmail({}, { message: 'Please provide a valid PayPal email address' })
  @IsOptional()
  paypalEmail?: string;
}
