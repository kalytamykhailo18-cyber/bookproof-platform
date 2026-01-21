import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ReaderManagementService } from '../services/reader-management.service';
import {
  SuspendReaderDto,
  UnsuspendReaderDto,
  AdjustWalletBalanceDto,
  UpdateReaderNotesDto,
  FlagReaderDto,
  UnflagReaderDto,
  AddAdminNoteDto,
} from '../dto/reader-management.dto';

/**
 * Admin controller for reader management operations
 */
@ApiTags('Admin Reader Management')
@ApiBearerAuth()
@Controller('admin/readers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ReaderManagementController {
  constructor(private readerManagementService: ReaderManagementService) {}

  /**
   * Get all readers with filters
   */
  @Get()
  @ApiOperation({
    summary: 'Get all readers',
    description: 'Get all readers with filters and pagination (admin only)',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'active', 'suspended', 'flagged'] })
  @ApiQuery({ name: 'contentPreference', required: false, enum: ['EBOOK', 'AUDIOBOOK', 'BOTH', 'all'] })
  @ApiQuery({ name: 'minReliabilityScore', required: false, type: Number })
  @ApiQuery({ name: 'hasVerifiedAmazon', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of readers',
  })
  async getAllReaders(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('contentPreference') contentPreference?: string,
    @Query('minReliabilityScore') minReliabilityScore?: string,
    @Query('hasVerifiedAmazon') hasVerifiedAmazon?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.readerManagementService.getAllReaders({
      search,
      status: status as any,
      contentPreference: contentPreference as any,
      minReliabilityScore: minReliabilityScore ? parseFloat(minReliabilityScore) : undefined,
      hasVerifiedAmazon: hasVerifiedAmazon ? hasVerifiedAmazon === 'true' : undefined,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    });
  }

  /**
   * Get reader stats for admin dashboard
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get reader statistics',
    description: 'Get reader statistics for admin dashboard (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Reader statistics',
  })
  async getReaderStats() {
    return this.readerManagementService.getReaderStats();
  }

  /**
   * Get reader details by ID
   */
  @Get(':readerProfileId')
  @ApiOperation({
    summary: 'Get reader details',
    description: 'Get detailed reader information including user-level data (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Reader details',
  })
  async getReaderDetails(@Param('readerProfileId') readerProfileId: string) {
    return this.readerManagementService.getReaderDetails(readerProfileId);
  }

  /**
   * Get reader review history
   */
  @Get(':readerProfileId/reviews')
  @ApiOperation({
    summary: 'Get reader review history',
    description: 'Get review history for a reader (admin only)',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Reader review history',
  })
  async getReaderReviewHistory(
    @Param('readerProfileId') readerProfileId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.readerManagementService.getReaderReviewHistory(
      readerProfileId,
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
    );
  }

  /**
   * Suspend a reader account
   */
  @Post(':readerProfileId/suspend')
  @ApiOperation({
    summary: 'Suspend reader account',
    description: 'Suspend a reader account (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Reader suspended successfully',
  })
  async suspendReader(
    @Param('readerProfileId') readerProfileId: string,
    @Body() dto: SuspendReaderDto,
    @Req() req: any,
  ) {
    const adminUserId = req.user.userId;
    const adminEmail = req.user.email;
    const ipAddress = req.ip;

    return this.readerManagementService.suspendReader(
      readerProfileId,
      dto,
      adminUserId,
      adminEmail,
      ipAddress,
    );
  }

  /**
   * Unsuspend a reader account
   */
  @Post(':readerProfileId/unsuspend')
  @ApiOperation({
    summary: 'Unsuspend reader account',
    description: 'Unsuspend a reader account (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Reader unsuspended successfully',
  })
  async unsuspendReader(
    @Param('readerProfileId') readerProfileId: string,
    @Body() dto: UnsuspendReaderDto,
    @Req() req: any,
  ) {
    const adminUserId = req.user.userId;
    const adminEmail = req.user.email;
    const ipAddress = req.ip;

    return this.readerManagementService.unsuspendReader(
      readerProfileId,
      dto,
      adminUserId,
      adminEmail,
      ipAddress,
    );
  }

  /**
   * Adjust reader wallet balance
   */
  @Post(':readerProfileId/adjust-wallet')
  @ApiOperation({
    summary: 'Adjust reader wallet balance',
    description: 'Manually adjust reader wallet balance (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Wallet balance adjusted successfully',
  })
  async adjustWalletBalance(
    @Param('readerProfileId') readerProfileId: string,
    @Body() dto: AdjustWalletBalanceDto,
    @Req() req: any,
  ) {
    const adminUserId = req.user.userId;
    const adminEmail = req.user.email;
    const ipAddress = req.ip;

    return this.readerManagementService.adjustWalletBalance(
      readerProfileId,
      dto,
      adminUserId,
      adminEmail,
      ipAddress,
    );
  }

  /**
   * Update reader admin notes
   */
  @Patch(':readerProfileId/notes')
  @ApiOperation({
    summary: 'Update reader admin notes',
    description: 'Update admin notes for a reader (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin notes updated successfully',
  })
  async updateAdminNotes(
    @Param('readerProfileId') readerProfileId: string,
    @Body() dto: UpdateReaderNotesDto,
    @Req() req: any,
  ) {
    const adminUserId = req.user.userId;
    const adminEmail = req.user.email;
    const ipAddress = req.ip;

    return this.readerManagementService.updateAdminNotes(
      readerProfileId,
      dto,
      adminUserId,
      adminEmail,
      ipAddress,
    );
  }

  /**
   * Flag a reader
   */
  @Post(':readerProfileId/flag')
  @ApiOperation({
    summary: 'Flag reader',
    description: 'Flag a reader for attention (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Reader flagged successfully',
  })
  async flagReader(
    @Param('readerProfileId') readerProfileId: string,
    @Body() dto: FlagReaderDto,
    @Req() req: any,
  ) {
    return this.readerManagementService.flagReader(
      readerProfileId,
      dto,
      req.user.userId,
      req.user.email,
      req.ip,
    );
  }

  /**
   * Unflag a reader
   */
  @Post(':readerProfileId/unflag')
  @ApiOperation({
    summary: 'Unflag reader',
    description: 'Remove flag from a reader (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Reader unflagged successfully',
  })
  async unflagReader(
    @Param('readerProfileId') readerProfileId: string,
    @Body() dto: UnflagReaderDto,
    @Req() req: any,
  ) {
    return this.readerManagementService.unflagReader(
      readerProfileId,
      dto,
      req.user.userId,
      req.user.email,
      req.ip,
    );
  }

  /**
   * Add admin note to reader
   */
  @Post(':readerProfileId/notes')
  @ApiOperation({
    summary: 'Add admin note',
    description: 'Add an admin note to a reader (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin note added successfully',
  })
  async addAdminNote(
    @Param('readerProfileId') readerProfileId: string,
    @Body() dto: AddAdminNoteDto,
    @Req() req: any,
  ) {
    return this.readerManagementService.addAdminNote(
      readerProfileId,
      dto,
      req.user.userId,
      req.user.email,
      req.ip,
    );
  }

  /**
   * Delete admin note from reader
   */
  @Delete(':readerProfileId/notes/:noteId')
  @ApiOperation({
    summary: 'Delete admin note',
    description: 'Delete an admin note from a reader (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin note deleted successfully',
  })
  async deleteAdminNote(
    @Param('readerProfileId') readerProfileId: string,
    @Param('noteId') noteId: string,
    @Req() req: any,
  ) {
    return this.readerManagementService.deleteAdminNote(
      readerProfileId,
      noteId,
      req.user.userId,
      req.user.email,
      req.ip,
    );
  }

  /**
   * Manually verify Amazon profile
   */
  @Post(':readerProfileId/amazon-profiles/:amazonProfileId/verify')
  @ApiOperation({
    summary: 'Verify Amazon profile',
    description: 'Manually verify a reader Amazon profile (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Amazon profile verified successfully',
  })
  async verifyAmazonProfile(
    @Param('readerProfileId') readerProfileId: string,
    @Param('amazonProfileId') amazonProfileId: string,
    @Req() req: any,
  ) {
    return this.readerManagementService.verifyAmazonProfile(
      readerProfileId,
      amazonProfileId,
      req.user.userId,
      req.user.email,
      req.ip,
    );
  }
}
