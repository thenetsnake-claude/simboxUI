import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { SyncProcessor } from './sync.processor';
import { Message } from '../../entities/message.entity';
import { SyncState } from '../../entities/sync-state.entity';
import { PendingMessage } from '../../entities/pending-message.entity';
import { User } from '../../entities/user.entity';
import { SMSEagleModule } from '../smseagle/smseagle.module';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, SyncState, PendingMessage, User]),
    SMSEagleModule,
    BullModule.registerQueue({
      name: 'sync-queue',
    }),
  ],
  controllers: [SyncController],
  providers: [SyncService, SyncProcessor],
  exports: [SyncService],
})
export class SyncModule implements OnModuleInit {
  constructor(@InjectQueue('sync-queue') private syncQueue: Queue) {}

  async onModuleInit() {
    // Clear any existing jobs
    await this.syncQueue.empty();

    // Schedule message sync every 2 minutes
    const syncInterval = parseInt(process.env.SYNC_INTERVAL_MINUTES, 10) || 2;
    await this.syncQueue.add(
      'sync-messages',
      {},
      {
        repeat: {
          every: syncInterval * 60 * 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    // Schedule status update every 5 minutes
    const statusInterval = parseInt(process.env.STATUS_UPDATE_INTERVAL_MINUTES, 10) || 5;
    await this.syncQueue.add(
      'update-pending',
      {},
      {
        repeat: {
          every: statusInterval * 60 * 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    console.log(
      `Sync jobs scheduled: messages every ${syncInterval} minutes, status updates every ${statusInterval} minutes`,
    );
  }
}
