import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('modems')
export class Modem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  modem_no: number;

  @Column({ nullable: true })
  custom_name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
