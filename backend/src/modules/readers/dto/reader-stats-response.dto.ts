import { ApiProperty } from '@nestjs/swagger';

export class ReaderStatsResponseDto {
  @ApiProperty({ description: 'Total assignments (all statuses)' })
  totalAssignments: number;

  @ApiProperty({ description: 'Currently waiting in queue' })
  waitingAssignments: number;

  @ApiProperty({ description: 'Scheduled for future weeks' })
  scheduledAssignments: number;

  @ApiProperty({ description: 'Materials released, deadline active' })
  activeAssignments: number;

  @ApiProperty({ description: 'In progress' })
  inProgressAssignments: number;

  @ApiProperty({ description: 'Submitted, pending validation' })
  submittedAssignments: number;

  @ApiProperty({ description: 'Validated and completed' })
  completedAssignments: number;

  @ApiProperty({ description: 'Expired without submission' })
  expiredAssignments: number;

  @ApiProperty({ description: 'Wallet balance' })
  walletBalance: number;

  @ApiProperty({ description: 'Total earned' })
  totalEarned: number;

  @ApiProperty({ description: 'Pending earnings (reviews submitted but not validated)' })
  pendingEarnings: number;

  @ApiProperty({ description: 'Reliability score (0-100)' })
  reliabilityScore: number;

  @ApiProperty({ description: 'Completion rate (%)' })
  completionRate: number;

  @ApiProperty({ description: 'Pending payout amount (requested but not yet processed)' })
  pendingPayouts: number;
}
