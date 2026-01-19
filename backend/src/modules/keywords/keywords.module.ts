import { Module, forwardRef } from '@nestjs/common';
import { KeywordsService } from './keywords.service';
import { KeywordsController } from './keywords.controller';
import { KeywordAiService } from './services/keyword-ai.service';
import { KeywordPdfService } from './services/keyword-pdf.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { FilesModule } from '../files/files.module';
import { EmailModule } from '../email/email.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [PrismaModule, FilesModule, EmailModule, forwardRef(() => SettingsModule)],
  controllers: [KeywordsController],
  providers: [KeywordsService, KeywordAiService, KeywordPdfService],
  exports: [KeywordsService],
})
export class KeywordsModule {}
