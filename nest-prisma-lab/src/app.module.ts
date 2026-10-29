import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RoomsModule } from './rooms/rooms.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { redisStore } from 'cache-manager-redis-yet';
import { APP_GUARD } from '@nestjs/core';
@Module({
  imports: [PrismaModule, RoomsModule, AuthModule,
    CacheModule.registerAsync({
      isGlobal: true, // Make cache module available globally
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST ?? '127.0.0.1',
            port: Number(process.env.REDIS_PORT ?? 6379),
          },
        }),
      }),
    }),
    // Configure Rate Limiting (Throttler)
    ThrottlerModule.forRoot([{
      ttl: 60000, 
      limit: 20,  // Max number of requests within TTL
    }]),
  ],
  controllers: [AppController],
  providers: [AppService, 
  {
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  }
  ],
})
export class AppModule {}
