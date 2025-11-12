import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Message, MessageFolder } from '../../entities/message.entity';
import { SyncState } from '../../entities/sync-state.entity';
import { PendingMessage } from '../../entities/pending-message.entity';
import { SMSEagleService } from '../smseagle/smseagle.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(SyncState)
    private syncStateRepository: Repository<SyncState>,
    @InjectRepository(PendingMessage)
    private pendingRepository: Repository<PendingMessage>,
    private smsEagleService: SMSEagleService,
  ) {}

  async syncAllMessages() {
    this.logger.log('Starting message synchronization...');

    const folders: MessageFolder[] = [
      MessageFolder.INBOX,
      MessageFolder.OUTBOX,
      MessageFolder.SENT,
      MessageFolder.ERROR,
      MessageFolder.DELIVERED,
    ];

    const results = {};

    for (const folder of folders) {
      try {
        const synced = await this.syncFolder(folder);
        results[folder] = synced;
        this.logger.log(`Synced ${synced} new messages from ${folder}`);
      } catch (error) {
        this.logger.error(`Failed to sync folder ${folder}: ${error.message}`);
        results[folder] = 0;
      }
    }

    return {
      message: 'Message synchronization completed',
      synced: results,
    };
  }

  async syncFolder(folder: MessageFolder): Promise<number> {
    // Get last synced ID
    let syncState = await this.syncStateRepository.findOne({ where: { folder } });

    if (!syncState) {
      // First time sync - create sync state
      syncState = this.syncStateRepository.create({
        folder,
        last_synced_id: 0,
      });
      await this.syncStateRepository.save(syncState);
    }

    const lastId = syncState.last_synced_id;

    // If first sync (lastId = 0), fetch only recent messages (last 7 days)
    if (lastId === 0) {
      return await this.coldStartSync(folder);
    }

    // Incremental sync - fetch messages since last ID
    const messages = await this.smsEagleService.getMessages(folder, {
      id_from: lastId + 1,
    });

    if (!messages || messages.length === 0) {
      return 0;
    }

    // Save messages to database
    const savedCount = await this.saveMessages(messages, folder);

    // Update sync state
    const maxId = Math.max(...messages.map((m) => m.id));
    syncState.last_synced_id = maxId;
    syncState.last_sync_time = new Date();
    await this.syncStateRepository.save(syncState);

    return savedCount;
  }

  private async coldStartSync(folder: MessageFolder): Promise<number> {
    this.logger.log(`Cold start sync for ${folder} - fetching last 7 days`);

    const daysAgo = parseInt(process.env.INITIAL_SYNC_DAYS, 10) || 7;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - daysAgo);

    const messages = await this.smsEagleService.getMessages(folder, {
      date_from: dateFrom.toISOString(),
    });

    if (!messages || messages.length === 0) {
      return 0;
    }

    const savedCount = await this.saveMessages(messages, folder);

    // Update sync state
    const maxId = Math.max(...messages.map((m) => m.id));
    const syncState = await this.syncStateRepository.findOne({ where: { folder } });
    syncState.last_synced_id = maxId;
    syncState.last_sync_time = new Date();
    await this.syncStateRepository.save(syncState);

    return savedCount;
  }

  private async saveMessages(messages: any[], folder: MessageFolder): Promise<number> {
    let savedCount = 0;

    for (const msg of messages) {
      try {
        // Check if message already exists
        const exists = await this.messageRepository.findOne({
          where: { smseagle_id: msg.id },
        });

        if (exists) {
          // Update existing message
          exists.status = msg.status;
          exists.update_date = msg.update_date ? new Date(msg.update_date) : null;
          exists.delivery_date = msg.delivery_date ? new Date(msg.delivery_date) : null;
          await this.messageRepository.save(exists);
        } else {
          // Create new message
          const message = this.messageRepository.create({
            smseagle_id: msg.id,
            folder,
            phone_number: msg.number,
            text: msg.text,
            text_binary: msg.text_binary,
            encoding: msg.encoding,
            modem_no: msg.modem_no,
            sender_name: msg.sender_name,
            status: msg.status,
            error_code: msg.error_code,
            oid: msg.oid,
            validity: msg.validity,
            processed: msg.processed || false,
            is_read: msg.read || false,
            insert_date: msg.insert_date ? new Date(msg.insert_date) : null,
            update_date: msg.update_date ? new Date(msg.update_date) : null,
            receive_date: msg.receive_date ? new Date(msg.receive_date) : null,
            delivery_date: msg.delivery_date ? new Date(msg.delivery_date) : null,
            sending_date: msg.sending_date ? new Date(msg.sending_date) : null,
          });

          await this.messageRepository.save(message);
          savedCount++;

          // Track pending if outbox/sent and has validity
          if (
            (folder === MessageFolder.OUTBOX || folder === MessageFolder.SENT) &&
            msg.validity &&
            msg.validity !== 'max'
          ) {
            await this.trackPendingMessage(message, msg.validity);
          }
        }
      } catch (error) {
        this.logger.error(`Failed to save message ${msg.id}: ${error.message}`);
      }
    }

    return savedCount;
  }

  async updatePendingStatuses() {
    this.logger.log('Starting pending message status updates...');

    // Get all pending messages that haven't expired
    const pending = await this.pendingRepository.find({
      where: {
        validity_expires_at: MoreThan(new Date()),
      },
      relations: ['message'],
    });

    let updated = 0;

    for (const item of pending) {
      try {
        // Fetch current status from SMSEagle
        const messages = await this.smsEagleService.getMessages('sent', {
          id_from: item.smseagle_id,
          id_to: item.smseagle_id,
        });

        if (messages && messages.length > 0) {
          const updatedMsg = messages[0];

          // Update message status
          item.message.status = updatedMsg.status;
          item.message.update_date = updatedMsg.update_date
            ? new Date(updatedMsg.update_date)
            : null;
          item.message.delivery_date = updatedMsg.delivery_date
            ? new Date(updatedMsg.delivery_date)
            : null;
          await this.messageRepository.save(item.message);

          updated++;

          // Remove from pending if final status
          if (this.isFinalStatus(updatedMsg.status)) {
            await this.pendingRepository.remove(item);
          }
        }
      } catch (error) {
        this.logger.error(
          `Failed to update pending message ${item.smseagle_id}: ${error.message}`,
        );
      }
    }

    // Clean expired pending messages
    const expired = await this.pendingRepository.find({
      where: {
        validity_expires_at: LessThan(new Date()),
      },
    });

    if (expired.length > 0) {
      await this.pendingRepository.remove(expired);
      this.logger.log(`Removed ${expired.length} expired pending messages`);
    }

    return {
      message: 'Pending message status update completed',
      updated,
      expired: expired.length,
    };
  }

  async getSyncStatus() {
    const syncStates = await this.syncStateRepository.find({
      order: { folder: 'ASC' },
    });

    const pendingCount = await this.pendingRepository.count();

    const folders = {};
    for (const state of syncStates) {
      folders[state.folder] = {
        last_synced_id: state.last_synced_id,
        last_sync_time: state.last_sync_time,
      };
    }

    return {
      folders,
      pending_messages: pendingCount,
      last_sync: syncStates[0]?.last_sync_time || null,
    };
  }

  async manualSync() {
    this.logger.log('Manual sync triggered');
    const syncResult = await this.syncAllMessages();
    const statusResult = await this.updatePendingStatuses();

    return {
      ...syncResult,
      status_updates: statusResult,
    };
  }

  private async trackPendingMessage(message: Message, validity: string) {
    const validityMap = {
      '5m': 5 * 60 * 1000,
      '10m': 10 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
    };

    const expiresAt = new Date(
      (message.sending_date?.getTime() || Date.now()) + (validityMap[validity] || 0),
    );

    const pending = this.pendingRepository.create({
      message_id: message.id,
      smseagle_id: message.smseagle_id,
      validity_expires_at: expiresAt,
    });

    await this.pendingRepository.save(pending);
  }

  private isFinalStatus(status: string): boolean {
    const finalStatuses = ['delivery_ok', 'delivery_failed', 'sending_error', 'error'];
    return finalStatuses.includes(status);
  }
}
