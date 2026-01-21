import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { PublicCampaignsService } from './public-campaigns.service';
import {
  PublicCampaignDto,
  TrackViewDto,
  ApplyToCampaignPublicDto,
} from './dto/public-campaign.dto';
import { generateVisitorHash, getClientIp } from '@common/utils/visitor-hash.util';

/**
 * Public Campaigns Controller - Milestone 2.2 & 2.3
 *
 * Handles public-facing campaign landing pages and reader registration
 * Per requirements: "Landing pages are publicly accessible (no login required to view)"
 */
@ApiTags('Public Campaigns')
@Controller('public/campaigns')
export class PublicCampaignsController {
  constructor(private readonly publicCampaignsService: PublicCampaignsService) {}

  /**
   * Get public campaign by slug and language
   * Per Milestone 2.2: "System automatically creates public-facing campaign pages"
   */
  @Public()
  @Get(':slug/:language')
  @ApiOperation({
    summary: 'View public campaign landing page',
    description:
      'Publicly accessible campaign landing page. No authentication required. ' +
      'Returns campaign details for display on public landing page.',
  })
  @ApiParam({ name: 'slug', description: 'Campaign slug', example: 'my-awesome-thriller' })
  @ApiParam({ name: 'language', description: 'Language code', example: 'en', enum: ['en', 'pt', 'es'] })
  @ApiResponse({
    status: 200,
    description: 'Campaign details retrieved successfully',
    type: PublicCampaignDto,
  })
  @ApiResponse({ status: 404, description: 'Campaign not found or landing page not enabled' })
  async getPublicCampaign(
    @Param('slug') slug: string,
    @Param('language') language: string,
  ): Promise<PublicCampaignDto> {
    return this.publicCampaignsService.getPublicCampaign(slug, language.toUpperCase());
  }

  /**
   * Track page view for campaign landing page
   * Per Milestone 2.2: "View counter (tracks page visits)"
   * Per requirements: "View tracking counts unique visitors, not repeated visits"
   */
  @Public()
  @Post(':slug/track-view')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Track landing page view',
    description: 'Records a view on the campaign landing page for analytics. Tracks unique visitors.',
  })
  @ApiParam({ name: 'slug', description: 'Campaign slug' })
  @ApiBody({ type: TrackViewDto })
  @ApiResponse({ status: 204, description: 'View tracked successfully' })
  async trackView(
    @Param('slug') slug: string,
    @Body() dto: TrackViewDto,
    @Req() request: Request,
  ): Promise<void> {
    // Extract visitor information for unique tracking
    const ip = getClientIp(request);
    const userAgent = request.headers['user-agent'] || 'unknown';
    const visitorHash = generateVisitorHash(ip, userAgent);

    return this.publicCampaignsService.trackView(slug, dto.language, visitorHash);
  }
}
