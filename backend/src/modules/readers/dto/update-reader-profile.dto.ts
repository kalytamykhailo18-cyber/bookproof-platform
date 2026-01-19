import { IsEnum, IsArray, IsString, IsOptional, ArrayMaxSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ContentPreference } from '@prisma/client';

export class UpdateReaderProfileDto {
  @ApiProperty({
    description: 'Reader content preference (ebook, audiobook, or both)',
    enum: ContentPreference,
    example: ContentPreference.BOTH,
    required: false,
  })
  @IsEnum(ContentPreference)
  @IsOptional()
  contentPreference?: ContentPreference;

  @ApiProperty({
    description: 'Amazon profile URLs (max 3 for validation tracking)',
    type: [String],
    example: ['https://amazon.com/gp/profile/A1B2C3D4E5F6'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(3)
  @IsOptional()
  amazonProfiles?: string[];

  @ApiProperty({
    description: 'Preferred book genres for better matching',
    type: [String],
    example: ['Science Fiction', 'Fantasy', 'Thriller'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  preferredGenres?: string[];
}
