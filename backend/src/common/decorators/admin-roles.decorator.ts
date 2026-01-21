import { SetMetadata } from '@nestjs/common';
import { AdminRole } from '@prisma/client';

export const ADMIN_ROLES_KEY = 'adminRoles';

/**
 * Decorator to specify required AdminRole(s) for an endpoint
 * Use with AdminRolesGuard to enforce admin role-based access control
 *
 * Per Milestone 5.5: Financial Oversight should be SUPER_ADMIN only
 *
 * @example
 * @AdminRoles(AdminRole.SUPER_ADMIN)
 * @UseGuards(JwtAuthGuard, RolesGuard, AdminRolesGuard)
 * async getFinancialReport() { ... }
 */
export const AdminRoles = (...roles: AdminRole[]) => SetMetadata(ADMIN_ROLES_KEY, roles);
