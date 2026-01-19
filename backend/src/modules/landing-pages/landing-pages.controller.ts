import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '@common/decorators/public.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { LandingPagesService } from './landing-pages.service';
import { CaptureLeadDto, CaptureLeadResponseDto } from './dto/capture-lead.dto';
import { TrackPageViewDto, TrackPageViewResponseDto } from './dto/track-page-view.dto';
import { AnalyticsStatsDto, GlobalAnalyticsDto } from './dto/analytics.dto';
import {
  UpdateLandingPageDto,
  LandingPageResponseDto,
  GetLandingPageLeadsDto,
  LeadsListResponseDto,
} from './dto/update-landing-page.dto';
import { Language, UserRole } from '@prisma/client';
import { Roles } from '@common/decorators/roles.decorator';

@ApiTags('Landing Pages')
@Controller('landing-pages')
export class LandingPagesController {
  constructor(private readonly landingPagesService: LandingPagesService) {}

  @Public()
  @Post('leads')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Capture a lead from the landing page' })
  @ApiResponse({ status: 200, description: 'Lead captured successfully', type: CaptureLeadResponseDto })
  async captureLead(@Body() captureLeadDto: CaptureLeadDto): Promise<CaptureLeadResponseDto> {
    return this.landingPagesService.captureLead(captureLeadDto);
  }

  @Public()
  @Post('track-view')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track a page view on the landing page' })
  @ApiResponse({ status: 200, description: 'Page view tracked successfully', type: TrackPageViewResponseDto })
  async trackPageView(@Body() trackPageViewDto: TrackPageViewDto): Promise<TrackPageViewResponseDto> {
    return this.landingPagesService.trackPageView(trackPageViewDto);
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get landing page analytics by language' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully', type: AnalyticsStatsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access only' })
  async getAnalyticsByLanguage(@Query('language') language: Language): Promise<AnalyticsStatsDto> {
    return this.landingPagesService.getAnalyticsByLanguage(language);
  }

  @Get('analytics/global')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get global landing page analytics' })
  @ApiResponse({ status: 200, description: 'Global analytics retrieved successfully', type: GlobalAnalyticsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access only' })
  async getGlobalAnalytics(): Promise<GlobalAnalyticsDto> {
    return this.landingPagesService.getGlobalAnalytics();
  }

  // ==========================================
  // ADMIN CONTENT MANAGEMENT ENDPOINTS
  // ==========================================

  @Get('admin/pages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all landing pages (admin)' })
  @ApiResponse({ status: 200, description: 'All landing pages retrieved', type: [LandingPageResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access only' })
  async getAllLandingPages(): Promise<LandingPageResponseDto[]> {
    return this.landingPagesService.getAllLandingPages();
  }

  @Get('admin/pages/:language')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get landing page by language (admin)' })
  @ApiResponse({ status: 200, description: 'Landing page retrieved', type: LandingPageResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access only' })
  async getLandingPage(@Param('language') language: Language): Promise<LandingPageResponseDto> {
    return this.landingPagesService.getLandingPage(language);
  }

  @Put('admin/pages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update landing page content (admin CMS)' })
  @ApiResponse({ status: 200, description: 'Landing page updated', type: LandingPageResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access only' })
  async updateLandingPage(@Body() dto: UpdateLandingPageDto): Promise<LandingPageResponseDto> {
    return this.landingPagesService.updateLandingPage(dto);
  }

  @Get('admin/leads')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get leads list with pagination (admin)' })
  @ApiResponse({ status: 200, description: 'Leads list retrieved', type: LeadsListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access only' })
  @ApiQuery({ name: 'language', enum: Language, required: false })
  @ApiQuery({ name: 'userType', required: false })
  @ApiQuery({ name: 'source', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getLeads(@Query() query: GetLandingPageLeadsDto): Promise<LeadsListResponseDto> {
    return this.landingPagesService.getLeads(query);
  }

  @Get('admin/leads/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export leads as CSV or JSON (admin)' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access only' })
  @ApiQuery({ name: 'language', enum: Language, required: false })
  @ApiQuery({ name: 'format', enum: ['csv', 'json'], required: false })
  async exportLeads(
    @Query('language') language: Language | undefined,
    @Query('format') format: 'csv' | 'json' = 'csv',
    @Res() res: Response,
  ): Promise<void> {
    const data = await this.landingPagesService.exportLeads(language, format);

    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=leads.json');
    } else {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    }

    res.send(data);
  }

  @Delete('admin/leads/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a lead (admin)' })
  @ApiResponse({ status: 200, description: 'Lead deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access only' })
  async deleteLead(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.landingPagesService.deleteLead(id);
  }

  @Post('admin/leads/:id/resend-email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend welcome email to a lead (admin)' })
  @ApiResponse({ status: 200, description: 'Welcome email resent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access only' })
  async resendWelcomeEmail(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.landingPagesService.resendWelcomeEmail(id);
  }
}
