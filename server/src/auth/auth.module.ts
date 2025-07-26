import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RefreshToken } from '../entities/refresh-token.entity';
import { TokenBlacklist } from '../entities/token-blacklist.entity';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([RefreshToken, TokenBlacklist]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '15m' }, // Short-lived access tokens
      }),
    }),
  ],
  providers: [AuthService, TokenService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
  exports: [JwtAuthGuard, TokenService],
})
export class AuthModule {}
