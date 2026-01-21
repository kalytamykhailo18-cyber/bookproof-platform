import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CampaignsController } from './campaigns.controller';
import { CampaignFilesController } from './files.controller';
import { PublicCampaignsController } from './public-campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { PublicCampaignsService } from './public-campaigns.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { FilesModule } from '@modules/files/files.module';
import { EmailModule } from '@modules/email/email.module';

@Module({
  imports: [PrismaModule, ConfigModule, FilesModule, EmailModule],
  controllers: [CampaignsController, CampaignFilesController, PublicCampaignsController],
  providers: [CampaignsService, PublicCampaignsService],
  exports: [CampaignsService, PublicCampaignsService],
})
export class CampaignsModule {}
