import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CampaignsController } from './campaigns.controller';
import { CampaignFilesController } from './files.controller';
import { CampaignsService } from './campaigns.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { FilesModule } from '@modules/files/files.module';
import { EmailModule } from '@modules/email/email.module';

@Module({
  imports: [PrismaModule, ConfigModule, FilesModule, EmailModule],
  controllers: [CampaignsController, CampaignFilesController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
