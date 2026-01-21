import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UserManagementService } from '../services/user-management.service';
import {
  BanUserDto,
  UnbanUserDto,
  ChangeUserRoleDto,
  AdminResetPasswordDto,
  UpdateEmailVerificationDto,
  SendUserEmailDto,
  AdminEditUserProfileDto,
  UserManagementResponseDto,
} from '../dto/user-management.dto';

/**
 * Admin controller for user management operations (Section 5.2)
 */
@ApiTags('Admin User Management')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UserManagementController {
  constructor(private userManagementService: UserManagementService) {}

  /**
   * Get user by ID
   */
  @Get(':userId')
  @ApiOperation({
    summary: 'Get user details',
    description: 'Get detailed information about a user (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'User details',
    type: UserManagementResponseDto,
  })
  async getUser(@Param('userId') userId: string) {
    return this.userManagementService.getUserById(userId);
  }

  /**
   * Ban a user (permanent)
   */
  @Post(':userId/ban')
  @ApiOperation({
    summary: 'Ban user (permanent)',
    description: 'Permanently ban a user account (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'User banned successfully',
    type: UserManagementResponseDto,
  })
  async banUser(
    @Param('userId') userId: string,
    @Body() dto: BanUserDto,
    @Req() req: any,
  ) {
    return this.userManagementService.banUser(
      userId,
      dto,
      req.user.userId,
      req.user.email,
      req.ip,
    );
  }

  /**
   * Unban a user
   */
  @Post(':userId/unban')
  @ApiOperation({
    summary: 'Unban user',
    description: 'Remove permanent ban from a user account (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'User unbanned successfully',
    type: UserManagementResponseDto,
  })
  async unbanUser(
    @Param('userId') userId: string,
    @Body() dto: UnbanUserDto,
    @Req() req: any,
  ) {
    return this.userManagementService.unbanUser(
      userId,
      dto,
      req.user.userId,
      req.user.email,
      req.ip,
    );
  }

  /**
   * Change user role
   */
  @Post(':userId/change-role')
  @ApiOperation({
    summary: 'Change user role',
    description: 'Change the role of a user (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'User role changed successfully',
    type: UserManagementResponseDto,
  })
  async changeUserRole(
    @Param('userId') userId: string,
    @Body() dto: ChangeUserRoleDto,
    @Req() req: any,
  ) {
    return this.userManagementService.changeUserRole(
      userId,
      dto,
      req.user.userId,
      req.user.email,
      req.ip,
    );
  }

  /**
   * Reset user password (admin-initiated)
   */
  @Post(':userId/reset-password')
  @ApiOperation({
    summary: 'Reset user password',
    description: 'Initiate password reset for a user (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset initiated successfully',
  })
  async resetUserPassword(
    @Param('userId') userId: string,
    @Body() dto: AdminResetPasswordDto,
    @Req() req: any,
  ) {
    return this.userManagementService.resetUserPassword(
      userId,
      dto,
      req.user.userId,
      req.user.email,
      req.ip,
    );
  }

  /**
   * Update email verification status
   */
  @Patch(':userId/verify-email')
  @ApiOperation({
    summary: 'Update email verification',
    description: 'Manually verify or unverify a user email (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verification updated successfully',
    type: UserManagementResponseDto,
  })
  async updateEmailVerification(
    @Param('userId') userId: string,
    @Body() dto: UpdateEmailVerificationDto,
    @Req() req: any,
  ) {
    return this.userManagementService.updateEmailVerification(
      userId,
      dto,
      req.user.userId,
      req.user.email,
      req.ip,
    );
  }

  /**
   * Send email to user
   */
  @Post(':userId/send-email')
  @ApiOperation({
    summary: 'Send email to user',
    description: 'Send a custom email to a user (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Email sent successfully',
  })
  async sendEmailToUser(
    @Param('userId') userId: string,
    @Body() dto: SendUserEmailDto,
    @Req() req: any,
  ) {
    return this.userManagementService.sendEmailToUser(
      userId,
      dto,
      req.user.userId,
      req.user.email,
      req.ip,
    );
  }

  /**
   * Edit user profile (admin override)
   */
  @Patch(':userId/profile')
  @ApiOperation({
    summary: 'Edit user profile',
    description: 'Edit user profile fields (admin override)',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
    type: UserManagementResponseDto,
  })
  async editUserProfile(
    @Param('userId') userId: string,
    @Body() dto: AdminEditUserProfileDto,
    @Req() req: any,
  ) {
    return this.userManagementService.editUserProfile(
      userId,
      dto,
      req.user.userId,
      req.user.email,
      req.ip,
    );
  }

  /**
   * Get user audit log
   */
  @Get(':userId/audit-log')
  @ApiOperation({
    summary: 'Get user audit log',
    description: 'Get audit log entries for a specific user (admin only)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'User audit log',
  })
  async getUserAuditLog(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.userManagementService.getUserAuditLog(
      userId,
      page || 1,
      limit || 50,
    );
  }
}
