import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity';
import { UserInterceptor } from './common/interceptors/user.interceptor';
import { SMSEagleModule } from './modules/smseagle/smseagle.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { GroupsModule } from './modules/groups/groups.module';
import { ModemsModule } from './modules/modems/modems.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        username: process.env.DB_USER || 'simbox',
        password: process.env.DB_PASSWORD || 'simbox',
        database: process.env.DB_NAME || 'simbox_ui',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // Use migrations in production
        logging: process.env.NODE_ENV === 'development',
      }),
    }),

    // Bull Queue (Redis)
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        },
      }),
    }),

    // User entity for interceptor
    TypeOrmModule.forFeature([User]),

    // Feature modules
    SMSEagleModule,
    MessagesModule,
    ContactsModule,
    GroupsModule,
    ModemsModule,
    // SyncModule - to be added
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: UserInterceptor,
    },
  ],
})
export class AppModule {}
