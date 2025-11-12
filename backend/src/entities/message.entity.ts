import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { PendingMessage } from './pending-message.entity';

export enum MessageFolder {
  INBOX = 'inbox',
  OUTBOX = 'outbox',
  SENT = 'sent',
  ERROR = 'error',
  DELIVERED = 'delivered',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  smseagle_id: number;

  @Column({ type: 'enum', enum: MessageFolder })
  folder: MessageFolder;

  @Column()
  phone_number: string;

  @Column({ type: 'text', nullable: true })
  text: string;

  @Column({ type: 'text', nullable: true })
  text_binary: string;

  @Column({ nullable: true })
  encoding: string;

  @Column({ nullable: true })
  modem_no: number;

  @Column({ nullable: true })
  sender_name: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  error_code: number;

  @Column({ nullable: true })
  oid: string;

  @Column({ nullable: true })
  validity: string;

  @Column({ default: false })
  processed: boolean;

  @Column({ default: false })
  is_read: boolean;

  @Column({ type: 'timestamp', nullable: true })
  insert_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  update_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  receive_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  delivery_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  sending_date: Date;

  @OneToOne(() => PendingMessage, (pending) => pending.message)
  pendingMessage: PendingMessage;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
