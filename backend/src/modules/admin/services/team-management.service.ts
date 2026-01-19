import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { CloserListItemDto, AdminListItemDto } from '../dto/team-management.dto';

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
}
