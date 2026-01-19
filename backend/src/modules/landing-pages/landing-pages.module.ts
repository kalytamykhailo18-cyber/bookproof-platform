import { Module } from '@nestjs/common';
import { LandingPagesController } from './landing-pages.controller';
import { LandingPagesService } from './landing-pages.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { EmailModule } from '@modules/email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [LandingPagesController],
  providers: [LandingPagesService],
  exports: [LandingPagesService],
})
export class LandingPagesModule {}
