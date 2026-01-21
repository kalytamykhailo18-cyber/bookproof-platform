import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KeywordResearchStatus, Language, TargetMarket } from '@prisma/client';

export class KeywordSet {
  @ApiProperty({ type: [String] })
  keywords: string[];
}

export class UsageGuideline {
  @ApiProperty()
  location: string;

  @ApiProperty()
  instruction: string;

  @ApiProperty({ type: [String] })
  examples: string[];
}

export class KeywordResearchResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  authorProfileId: string;

  @ApiPropertyOptional({ description: 'Book ID (optional for standalone purchases)' })
  bookId?: string;

  @ApiProperty()
  bookTitle: string;

  @ApiProperty()
  genre: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  targetAudience: string;

  @ApiPropertyOptional()
  competingBooks?: string;

  @ApiPropertyOptional()
  specificKeywords?: string;

  @ApiProperty({ enum: Language })
  bookLanguage: Language;

  @ApiProperty({ enum: TargetMarket })
  targetMarket: TargetMarket;

  @ApiPropertyOptional()
  additionalNotes?: string;

  @ApiPropertyOptional()
  primaryKeywords?: string[];

  @ApiPropertyOptional()
  secondaryKeywords?: string[];

  @ApiPropertyOptional()
  longTailKeywords?: string[];

  @ApiPropertyOptional({ type: [UsageGuideline] })
  usageGuidelines?: UsageGuideline[];

  @ApiPropertyOptional()
  kdpSuggestions?: any;

  @ApiPropertyOptional()
  pdfUrl?: string;

  @ApiPropertyOptional()
  pdfFileName?: string;

  @ApiPropertyOptional()
  pdfGeneratedAt?: Date;

  @ApiProperty({ enum: KeywordResearchStatus })
  status: KeywordResearchStatus;

  @ApiPropertyOptional()
  processingStartedAt?: Date;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiPropertyOptional()
  errorMessage?: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  paid: boolean;

  @ApiPropertyOptional()
  paidAt?: Date;

  @ApiPropertyOptional()
  couponId?: string;

  @ApiPropertyOptional()
  emailedAt?: Date;

  @ApiProperty()
  emailDelivered: boolean;

  @ApiProperty()
  downloadCount: number;

  @ApiPropertyOptional()
  lastDownloadedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<KeywordResearchResponseDto>) {
    Object.assign(this, partial);
  }
}

export class KeywordResearchListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bookTitle: string;

  @ApiProperty({ enum: KeywordResearchStatus })
  status: KeywordResearchStatus;

  @ApiProperty()
  price: number;

  @ApiProperty()
  paid: boolean;

  @ApiPropertyOptional()
  pdfUrl?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional()
  completedAt?: Date;
}
