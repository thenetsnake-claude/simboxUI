import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { MessageFolder } from './message.entity';

@Entity('sync_state')
export class SyncState {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: MessageFolder, unique: true })
  folder: MessageFolder;

  @Column({ default: 0 })
  last_synced_id: number;

  @CreateDateColumn()
  last_sync_time: Date;
}
