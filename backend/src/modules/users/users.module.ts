import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '@common/prisma/prisma.module';

/**
 * Users Module
 *
 * Provides GDPR compliance features:
 * - Data export (requirements.md Section 15.3)
 * - Data deletion (requirements.md Section 15.3)
 * - Consent management
 */
@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
