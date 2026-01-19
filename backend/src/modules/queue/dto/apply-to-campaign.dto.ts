import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BookFormat } from '@prisma/client';

export class ApplyToCampaignDto {
  @ApiProperty({
    description: 'Book/Campaign ID to apply for',
    example: 'clx123abc456',
  })
  @IsString()
  bookId: string;

  @ApiProperty({
    description: 'Preferred format for this assignment (must match reader content preference)',
    enum: BookFormat,
    example: BookFormat.EBOOK,
    required: false,
  })
  @IsEnum(BookFormat)
  @IsOptional()
  formatPreference?: BookFormat;

  @ApiProperty({
    description: 'Amazon profile ID to use for this assignment (optional, will auto-select if not provided)',
    example: 'clx789def012',
    required: false,
  })
  @IsString()
  @IsOptional()
  amazonProfileId?: string;
}
