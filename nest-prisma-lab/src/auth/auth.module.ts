import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: 'jwt'}),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => { 
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: '1h'
          }
      } 
    },
      
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
  exports: [JwtModule]
})
export class AuthModule {}
