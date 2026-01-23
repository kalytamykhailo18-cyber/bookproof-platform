import { Module } from '@nestjs/common';
import { PayoutController } from './controllers/payout.controller';
import { WalletPayoutService } from './services/payout.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { EmailModule } from '@modules/email/email.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';

@Module({
  imports: [PrismaModule, EmailModule, NotificationsModule],
  controllers: [PayoutController],
  providers: [WalletPayoutService],
  exports: [WalletPayoutService],
})
export class WalletModule {}
