import { Module } from '@nestjs/common';
import { RepoModule } from './modules/repo/repo.module';
import { ScoreModule } from './modules/score/score.module';
import { RestModule } from './modules/rest/rest.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { ThrottlerGuard, ThrottlerModule, seconds } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggingInterceptor } from './http-interceptor/logging.interceptor';

@Module({
  imports: [
    RepoModule,
    ScoreModule,
    RestModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        ttl: configService.get<number>('REDIS_TTL', 10000),
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: seconds(configService.get<number>('THROTTLE_TTL', 12)),
            limit: configService.get<number>('THROTTLE_LIMIT', 2),
            blockDuration: seconds(configService.get<number>('THROTTLE_BLOCK_DURATION', 12)),
          },
        ],
        errorMessage: configService.get<string>('THROTTLE_ERROR_MESSAGE', 'Slow down your request'),
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule { }
