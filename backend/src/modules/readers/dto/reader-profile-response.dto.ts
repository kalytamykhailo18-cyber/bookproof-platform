import { ApiProperty } from '@nestjs/swagger';
import { ContentPreference } from '@prisma/client';

export class AmazonProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  profileUrl: string;

  @ApiProperty({ required: false })
  profileName?: string;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty({ required: false })
  verifiedAt?: Date;

  @ApiProperty()
  createdAt: Date;
}

export class ReaderProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: ContentPreference })
  contentPreference: ContentPreference;

  @ApiProperty({ type: [AmazonProfileDto] })
  amazonProfiles: AmazonProfileDto[];

  @ApiProperty({ description: 'Wallet balance in USD', example: 125.50 })
  walletBalance: number;

  @ApiProperty({ description: 'Total earned in USD', example: 500.00 })
  totalEarned: number;

  @ApiProperty({ description: 'Total withdrawn in USD', example: 374.50 })
  totalWithdrawn: number;

  @ApiProperty({ description: 'Reviews completed', example: 25 })
  reviewsCompleted: number;

  @ApiProperty({ description: 'Reviews expired', example: 2 })
  reviewsExpired: number;

  @ApiProperty({ description: 'Reviews rejected', example: 1 })
  reviewsRejected: number;

  @ApiProperty({ description: 'Average internal rating (1-5)', example: 4.5, required: false })
  averageInternalRating?: number;

  @ApiProperty({ description: 'Reliability score (0-100)', example: 95.5, required: false })
  reliabilityScore?: number;

  @ApiProperty({ description: 'Completion rate percentage', example: 92.3, required: false })
  completionRate?: number;

  @ApiProperty({ description: 'Reviews removed by Amazon', example: 0 })
  reviewsRemovedByAmazon: number;

  @ApiProperty({ description: 'Removal rate percentage', example: 0.0, required: false })
  removalRate?: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isFlagged: boolean;

  @ApiProperty({ required: false })
  flagReason?: string;

  @ApiProperty({ type: [String] })
  preferredGenres: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
