import { Module, Global } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailTemplateService } from './email-template.service';
import { PrismaModule } from '@common/prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [EmailService, EmailTemplateService],
  exports: [EmailService, EmailTemplateService],
})
export class EmailModule {}
