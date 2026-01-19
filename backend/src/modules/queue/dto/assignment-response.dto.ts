import { ApiProperty } from '@nestjs/swagger';
import { AssignmentStatus, BookFormat } from '@prisma/client';

export class AssignmentBookDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  authorName: string;

  @ApiProperty()
  genre: string;

  @ApiProperty()
  coverImageUrl?: string;

  @ApiProperty({ description: 'Synopsis text content' })
  synopsis: string;

  @ApiProperty({ required: false, description: 'Synopsis PDF file URL (if provided by author)' })
  synopsisFileUrl?: string;

  @ApiProperty({ enum: BookFormat })
  availableFormats: BookFormat;
}

/**
 * Reader-facing Assignment Response DTO
 *
 * IMPORTANT: Per Rule 2 - "Buffer is completely invisible to authors"
 * This also applies to readers - they should NOT know if they are a buffer assignment.
 * The isBufferAssignment field is intentionally NOT exposed here.
 * It is only available to Admin users via admin-specific endpoints.
 */
export class AssignmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bookId: string;

  @ApiProperty({ type: AssignmentBookDto })
  book: AssignmentBookDto;

  @ApiProperty()
  readerProfileId: string;

  @ApiProperty({ enum: AssignmentStatus })
  status: AssignmentStatus;

  @ApiProperty({ enum: BookFormat, description: 'Format assigned to reader' })
  formatAssigned: BookFormat;

  @ApiProperty({ description: 'Credits value (1 for ebook, 2 for audiobook)' })
  creditsValue: number;

  @ApiProperty({ description: 'Queue position (null if already scheduled)', required: false })
  queuePosition?: number;

  @ApiProperty({ description: 'Scheduled week number (null if waiting)', required: false })
  scheduledWeek?: number;

  @ApiProperty({ description: 'Scheduled date for material release', required: false })
  scheduledDate?: Date;

  @ApiProperty({ description: 'When materials were released', required: false })
  materialsReleasedAt?: Date;

  @ApiProperty({ description: 'Deadline for submission (72 hours from release)', required: false })
  deadlineAt?: Date;

  @ApiProperty({ description: 'Hours remaining until deadline', required: false })
  hoursRemaining?: number;

  // NOTE: isBufferAssignment intentionally NOT exposed per Rule 2
  // Buffer assignments are completely invisible to both authors AND readers

  @ApiProperty({ description: 'Ebook file URL (only available after materials released)', required: false })
  ebookFileUrl?: string;

  @ApiProperty({ description: 'Audiobook streaming URL (signed, 7-day expiry)', required: false })
  audioBookStreamUrl?: string;

  @ApiProperty({ description: 'When ebook was downloaded', required: false })
  ebookDownloadedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
