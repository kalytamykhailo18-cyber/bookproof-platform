import { ApiProperty } from '@nestjs/swagger';
import { Language } from '@prisma/client';

export class AnalyticsStatsDto {
  @ApiProperty()
  language: Language;

  @ApiProperty()
  totalViews: number;

  @ApiProperty()
  totalLeads: number;

  @ApiProperty()
  conversionRate: number;

  @ApiProperty()
  leadsByUserType: {
    author: number;
    reader: number;
    both: number;
    unknown: number;
  };

  @ApiProperty()
  topSources: Array<{
    source: string;
    count: number;
  }>;

  @ApiProperty()
  topCampaigns: Array<{
    campaign: string;
    count: number;
  }>;
}

export class GlobalAnalyticsDto {
  @ApiProperty()
  totalViews: number;

  @ApiProperty()
  totalLeads: number;

  @ApiProperty()
  conversionRate: number;

  @ApiProperty({ type: [AnalyticsStatsDto] })
  byLanguage: AnalyticsStatsDto[];
}
