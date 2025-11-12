import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModemsController } from './modems.controller';
import { ModemsService } from './modems.service';
import { Modem } from '../../entities/modem.entity';
import { User } from '../../entities/user.entity';
import { SMSEagleModule } from '../smseagle/smseagle.module';

@Module({
  imports: [TypeOrmModule.forFeature([Modem, User]), SMSEagleModule],
  controllers: [ModemsController],
  providers: [ModemsService],
  exports: [ModemsService],
})
export class ModemsModule {}
