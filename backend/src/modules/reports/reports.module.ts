import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { AdminReportsController } from './admin-reports.controller';
import { ReportsService } from './reports.service';
import { CampaignPdfService } from './services/campaign-pdf.service';
import { FinancialReportService } from './services/financial-report.service';
import { OperationalReportService } from './services/operational-report.service';
import { AffiliateReportService } from './services/affiliate-report.service';
import { CsvExportService } from './services/csv-export.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { FilesModule } from '@modules/files/files.module';

@Module({
  imports: [PrismaModule, FilesModule],
  controllers: [ReportsController, AdminReportsController],
  providers: [
    ReportsService,
    CampaignPdfService,
    FinancialReportService,
    OperationalReportService,
    AffiliateReportService,
    CsvExportService,
  ],
  exports: [ReportsService],
})
export class ReportsModule {}
