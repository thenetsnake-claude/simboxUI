import { Module } from '@nestjs/common';
import { SMSEagleService } from './smseagle.service';

@Module({
  providers: [SMSEagleService],
  exports: [SMSEagleService],
})
export class SMSEagleModule {}
