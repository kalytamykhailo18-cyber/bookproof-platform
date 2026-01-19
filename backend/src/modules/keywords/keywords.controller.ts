import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { KeywordsService } from './keywords.service';
import {
  CreateKeywordResearchDto,
  UpdateKeywordResearchDto,
  KeywordResearchResponseDto,
  KeywordResearchListItemDto,
  CreateKeywordResearchCheckoutDto,
  KeywordResearchCheckoutResponseDto,
} from './dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { GetUser } from '@common/decorators/get-user.decorator';
import { SettingsService } from '../settings/settings.service';

@ApiTags('Keyword Research')
@Controller('keyword-research')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KeywordsController {
  constructor(
    private readonly keywordsService: KeywordsService,
    private readonly settingsService: SettingsService,
  ) {}

  /**
   * Check if keyword research feature is enabled
   */
  private async checkFeatureEnabled(): Promise<void> {
    const isEnabled = await this.settingsService.isKeywordResearchEnabled();
    if (!isEnabled) {
      throw new ServiceUnavailableException(
        'Keyword research feature is currently disabled. Please try again later.',
      );
    }
  }

  /**
   * Create keyword research order
   */
  @Post()
  @Roles(UserRole.AUTHOR)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create keyword research order (Author only)' })
  @ApiResponse({
    status: 201,
    description: 'Keyword research order created',
    type: KeywordResearchResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  @ApiResponse({ status: 409, description: 'Research already exists for this book' })
  @ApiResponse({ status: 503, description: 'Feature is disabled' })
  async create(
    @Body() createDto: CreateKeywordResearchDto,
    @GetUser('authorProfileId') authorProfileId: string,
  ): Promise<KeywordResearchResponseDto> {
    await this.checkFeatureEnabled();
    return this.keywordsService.create(createDto, authorProfileId);
  }

  /**
   * Get all keyword research orders for current author
   */
  @Get()
  @Roles(UserRole.AUTHOR)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all keyword research orders for current author' })
  @ApiResponse({
    status: 200,
    description: 'List of keyword research orders',
    type: [KeywordResearchListItemDto],
  })
  async findAllForAuthor(
    @GetUser('authorProfileId') authorProfileId: string,
  ): Promise<KeywordResearchListItemDto[]> {
    return this.keywordsService.findAllForAuthor(authorProfileId);
  }

  /**
   * Get all keyword research orders (Admin)
   */
  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all keyword research orders (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all keyword research orders',
    type: [KeywordResearchListItemDto],
  })
  async findAll(): Promise<KeywordResearchListItemDto[]> {
    return this.keywordsService.findAll();
  }

  /**
   * Get keyword research details
   */
  @Get(':id')
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get keyword research details' })
  @ApiResponse({
    status: 200,
    description: 'Keyword research details',
    type: KeywordResearchResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Research not found' })
  async findOne(
    @Param('id') id: string,
    @GetUser('role') role: UserRole,
    @GetUser('authorProfileId') authorProfileId: string,
  ): Promise<KeywordResearchResponseDto> {
    // Admins can see any research, authors only their own
    const ownerCheck = role === UserRole.ADMIN ? undefined : authorProfileId;
    return this.keywordsService.findOne(id, ownerCheck);
  }

  /**
   * Update keyword research (only allowed for PENDING status)
   */
  @Patch(':id')
  @Roles(UserRole.AUTHOR)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Update keyword research (Author only, PENDING status only)',
    description: 'Update book details for keyword research before payment is completed',
  })
  @ApiResponse({
    status: 200,
    description: 'Keyword research updated',
    type: KeywordResearchResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Cannot update - already processed or not owner' })
  @ApiResponse({ status: 404, description: 'Research not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateKeywordResearchDto,
    @GetUser('authorProfileId') authorProfileId: string,
  ): Promise<KeywordResearchResponseDto> {
    return this.keywordsService.update(id, updateDto, authorProfileId);
  }

  /**
   * Download PDF
   */
  @Get(':id/download')
  @Roles(UserRole.AUTHOR, UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get PDF download URL' })
  @ApiResponse({
    status: 200,
    description: 'PDF download URL',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Research or PDF not found' })
  async downloadPdf(
    @Param('id') id: string,
    @GetUser('role') role: UserRole,
    @GetUser('authorProfileId') authorProfileId: string,
  ): Promise<{ url: string }> {
    // Admins can download any PDF, authors only their own
    const ownerCheck = role === UserRole.ADMIN ? undefined : authorProfileId;
    const url = await this.keywordsService.downloadPdf(id, ownerCheck);
    return { url };
  }

  /**
   * Create checkout session for keyword research payment
   */
  @Post(':id/checkout')
  @Roles(UserRole.AUTHOR)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create Stripe checkout session for keyword research payment',
    description: 'Create a Stripe checkout session to pay for pending keyword research',
  })
  @ApiResponse({
    status: 200,
    description: 'Checkout session created',
    type: KeywordResearchCheckoutResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Already paid or invalid status' })
  @ApiResponse({ status: 404, description: 'Research not found' })
  async createCheckout(
    @Param('id') id: string,
    @Body() dto: CreateKeywordResearchCheckoutDto,
    @GetUser('authorProfileId') authorProfileId: string,
  ): Promise<KeywordResearchCheckoutResponseDto> {
    return this.keywordsService.createCheckoutSession(id, dto, authorProfileId);
  }

  /**
   * Regenerate keywords (Admin only)
   */
  @Post(':id/regenerate')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Regenerate keywords and PDF (Admin only)',
    description: 'Retry keyword generation if it failed or needs updating',
  })
  @ApiResponse({
    status: 200,
    description: 'Regeneration started',
    type: KeywordResearchResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Research not found' })
  async regenerate(@Param('id') id: string): Promise<KeywordResearchResponseDto> {
    return this.keywordsService.regenerate(id);
  }
}
