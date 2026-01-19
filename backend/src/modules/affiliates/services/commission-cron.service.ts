import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommissionService } from './commission.service';

@Injectable()
export class CommissionCronService {
  private readonly logger = new Logger(CommissionCronService.name);

  constructor(private commissionService: CommissionService) {}

  /**
   * Auto-approve pending commissions after 14-day holding period
   * Runs daily at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoApproveCommissions() {
    this.logger.log('Running scheduled commission approval job');

    try {
      const result = await this.commissionService.approvePendingCommissions();

      this.logger.log(
        `Commission approval job completed. ${result.approvedCount} commissions approved, ${result.totalAmount.toFixed(2)} total amount`,
      );
    } catch (error) {
      this.logger.error(
        `Commission approval job failed: ${error.message}`,
        error.stack,
      );
    }
  }
}
