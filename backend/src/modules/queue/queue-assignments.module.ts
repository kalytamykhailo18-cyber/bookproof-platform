import { Module } from '@nestjs/common';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { PrismaModule } from '@common/prisma/prisma.module';
import { FilesModule } from '@modules/files/files.module';
import { EmailModule } from '@modules/email/email.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';

@Module({
  imports: [PrismaModule, FilesModule, EmailModule, NotificationsModule],
  controllers: [QueueController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueAssignmentsModule {}
