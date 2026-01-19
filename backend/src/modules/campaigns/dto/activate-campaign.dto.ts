import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ActivateCampaignDto {
  @ApiProperty({ description: 'Credits to allocate to this campaign' })
  @IsInt()
  @Min(25)
  creditsToAllocate: number;
}
