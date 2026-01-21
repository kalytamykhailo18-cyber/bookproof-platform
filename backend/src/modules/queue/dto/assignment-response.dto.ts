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

  @ApiProperty({
    required: false,
    description: 'DEPRECATED: Direct synopsis file URL no longer exposed for security. Use synopsisStreamUrl from assignment instead.',
    deprecated: true
  })
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

  // SECURITY: Section 11 File Storage and Security Compliance
  // All file access now goes through secure streaming endpoints with server-side validation

  @ApiProperty({
    description: 'DEPRECATED: Direct ebook file URL no longer exposed for security. Use ebookStreamUrl instead.',
    required: false,
    deprecated: true
  })
  ebookFileUrl?: string;

  @ApiProperty({
    description: 'Secure ebook streaming endpoint (requires auth, 72-hour deadline enforced)',
    required: false,
    example: '/api/queue/assignments/cuid123/stream-ebook'
  })
  ebookStreamUrl?: string;

  @ApiProperty({
    description: 'Secure audiobook streaming endpoint (requires auth, 7-day access window enforced)',
    required: false,
    example: '/api/queue/assignments/cuid123/stream-audio'
  })
  audioBookStreamUrl?: string;

  @ApiProperty({
    description: 'Secure synopsis streaming endpoint (requires auth, follows format expiration rules)',
    required: false,
    example: '/api/queue/assignments/cuid123/stream-synopsis'
  })
  synopsisStreamUrl?: string;

  @ApiProperty({ description: 'When ebook was first downloaded', required: false })
  ebookDownloadedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
