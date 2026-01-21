import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Language } from '@prisma/client';

/**
 * GDPR Data Export Response DTO
 *
 * Per requirements.md Section 15.3:
 * - Data export on request
 * - Complete user data package
 */
export class DataExportResponseDto {
  @ApiProperty({
    description: 'User personal information',
    example: {
      id: 'usr_123',
      email: 'user@example.com',
      name: 'John Doe',
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  })
  personalInfo: {
    id: string;
    email: string;
    name: string;
    companyName?: string;
    phone?: string;
    country?: string;
    preferredLanguage: string;
    preferredCurrency?: string;
    createdAt: Date;
    emailVerified: boolean;
    emailVerifiedAt?: Date;
  };

  @ApiPropertyOptional({
    description: 'Author profile data (if user is an author)',
  })
  authorProfile?: {
    totalCreditsPurchased: number;
    totalCreditsUsed: number;
    availableCredits: number;
    campaigns: Array<{
      id: string;
      bookTitle: string;
      status: string;
      createdAt: Date;
    }>;
    transactions: Array<{
      id: string;
      type: string;
      amount: number;
      date: Date;
      description: string;
    }>;
  };

  @ApiPropertyOptional({
    description: 'Reader profile data (if user is a reader)',
  })
  readerProfile?: {
    contentPreference: string;
    completedReviews: number;
    walletBalance: number;
    assignments: Array<{
      id: string;
      bookTitle: string;
      status: string;
      accessGrantedAt?: Date;
      submittedAt?: Date;
    }>;
    amazonProfiles: Array<{
      profileUrl: string;
      isVerified: boolean;
    }>;
  };

  @ApiPropertyOptional({
    description: 'Affiliate profile data (if user is an affiliate)',
  })
  affiliateProfile?: {
    referralCode: string;
    totalClicks: number;
    totalConversions: number;
    totalCommissionEarned: number;
    commissions: Array<{
      amount: number;
      status: string;
      date: Date;
    }>;
  };

  @ApiProperty({
    description: 'Consent records',
  })
  consents: Array<{
    type: string; // 'terms', 'marketing', 'privacy'
    accepted: boolean;
    acceptedAt?: Date;
    withdrawnAt?: Date;
  }>;

  @ApiProperty({
    description: 'Activity log (last 100 actions)',
  })
  activityLog: Array<{
    action: string;
    timestamp: Date;
    ipAddress?: string;
  }>;

  @ApiProperty({
    description: 'Export metadata',
  })
  exportMetadata: {
    generatedAt: Date;
    format: string;
    version: string;
  };
}

/**
 * Account Deletion Request DTO
 *
 * Per requirements.md Section 15.3:
 * - Data deletion on request
 * - User must confirm deletion
 */
export class DeleteAccountDto {
  @ApiProperty({
    description: 'Confirmation phrase to prevent accidental deletion',
    example: 'DELETE MY ACCOUNT',
  })
  @IsString()
  confirmationPhrase: string;

  @ApiPropertyOptional({
    description: 'Optional reason for account deletion (helps us improve)',
    example: 'No longer need the service',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * Account Deletion Response DTO
 */
export class DeleteAccountResponseDto {
  @ApiProperty({
    description: 'Confirmation message',
    example: 'Your account has been scheduled for deletion. You will receive a confirmation email.',
  })
  message: string;

  @ApiProperty({
    description: 'Deletion scheduled date (30-day grace period)',
    example: '2024-02-01T00:00:00.000Z',
  })
  scheduledDeletionDate: Date;

  @ApiProperty({
    description: 'Grace period in days',
    example: 30,
  })
  gracePeriodDays: number;
}

/**
 * Consent Update DTO
 *
 * For GDPR consent management
 */
export enum ConsentType {
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  PERSONALIZATION = 'personalization',
}

export class UpdateConsentDto {
  @ApiProperty({
    enum: ConsentType,
    description: 'Type of consent to update',
  })
  @IsEnum(ConsentType)
  consentType: ConsentType;

  @ApiProperty({
    description: 'Whether consent is granted',
    example: true,
  })
  granted: boolean;
}

/**
 * Consent Response DTO
 */
export class ConsentResponseDto {
  @ApiProperty({
    enum: ConsentType,
    description: 'Type of consent',
  })
  consentType: ConsentType;

  @ApiProperty({
    description: 'Whether consent is currently granted',
  })
  granted: boolean;

  @ApiProperty({
    description: 'When consent was last updated',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'When consent was first granted (if ever)',
  })
  grantedAt?: Date;

  @ApiPropertyOptional({
    description: 'When consent was withdrawn (if applicable)',
  })
  withdrawnAt?: Date;
}

/**
 * Update Language Preference DTO
 *
 * Allows users to change their preferred language for the platform interface
 * and email notifications.
 */
export class UpdateLanguageDto {
  @ApiProperty({
    enum: Language,
    description: 'Preferred language for the platform',
    example: 'EN',
  })
  @IsEnum(Language)
  preferredLanguage: Language;
}

/**
 * Language Update Response DTO
 */
export class UpdateLanguageResponseDto {
  @ApiProperty({
    description: 'Confirmation message',
    example: 'Language preference updated successfully',
  })
  message: string;

  @ApiProperty({
    enum: Language,
    description: 'New preferred language',
    example: 'EN',
  })
  preferredLanguage: Language;
}
