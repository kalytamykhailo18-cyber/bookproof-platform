import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AffiliateStatsDto {
  @ApiProperty({ description: 'Total clicks on affiliate links' })
  totalClicks: number;

  @ApiProperty({ description: 'Total conversions (registered users)' })
  totalConversions: number;

  @ApiProperty({ description: 'Conversion rate as percentage' })
  conversionRate: number;

  @ApiProperty({ description: 'Total earnings (all time)' })
  totalEarnings: number;

  @ApiProperty({ description: 'Pending earnings (not yet approved)' })
  pendingEarnings: number;

  @ApiProperty({ description: 'Approved earnings (ready for payout)' })
  approvedEarnings: number;

  @ApiProperty({ description: 'Already paid earnings' })
  paidEarnings: number;

  @ApiProperty({ description: 'Number of referred authors' })
  totalReferrals: number;

  @ApiProperty({ description: 'Number of active referred authors (made purchases)' })
  activeReferrals: number;
}

export class AffiliateProfileResponseDto {
  @ApiProperty({ description: 'Affiliate profile ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'User email' })
  userEmail: string;

  @ApiProperty({ description: 'User name' })
  userName: string;

  @ApiProperty({ description: 'Unique referral code' })
  referralCode: string;

  @ApiPropertyOptional({ description: 'Custom slug for vanity URL' })
  customSlug?: string;

  @ApiProperty({ description: 'Commission rate as percentage' })
  commissionRate: number;

  @ApiProperty({ description: 'Whether lifetime commission is enabled' })
  lifetimeCommission: boolean;

  @ApiProperty({ description: 'Whether the affiliate is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Whether the affiliate application is approved' })
  isApproved: boolean;

  @ApiPropertyOptional({ description: 'Approval date' })
  approvedAt?: Date;

  @ApiPropertyOptional({ description: 'Website URL' })
  websiteUrl?: string;

  @ApiPropertyOptional({ description: 'Social media URLs' })
  socialMediaUrls?: string;

  @ApiPropertyOptional({ description: 'Promotion plan' })
  promotionPlan?: string;

  @ApiPropertyOptional({ description: 'Estimated reach' })
  estimatedReach?: string;

  @ApiPropertyOptional({ description: 'Rejection date' })
  rejectedAt?: Date;

  @ApiPropertyOptional({ description: 'Reason for rejection' })
  rejectionReason?: string;

  @ApiProperty({ description: 'Profile creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Affiliate statistics' })
  stats?: AffiliateStatsDto;
}

export class AffiliateListItemDto {
  @ApiProperty({ description: 'Affiliate profile ID' })
  id: string;

  @ApiProperty({ description: 'User email' })
  userEmail: string;

  @ApiProperty({ description: 'User name' })
  userName: string;

  @ApiProperty({ description: 'Referral code' })
  referralCode: string;

  @ApiProperty({ description: 'Commission rate' })
  commissionRate: number;

  @ApiProperty({ description: 'Total earnings' })
  totalEarnings: number;

  @ApiProperty({ description: 'Approved earnings' })
  approvedEarnings: number;

  @ApiProperty({ description: 'Total clicks' })
  totalClicks: number;

  @ApiProperty({ description: 'Total conversions' })
  totalConversions: number;

  @ApiProperty({ description: 'Is approved' })
  isApproved: boolean;

  @ApiProperty({ description: 'Is active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;
}
