import { IsEnum, IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ValidationAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  FLAG = 'FLAG',
  REQUEST_RESUBMISSION = 'REQUEST_RESUBMISSION',
}

export enum IssueType {
  // Review issues
  INVALID_LINK = 'INVALID_LINK',
  REVIEW_NOT_FOUND = 'REVIEW_NOT_FOUND',
  WRONG_BOOK = 'WRONG_BOOK',
  DUPLICATE = 'DUPLICATE',
  REMOVED_BY_AMAZON = 'REMOVED_BY_AMAZON',
  SUSPICIOUS_CONTENT = 'SUSPICIOUS_CONTENT',
  GUIDELINE_VIOLATION = 'GUIDELINE_VIOLATION',
  PROFILE_MISMATCH = 'PROFILE_MISMATCH',

  // Customer disputes/complaints (FIX #1)
  AUTHOR_DISPUTE = 'AUTHOR_DISPUTE',
  AUTHOR_COMPLAINT = 'AUTHOR_COMPLAINT',
  READER_COMPLAINT = 'READER_COMPLAINT',

  // Unusual reader behavior (FIX #2)
  UNUSUAL_BEHAVIOR = 'UNUSUAL_BEHAVIOR',
  SUSPECTED_FRAUD = 'SUSPECTED_FRAUD',

  // Payment issues (FIX #3)
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_DISPUTE = 'PAYMENT_DISPUTE',
  REFUND_REQUEST = 'REFUND_REQUEST',
  PAYOUT_ISSUE = 'PAYOUT_ISSUE',
  DUPLICATE_PAYMENT = 'DUPLICATE_PAYMENT',

  // Technical errors (FIX #4)
  TECHNICAL_ERROR = 'TECHNICAL_ERROR',
  SYSTEM_FAILURE = 'SYSTEM_FAILURE',
  DATA_INCONSISTENCY = 'DATA_INCONSISTENCY',

  OTHER = 'OTHER',
}

export enum IssueSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class ValidateReviewDto {
  @ApiProperty({
    description: 'Validation action to perform',
    enum: ValidationAction,
    example: ValidationAction.APPROVE,
  })
  @IsEnum(ValidationAction)
  action: ValidationAction;

  @ApiPropertyOptional({
    description: 'Issue type (required if action is FLAG or REJECT)',
    enum: IssueType,
    example: IssueType.INVALID_LINK,
  })
  @IsEnum(IssueType)
  @IsOptional()
  issueType?: IssueType;

  @ApiPropertyOptional({
    description: 'Issue severity (optional, defaults to MEDIUM)',
    enum: IssueSeverity,
    example: IssueSeverity.MEDIUM,
  })
  @IsEnum(IssueSeverity)
  @IsOptional()
  severity?: IssueSeverity;

  @ApiPropertyOptional({
    description: 'Notes or reason for rejection/flagging',
    example: 'Amazon review link does not match book ASIN',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class BulkValidateReviewsDto {
  @ApiProperty({
    description: 'Array of review IDs to validate',
    example: ['cly1abc123', 'cly2def456'],
  })
  @IsArray()
  @IsString({ each: true })
  reviewIds: string[];

  @ApiProperty({
    description: 'Validation action to perform on all reviews',
    enum: ValidationAction,
    example: ValidationAction.APPROVE,
  })
  @IsEnum(ValidationAction)
  action: ValidationAction;
}
