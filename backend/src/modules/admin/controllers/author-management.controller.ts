import { Controller, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { AuthorManagementService } from '../services/author-management.service';
import {
  SuspendAuthorDto,
  UnsuspendAuthorDto,
  UpdateAuthorNotesDto,
} from '../dto/author-management.dto';

/**
 * Admin controller for author management operations
 */
@ApiTags('Admin Author Management')
@ApiBearerAuth()
@Controller('admin/authors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AuthorManagementController {
  constructor(private authorManagementService: AuthorManagementService) {}

  /**
   * Suspend an author account
   */
  @Post(':authorProfileId/suspend')
  @ApiOperation({
    summary: 'Suspend author account',
    description: 'Suspend an author account (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Author suspended successfully',
  })
  async suspendAuthor(
    @Param('authorProfileId') authorProfileId: string,
    @Body() dto: SuspendAuthorDto,
    @Req() req: any,
  ) {
    const adminUserId = req.user.userId;
    const adminEmail = req.user.email;
    const ipAddress = req.ip;

    return this.authorManagementService.suspendAuthor(
      authorProfileId,
      dto,
      adminUserId,
      adminEmail,
      ipAddress,
    );
  }

  /**
   * Unsuspend an author account
   */
  @Post(':authorProfileId/unsuspend')
  @ApiOperation({
    summary: 'Unsuspend author account',
    description: 'Unsuspend an author account (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Author unsuspended successfully',
  })
  async unsuspendAuthor(
    @Param('authorProfileId') authorProfileId: string,
    @Body() dto: UnsuspendAuthorDto,
    @Req() req: any,
  ) {
    const adminUserId = req.user.userId;
    const adminEmail = req.user.email;
    const ipAddress = req.ip;

    return this.authorManagementService.unsuspendAuthor(
      authorProfileId,
      dto,
      adminUserId,
      adminEmail,
      ipAddress,
    );
  }

  /**
   * Update author admin notes
   */
  @Patch(':authorProfileId/notes')
  @ApiOperation({
    summary: 'Update author admin notes',
    description: 'Update admin notes for an author (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin notes updated successfully',
  })
  async updateAdminNotes(
    @Param('authorProfileId') authorProfileId: string,
    @Body() dto: UpdateAuthorNotesDto,
    @Req() req: any,
  ) {
    const adminUserId = req.user.userId;
    const adminEmail = req.user.email;
    const ipAddress = req.ip;

    return this.authorManagementService.updateAdminNotes(
      authorProfileId,
      dto,
      adminUserId,
      adminEmail,
      ipAddress,
    );
  }
}
