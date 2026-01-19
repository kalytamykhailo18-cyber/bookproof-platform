import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { CampaignPdfService } from './services/campaign-pdf.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { FilesModule } from '@modules/files/files.module';

@Module({
  imports: [PrismaModule, FilesModule],
  controllers: [ReportsController],
  providers: [ReportsService, CampaignPdfService],
  exports: [ReportsService],
})
export class ReportsModule {}
