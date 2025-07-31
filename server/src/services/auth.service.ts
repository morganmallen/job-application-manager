import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { TokenService, TokenPair } from './token.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ConfigService } from '@nestjs/config'; // asegúrate de inyectarlo
import { EmailService } from './email.service'; // asegúrate de tenerlo

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private tokenService: TokenService,
    private configService: ConfigService,
    private emailService: EmailService, // debes tenerlo
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
        password: hashedPassword,
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

async forgotPassword(dto: ForgotPasswordDto) {
  const { email } = dto;

  const user = await this.usersService.findByEmail(email);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  const token = await this.tokenService.generatePasswordResetToken(user.id);

  // Solo devuelve el token, no envía email
  return { token };
}

async sendPasswordResetLink(email: string) {
  const user = await this.usersService.findByEmail(email);
  if (!user) throw new NotFoundException('User not found');

  const token = await this.tokenService.generatePasswordResetToken(user.id);
  const resetLink = `${process.env.CORS_ORIGIN}/reset-password?token=${token}`;

  // The frontend will use this link to send it via EmailJS
  return { resetLink };
}

async resetPassword(token: string, newPassword: string) {
  const payload = await this.tokenService.verifyPasswordResetToken(token);
  const user = await this.usersService.findById(payload.userId);
  if (!user) throw new NotFoundException('User not found');

  user.password = await bcrypt.hash(newPassword, 10);
  await this.usersService.save(user);
  return { message: 'Password successfully reset' };
}

}
