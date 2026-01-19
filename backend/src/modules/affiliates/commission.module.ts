import { Module } from '@nestjs/common';
import { CommissionService } from './services/commission.service';
import { CommissionCronService } from './services/commission-cron.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { EmailModule } from '@modules/email/email.module';

/**
 * Commission Module
 *
 * Handles affiliate commission calculations and approval workflow.
 * Used by CreditsModule to create commissions after successful purchases.
 *
 * Separated from main AffiliatesModule to prevent circular dependencies.
 */
@Module({
  imports: [PrismaModule, EmailModule],
  providers: [CommissionService, CommissionCronService],
  exports: [CommissionService],
})
export class CommissionModule {}
