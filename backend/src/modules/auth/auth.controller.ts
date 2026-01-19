import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/reset-password.dto';
import { AuthResponseDto, MessageResponseDto, UserDataDto } from './dto/auth-response.dto';
import { CreateAuthorByCloserDto, CreateAuthorByCloserResponseDto } from './dto/create-author-by-closer.dto';
import { CreateAdminDto, CreateAdminResponseDto } from './dto/create-admin.dto';
import { CreateCloserDto, CreateCloserResponseDto } from './dto/create-closer.dto';
import { UnlockAccountDto, UnlockAccountResponseDto } from './dto/unlock-account.dto';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser, CurrentUserData } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

/**
 * Authentication Controller
 *
 * Implements strict rate limiting on sensitive endpoints to prevent:
 * - Brute force attacks on login
 * - Registration spam/bot attacks
 * - Password reset abuse
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 registrations per minute per IP
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered', type: AuthResponseDto })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 429, description: 'Too many registration attempts' })
  async register(@Body() registerDto: RegisterDto, @Req() request: Request): Promise<AuthResponseDto> {
    return this.authService.register(registerDto, request);
  }

  @Public()
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 login attempts per minute per IP
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many login attempts' })
  async login(@Body() loginDto: LoginDto, @Req() request: Request): Promise<AuthResponseDto> {
    return this.authService.login(loginDto, request);
  }

  @Public()
  @Post('verify-email')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 attempts per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address with token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully', type: MessageResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<MessageResponseDto> {
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Public()
  @Post('request-password-reset')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 password reset requests per minute per IP
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset link' })
  @ApiResponse({ status: 200, description: 'Reset link sent if email exists', type: MessageResponseDto })
  @ApiResponse({ status: 429, description: 'Too many password reset requests' })
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto): Promise<MessageResponseDto> {
    return this.authService.requestPasswordReset(dto);
  }

  @Public()
  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 reset attempts per minute
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully', type: MessageResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  @ApiResponse({ status: 429, description: 'Too many password reset attempts' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<MessageResponseDto> {
    return this.authService.resetPassword(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user data', type: UserDataDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: CurrentUserData): Promise<UserDataDto> {
    // Fetch full user data with author profile for terms info
    return this.authService.getUserProfile(user.id);
  }

  @Post('accept-terms')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept terms of service (for authors who need to accept terms)' })
  @ApiResponse({ status: 200, description: 'Terms accepted successfully', type: MessageResponseDto })
  @ApiResponse({ status: 400, description: 'User is not an author or already accepted terms' })
  async acceptTerms(@CurrentUser() user: CurrentUserData): Promise<MessageResponseDto> {
    return this.authService.acceptTerms(user.id);
  }

  @Post('closer/create-author')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLOSER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create author account by Closer after custom package sale' })
  @ApiResponse({
    status: 201,
    description: 'Author account created successfully',
    type: CreateAuthorByCloserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 403, description: 'Only Closers and Admins can create author accounts' })
  async createAuthorByCloser(
    @Body() dto: CreateAuthorByCloserDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<CreateAuthorByCloserResponseDto> {
    return this.authService.createAuthorByCloser(dto, user.id);
  }

  /**
   * Create admin account (Super Admin only)
   * Per requirements.md Section 1.3
   */
  @Post('admin/create-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create admin account (Super Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Admin account created successfully',
    type: CreateAdminResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 403, description: 'Only Super Admins can create admin accounts' })
  async createAdmin(
    @Body() dto: CreateAdminDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<CreateAdminResponseDto> {
    // Note: Additional super admin check should be done in the service
    return this.authService.createAdmin(dto, user.id);
  }

  /**
   * Create closer account (Admin only)
   * Per requirements.md Section 1.4
   */
  @Post('admin/create-closer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create closer account (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Closer account created successfully',
    type: CreateCloserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 403, description: 'Only Admins can create closer accounts' })
  async createCloser(
    @Body() dto: CreateCloserDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<CreateCloserResponseDto> {
    return this.authService.createCloser(dto, user.id);
  }

  /**
   * Unlock a locked account (Admin only)
   * Per requirements.md Section 1.1: Admin can manually unlock accounts
   */
  @Post('admin/unlock-account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlock a locked user account (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Account unlock status',
    type: UnlockAccountResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Only Admins can unlock accounts' })
  async unlockAccount(
    @Body() dto: UnlockAccountDto,
    @CurrentUser() user: CurrentUserData,
  ): Promise<UnlockAccountResponseDto> {
    return this.authService.unlockAccount(dto.email, user.id, dto.reason);
  }
}
