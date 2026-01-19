import { Module } from '@nestjs/common';
import { ReadersController } from './readers.controller';
import { ReadersService } from './readers.service';
import { PrismaModule } from '@common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReadersController],
  providers: [ReadersService],
  exports: [ReadersService],
})
export class ReadersModule {}
