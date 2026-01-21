import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ADMIN_ROLES_KEY } from '@common/decorators/admin-roles.decorator';
import { AdminRole, UserRole } from '@prisma/client';
import { PrismaService } from '@common/prisma/prisma.service';

/**
 * Guard that checks if the authenticated admin user has the required AdminRole
 *
 * Per Milestone 5.5: Financial Oversight requires SUPER_ADMIN role
 *
 * AdminRole hierarchy:
 * - SUPER_ADMIN: Full access (including financial data)
 * - ADMIN: Most access (excluding financial data)
 * - MODERATOR: Review validation, issue resolution
 * - SUPPORT: View only, limited actions
 *
 * @example
 * @UseGuards(JwtAuthGuard, RolesGuard, AdminRolesGuard)
 * @Roles(UserRole.ADMIN)
 * @AdminRoles(AdminRole.SUPER_ADMIN)
 * async getFinancialReport() { ... }
 */
@Injectable()
export class AdminRolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredAdminRoles = this.reflector.getAllAndOverride<AdminRole[]>(
      ADMIN_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no admin roles specified, allow access (guard not applicable)
    if (!requiredAdminRoles || requiredAdminRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Only check AdminRole if user is an ADMIN
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    // Fetch admin profile to check AdminRole
    const adminProfile = await this.prisma.adminProfile.findUnique({
      where: { userId: user.id },
      select: { role: true },
    });

    if (!adminProfile) {
      throw new ForbiddenException('Admin profile not found');
    }

    // Check if user's AdminRole is in the required roles
    const hasRequiredRole = requiredAdminRoles.includes(adminProfile.role);

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `This action requires ${requiredAdminRoles.join(' or ')} role`,
      );
    }

    // Attach adminRole to request.user for downstream use
    request.user.adminRole = adminProfile.role;

    return true;
  }
}
