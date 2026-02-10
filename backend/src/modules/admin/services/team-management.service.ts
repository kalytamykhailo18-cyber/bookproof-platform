import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { AdminRole } from '@prisma/client';
import {
  CloserListItemDto,
  AdminListItemDto,
  UpdateCloserDto,
  UpdateAdminDto,
  ToggleActiveDto,
} from '../dto/team-management.dto';

/**
 * Service for team management (listing closers and admins)
 * Per requirements.md Sections 1.3 and 1.4
 */
@Injectable()
export class TeamManagementService {
  private readonly logger = new Logger(TeamManagementService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get all closers for admin management
   * Per requirements.md Section 1.4
   */
  async getAllClosers(): Promise<CloserListItemDto[]> {
    const closers = await this.prisma.closerProfile.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return closers.map((closer) => ({
      id: closer.id,
      userId: closer.userId,
      email: closer.user.email,
      name: closer.user.name,
      commissionRate: closer.commissionRate ? Number(closer.commissionRate) : 0,
      commissionEnabled: closer.commissionEnabled,
      commissionEarned: Number(closer.commissionEarned),
      commissionPaid: Number(closer.commissionPaid),
      totalSales: Number(closer.totalSales),
      totalClients: closer.totalClients,
      totalPackagesSold: closer.totalPackagesSold,
      isActive: closer.user.isActive,
      createdAt: closer.createdAt,
      updatedAt: closer.updatedAt,
    }));
  }

  /**
   * Get all admins for admin management
   * Per requirements.md Section 1.3
   */
  async getAllAdmins(): Promise<AdminListItemDto[]> {
    const admins = await this.prisma.adminProfile.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return admins.map((admin) => ({
      id: admin.id,
      userId: admin.userId,
      email: admin.user.email,
      name: admin.user.name,
      role: admin.role,
      permissions: admin.permissions,
      isActive: admin.user.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    }));
  }

  /**
   * Get single closer by ID
   */
  async getCloserById(closerId: string): Promise<CloserListItemDto> {
    const closer = await this.prisma.closerProfile.findUnique({
      where: { id: closerId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    if (!closer) {
      throw new NotFoundException(`Closer with ID ${closerId} not found`);
    }

    return {
      id: closer.id,
      userId: closer.userId,
      email: closer.user.email,
      name: closer.user.name,
      commissionRate: closer.commissionRate ? Number(closer.commissionRate) : 0,
      commissionEnabled: closer.commissionEnabled,
      commissionEarned: Number(closer.commissionEarned),
      commissionPaid: Number(closer.commissionPaid),
      totalSales: Number(closer.totalSales),
      totalClients: closer.totalClients,
      totalPackagesSold: closer.totalPackagesSold,
      isActive: closer.user.isActive,
      createdAt: closer.createdAt,
      updatedAt: closer.updatedAt,
    };
  }

  /**
   * Update closer details
   */
  async updateCloser(
    closerId: string,
    dto: UpdateCloserDto,
  ): Promise<CloserListItemDto> {
    // Check if closer exists
    const closer = await this.prisma.closerProfile.findUnique({
      where: { id: closerId },
      include: { user: true },
    });

    if (!closer) {
      throw new NotFoundException(`Closer with ID ${closerId} not found`);
    }

    // If email is being changed, check it's not already taken
    if (dto.email && dto.email !== closer.user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser) {
        throw new BadRequestException('Email is already taken');
      }
    }

    // Update user fields (name, email) if provided
    if (dto.name || dto.email) {
      await this.prisma.user.update({
        where: { id: closer.userId },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.email && { email: dto.email }),
        },
      });
    }

    // Update closer profile fields (commissionRate, commissionEnabled) if provided
    const updatedCloser = await this.prisma.closerProfile.update({
      where: { id: closerId },
      data: {
        ...(dto.commissionRate !== undefined && {
          commissionRate: dto.commissionRate,
        }),
        ...(dto.commissionEnabled !== undefined && {
          commissionEnabled: dto.commissionEnabled,
        }),
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    this.logger.log(`Closer ${closerId} updated successfully`);

    return {
      id: updatedCloser.id,
      userId: updatedCloser.userId,
      email: updatedCloser.user.email,
      name: updatedCloser.user.name,
      commissionRate: updatedCloser.commissionRate
        ? Number(updatedCloser.commissionRate)
        : 0,
      commissionEnabled: updatedCloser.commissionEnabled,
      commissionEarned: Number(updatedCloser.commissionEarned),
      commissionPaid: Number(updatedCloser.commissionPaid),
      totalSales: Number(updatedCloser.totalSales),
      totalClients: updatedCloser.totalClients,
      totalPackagesSold: updatedCloser.totalPackagesSold,
      isActive: updatedCloser.user.isActive,
      createdAt: updatedCloser.createdAt,
      updatedAt: updatedCloser.updatedAt,
    };
  }

  /**
   * Toggle closer active status
   */
  async toggleCloserActive(
    closerId: string,
    dto: ToggleActiveDto,
  ): Promise<CloserListItemDto> {
    const closer = await this.prisma.closerProfile.findUnique({
      where: { id: closerId },
      include: { user: true },
    });

    if (!closer) {
      throw new NotFoundException(`Closer with ID ${closerId} not found`);
    }

    // Update user isActive status
    await this.prisma.user.update({
      where: { id: closer.userId },
      data: { isActive: dto.isActive },
    });

    // Fetch updated closer
    const updatedCloser = await this.prisma.closerProfile.findUnique({
      where: { id: closerId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    if (!updatedCloser) {
      throw new NotFoundException(`Closer with ID ${closerId} not found`);
    }

    this.logger.log(
      `Closer ${closerId} ${dto.isActive ? 'activated' : 'deactivated'}`,
    );

    return {
      id: updatedCloser.id,
      userId: updatedCloser.userId,
      email: updatedCloser.user.email,
      name: updatedCloser.user.name,
      commissionRate: updatedCloser.commissionRate
        ? Number(updatedCloser.commissionRate)
        : 0,
      commissionEnabled: updatedCloser.commissionEnabled,
      commissionEarned: Number(updatedCloser.commissionEarned),
      commissionPaid: Number(updatedCloser.commissionPaid),
      totalSales: Number(updatedCloser.totalSales),
      totalClients: updatedCloser.totalClients,
      totalPackagesSold: updatedCloser.totalPackagesSold,
      isActive: updatedCloser.user.isActive,
      createdAt: updatedCloser.createdAt,
      updatedAt: updatedCloser.updatedAt,
    };
  }

  /**
   * Get single admin by ID
   */
  async getAdminById(adminId: string): Promise<AdminListItemDto> {
    const admin = await this.prisma.adminProfile.findUnique({
      where: { id: adminId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    return {
      id: admin.id,
      userId: admin.userId,
      email: admin.user.email,
      name: admin.user.name,
      role: admin.role,
      permissions: admin.permissions,
      isActive: admin.user.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }

  /**
   * Update admin details
   */
  async updateAdmin(
    adminId: string,
    dto: UpdateAdminDto,
  ): Promise<AdminListItemDto> {
    // Check if admin exists
    const admin = await this.prisma.adminProfile.findUnique({
      where: { id: adminId },
      include: { user: true },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    // If email is being changed, check it's not already taken
    if (dto.email && dto.email !== admin.user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser) {
        throw new BadRequestException('Email is already taken');
      }
    }

    // Update user fields (name, email) if provided
    if (dto.name || dto.email) {
      await this.prisma.user.update({
        where: { id: admin.userId },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.email && { email: dto.email }),
        },
      });
    }

    // Build update data object with proper typing
    const updateData: any = {};
    if (dto.role) {
      updateData.role = dto.role as AdminRole;
    }
    if (dto.permissions) {
      updateData.permissions = dto.permissions;
    }

    // Update admin profile fields (role, permissions) if provided
    const updatedAdmin = await this.prisma.adminProfile.update({
      where: { id: adminId },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    this.logger.log(`Admin ${adminId} updated successfully`);

    return {
      id: updatedAdmin.id,
      userId: updatedAdmin.userId,
      email: updatedAdmin.user.email,
      name: updatedAdmin.user.name,
      role: updatedAdmin.role,
      permissions: updatedAdmin.permissions,
      isActive: updatedAdmin.user.isActive,
      createdAt: updatedAdmin.createdAt,
      updatedAt: updatedAdmin.updatedAt,
    };
  }

  /**
   * Toggle admin active status
   */
  async toggleAdminActive(
    adminId: string,
    dto: ToggleActiveDto,
  ): Promise<AdminListItemDto> {
    const admin = await this.prisma.adminProfile.findUnique({
      where: { id: adminId },
      include: { user: true },
    });

    if (!admin) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    // Update user isActive status
    await this.prisma.user.update({
      where: { id: admin.userId },
      data: { isActive: dto.isActive },
    });

    // Fetch updated admin
    const updatedAdmin = await this.prisma.adminProfile.findUnique({
      where: { id: adminId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    if (!updatedAdmin) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    this.logger.log(
      `Admin ${adminId} ${dto.isActive ? 'activated' : 'deactivated'}`,
    );

    return {
      id: updatedAdmin.id,
      userId: updatedAdmin.userId,
      email: updatedAdmin.user.email,
      name: updatedAdmin.user.name,
      role: updatedAdmin.role,
      permissions: updatedAdmin.permissions,
      isActive: updatedAdmin.user.isActive,
      createdAt: updatedAdmin.createdAt,
      updatedAt: updatedAdmin.updatedAt,
    };
  }
}
