import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { Message } from '../../entities/message.entity';
import { PendingMessage } from '../../entities/pending-message.entity';
import { User } from '../../entities/user.entity';
import { SMSEagleModule } from '../smseagle/smseagle.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, PendingMessage, User]),
    SMSEagleModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
