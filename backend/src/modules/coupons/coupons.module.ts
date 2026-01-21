import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';
import { PrismaModule } from '@common/prisma/prisma.module';
import { AuditModule } from '@modules/audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [CouponsController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
