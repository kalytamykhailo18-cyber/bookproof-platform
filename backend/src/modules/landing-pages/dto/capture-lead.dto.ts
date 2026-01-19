import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Language } from '@prisma/client';

export class CaptureLeadDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ enum: Language, example: Language.EN })
  @IsEnum(Language)
  language: Language;

  @ApiProperty({ example: 'author', required: false, enum: ['author', 'reader', 'both'] })
  @IsString()
  @IsOptional()
  userType?: string;

  @ApiProperty({ example: 'google', required: false })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ example: 'cpc', required: false })
  @IsString()
  @IsOptional()
  medium?: string;

  @ApiProperty({ example: 'spring_2024', required: false })
  @IsString()
  @IsOptional()
  campaign?: string;

  @ApiProperty({ example: 'https://google.com', required: false })
  @IsString()
  @IsOptional()
  referrer?: string;

  @ApiProperty({ example: '192.168.1.1', required: false })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiProperty({ example: 'US', required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ example: true, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  marketingConsent?: boolean;
}

export class CaptureLeadResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  leadId?: string;
}
