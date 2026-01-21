import { Controller, Post, Put, Get, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole, CreditTransactionType } from '@prisma/client';
import { CampaignControlsService } from '../services/campaign-controls.service';
import {
  PauseCampaignDto,
  ResumeCampaignDto,
  AdjustWeeklyDistributionDto,
  AddCreditsDto,
  RemoveCreditsDto,
  AllocateCreditsDto,
  AdjustOverbookingDto,
  CampaignHealthDto,
  CampaignAnalyticsDto,
  AuthorListItemDto,
  CreditTransactionHistoryDto,
  CreditTransactionDto,
  UpdateCampaignSettingsDto,
  TransferCreditsDto,
  ForceCompleteCampaignDto,
  ManualGrantAccessDto,
  RemoveReaderFromCampaignDto,
} from '../dto/campaign-controls.dto';

@ApiTags('Admin - Campaign Controls')
@ApiBearerAuth()
@Controller('admin/campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class CampaignControlsController {
  constructor(private campaignControlsService: CampaignControlsService) {}

  @Post(':id/pause')
  @ApiOperation({ summary: 'Pause campaign' })
  @ApiResponse({ status: 200, description: 'Campaign paused successfully', type: CampaignAnalyticsDto })
  async pauseCampaign(
    @Param('id') bookId: string,
    @Body() dto: PauseCampaignDto,
    @Req() req: Request,
  ): Promise<CampaignAnalyticsDto> {
    return this.campaignControlsService.pauseCampaign(
      bookId,
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  @Post(':id/resume')
  @ApiOperation({ summary: 'Resume campaign' })
  @ApiResponse({ status: 200, description: 'Campaign resumed successfully', type: CampaignAnalyticsDto })
  async resumeCampaign(
    @Param('id') bookId: string,
    @Body() dto: ResumeCampaignDto,
    @Req() req: Request,
  ): Promise<CampaignAnalyticsDto> {
    return this.campaignControlsService.resumeCampaign(
      bookId,
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  @Put(':id/distribution')
  @ApiOperation({ summary: 'Adjust weekly distribution' })
  @ApiResponse({ status: 200, description: 'Distribution adjusted successfully', type: CampaignAnalyticsDto })
  async adjustDistribution(
    @Param('id') bookId: string,
    @Body() dto: AdjustWeeklyDistributionDto,
    @Req() req: Request,
  ): Promise<CampaignAnalyticsDto> {
    return this.campaignControlsService.adjustWeeklyDistribution(
      bookId,
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  @Post('authors/:id/credits/add')
  @ApiOperation({ summary: 'Add credits to author manually' })
  @ApiResponse({ status: 200, description: 'Credits added successfully' })
  async addCredits(
    @Param('id') authorProfileId: string,
    @Body() dto: AddCreditsDto,
    @Req() req: Request,
  ) {
    return this.campaignControlsService.addCreditsToAuthor(
      authorProfileId,
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  @Post('authors/:id/credits/remove')
  @ApiOperation({ summary: 'Remove credits from author manually' })
  @ApiResponse({ status: 200, description: 'Credits removed successfully' })
  async removeCredits(
    @Param('id') authorProfileId: string,
    @Body() dto: RemoveCreditsDto,
    @Req() req: Request,
  ) {
    return this.campaignControlsService.removeCreditsFromAuthor(
      authorProfileId,
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  @Post(':id/credits/allocate')
  @ApiOperation({ summary: 'Allocate credits to campaign' })
  @ApiResponse({ status: 200, description: 'Credits allocated successfully' })
  async allocateCredits(
    @Param('id') bookId: string,
    @Body() dto: AllocateCreditsDto,
    @Req() req: Request,
  ) {
    return this.campaignControlsService.allocateCreditsToCampaign(
      bookId,
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  @Put(':id/overbooking')
  @ApiOperation({ summary: 'Adjust overbooking percentage' })
  @ApiResponse({ status: 200, description: 'Overbooking adjusted successfully' })
  async adjustOverbooking(
    @Param('id') bookId: string,
    @Body() dto: AdjustOverbookingDto,
    @Req() req: Request,
  ) {
    return this.campaignControlsService.adjustOverbooking(
      bookId,
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  @Get(':id/health')
  @ApiOperation({ summary: 'Get campaign health status' })
  @ApiResponse({ status: 200, description: 'Campaign health retrieved', type: CampaignHealthDto })
  async getCampaignHealth(
    @Param('id') bookId: string,
  ): Promise<CampaignHealthDto> {
    return this.campaignControlsService.getCampaignHealth(bookId);
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get campaign analytics' })
  @ApiResponse({ status: 200, description: 'Campaign analytics retrieved', type: CampaignAnalyticsDto })
  async getCampaignAnalytics(
    @Param('id') bookId: string,
  ): Promise<CampaignAnalyticsDto> {
    return this.campaignControlsService.getCampaignAnalytics(bookId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns for admin with pagination' })
  @ApiResponse({ status: 200, description: 'Campaigns list retrieved' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of campaigns to return (default 50)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination (default 0)' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'DRAFT', 'PENDING'], isArray: true, description: 'Filter by campaign status' })
  async getAllCampaigns(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('status') status?: string | string[],
  ) {
    const statusArray = status
      ? (Array.isArray(status) ? status : [status]).map((s) => s as any)
      : undefined;
    return this.campaignControlsService.getAllCampaigns(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
      statusArray,
    );
  }

  @Get('authors')
  @ApiOperation({ summary: 'Get all authors with credit information and pagination' })
  @ApiResponse({ status: 200, description: 'Authors list retrieved' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of authors to return (default 50)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination (default 0)' })
  async getAllAuthors(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ authors: AuthorListItemDto[]; total: number }> {
    return this.campaignControlsService.getAllAuthors(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('authors/:id')
  @ApiOperation({ summary: 'Get author details by ID' })
  @ApiResponse({ status: 200, description: 'Author details retrieved', type: AuthorListItemDto })
  async getAuthorDetails(
    @Param('id') authorProfileId: string,
  ): Promise<AuthorListItemDto> {
    return this.campaignControlsService.getAuthorDetails(authorProfileId);
  }

  @Get('authors/:id/transactions')
  @ApiOperation({ summary: 'Get credit transaction history for a specific author' })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved', type: CreditTransactionHistoryDto })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of transactions to return (default 100)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination (default 0)' })
  async getAuthorTransactionHistory(
    @Param('id') authorProfileId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<CreditTransactionHistoryDto> {
    return this.campaignControlsService.getCreditTransactionHistory(
      authorProfileId,
      limit ? parseInt(limit, 10) : 100,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('credits/transactions')
  @ApiOperation({ summary: 'Get all credit transactions across platform' })
  @ApiResponse({ status: 200, description: 'All transactions retrieved' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of transactions to return (default 100)' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination (default 0)' })
  @ApiQuery({ name: 'type', required: false, enum: CreditTransactionType, description: 'Filter by transaction type' })
  async getAllTransactions(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('type') type?: CreditTransactionType,
  ): Promise<{ transactions: CreditTransactionDto[]; total: number }> {
    return this.campaignControlsService.getAllCreditTransactions(
      limit ? parseInt(limit, 10) : 100,
      offset ? parseInt(offset, 10) : 0,
      type,
    );
  }

  @Put(':id/settings')
  @ApiOperation({ summary: 'Update campaign settings for active/paused campaigns' })
  @ApiResponse({ status: 200, description: 'Campaign settings updated successfully', type: CampaignAnalyticsDto })
  async updateCampaignSettings(
    @Param('id') bookId: string,
    @Body() dto: UpdateCampaignSettingsDto,
    @Req() req: Request,
  ): Promise<CampaignAnalyticsDto> {
    return this.campaignControlsService.updateCampaignSettings(
      bookId,
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  @Post('credits/transfer')
  @ApiOperation({ summary: 'Transfer credits between campaigns (same author)' })
  @ApiResponse({ status: 200, description: 'Credits transferred successfully' })
  async transferCredits(
    @Body() dto: TransferCreditsDto,
    @Req() req: Request,
  ) {
    return this.campaignControlsService.transferCreditsBetweenCampaigns(
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  @Post(':id/resume-with-catchup')
  @ApiOperation({ summary: 'Resume campaign with catch-up logic (extends end date)' })
  @ApiResponse({ status: 200, description: 'Campaign resumed with catch-up', type: CampaignAnalyticsDto })
  async resumeCampaignWithCatchUp(
    @Param('id') bookId: string,
    @Body() dto: ResumeCampaignDto,
    @Req() req: Request,
  ): Promise<CampaignAnalyticsDto> {
    return this.campaignControlsService.resumeCampaignWithCatchUp(
      bookId,
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  /**
   * Force complete a campaign (Section 5.3)
   */
  @Post(':id/force-complete')
  @ApiOperation({ summary: 'Force complete a campaign' })
  @ApiResponse({ status: 200, description: 'Campaign force completed', type: CampaignAnalyticsDto })
  async forceCompleteCampaign(
    @Param('id') bookId: string,
    @Body() dto: ForceCompleteCampaignDto,
    @Req() req: Request,
  ): Promise<CampaignAnalyticsDto> {
    return this.campaignControlsService.forceCompleteCampaign(
      bookId,
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  /**
   * Manually grant material access to a reader (Section 5.3)
   */
  @Post(':id/grant-access')
  @ApiOperation({ summary: 'Manually grant material access to a reader' })
  @ApiResponse({ status: 200, description: 'Access granted successfully' })
  async manualGrantAccess(
    @Param('id') bookId: string,
    @Body() dto: ManualGrantAccessDto,
    @Req() req: Request,
  ) {
    return this.campaignControlsService.manualGrantAccess(
      bookId,
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  /**
   * Remove a reader from a campaign (Section 5.3)
   */
  @Post(':id/remove-reader')
  @ApiOperation({ summary: 'Remove a reader from a campaign' })
  @ApiResponse({ status: 200, description: 'Reader removed successfully' })
  async removeReaderFromCampaign(
    @Param('id') bookId: string,
    @Body() dto: RemoveReaderFromCampaignDto,
    @Req() req: Request,
  ) {
    return this.campaignControlsService.removeReaderFromCampaign(
      bookId,
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  /**
   * Generate campaign report data for PDF (Section 5.3)
   */
  @Get(':id/report')
  @ApiOperation({ summary: 'Generate campaign report data for PDF' })
  @ApiResponse({ status: 200, description: 'Campaign report data' })
  async generateCampaignReport(
    @Param('id') bookId: string,
    @Req() req: Request,
  ) {
    return this.campaignControlsService.generateCampaignReportData(
      bookId,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }
}
