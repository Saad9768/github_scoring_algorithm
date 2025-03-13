import { Module } from '@nestjs/common';
import { RepoModule } from './modules/repo/repo.module';
import { ScoreModule } from './modules/score/score.module';
import { RestModule } from './modules/rest/rest.module';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { ThrottlerGuard, ThrottlerModule, seconds } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggingInterceptor } from './http-interceptor/logging.interceptor';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';
import { createKeyv } from '@keyv/redis';

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
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: seconds(configService.get<number>('REDIS_TTL') || 100), lruSize: configService.get<number>('REDIS_LRU_SIZE') }),
            }),
            createKeyv(`redis://${configService.get<string>('REDIS_HOST')}:${configService.get<number>('REDIS_PORT')}`),
          ],
        };
      },
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
    }, {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    }
  ],
})
export class AppModule { }
