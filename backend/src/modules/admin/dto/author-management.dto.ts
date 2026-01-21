import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO for suspending an author
 */
export class SuspendAuthorDto {
  @ApiProperty({
    description: 'Reason for suspending the author',
    example: 'Payment fraud detected',
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
 * DTO for unsuspending an author
 */
export class UnsuspendAuthorDto {
  @ApiProperty({
    description: 'Reason for unsuspending the author',
    example: 'Investigation completed, no fraud found',
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
 * DTO for updating author admin notes
 */
export class UpdateAuthorNotesDto {
  @ApiProperty({
    description: 'Admin notes for this author',
    example: 'VIP author. Requires priority support. Consistently high-quality campaigns.',
  })
  @IsString()
  @IsNotEmpty()
  adminNotes: string;
}
