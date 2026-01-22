import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Chart data DTOs for Section 6.1
export class ChartDataPointDto {
  @ApiProperty({ description: 'Date of the data point' })
  date: string;

  @ApiProperty({ description: 'Value for the date' })
  value: number;
}

export class AffiliateChartDataDto {
  @ApiProperty({ type: [ChartDataPointDto], description: 'Clicks over the last 30 days' })
  clicks: ChartDataPointDto[];

  @ApiProperty({ type: [ChartDataPointDto], description: 'Conversions over the last 30 days' })
  conversions: ChartDataPointDto[];
}

// Referred Authors DTOs for Section 6.3
export class ReferredAuthorDto {
  @ApiProperty({ description: 'Referral ID' })
  id: string;

  @ApiProperty({ description: 'Author identifier (partial email)' })
  authorIdentifier: string;

  @ApiProperty({ description: 'Sign-up date' })
  signUpDate: Date;

  @ApiProperty({ description: 'Total purchases by this author' })
  totalPurchases: number;

  @ApiProperty({ description: 'Total commission earned from this author' })
  totalCommissionEarned: number;

  @ApiPropertyOptional({ description: 'Last purchase date' })
  lastPurchaseDate?: Date;
}

export class ReferredAuthorDetailDto extends ReferredAuthorDto {
  @ApiProperty({ description: 'Purchase history (amounts only)' })
  purchaseHistory: { amount: number; date: Date; commission: number }[];
}

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
