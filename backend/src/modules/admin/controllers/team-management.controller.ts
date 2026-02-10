import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { TeamManagementService } from '../services/team-management.service';
import {
  CloserListItemDto,
  AdminListItemDto,
  UpdateCloserDto,
  UpdateAdminDto,
  ToggleActiveDto,
} from '../dto/team-management.dto';

/**
 * Controller for team management (listing closers and admins)
 * Per requirements.md Sections 1.3 and 1.4
 */
@ApiTags('Admin - Team Management')
@ApiBearerAuth()
@Controller('admin/team')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class TeamManagementController {
  constructor(private readonly teamManagementService: TeamManagementService) {}

  /**
   * Get all closers
   * Per requirements.md Section 1.4
   */
  @Get('closers')
  @ApiOperation({ summary: 'Get all closers for admin management' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all closers',
    type: [CloserListItemDto],
  })
  async getAllClosers(): Promise<CloserListItemDto[]> {
    return this.teamManagementService.getAllClosers();
  }

  /**
   * Get all admins
   * Per requirements.md Section 1.3
   */
  @Get('admins')
  @ApiOperation({ summary: 'Get all admins for admin management' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all admins',
    type: [AdminListItemDto],
  })
  async getAllAdmins(): Promise<AdminListItemDto[]> {
    return this.teamManagementService.getAllAdmins();
  }

  /**
   * Get single closer by ID
   */
  @Get('closers/:id')
  @ApiOperation({ summary: 'Get closer details by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Closer details',
    type: CloserListItemDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Closer not found',
  })
  async getCloserById(@Param('id') id: string): Promise<CloserListItemDto> {
    return this.teamManagementService.getCloserById(id);
  }

  /**
   * Update closer details
   */
  @Patch('closers/:id')
  @ApiOperation({ summary: 'Update closer details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Closer updated successfully',
    type: CloserListItemDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Closer not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or email already taken',
  })
  async updateCloser(
    @Param('id') id: string,
    @Body() dto: UpdateCloserDto,
  ): Promise<CloserListItemDto> {
    return this.teamManagementService.updateCloser(id, dto);
  }

  /**
   * Toggle closer active status
   */
  @Patch('closers/:id/toggle-active')
  @ApiOperation({ summary: 'Activate or deactivate a closer' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Closer status updated successfully',
    type: CloserListItemDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Closer not found',
  })
  async toggleCloserActive(
    @Param('id') id: string,
    @Body() dto: ToggleActiveDto,
  ): Promise<CloserListItemDto> {
    return this.teamManagementService.toggleCloserActive(id, dto);
  }

  /**
   * Get single admin by ID
   */
  @Get('admins/:id')
  @ApiOperation({ summary: 'Get admin details by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin details',
    type: AdminListItemDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Admin not found',
  })
  async getAdminById(@Param('id') id: string): Promise<AdminListItemDto> {
    return this.teamManagementService.getAdminById(id);
  }

  /**
   * Update admin details
   */
  @Patch('admins/:id')
  @ApiOperation({ summary: 'Update admin details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin updated successfully',
    type: AdminListItemDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Admin not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or email already taken',
  })
  async updateAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateAdminDto,
  ): Promise<AdminListItemDto> {
    return this.teamManagementService.updateAdmin(id, dto);
  }

  /**
   * Toggle admin active status
   */
  @Patch('admins/:id/toggle-active')
  @ApiOperation({ summary: 'Activate or deactivate an admin' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin status updated successfully',
    type: AdminListItemDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Admin not found',
  })
  async toggleAdminActive(
    @Param('id') id: string,
    @Body() dto: ToggleActiveDto,
  ): Promise<AdminListItemDto> {
    return this.teamManagementService.toggleAdminActive(id, dto);
  }
}
