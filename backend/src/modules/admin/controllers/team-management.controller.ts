import {
  Controller,
  Get,
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
import { CloserListItemDto, AdminListItemDto } from '../dto/team-management.dto';

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
}
