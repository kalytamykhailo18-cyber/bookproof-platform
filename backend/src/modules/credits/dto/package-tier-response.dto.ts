import { ApiProperty } from '@nestjs/swagger';

export class PackageTierResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  credits: number;

  @ApiProperty()
  basePrice: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  validityDays: number;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ description: 'Marks the recommended/most popular package' })
  isPopular: boolean;

  @ApiProperty()
  displayOrder: number;

  @ApiProperty({ type: [String], required: false })
  features?: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
