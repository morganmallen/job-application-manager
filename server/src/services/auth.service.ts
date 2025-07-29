import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { TokenService, TokenPair } from './token.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokenService: TokenService,
  ) {}

  async validateUser(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async login(
    email: string,
    password: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ access_token: string; refresh_token: string; user: any }> {
    const user = await this.validateUser(email, password);

    const tokenPair = await this.tokenService.generateTokenPair(
      user,
      userAgent,
      ipAddress,
    );

    return {
      ...tokenPair,
      user,
    };
  }

  async register(dto: CreateUserDto, userAgent?: string, ipAddress?: string) {
    try {
      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(dto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = await this.usersService.create({
        ...dto,
        hash_password: hashedPassword,
      } as any);

      const tokenPair = await this.tokenService.generateTokenPair(
        user,
        userAgent,
        ipAddress,
      );

      return {
        ...tokenPair,
        user,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create user account');
    }
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    const accessToken =
      await this.tokenService.refreshAccessToken(refreshToken);
    return { access_token: accessToken };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokenService.revokeRefreshToken(refreshToken);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.tokenService.revokeAllUserTokens(userId);
  }

  async getUserSessions(userId: string) {
    return this.tokenService.getUserSessions(userId);
  }
}
