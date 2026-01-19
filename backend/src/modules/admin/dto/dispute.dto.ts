import {
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Enums matching Prisma schema
export enum DisputeType {
  AUTHOR_DISPUTE = 'AUTHOR_DISPUTE',
  AUTHOR_COMPLAINT = 'AUTHOR_COMPLAINT',
  READER_COMPLAINT = 'READER_COMPLAINT',
  REVIEW_QUALITY = 'REVIEW_QUALITY',
  PAYMENT_ISSUE = 'PAYMENT_ISSUE',
  SERVICE_ISSUE = 'SERVICE_ISSUE',
  POLICY_VIOLATION = 'POLICY_VIOLATION',
  OTHER = 'OTHER',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  ESCALATED = 'ESCALATED',
  REJECTED = 'REJECTED',
}

export enum DisputePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// DTO for creating a dispute
export class CreateDisputeDto {
  @ApiProperty({
    description: 'Type of dispute',
    enum: DisputeType,
    example: DisputeType.AUTHOR_COMPLAINT,
  })
  @IsEnum(DisputeType)
  type: DisputeType;

  @ApiProperty({
    description: 'Detailed description of the dispute',
    example: 'The review quality does not meet expectations...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiPropertyOptional({
    description: 'Priority level (defaults to MEDIUM)',
    enum: DisputePriority,
    example: DisputePriority.MEDIUM,
  })
  @IsEnum(DisputePriority)
  @IsOptional()
  priority?: DisputePriority;

  @ApiPropertyOptional({
    description: 'Type of related entity (Campaign, Review, Assignment, Payment)',
    example: 'Campaign',
  })
  @IsString()
  @IsOptional()
  relatedEntityType?: string;

  @ApiPropertyOptional({
    description: 'ID of the related entity',
    example: 'cly1abc123',
  })
  @IsString()
  @IsOptional()
  relatedEntityId?: string;
}

// DTO for resolving a dispute
export class ResolveDisputeDto {
  @ApiProperty({
    description: 'Resolution notes',
    example: 'Issue resolved by providing replacement review',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  resolution: string;

  @ApiPropertyOptional({
    description: 'Final status after resolution',
    enum: [DisputeStatus.RESOLVED, DisputeStatus.REJECTED],
    example: DisputeStatus.RESOLVED,
  })
  @IsEnum(DisputeStatus)
  @IsOptional()
  status?: DisputeStatus.RESOLVED | DisputeStatus.REJECTED;
}

// DTO for escalating a dispute
export class EscalateDisputeDto {
  @ApiProperty({
    description: 'Reason for escalation',
    example: 'Requires senior admin review due to complexity',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(1000)
  reason: string;
}

// DTO for updating dispute status
export class UpdateDisputeStatusDto {
  @ApiProperty({
    description: 'New status',
    enum: DisputeStatus,
    example: DisputeStatus.IN_PROGRESS,
  })
  @IsEnum(DisputeStatus)
  status: DisputeStatus;

  @ApiPropertyOptional({
    description: 'Admin notes about the status change',
    example: 'Investigating the issue...',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  adminNotes?: string;
}

// DTO for filtering disputes
export class GetDisputesQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: DisputeStatus,
  })
  @IsEnum(DisputeStatus)
  @IsOptional()
  status?: DisputeStatus;

  @ApiPropertyOptional({
    description: 'Filter by type',
    enum: DisputeType,
  })
  @IsEnum(DisputeType)
  @IsOptional()
  type?: DisputeType;

  @ApiPropertyOptional({
    description: 'Filter by priority',
    enum: DisputePriority,
  })
  @IsEnum(DisputePriority)
  @IsOptional()
  priority?: DisputePriority;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
  })
  @IsString()
  @IsOptional()
  userId?: string;
}

// Response DTO for dispute
export class DisputeResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  userRole: string;

  @ApiProperty({ enum: DisputeType })
  type: DisputeType;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: DisputeStatus })
  status: DisputeStatus;

  @ApiProperty({ enum: DisputePriority })
  priority: DisputePriority;

  @ApiPropertyOptional()
  relatedEntityType?: string;

  @ApiPropertyOptional()
  relatedEntityId?: string;

  @ApiPropertyOptional()
  resolution?: string;

  @ApiPropertyOptional()
  resolvedBy?: string;

  @ApiPropertyOptional()
  resolvedAt?: Date;

  @ApiPropertyOptional()
  escalatedBy?: string;

  @ApiPropertyOptional()
  escalatedAt?: Date;

  @ApiPropertyOptional()
  escalationReason?: string;

  @ApiPropertyOptional()
  adminNotes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
