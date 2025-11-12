import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Contact } from './contact.entity';

@Entity('contact_groups')
export class ContactGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, unique: true })
  smseagle_id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  created_by: number;

  @ManyToOne(() => User, (user) => user.groups, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdByUser: User;

  @ManyToMany(() => Contact, (contact) => contact.groups)
  @JoinTable({
    name: 'contact_group_members',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'contact_id', referencedColumnName: 'id' },
  })
  contacts: Contact[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
