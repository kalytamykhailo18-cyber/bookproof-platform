import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { EmailModule } from '../email/email.module';
import { ClosersService } from './services/closers.service';
import { InvoicePdfService } from './services/invoice-pdf.service';
import { ClosersController } from './controllers/closers.controller';

@Module({
  imports: [PrismaModule, EmailModule], // AuditService is @Global, no need to import
  controllers: [ClosersController],
  providers: [ClosersService, InvoicePdfService],
  exports: [ClosersService, InvoicePdfService],
})
export class ClosersModule {}
