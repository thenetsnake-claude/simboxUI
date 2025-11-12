import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { ContactGroup } from '../../entities/contact-group.entity';
import { Contact } from '../../entities/contact.entity';
import { User } from '../../entities/user.entity';
import { SMSEagleModule } from '../smseagle/smseagle.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContactGroup, Contact, User]), SMSEagleModule],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
