import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { ContactGroup } from './contact-group.entity';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  smseagle_id: number;

  @Column()
  name: string;

  @Column()
  phone_number: string;

  @Column({ nullable: true })
  created_by: number;

  @ManyToOne(() => User, (user) => user.contacts, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdByUser: User;

  @ManyToMany(() => ContactGroup, (group) => group.contacts)
  groups: ContactGroup[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
