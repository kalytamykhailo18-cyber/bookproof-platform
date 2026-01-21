import { ApiProperty } from '@nestjs/swagger';
import { BookFormat, Language, CampaignStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

/**
 * Public Campaign DTO - Milestone 2.2
 *
 * Data exposed on public landing pages
 * Per requirements: "Landing pages are publicly accessible (no login required to view)"
 *
 * SECURITY: Only expose necessary information for public viewing
 * DO NOT expose:
 * - Credit information
 * - Internal metrics
 * - Author email/contact info
 * - Buffer/overbooking details
 */
export class PublicCampaignDto {
  @ApiProperty({ description: 'Campaign ID' })
  id: string;

  @ApiProperty({ description: 'Book title in requested language' })
  title: string;

  @ApiProperty({ description: 'Author name as appears on book' })
  authorName: string;

  @ApiProperty({ description: 'Book synopsis in requested language' })
  synopsis: string;

  @ApiProperty({ description: 'Book genre' })
  genre: string;

  @ApiProperty({ description: 'Book category' })
  category: string;

  @ApiProperty({ enum: BookFormat, description: 'Available book formats' })
  availableFormats: BookFormat;

  @ApiProperty({ required: false, description: 'Cover image URL' })
  coverImageUrl?: string;

  @ApiProperty({ required: false, description: 'Page count for ebooks' })
  pageCount?: number;

  @ApiProperty({ required: false, description: 'Audiobook duration in minutes' })
  audiobookDurationMinutes?: number;

  @ApiProperty({ required: false, description: 'Series name if part of a series' })
  seriesName?: string;

  @ApiProperty({ required: false, description: 'Book number in series' })
  seriesNumber?: number;

  @ApiProperty({ enum: CampaignStatus, description: 'Campaign status' })
  status: CampaignStatus;

  @ApiProperty({ description: 'Campaign URL slug' })
  slug: string;

  @ApiProperty({ description: 'Currently viewing language', enum: Language })
  viewingLanguage: Language;

  @ApiProperty({ description: 'Available languages for this campaign', type: [String] })
  availableLanguages: Language[];

  @ApiProperty({ description: 'Amazon product link' })
  amazonLink: string;

  @ApiProperty({ required: false, description: 'Amazon ASIN' })
  asin?: string;

  @ApiProperty({ required: false, description: 'Reading instructions for reviewers' })
  readingInstructions?: string;

  // Availability information - Milestone 2.2 requirement
  @ApiProperty({ description: 'Total spots available in campaign' })
  totalSpots: number;

  @ApiProperty({ description: 'Spots already taken' })
  spotsTaken: number;

  @ApiProperty({ description: 'Spots remaining' })
  spotsRemaining: number;

  @ApiProperty({ description: 'Whether campaign is accepting new registrations' })
  acceptingRegistrations: boolean;
}

/**
 * Track View DTO - Milestone 2.2
 */
export class TrackViewDto {
  @ApiProperty({ enum: Language, description: 'Language of viewed page' })
  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;
}

/**
 * Apply to Campaign (Public) DTO - Milestone 2.3
 *
 * Used for public registration flow
 * This endpoint checks authentication and redirects to login if needed
 */
export class ApplyToCampaignPublicDto {
  @ApiProperty({ enum: BookFormat, required: false, description: 'Preferred format (if campaign offers both)' })
  @IsEnum(BookFormat)
  formatPreference?: BookFormat;
}
