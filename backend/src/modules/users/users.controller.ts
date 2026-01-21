import { Controller, Get, Post, Patch, Delete, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { DataExportResponseDto, DeleteAccountDto, DeleteAccountResponseDto, UpdateConsentDto, ConsentResponseDto, UpdateLanguageDto, UpdateLanguageResponseDto } from './dto/gdpr.dto';
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

  /**
   * Get user's current language preference
   *
   * Per requirements.md Section 7.4:
   * - Language preference stored in profile
   */
  @Get('me/language')
  @ApiOperation({
    summary: 'Get current language preference',
    description: 'Returns the user\'s current language setting',
  })
  @ApiResponse({
    status: 200,
    description: 'Language preference retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        preferredLanguage: { type: 'string', enum: ['EN', 'PT', 'ES'] },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getLanguage(@CurrentUser() user: CurrentUserData): Promise<{ preferredLanguage: string }> {
    return this.usersService.getLanguage(user.id);
  }

  /**
   * Update user's preferred language
   *
   * Per requirements.md Section 7.4:
   * - User can change language in settings
   * - Interface updates immediately
   */
  @Patch('me/language')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update language preference',
    description: 'Change the user\'s preferred language for the platform and email notifications',
  })
  @ApiResponse({
    status: 200,
    description: 'Language preference updated successfully',
    type: UpdateLanguageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid language' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateLanguage(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateLanguageDto,
  ): Promise<UpdateLanguageResponseDto> {
    return this.usersService.updateLanguage(user.id, dto);
  }
}
