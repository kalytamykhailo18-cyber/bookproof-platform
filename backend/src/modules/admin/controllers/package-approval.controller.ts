import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ClosersService } from '../../closers/services/closers.service';
import { CustomPackageResponseDto } from '../../closers/dto/custom-package.dto';

// DTO for rejection
export class RejectPackageDto {
  rejectionReason: string;
}

@ApiTags('Admin - Package Approval')
@ApiBearerAuth()
@Controller('admin/packages')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // Only Super Admin can approve packages
export class PackageApprovalController {
  constructor(private readonly closersService: ClosersService) {}

  @Get('pending-approval')
  @ApiOperation({ summary: 'Get all packages pending Super Admin approval' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of packages pending approval',
    type: [CustomPackageResponseDto],
  })
  async getPackagesPendingApproval(): Promise<CustomPackageResponseDto[]> {
    return this.closersService.getPackagesPendingApproval();
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a custom package (Super Admin only)' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Package approved',
    type: CustomPackageResponseDto,
  })
  async approvePackage(
    @Req() req: Request,
    @Param('id') packageId: string,
  ): Promise<CustomPackageResponseDto> {
    return this.closersService.approvePackage(req.user!.id, packageId);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a custom package (Super Admin only)' })
  @ApiParam({ name: 'id', description: 'Package ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Package rejected',
    type: CustomPackageResponseDto,
  })
  async rejectPackage(
    @Req() req: Request,
    @Param('id') packageId: string,
    @Body() dto: RejectPackageDto,
  ): Promise<CustomPackageResponseDto> {
    return this.closersService.rejectPackage(
      req.user!.id,
      packageId,
      dto.rejectionReason,
    );
  }
}
