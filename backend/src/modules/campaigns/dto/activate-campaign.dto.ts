import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ActivateCampaignDto {
  @ApiProperty({ description: 'Credits to allocate to this campaign (minimum 10 per Section 2.3)' })
  @IsInt()
  @Min(10, { message: 'Minimum 10 credits required per Section 2.3' })
  creditsToAllocate: number;
}
