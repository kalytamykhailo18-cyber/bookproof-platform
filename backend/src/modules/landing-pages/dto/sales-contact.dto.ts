import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { Language } from '@prisma/client';

export class SalesContactDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 500, description: 'Number of reviews needed' })
  @IsNumber()
  @Min(1)
  reviewsNeeded: number;

  @ApiProperty({ example: 'I need a custom package for my book series...' })
  @IsString()
  message: string;

  @ApiProperty({ enum: Language, example: Language.EN })
  @IsEnum(Language)
  language: Language;

  @ApiPropertyOptional({
    description: 'reCAPTCHA v3 token for bot protection',
    example: '03AGdBq24...',
  })
  @IsOptional()
  @IsString()
  captchaToken?: string;
}

export class SalesContactResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;
}
