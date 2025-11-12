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
import { SyncModule } from './modules/sync/sync.module';

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

    // Bull Queue (Redis with Sentinel support)
    BullModule.forRootAsync({
      useFactory: () => {
        const useSentinel = process.env.REDIS_SENTINEL_ENABLED === 'true';
        const username = process.env.REDIS_USERNAME || undefined;
        const password = process.env.REDIS_PASSWORD || undefined;
        const tlsEnabled = process.env.REDIS_TLS_ENABLED === 'true';

        if (useSentinel) {
          // Redis Sentinel configuration
          const sentinels = (process.env.REDIS_SENTINELS || 'localhost:26379')
            .split(',')
            .map(s => {
              const [host, port] = s.trim().split(':');
              return { host, port: parseInt(port, 10) || 26379 };
            });

          return {
            redis: {
              sentinels,
              name: process.env.REDIS_MASTER_NAME || 'mymaster',
              username,
              password,
              sentinelUsername: process.env.REDIS_SENTINEL_USERNAME || undefined,
              sentinelPassword: process.env.REDIS_SENTINEL_PASSWORD || undefined,
              ...(tlsEnabled && {
                tls: {
                  rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== 'false',
                  ...(process.env.REDIS_TLS_CA_CERT && {
                    ca: process.env.REDIS_TLS_CA_CERT,
                  }),
                  ...(process.env.REDIS_TLS_CERT && {
                    cert: process.env.REDIS_TLS_CERT,
                  }),
                  ...(process.env.REDIS_TLS_KEY && {
                    key: process.env.REDIS_TLS_KEY,
                  }),
                },
              }),
            },
          };
        } else {
          // Standard Redis configuration
          return {
            redis: {
              host: process.env.REDIS_HOST || 'localhost',
              port: parseInt(process.env.REDIS_PORT, 10) || 6379,
              username,
              password,
              ...(tlsEnabled && {
                tls: {
                  rejectUnauthorized: process.env.REDIS_TLS_REJECT_UNAUTHORIZED !== 'false',
                  ...(process.env.REDIS_TLS_CA_CERT && {
                    ca: process.env.REDIS_TLS_CA_CERT,
                  }),
                  ...(process.env.REDIS_TLS_CERT && {
                    cert: process.env.REDIS_TLS_CERT,
                  }),
                  ...(process.env.REDIS_TLS_KEY && {
                    key: process.env.REDIS_TLS_KEY,
                  }),
                },
              }),
            },
          };
        }
      },
    }),

    // User entity for interceptor
    TypeOrmModule.forFeature([User]),

    // Feature modules
    SMSEagleModule,
    MessagesModule,
    ContactsModule,
    GroupsModule,
    ModemsModule,
    SyncModule,
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
