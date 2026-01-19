import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO for listing closer accounts
 * Per requirements.md Section 1.4
 */
export class CloserListItemDto {
  @ApiProperty({ example: 'cls_123abc' })
  id: string;

  @ApiProperty({ example: 'usr_123abc' })
  userId: string;

  @ApiProperty({ example: 'closer@example.com' })
  email: string;

  @ApiProperty({ example: 'John Closer' })
  name: string;

  @ApiProperty({ example: 10.0 })
  commissionRate: number;

  @ApiProperty({ example: true })
  commissionEnabled: boolean;

  @ApiProperty({ example: 500.0 })
  commissionEarned: number;

  @ApiProperty({ example: 200.0 })
  commissionPaid: number;

  @ApiProperty({ example: 5000.0 })
  totalSales: number;

  @ApiProperty({ example: 10 })
  totalClients: number;

  @ApiProperty({ example: 15 })
  totalPackagesSold: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-20T14:00:00Z' })
  updatedAt: Date;
}

/**
 * Response DTO for listing admin accounts
 * Per requirements.md Section 1.3
 */
export class AdminListItemDto {
  @ApiProperty({ example: 'adm_123abc' })
  id: string;

  @ApiProperty({ example: 'usr_123abc' })
  userId: string;

  @ApiProperty({ example: 'admin@example.com' })
  email: string;

  @ApiProperty({ example: 'Jane Admin' })
  name: string;

  @ApiProperty({ enum: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'SUPPORT'] })
  role: string;

  @ApiProperty({ type: [String], example: ['MANAGE_USERS', 'MANAGE_CAMPAIGNS'] })
  permissions: string[];

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-20T14:00:00Z' })
  updatedAt: Date;
}
