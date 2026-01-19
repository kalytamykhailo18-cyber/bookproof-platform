import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CampaignReportResponseDto } from './dto/campaign-report.dto';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.AUTHOR)
  @ApiOperation({ summary: 'Get all campaign reports (Author: own reports, Admin: all reports)' })
  @ApiResponse({ status: 200, description: 'Returns list of campaign reports', type: [CampaignReportResponseDto] })
  async getReports(@Req() req: Request): Promise<CampaignReportResponseDto[]> {
    // Authors can only see their own reports
    if (req.user!.role === UserRole.AUTHOR) {
      return this.reportsService.getReportsByAuthor(req.user!.authorProfileId!);
    }
    // Admins can see all reports
    return this.reportsService.getReports();
  }

  @Get('campaign/:bookId')
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a specific campaign report by book ID' })
  @ApiParam({ name: 'bookId', description: 'The book/campaign ID' })
  @ApiResponse({ status: 200, description: 'Returns the campaign report', type: CampaignReportResponseDto })
  @ApiResponse({ status: 404, description: 'Campaign report not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getCampaignReport(
    @Req() req: Request,
    @Param('bookId') bookId: string,
  ): Promise<CampaignReportResponseDto> {
    const report = await this.reportsService.getCampaignReport(bookId);

    if (!report) {
      throw new NotFoundException('Campaign report not found');
    }

    // Authors can only access their own reports
    if (req.user!.role === UserRole.AUTHOR) {
      const isOwner = await this.reportsService.isReportOwner(bookId, req.user!.authorProfileId!);
      if (!isOwner) {
        throw new ForbiddenException('You do not have access to this report');
      }
    }

    return report;
  }

  @Post('campaign/:bookId/regenerate')
  @Roles(UserRole.ADMIN, UserRole.AUTHOR)
  @ApiOperation({ summary: 'Regenerate a campaign report (useful after data corrections)' })
  @ApiParam({ name: 'bookId', description: 'The book/campaign ID' })
  @ApiResponse({ status: 200, description: 'Returns the regenerated report', type: CampaignReportResponseDto })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async regenerateCampaignReport(
    @Req() req: Request,
    @Param('bookId') bookId: string,
  ): Promise<CampaignReportResponseDto> {
    // Authors can only regenerate their own reports
    if (req.user!.role === UserRole.AUTHOR) {
      const isOwner = await this.reportsService.isReportOwner(bookId, req.user!.authorProfileId!);
      if (!isOwner) {
        throw new ForbiddenException('You do not have access to regenerate this report');
      }
    }
    return this.reportsService.generateCampaignReport(bookId);
  }

  @Get('campaign/:bookId/download')
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a signed download URL for the campaign report PDF' })
  @ApiParam({ name: 'bookId', description: 'The book/campaign ID' })
  @ApiResponse({ status: 200, description: 'Returns signed download URL (valid for 1 hour)' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async downloadCampaignReport(
    @Req() req: Request,
    @Param('bookId') bookId: string,
  ): Promise<{ url: string }> {
    // Authors can only download their own reports
    if (req.user!.role === UserRole.AUTHOR) {
      const isOwner = await this.reportsService.isReportOwner(bookId, req.user!.authorProfileId!);
      if (!isOwner) {
        throw new ForbiddenException('You do not have access to download this report');
      }
    }
    const url = await this.reportsService.getDownloadUrl(bookId);
    return { url };
  }
}
