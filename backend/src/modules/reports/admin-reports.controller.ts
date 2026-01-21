import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { FinancialReportService } from './services/financial-report.service';
import { OperationalReportService } from './services/operational-report.service';
import { AffiliateReportService } from './services/affiliate-report.service';
import { CsvExportService } from './services/csv-export.service';
import {
  FinancialReportDto,
  OperationalReportDto,
  AffiliateReportDto,
  DateRangeQueryDto,
} from './dto/admin-reports.dto';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminReportsController {
  constructor(
    private readonly financialReportService: FinancialReportService,
    private readonly operationalReportService: OperationalReportService,
    private readonly affiliateReportService: AffiliateReportService,
    private readonly csvExportService: CsvExportService,
  ) {}

  /**
   * Get Financial Report
   * GET /admin/reports/financial?startDate=2024-01-01&endDate=2024-12-31
   */
  @Get('financial')
  async getFinancialReport(
    @Query() query: DateRangeQueryDto,
  ): Promise<FinancialReportDto> {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    return this.financialReportService.generateFinancialReport(
      startDate,
      endDate,
    );
  }

  /**
   * Export Financial Report as CSV
   * GET /admin/reports/financial/export/csv?startDate=2024-01-01&endDate=2024-12-31
   */
  @Get('financial/export/csv')
  async exportFinancialReportCsv(
    @Query() query: DateRangeQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    const report = await this.financialReportService.generateFinancialReport(
      startDate,
      endDate,
    );

    const csv = this.csvExportService.generateFinancialReportCsv(report);

    const filename = `financial-report-${query.startDate}-to-${query.endDate}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(HttpStatus.OK).send(csv);
  }

  /**
   * Get Operational Report
   * GET /admin/reports/operational?startDate=2024-01-01&endDate=2024-12-31
   */
  @Get('operational')
  async getOperationalReport(
    @Query() query: DateRangeQueryDto,
  ): Promise<OperationalReportDto> {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    return this.operationalReportService.generateOperationalReport(
      startDate,
      endDate,
    );
  }

  /**
   * Export Operational Report as CSV
   * GET /admin/reports/operational/export/csv?startDate=2024-01-01&endDate=2024-12-31
   */
  @Get('operational/export/csv')
  async exportOperationalReportCsv(
    @Query() query: DateRangeQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    const report = await this.operationalReportService.generateOperationalReport(
      startDate,
      endDate,
    );

    const csv = this.csvExportService.generateOperationalReportCsv(report);

    const filename = `operational-report-${query.startDate}-to-${query.endDate}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(HttpStatus.OK).send(csv);
  }

  /**
   * Get Affiliate Report
   * GET /admin/reports/affiliates?startDate=2024-01-01&endDate=2024-12-31
   */
  @Get('affiliates')
  async getAffiliateReport(
    @Query() query: DateRangeQueryDto,
  ): Promise<AffiliateReportDto> {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    return this.affiliateReportService.generateAffiliateReport(
      startDate,
      endDate,
    );
  }

  /**
   * Export Affiliate Report as CSV
   * GET /admin/reports/affiliates/export/csv?startDate=2024-01-01&endDate=2024-12-31
   */
  @Get('affiliates/export/csv')
  async exportAffiliateReportCsv(
    @Query() query: DateRangeQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    const report = await this.affiliateReportService.generateAffiliateReport(
      startDate,
      endDate,
    );

    const csv = this.csvExportService.generateAffiliateReportCsv(report);

    const filename = `affiliate-report-${query.startDate}-to-${query.endDate}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(HttpStatus.OK).send(csv);
  }
}
