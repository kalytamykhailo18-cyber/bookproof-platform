import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AdminRolesGuard } from '../../common/guards/admin-roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController],
  providers: [DashboardService, AdminRolesGuard],
  exports: [DashboardService],
})
export class DashboardModule {}
