import { Controller, Get, Post, Delete, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { DataExportResponseDto, DeleteAccountDto, DeleteAccountResponseDto, UpdateConsentDto, ConsentResponseDto } from './dto/gdpr.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '@common/decorators/current-user.decorator';

/**
 * Users Controller
 *
 * Handles GDPR compliance endpoints:
 * - Data export (requirements.md Section 15.3)
 * - Data deletion (requirements.md Section 15.3)
 * - Consent management
 */
@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Export all user data (GDPR compliance)
   *
   * Per requirements.md Section 15.3:
   * - GDPR compliance for EU users
   * - Data export on request
   */
  @Get('me/export-data')
  @ApiOperation({
    summary: 'Export all user data (GDPR compliance)',
    description: 'Returns a complete package of all user data including personal info, profile data, transactions, and activity logs.',
  })
  @ApiResponse({
    status: 200,
    description: 'User data exported successfully',
    type: DataExportResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async exportData(@CurrentUser() user: CurrentUserData): Promise<DataExportResponseDto> {
    return this.usersService.exportUserData(user.id);
  }

  /**
   * Request account deletion (GDPR compliance)
   *
   * Per requirements.md Section 15.3:
   * - GDPR compliance for EU users
   * - Data deletion on request
   *
   * Implements 30-day grace period before permanent deletion
   */
  @Delete('me/account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request account deletion (GDPR compliance)',
    description: 'Schedules account for deletion with 30-day grace period. User must provide confirmation phrase "DELETE MY ACCOUNT".',
  })
  @ApiResponse({
    status: 200,
    description: 'Account deletion scheduled',
    type: DeleteAccountResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid confirmation phrase' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteAccount(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: DeleteAccountDto,
  ): Promise<DeleteAccountResponseDto> {
    return this.usersService.requestAccountDeletion(user.id, dto);
  }

  /**
   * Cancel pending account deletion
   *
   * Allows user to cancel deletion within grace period
   */
  @Post('me/cancel-deletion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel pending account deletion',
    description: 'Cancel a previously requested account deletion (only works within grace period)',
  })
  @ApiResponse({
    status: 200,
    description: 'Account deletion cancelled',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'No pending deletion found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async cancelDeletion(@CurrentUser() user: CurrentUserData): Promise<{ message: string }> {
    return this.usersService.cancelAccountDeletion(user.id);
  }

  /**
   * Update user consent (GDPR compliance)
   *
   * Allows users to manage their consent preferences
   */
  @Post('me/consent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update consent preferences',
    description: 'Grant or withdraw consent for marketing, analytics, or personalization',
  })
  @ApiResponse({
    status: 200,
    description: 'Consent updated successfully',
    type: ConsentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateConsent(@CurrentUser() user: CurrentUserData, @Body() dto: UpdateConsentDto): Promise<ConsentResponseDto> {
    return this.usersService.updateConsent(user.id, dto);
  }

  /**
   * Get all user consents
   *
   * Returns current consent status for all types
   */
  @Get('me/consents')
  @ApiOperation({
    summary: 'Get all consent preferences',
    description: 'Returns current consent status for marketing, analytics, and personalization',
  })
  @ApiResponse({
    status: 200,
    description: 'Consents retrieved successfully',
    type: [ConsentResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getConsents(@CurrentUser() user: CurrentUserData): Promise<ConsentResponseDto[]> {
    return this.usersService.getUserConsents(user.id);
  }
}
