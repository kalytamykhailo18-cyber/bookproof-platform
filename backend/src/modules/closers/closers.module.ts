import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { SettingsModule } from '../settings/settings.module';
import { ClosersService } from './services/closers.service';
import { InvoicePdfService } from './services/invoice-pdf.service';
import { ClosersController } from './controllers/closers.controller';

@Module({
  imports: [PrismaModule, EmailModule, SettingsModule], // AuditService is @Global, no need to import
  controllers: [ClosersController],
  providers: [ClosersService, InvoicePdfService],
  exports: [ClosersService, InvoicePdfService],
})
export class ClosersModule {}
