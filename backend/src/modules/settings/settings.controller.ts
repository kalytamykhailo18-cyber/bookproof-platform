import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { SettingsService } from './settings.service';
import {
  UpdateSettingDto,
  UpdateKeywordPricingDto,
  SettingResponseDto,
  KeywordPricingResponseDto,
  PricingSettingsResponseDto,
  UpdateKeywordResearchFeatureDto,
  KeywordResearchFeatureStatusDto,
} from './dto';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  /**
   * Get all settings (Admin only)
   */
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all system settings (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'All system settings',
    type: [SettingResponseDto],
  })
  async getAllSettings(): Promise<SettingResponseDto[]> {
    return this.settingsService.getAllSettings();
  }

  /**
   * Get settings by category (Admin only)
   */
  @Get('admin/category/:category')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get settings by category (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Settings for category',
    type: [SettingResponseDto],
  })
  async getSettingsByCategory(
    @Param('category') category: string,
  ): Promise<SettingResponseDto[]> {
    return this.settingsService.getSettingsByCategory(category);
  }

  /**
   * Update a setting (Admin only)
   */
  @Put('admin/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a system setting (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Setting updated successfully',
    type: SettingResponseDto,
  })
  async updateSetting(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @Req() req: Request,
  ): Promise<SettingResponseDto> {
    return this.settingsService.updateSetting(
      key,
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  // ============================================
  // PRICING ENDPOINTS (Admin only)
  // ============================================

  /**
   * Get all pricing settings (Admin only)
   */
  @Get('admin/pricing')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all pricing settings (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'All pricing settings',
    type: PricingSettingsResponseDto,
  })
  async getPricingSettings(): Promise<PricingSettingsResponseDto> {
    return this.settingsService.getPricingSettings();
  }

  /**
   * Get keyword research pricing (Admin only)
   */
  @Get('admin/pricing/keyword-research')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get keyword research pricing (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Keyword research pricing',
    type: KeywordPricingResponseDto,
  })
  async getKeywordResearchPricing(): Promise<KeywordPricingResponseDto> {
    return this.settingsService.getKeywordResearchPricing();
  }

  /**
   * Update keyword research pricing (Admin only)
   */
  @Put('admin/pricing/keyword-research')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update keyword research pricing (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Pricing updated successfully',
    type: KeywordPricingResponseDto,
  })
  async updateKeywordResearchPricing(
    @Body() dto: UpdateKeywordPricingDto,
    @Req() req: Request,
  ): Promise<KeywordPricingResponseDto> {
    return this.settingsService.updateKeywordResearchPricing(
      dto,
      req.user!.id,
      req.user!.email,
      req.ip,
    );
  }

  // ============================================
  // FEATURE TOGGLE ENDPOINTS (Admin only)
  // ============================================

  /**
   * Get keyword research feature status (Admin only)
   */
  @Get('admin/features/keyword-research')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get keyword research feature status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Keyword research feature status',
    type: KeywordResearchFeatureStatusDto,
  })
  async getKeywordResearchFeatureStatus(): Promise<KeywordResearchFeatureStatusDto> {
    const enabled = await this.settingsService.isKeywordResearchEnabled();
    const setting = await this.settingsService.getSetting('keyword_research_enabled');
    return {
      enabled,
      updatedAt: setting?.updatedAt || new Date(),
      updatedBy: setting?.updatedBy,
    };
  }

  /**
   * Toggle keyword research feature (Admin only)
   */
  @Put('admin/features/keyword-research')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable/disable keyword research feature (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Feature status updated',
    type: KeywordResearchFeatureStatusDto,
  })
  async toggleKeywordResearchFeature(
    @Body() dto: UpdateKeywordResearchFeatureDto,
    @Req() req: Request,
  ): Promise<KeywordResearchFeatureStatusDto> {
    await this.settingsService.setKeywordResearchEnabled(
      dto.enabled,
      req.user!.id,
      req.user!.email,
      dto.reason,
      req.ip,
    );
    return this.getKeywordResearchFeatureStatus();
  }

  // ============================================
  // PUBLIC ENDPOINTS (for frontend display)
  // ============================================

  /**
   * Get public pricing info (for author checkout)
   */
  @Get('pricing/keyword-research')
  @ApiOperation({ summary: 'Get keyword research price (public)' })
  @ApiResponse({
    status: 200,
    description: 'Keyword research pricing',
    type: KeywordPricingResponseDto,
  })
  async getPublicKeywordResearchPricing(): Promise<KeywordPricingResponseDto> {
    return this.settingsService.getKeywordResearchPricing();
  }

  /**
   * Get public feature status (for frontend to check if feature is available)
   */
  @Get('features/keyword-research')
  @ApiOperation({ summary: 'Get keyword research feature availability (public)' })
  @ApiResponse({
    status: 200,
    description: 'Whether keyword research feature is enabled',
    schema: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean' },
      },
    },
  })
  async getPublicKeywordResearchFeatureStatus(): Promise<{ enabled: boolean }> {
    const enabled = await this.settingsService.isKeywordResearchEnabled();
    return { enabled };
  }
}
