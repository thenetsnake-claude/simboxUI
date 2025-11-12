import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Contact } from './contact.entity';
import { ContactGroup } from './contact-group.entity';

export enum UserRole {
  ADMIN = 'admin',
  SUPPORT = 'support',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  auth0_id: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @OneToMany(() => Contact, (contact) => contact.createdByUser)
  contacts: Contact[];

  @OneToMany(() => ContactGroup, (group) => group.createdByUser)
  groups: ContactGroup[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
