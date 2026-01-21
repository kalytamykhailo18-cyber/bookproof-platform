import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDecimal, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

/**
 * DTO for suspending a reader
 */
export class SuspendReaderDto {
  @ApiProperty({
    description: 'Reason for suspending the reader',
    example: 'Multiple violations of review quality standards',
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
 * DTO for unsuspending a reader
 */
export class UnsuspendReaderDto {
  @ApiProperty({
    description: 'Reason for unsuspending the reader',
    example: 'Violation resolved, performance improved',
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
 * DTO for adjusting reader wallet balance
 */
export class AdjustWalletBalanceDto {
  @ApiProperty({
    description: 'Amount to adjust (positive for addition, negative for deduction)',
    example: 25.5,
  })
  @IsDecimal()
  amount: number;

  @ApiProperty({
    description: 'Reason for wallet adjustment',
    example: 'Compensation for system error',
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
 * DTO for updating reader admin notes
 */
export class UpdateReaderNotesDto {
  @ApiProperty({
    description: 'Admin notes for this reader',
    example: 'Consistently provides high-quality reviews. Preferred for premium campaigns.',
  })
  @IsString()
  @IsNotEmpty()
  adminNotes: string;
}

/**
 * DTO for flagging a reader
 */
export class FlagReaderDto {
  @ApiProperty({
    description: 'Reason for flagging the reader',
    example: 'Suspicious review patterns detected',
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
 * DTO for unflagging a reader
 */
export class UnflagReaderDto {
  @ApiProperty({
    description: 'Reason for removing the flag',
    example: 'Investigation completed, no issues found',
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
 * DTO for adding admin note to reader
 */
export class AddAdminNoteDto {
  @ApiProperty({
    description: 'Note content',
    example: 'Contacted reader about review quality improvements',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
