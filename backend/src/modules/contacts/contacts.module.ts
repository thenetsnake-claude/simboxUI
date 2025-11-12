import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { Contact } from '../../entities/contact.entity';
import { User } from '../../entities/user.entity';
import { SMSEagleModule } from '../smseagle/smseagle.module';

@Module({
  imports: [TypeOrmModule.forFeature([Contact, User]), SMSEagleModule],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
