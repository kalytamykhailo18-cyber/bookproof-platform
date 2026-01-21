import { Module } from '@nestjs/common';
import { ReadersController } from './readers.controller';
import { ReadersService } from './readers.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [PrismaModule, SettingsModule],
  controllers: [ReadersController],
  providers: [ReadersService],
  exports: [ReadersService],
})
export class ReadersModule {}
