import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Language } from '@prisma/client';

/**
 * DTO for Closer (sales team) to create author accounts after custom package sale
 * The author will receive a welcome email with temporary login credentials
 */
export class CreateAuthorByCloserDto {
  @ApiProperty({ example: 'john@example.com', description: 'Author email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe', description: 'Author full name' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({ enum: Language, example: Language.EN, description: 'Preferred language' })
  @IsEnum(Language)
  @IsOptional()
  preferredLanguage?: Language;

  @ApiPropertyOptional({ example: 'USD', description: 'Preferred currency' })
  @IsString()
  @IsOptional()
  preferredCurrency?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'US', description: 'Country of residence' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: 50, description: 'Initial credits to allocate from custom package' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  initialCredits?: number;

  @ApiPropertyOptional({ example: 'Custom enterprise package', description: 'Notes about the sale' })
  @IsString()
  @IsOptional()
  saleNotes?: string;
}

export class CreateAuthorByCloserResponseDto {
  @ApiProperty({ description: 'Created author profile ID' })
  authorProfileId: string;

  @ApiProperty({ description: 'Created user ID' })
  userId: string;

  @ApiProperty({ description: 'Author email' })
  email: string;

  @ApiProperty({ description: 'Author name' })
  name: string;

  @ApiProperty({ description: 'Temporary password was sent to author email' })
  temporaryPasswordSent: boolean;

  @ApiProperty({ description: 'Welcome email was sent' })
  welcomeEmailSent: boolean;

  @ApiPropertyOptional({ description: 'Initial credits allocated' })
  initialCredits?: number;
}
