import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AffiliatesService } from './affiliates.service';
import { TrackingService } from './services/tracking.service';
import { CommissionService } from './services/commission.service';
import { AffiliatePayoutService } from './services/payout.service';
import { MarketingMaterialsService } from './services/marketing-materials.service';
import {
  RegisterAffiliateDto,
  ApproveAffiliateDto,
  TrackClickDto,
  RequestPayoutDto,
  ProcessPayoutDto,
  AffiliateProfileResponseDto,
  AffiliateListItemDto,
  AffiliateStatsDto,
  CommissionResponseDto,
  PayoutResponseDto,
} from './dto';
import {
  CreateMarketingMaterialDto,
  UpdateMarketingMaterialDto,
  GetMarketingMaterialsQueryDto,
  MarketingMaterialResponseDto,
} from './dto/marketing-material.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole, CommissionStatus, PayoutRequestStatus } from '@prisma/client';
import { GetUser } from '@common/decorators/get-user.decorator';

@ApiTags('Affiliates')
@Controller('affiliates')
export class AffiliatesController {
  constructor(
    private readonly affiliatesService: AffiliatesService,
    private readonly trackingService: TrackingService,
    private readonly commissionService: CommissionService,
    private readonly payoutService: AffiliatePayoutService,
    private readonly marketingMaterialsService: MarketingMaterialsService,
  ) {}

  /**
   * Register as affiliate (public/authenticated)
   */
  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register as affiliate' })
  @ApiResponse({
    status: 201,
    description: 'Affiliate registration created',
    type: AffiliateProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'User already has an affiliate profile' })
  async register(
    @Body() registerDto: RegisterAffiliateDto,
    @GetUser('userId') userId: string,
  ): Promise<AffiliateProfileResponseDto> {
    return this.affiliatesService.register(userId, registerDto);
  }

  /**
   * Track affiliate click (public endpoint)
   * Sets cookie for attribution
   */
  @Post('track-click')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track affiliate click' })
  @ApiResponse({
    status: 200,
    description: 'Click tracked successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid referral code' })
  async trackClick(
    @Body() trackClickDto: TrackClickDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ success: boolean; message: string }> {
    const { cookieId, cookieExpiry } = await this.trackingService.trackClick(trackClickDto, request);

    // Set cookie
    const cookieName = this.trackingService.getCookieName();
    response.cookie(cookieName, cookieId, {
      expires: cookieExpiry,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return {
      success: true,
      message: 'Click tracked successfully',
    };
  }

  /**
   * Get current affiliate profile
   */
  @Get('me')
  @Roles(UserRole.AFFILIATE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current affiliate profile' })
  @ApiResponse({
    status: 200,
    description: 'Affiliate profile',
    type: AffiliateProfileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Affiliate profile not found' })
  async getMe(@GetUser('userId') userId: string): Promise<AffiliateProfileResponseDto> {
    return this.affiliatesService.getProfile(userId);
  }

  /**
   * Get affiliate stats
   */
  @Get('stats')
  @Roles(UserRole.AFFILIATE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get affiliate statistics' })
  @ApiResponse({
    status: 200,
    description: 'Affiliate statistics',
    type: AffiliateStatsDto,
  })
  async getStats(@GetUser('affiliateProfileId') affiliateProfileId: string): Promise<AffiliateStatsDto> {
    return this.affiliatesService.getStats(affiliateProfileId);
  }

  /**
   * Get referral link
   */
  @Get('referral-link')
  @Roles(UserRole.AFFILIATE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get affiliate referral link' })
  @ApiResponse({
    status: 200,
    description: 'Referral link',
  })
  async getReferralLink(
    @GetUser('affiliateProfileId') affiliateProfileId: string,
  ): Promise<{ referralLink: string }> {
    const referralLink = await this.affiliatesService.getReferralLink(affiliateProfileId);
    return { referralLink };
  }

  /**
   * Get commissions for current affiliate
   */
  @Get('commissions')
  @Roles(UserRole.AFFILIATE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get commissions for current affiliate' })
  @ApiQuery({ name: 'status', enum: CommissionStatus, required: false })
  @ApiResponse({
    status: 200,
    description: 'List of commissions',
    type: [CommissionResponseDto],
  })
  async getCommissions(
    @GetUser('affiliateProfileId') affiliateProfileId: string,
    @Query('status') status?: CommissionStatus,
  ): Promise<CommissionResponseDto[]> {
    return this.commissionService.getCommissionsForAffiliate(affiliateProfileId, status);
  }

  /**
   * Request payout
   */
  @Post('payouts/request')
  @Roles(UserRole.AFFILIATE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request payout' })
  @ApiResponse({
    status: 201,
    description: 'Payout requested',
    type: PayoutResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input or insufficient balance' })
  async requestPayout(
    @Body() requestPayoutDto: RequestPayoutDto,
    @GetUser('affiliateProfileId') affiliateProfileId: string,
  ): Promise<PayoutResponseDto> {
    return this.payoutService.requestPayout(affiliateProfileId, requestPayoutDto);
  }

  /**
   * Get payouts for current affiliate
   */
  @Get('payouts')
  @Roles(UserRole.AFFILIATE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payouts for current affiliate' })
  @ApiResponse({
    status: 200,
    description: 'List of payouts',
    type: [PayoutResponseDto],
  })
  async getPayouts(@GetUser('affiliateProfileId') affiliateProfileId: string): Promise<PayoutResponseDto[]> {
    return this.payoutService.getPayoutsForAffiliate(affiliateProfileId);
  }

  // ===== ADMIN ENDPOINTS =====

  /**
   * Get all affiliates (Admin)
   */
  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all affiliates (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all affiliates',
    type: [AffiliateListItemDto],
  })
  async getAllForAdmin(): Promise<AffiliateListItemDto[]> {
    return this.affiliatesService.getAllForAdmin();
  }

  /**
   * Get affiliate by ID (Admin)
   */
  @Get('admin/:id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get affiliate by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Affiliate profile',
    type: AffiliateProfileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Affiliate not found' })
  async getByIdForAdmin(@Param('id') id: string): Promise<AffiliateProfileResponseDto> {
    return this.affiliatesService.getById(id);
  }

  /**
   * Approve or reject affiliate (Admin)
   */
  @Put('admin/:id/approve')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject affiliate application (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Affiliate approved/rejected',
    type: AffiliateProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Affiliate not found' })
  async approveAffiliate(
    @Param('id') id: string,
    @Body() approveDto: ApproveAffiliateDto,
    @GetUser('userId') adminUserId: string,
  ): Promise<AffiliateProfileResponseDto> {
    return this.affiliatesService.approveAffiliate(id, approveDto, adminUserId);
  }

  /**
   * Get commissions for affiliate (Admin)
   */
  @Get('admin/:id/commissions')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get commissions for affiliate (Admin only)' })
  @ApiQuery({ name: 'status', enum: CommissionStatus, required: false })
  @ApiResponse({
    status: 200,
    description: 'List of commissions',
    type: [CommissionResponseDto],
  })
  async getCommissionsForAdmin(
    @Param('id') affiliateProfileId: string,
    @Query('status') status?: CommissionStatus,
  ): Promise<CommissionResponseDto[]> {
    return this.commissionService.getCommissionsForAffiliate(affiliateProfileId, status);
  }

  /**
   * Get all payout requests (Admin)
   */
  @Get('admin/payouts/all')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all payout requests (Admin only)' })
  @ApiQuery({ name: 'status', enum: PayoutRequestStatus, required: false })
  @ApiResponse({
    status: 200,
    description: 'List of payout requests',
    type: [PayoutResponseDto],
  })
  async getAllPayoutsForAdmin(@Query('status') status?: PayoutRequestStatus): Promise<PayoutResponseDto[]> {
    return this.payoutService.getAllPayouts(status);
  }

  /**
   * Process payout (Admin)
   */
  @Put('admin/payouts/:id/process')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process payout request (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Payout processed',
    type: PayoutResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Payout not found' })
  async processPayout(
    @Param('id') payoutId: string,
    @Body() processPayoutDto: ProcessPayoutDto,
    @GetUser('userId') adminUserId: string,
  ): Promise<PayoutResponseDto> {
    return this.payoutService.processPayout(payoutId, processPayoutDto, adminUserId);
  }

  /**
   * Toggle affiliate active status (Admin)
   */
  @Put('admin/:id/toggle-active')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable or disable affiliate account (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Affiliate active status toggled',
    type: AffiliateProfileResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Affiliate not found' })
  async toggleAffiliateActive(
    @Param('id') id: string,
    @GetUser('userId') adminUserId: string,
  ): Promise<AffiliateProfileResponseDto> {
    return this.affiliatesService.toggleAffiliateActive(id, adminUserId);
  }

  /**
   * Update affiliate commission rate (Admin)
   */
  @Put('admin/:id/commission-rate')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update affiliate commission rate (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Commission rate updated',
    type: AffiliateProfileResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Affiliate not found' })
  async updateCommissionRate(
    @Param('id') id: string,
    @Body() body: { commissionRate: number },
    @GetUser('userId') adminUserId: string,
  ): Promise<AffiliateProfileResponseDto> {
    return this.affiliatesService.updateCommissionRate(id, body.commissionRate, adminUserId);
  }

  // ===== MARKETING MATERIALS ENDPOINTS =====

  /**
   * Get all marketing materials (Affiliate)
   */
  @Get('marketing-materials')
  @Roles(UserRole.AFFILIATE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get marketing materials for affiliates' })
  @ApiResponse({
    status: 200,
    description: 'List of marketing materials',
    type: [MarketingMaterialResponseDto],
  })
  async getMarketingMaterials(
    @Query() query: GetMarketingMaterialsQueryDto,
  ): Promise<MarketingMaterialResponseDto[]> {
    return this.marketingMaterialsService.getMarketingMaterials(query);
  }

  /**
   * Get a single marketing material by ID (Affiliate)
   */
  @Get('marketing-materials/:id')
  @Roles(UserRole.AFFILIATE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get marketing material by ID' })
  @ApiResponse({
    status: 200,
    description: 'Marketing material',
    type: MarketingMaterialResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Material not found' })
  async getMarketingMaterialById(@Param('id') id: string): Promise<MarketingMaterialResponseDto> {
    return this.marketingMaterialsService.getMarketingMaterialById(id);
  }

  /**
   * Track download of a marketing material (Affiliate)
   */
  @Post('marketing-materials/:id/track-download')
  @Roles(UserRole.AFFILIATE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track download of a marketing material' })
  @ApiResponse({
    status: 200,
    description: 'Download tracked',
  })
  @ApiResponse({ status: 404, description: 'Material not found' })
  async trackDownload(@Param('id') id: string): Promise<{ success: boolean; message: string }> {
    await this.marketingMaterialsService.trackDownload(id);
    return {
      success: true,
      message: 'Download tracked successfully',
    };
  }

  // ===== ADMIN MARKETING MATERIALS ENDPOINTS =====

  /**
   * Get all marketing materials with stats (Admin)
   */
  @Get('admin/marketing-materials')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all marketing materials (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of marketing materials',
    type: [MarketingMaterialResponseDto],
  })
  async getMarketingMaterialsForAdmin(
    @Query() query: GetMarketingMaterialsQueryDto,
  ): Promise<MarketingMaterialResponseDto[]> {
    // Admin can see inactive materials
    return this.marketingMaterialsService.getMarketingMaterials({ ...query, includeInactive: true });
  }

  /**
   * Get marketing materials statistics (Admin)
   */
  @Get('admin/marketing-materials/stats')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get marketing materials statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Marketing materials statistics',
  })
  async getMarketingMaterialsStats() {
    return this.marketingMaterialsService.getStatistics();
  }

  /**
   * Create a new marketing material (Admin)
   */
  @Post('admin/marketing-materials')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create marketing material (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Material created',
    type: MarketingMaterialResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createMarketingMaterial(
    @Body() dto: CreateMarketingMaterialDto,
    @GetUser('userId') adminUserId: string,
  ): Promise<MarketingMaterialResponseDto> {
    return this.marketingMaterialsService.createMarketingMaterial(dto, adminUserId);
  }

  /**
   * Update a marketing material (Admin)
   */
  @Put('admin/marketing-materials/:id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update marketing material (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Material updated',
    type: MarketingMaterialResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Material not found' })
  async updateMarketingMaterial(
    @Param('id') id: string,
    @Body() dto: UpdateMarketingMaterialDto,
    @GetUser('userId') adminUserId: string,
  ): Promise<MarketingMaterialResponseDto> {
    return this.marketingMaterialsService.updateMarketingMaterial(id, dto, adminUserId);
  }

  /**
   * Toggle active status of a marketing material (Admin)
   */
  @Put('admin/marketing-materials/:id/toggle-active')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle active status of marketing material (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Material status toggled',
    type: MarketingMaterialResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Material not found' })
  async toggleMarketingMaterialActive(
    @Param('id') id: string,
    @GetUser('userId') adminUserId: string,
  ): Promise<MarketingMaterialResponseDto> {
    return this.marketingMaterialsService.toggleActive(id, adminUserId);
  }

  /**
   * Delete a marketing material (Admin)
   */
  @Delete('admin/marketing-materials/:id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete marketing material (Admin only)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: 204,
    description: 'Material deleted',
  })
  @ApiResponse({ status: 404, description: 'Material not found' })
  async deleteMarketingMaterial(
    @Param('id') id: string,
    @GetUser('userId') adminUserId: string,
  ): Promise<void> {
    await this.marketingMaterialsService.deleteMarketingMaterial(id, adminUserId);
  }
}
