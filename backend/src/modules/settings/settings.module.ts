import { Module, OnModuleInit } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule implements OnModuleInit {
  constructor(private readonly settingsService: SettingsService) {}

  /**
   * Initialize default settings when the module starts
   */
  async onModuleInit() {
    await this.settingsService.initializeDefaults();
  }
}
