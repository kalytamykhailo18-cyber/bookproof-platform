import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsISO8601, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

/**
 * DTO for extending a reader's deadline
 */
export class ExtendDeadlineDto {
  @ApiProperty({
    description: 'Number of hours to extend deadline',
    example: 24,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  extensionHours: number;

  @ApiProperty({
    description: 'Reason for deadline extension',
    example: 'Reader reported technical issues accessing audiobook',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for shortening a reader's deadline
 */
export class ShortenDeadlineDto {
  @ApiProperty({
    description: 'Number of hours to shorten deadline by',
    example: 24,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  reductionHours: number;

  @ApiProperty({
    description: 'Reason for shortening deadline',
    example: 'Campaign ending soon, reader has had ample time',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for manual reassignment of reader to different book
 */
export class ReassignReaderDto {
  @ApiProperty({
    description: 'Target book ID for reassignment',
    example: 'cm1abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  targetBookId: string;

  @ApiProperty({
    description: 'Reason for reassignment',
    example: 'Reader requested genre change due to personal preference',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for bulk reassignment operations
 */
export class BulkReassignDto {
  @ApiProperty({
    description: 'Array of assignment IDs to reassign',
    example: ['cm1abc123', 'cm1def456', 'cm1ghi789'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  assignmentIds: string[];

  @ApiProperty({
    description: 'Target book ID for bulk reassignment',
    example: 'cm1xyz999',
  })
  @IsString()
  @IsNotEmpty()
  targetBookId: string;

  @ApiProperty({
    description: 'Reason for bulk reassignment',
    example: 'Original campaign cancelled, moving readers to similar book',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for cancelling an assignment
 */
export class CancelAssignmentDto {
  @ApiProperty({
    description: 'Reason for assignment cancellation',
    example: 'Reader violated platform terms of service',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description: 'Whether to refund credits to the author',
    example: true,
  })
  @IsOptional()
  refundCredits?: boolean;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for correcting assignment errors
 */
export class CorrectAssignmentErrorDto {
  @ApiProperty({
    description: 'Type of error correction',
    example: 'WRONG_FORMAT',
    enum: ['WRONG_FORMAT', 'WRONG_BOOK', 'DUPLICATE', 'MISSING_CREDITS', 'OTHER'],
  })
  @IsString()
  @IsNotEmpty()
  errorType: 'WRONG_FORMAT' | 'WRONG_BOOK' | 'DUPLICATE' | 'MISSING_CREDITS' | 'OTHER';

  @ApiProperty({
    description: 'Action taken to correct the error',
    example: 'Changed format from ebook to audiobook',
  })
  @IsString()
  @IsNotEmpty()
  correctionAction: string;

  @ApiProperty({
    description: 'Description of the error',
    example: 'Reader was assigned ebook but prefers audiobook',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Additional notes for audit trail',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * Response DTO for bulk reassignment results
 */
export class BulkReassignResultDto {
  @ApiProperty({ description: 'Total assignments processed', example: 10 })
  totalProcessed: number;

  @ApiProperty({ description: 'Successfully reassigned', example: 8 })
  successCount: number;

  @ApiProperty({ description: 'Failed reassignments', example: 2 })
  failureCount: number;

  @ApiProperty({
    description: 'Details of reassignments',
    type: 'array',
    example: [
      { assignmentId: 'cm1abc123', success: true },
      { assignmentId: 'cm1def456', success: false, error: 'Reader already has assignment for this book' }
    ]
  })
  results: Array<{
    assignmentId: string;
    success: boolean;
    error?: string;
  }>;
}

/**
 * Response DTO for assignment exception details
 */
export class AssignmentExceptionDto {
  @ApiProperty({ description: 'Assignment ID (used as id for frontend compatibility)' })
  id: string;

  @ApiProperty({ description: 'Book ID' })
  bookId: string;

  @ApiProperty({ description: 'Book title' })
  bookTitle: string;

  @ApiProperty({ description: 'Reader profile ID' })
  readerProfileId: string;

  @ApiProperty({ description: 'Reader name' })
  readerName: string;

  @ApiProperty({ description: 'Exception type' })
  exceptionType: 'EXPIRED' | 'DEADLINE_EXTENSION' | 'REASSIGNMENT' | 'CANCELLATION' | 'ERROR_CORRECTION';

  @ApiProperty({ description: 'Exception reason' })
  reason: string;

  @ApiProperty({ description: 'Current status' })
  status: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: string;

  @ApiPropertyOptional({ description: 'Resolution timestamp' })
  resolvedAt?: string;
}
