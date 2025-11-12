import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { SyncService } from './sync.service';

@Processor('sync-queue')
export class SyncProcessor {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(private syncService: SyncService) {}

  @Process('sync-messages')
  async handleMessageSync(job: Job) {
    this.logger.debug('Processing message sync job...');

    try {
      const result = await this.syncService.syncAllMessages();
      this.logger.log('Message sync job completed');
      return result;
    } catch (error) {
      this.logger.error(`Message sync job failed: ${error.message}`);
      throw error;
    }
  }

  @Process('update-pending')
  async handlePendingUpdate(job: Job) {
    this.logger.debug('Processing pending message update job...');

    try {
      const result = await this.syncService.updatePendingStatuses();
      this.logger.log('Pending update job completed');
      return result;
    } catch (error) {
      this.logger.error(`Pending update job failed: ${error.message}`);
      throw error;
    }
  }
}
