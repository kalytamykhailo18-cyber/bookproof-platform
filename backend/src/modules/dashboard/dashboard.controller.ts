import { Controller, Get, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AdminRolesGuard } from '../../common/guards/admin-roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRoles } from '../../common/decorators/admin-roles.decorator';
import { AdminRole } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import {
  AdminDashboardDto,
  AuthorCampaignTrackingDto,
  ReaderPerformanceStatsDto,
  TransactionHistoryDto,
  AdminRevenueAnalyticsDto,
} from './dto/dashboard.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('admin')
  @Roles('ADMIN' as any)
  @ApiOperation({ summary: 'Get admin dashboard' })
  @ApiResponse({ status: 200, description: 'Admin dashboard retrieved', type: AdminDashboardDto })
  async getAdminDashboard(): Promise<AdminDashboardDto> {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('author/campaigns/:id')
  @Roles('AUTHOR' as any)
  @ApiOperation({ summary: 'Get campaign tracking for author' })
  @ApiResponse({ status: 200, description: 'Campaign tracking retrieved', type: AuthorCampaignTrackingDto })
  async getCampaignTracking(
    @Req() req: Request,
    @Param('id') bookId: string,
  ): Promise<AuthorCampaignTrackingDto> {
    // Verify the book belongs to the requesting author
    const isOwner = await this.dashboardService.isBookOwner(bookId, req.user!.authorProfileId!);
    if (!isOwner) {
      throw new ForbiddenException('You do not have access to this campaign');
    }
    return this.dashboardService.getAuthorCampaignTracking(bookId);
  }

  @Get('reader/stats')
  @Roles('READER' as any)
  @ApiOperation({ summary: 'Get reader performance stats' })
  @ApiResponse({ status: 200, description: 'Reader stats retrieved', type: ReaderPerformanceStatsDto })
  async getReaderStats(@Req() req: any): Promise<ReaderPerformanceStatsDto> {
    return this.dashboardService.getReaderPerformanceStats(req.user.readerProfileId);
  }

  @Get('transactions')
  @Roles('AUTHOR' as any)
  @ApiOperation({ summary: 'Get transaction history for author' })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved', type: TransactionHistoryDto })
  async getTransactions(@Req() req: any): Promise<TransactionHistoryDto> {
    return this.dashboardService.getTransactionHistory(req.user.authorProfileId);
  }

  /**
   * Get admin revenue analytics
   * Per Milestone 5.5: Financial data is SUPER_ADMIN only
   */
  @Get('admin/revenue')
  @Roles('ADMIN' as any)
  @UseGuards(AdminRolesGuard)
  @AdminRoles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get admin revenue analytics (SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Revenue analytics retrieved', type: AdminRevenueAnalyticsDto })
  async getRevenueAnalytics(): Promise<AdminRevenueAnalyticsDto> {
    return this.dashboardService.getAdminRevenueAnalytics();
  }

  @Get('admin/author/:id/transactions')
  @Roles('ADMIN' as any)
  @ApiOperation({ summary: 'Get author transaction history (Admin only)' })
  @ApiResponse({ status: 200, description: 'Author transaction history retrieved', type: TransactionHistoryDto })
  async getAuthorTransactionsForAdmin(
    @Param('id') authorProfileId: string,
  ): Promise<TransactionHistoryDto> {
    return this.dashboardService.getTransactionHistory(authorProfileId);
  }

  @Get('admin/reader/:id/stats')
  @Roles('ADMIN' as any)
  @ApiOperation({ summary: 'Get reader performance stats (Admin only)' })
  @ApiResponse({ status: 200, description: 'Reader stats retrieved', type: ReaderPerformanceStatsDto })
  async getReaderStatsForAdmin(
    @Param('id') readerProfileId: string,
  ): Promise<ReaderPerformanceStatsDto> {
    return this.dashboardService.getReaderPerformanceStats(readerProfileId);
  }

  @Get('admin/campaign/:id')
  @Roles('ADMIN' as any)
  @ApiOperation({ summary: 'Get campaign tracking (Admin only)' })
  @ApiResponse({ status: 200, description: 'Campaign tracking retrieved', type: AuthorCampaignTrackingDto })
  async getCampaignTrackingForAdmin(
    @Param('id') bookId: string,
  ): Promise<AuthorCampaignTrackingDto> {
    return this.dashboardService.getAuthorCampaignTracking(bookId);
  }
}
