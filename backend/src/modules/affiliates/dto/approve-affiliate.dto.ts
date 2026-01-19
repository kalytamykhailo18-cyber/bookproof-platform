import { IsBoolean, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveAffiliateDto {
  @ApiProperty({
    description: 'Whether to approve or reject the affiliate application',
    example: true,
  })
  @IsBoolean()
  approve: boolean;

  @ApiPropertyOptional({
    description: 'Reason for rejection (required if approve=false)',
    example: 'Website does not meet minimum traffic requirements',
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiPropertyOptional({
    description: 'Custom commission rate for this affiliate (overrides default 20%)',
    example: 25,
    minimum: 0,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  commissionRate?: number;
}
