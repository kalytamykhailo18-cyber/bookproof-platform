import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum IssueResolutionStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
  RESUBMISSION_PENDING = 'RESUBMISSION_PENDING',
}

export class CreateIssueDto {
  @ApiProperty({
    description: 'Issue type',
    example: 'INVALID_LINK',
  })
  @IsString()
  issueType: string;

  @ApiProperty({
    description: 'Detailed description of the issue',
    example: 'The Amazon review link provided does not lead to a valid review.',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Issue severity (defaults to MEDIUM)',
    example: 'MEDIUM',
  })
  @IsString()
  @IsOptional()
  severity?: string;
}

export class ResolveIssueDto {
  @ApiProperty({
    description: 'Resolution status',
    enum: IssueResolutionStatus,
    example: IssueResolutionStatus.RESOLVED,
  })
  @IsEnum(IssueResolutionStatus)
  status: IssueResolutionStatus;

  @ApiProperty({
    description: 'Resolution description or notes',
    example: 'Reader provided correct Amazon review link after resubmission request.',
  })
  @IsString()
  resolution: string;

  @ApiPropertyOptional({
    description: 'Should reader be notified of resolution?',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  notifyReader?: boolean;

  @ApiPropertyOptional({
    description: 'Should resubmission be requested?',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  requestResubmission?: boolean;

  @ApiPropertyOptional({
    description: 'Should assignment be reassigned to another reader?',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  triggerReassignment?: boolean;
}

export class MarkAsRemovedByAmazonDto {
  @ApiProperty({
    description: 'Date when removal was detected',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  removalDate: string;

  @ApiPropertyOptional({
    description: 'Notes about the removal',
    example: 'Review no longer appears on Amazon product page',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * DTO for requesting resubmission with deadline
 */
export class RequestResubmissionDto {
  @ApiProperty({
    description: 'Instructions for the reader on what needs to be corrected',
    example: 'Please provide a valid Amazon review link. The current link does not lead to your review.',
  })
  @IsString()
  instructions: string;

  @ApiProperty({
    description: 'Deadline for resubmission in hours from now',
    example: 48,
  })
  deadlineHours: number;

  @ApiPropertyOptional({
    description: 'Additional notes for admin records',
    example: 'Reader was contacted via email on 2024-01-15',
  })
  @IsString()
  @IsOptional()
  adminNotes?: string;
}
