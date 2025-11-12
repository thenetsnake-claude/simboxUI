import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Message } from './message.entity';

@Entity('pending_messages')
export class PendingMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message_id: number;

  @Column()
  smseagle_id: number;

  @Column({ type: 'timestamp' })
  validity_expires_at: Date;

  @OneToOne(() => Message, (message) => message.pendingMessage)
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @CreateDateColumn()
  created_at: Date;
}
