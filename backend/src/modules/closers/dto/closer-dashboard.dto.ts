import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================
// CLOSER PROFILE RESPONSE
// ============================================

export class CloserProfileResponseDto {
  @ApiProperty({ description: 'Closer profile ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Total sales amount' })
  totalSales: number;

  @ApiProperty({ description: 'Total number of clients' })
  totalClients: number;

  @ApiProperty({ description: 'Total packages sold' })
  totalPackagesSold: number;

  @ApiProperty({ description: 'Whether commission is enabled' })
  commissionEnabled: boolean;

  @ApiPropertyOptional({ description: 'Commission rate percentage' })
  commissionRate?: number;

  @ApiProperty({ description: 'Total commission earned' })
  commissionEarned: number;

  @ApiProperty({ description: 'Total commission paid out' })
  commissionPaid: number;

  @ApiProperty({ description: 'Whether profile is active' })
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Conversion rate percentage' })
  conversionRate?: number;

  @ApiPropertyOptional({ description: 'Average package size in credits' })
  averagePackageSize?: number;

  @ApiProperty({ description: 'Created date' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated date' })
  updatedAt: Date;

  // User details
  @ApiPropertyOptional({ description: 'User name' })
  userName?: string;

  @ApiPropertyOptional({ description: 'User email' })
  userEmail?: string;
}

// ============================================
// DASHBOARD STATS
// ============================================

export class CloserDashboardStatsDto {
  // Sales metrics
  @ApiProperty({ description: 'Total sales this month' })
  salesThisMonth: number;

  @ApiProperty({ description: 'Total sales last month' })
  salesLastMonth: number;

  @ApiProperty({ description: 'Sales growth percentage' })
  salesGrowth: number;

  // Package metrics
  @ApiProperty({ description: 'Packages created this month' })
  packagesCreatedThisMonth: number;

  @ApiProperty({ description: 'Packages sent this month' })
  packagesSentThisMonth: number;

  @ApiProperty({ description: 'Packages paid this month' })
  packagesPaidThisMonth: number;

  // Conversion metrics
  @ApiProperty({ description: 'Current conversion rate' })
  conversionRate: number;

  @ApiProperty({ description: 'Average deal size' })
  averageDealSize: number;

  // Pipeline metrics
  @ApiProperty({ description: 'Packages in pipeline (draft + sent + viewed)' })
  packagesInPipeline: number;

  @ApiProperty({ description: 'Pipeline value (potential revenue)' })
  pipelineValue: number;

  // Commission metrics (if enabled)
  @ApiProperty({ description: 'Pending commission amount' })
  pendingCommission: number;

  @ApiProperty({ description: 'Commission earned this month' })
  commissionThisMonth: number;
}

// ============================================
// SALES HISTORY ITEM
// ============================================

export class SalesHistoryItemDto {
  @ApiProperty({ description: 'Sale ID (package or invoice ID)' })
  id: string;

  @ApiProperty({ description: 'Sale type: PACKAGE or INVOICE' })
  type: 'PACKAGE' | 'INVOICE';

  @ApiProperty({ description: 'Client name' })
  clientName: string;

  @ApiProperty({ description: 'Client email' })
  clientEmail: string;

  @ApiPropertyOptional({ description: 'Client company' })
  clientCompany?: string;

  @ApiProperty({ description: 'Amount' })
  amount: number;

  @ApiProperty({ description: 'Currency' })
  currency: string;

  @ApiPropertyOptional({ description: 'Credits included' })
  credits?: number;

  @ApiProperty({ description: 'Status' })
  status: string;

  @ApiProperty({ description: 'Date of sale/payment' })
  date: Date;

  @ApiProperty({ description: 'Whether author account was created' })
  accountCreated: boolean;
}

// ============================================
// RECENT ACTIVITY
// ============================================

export class RecentActivityDto {
  @ApiProperty({ description: 'Activity ID' })
  id: string;

  @ApiProperty({
    description: 'Activity type',
    enum: [
      'PACKAGE_CREATED',
      'PACKAGE_SENT',
      'PACKAGE_VIEWED',
      'PACKAGE_PAID',
      'INVOICE_CREATED',
      'INVOICE_PAID',
      'ACCOUNT_CREATED',
    ],
  })
  type: string;

  @ApiProperty({ description: 'Activity description' })
  description: string;

  @ApiProperty({ description: 'Related entity ID' })
  entityId: string;

  @ApiProperty({ description: 'Activity timestamp' })
  timestamp: Date;

  @ApiPropertyOptional({ description: 'Client name involved' })
  clientName?: string;

  @ApiPropertyOptional({ description: 'Amount involved' })
  amount?: number;
}
