import { Controller, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
}
