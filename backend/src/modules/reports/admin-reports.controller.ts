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
import { AdminRolesGuard } from '@common/guards/admin-roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { AdminRoles } from '@common/decorators/admin-roles.decorator';
import { UserRole, AdminRole } from '@prisma/client';
import { FinancialReportService } from './services/financial-report.service';
import { OperationalReportService } from './services/operational-report.service';
import { AffiliateReportService } from './services/affiliate-report.service';
import { CsvExportService } from './services/csv-export.service';
import { AdminReportPdfService } from './services/admin-report-pdf.service';
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
    private readonly adminReportPdfService: AdminReportPdfService,
  ) {}

  /**
   * Get Financial Report
   * GET /admin/reports/financial?startDate=2024-01-01&endDate=2024-12-31
   *
   * Per Milestone 5.5: Financial Oversight is SUPER_ADMIN only
   */
  @Get('financial')
  @UseGuards(AdminRolesGuard)
  @AdminRoles(AdminRole.SUPER_ADMIN)
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
   *
   * Per Milestone 5.5: Financial Oversight is SUPER_ADMIN only
   */
  @Get('financial/export/csv')
  @UseGuards(AdminRolesGuard)
  @AdminRoles(AdminRole.SUPER_ADMIN)
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
   * Export Financial Report as PDF (Section 14.4)
   * GET /admin/reports/financial/export/pdf?startDate=2024-01-01&endDate=2024-12-31
   *
   * Per Milestone 5.5: Financial Oversight is SUPER_ADMIN only
   */
  @Get('financial/export/pdf')
  @UseGuards(AdminRolesGuard)
  @AdminRoles(AdminRole.SUPER_ADMIN)
  async exportFinancialReportPdf(
    @Query() query: DateRangeQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    const report = await this.financialReportService.generateFinancialReport(
      startDate,
      endDate,
    );

    const pdfBuffer = await this.adminReportPdfService.generateFinancialReportPdf(report);

    const filename = `financial-report-${query.startDate}-to-${query.endDate}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.status(HttpStatus.OK).send(pdfBuffer);
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
   * Export Operational Report as PDF (Section 14.4)
   * GET /admin/reports/operational/export/pdf?startDate=2024-01-01&endDate=2024-12-31
   */
  @Get('operational/export/pdf')
  async exportOperationalReportPdf(
    @Query() query: DateRangeQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    const report = await this.operationalReportService.generateOperationalReport(
      startDate,
      endDate,
    );

    const pdfBuffer = await this.adminReportPdfService.generateOperationalReportPdf(report);

    const filename = `operational-report-${query.startDate}-to-${query.endDate}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.status(HttpStatus.OK).send(pdfBuffer);
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

  /**
   * Export Affiliate Report as PDF (Section 14.4)
   * GET /admin/reports/affiliates/export/pdf?startDate=2024-01-01&endDate=2024-12-31
   */
  @Get('affiliates/export/pdf')
  async exportAffiliateReportPdf(
    @Query() query: DateRangeQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    const report = await this.affiliateReportService.generateAffiliateReport(
      startDate,
      endDate,
    );

    const pdfBuffer = await this.adminReportPdfService.generateAffiliateReportPdf(report);

    const filename = `affiliate-report-${query.startDate}-to-${query.endDate}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.status(HttpStatus.OK).send(pdfBuffer);
  }
}
