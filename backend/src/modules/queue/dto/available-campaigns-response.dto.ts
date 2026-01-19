import { ApiProperty } from '@nestjs/swagger';
import { BookFormat, Language, CampaignStatus } from '@prisma/client';

export class AvailableCampaignDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  authorName: string;

  @ApiProperty()
  synopsis: string;

  @ApiProperty({ enum: Language })
  language: Language;

  @ApiProperty()
  genre: string;

  @ApiProperty()
  category: string;

  @ApiProperty({ enum: BookFormat })
  availableFormats: BookFormat;

  @ApiProperty({ required: false })
  coverImageUrl?: string;

  // NOTE: targetReviews and totalReviewsDelivered removed
  // Per requirement: "Readers cannot see total campaign scope or author information"

  @ApiProperty({ enum: CampaignStatus })
  status: CampaignStatus;

  @ApiProperty({ description: 'Whether reader has already applied' })
  hasApplied: boolean;

  @ApiProperty({ description: 'Estimated queue position if reader applies now', required: false })
  estimatedQueuePosition?: number;

  @ApiProperty({ description: 'Estimated week when materials might be released', required: false })
  estimatedWeek?: number;

  @ApiProperty({ description: 'Page count (if ebook)', required: false })
  pageCount?: number;

  @ApiProperty({ description: 'Audiobook duration in minutes (if audiobook)', required: false })
  audioBookDuration?: number;

  @ApiProperty()
  createdAt: Date;
}
