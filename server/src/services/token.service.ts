import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';
import { TokenBlacklist } from '../entities/token-blacklist.entity';
import { User } from '../entities/user.entity';
import * as crypto from 'crypto';

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
}

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(TokenBlacklist)
    private tokenBlacklistRepository: Repository<TokenBlacklist>,
  ) {}

  async generateTokenPair(
    user: User,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<TokenPair> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user, userAgent, ipAddress);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      type: 'access',
    };
    return this.jwtService.sign(payload, {
      expiresIn: '15m',
    });
  }

  private async generateRefreshToken(
    user: User,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(refreshToken);

    const refreshTokenEntity = this.refreshTokenRepository.create({
      token_hash: tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userAgent,
      ipAddress,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);
    return refreshToken;
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const tokenHash = this.hashToken(refreshToken);

    const refreshTokenEntity = await this.refreshTokenRepository.findOne({
      where: { token_hash: tokenHash },
      relations: ['user'],
    });

    if (
      !refreshTokenEntity ||
      refreshTokenEntity.isRevoked ||
      refreshTokenEntity.expiresAt < new Date()
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return this.generateAccessToken(refreshTokenEntity.user);
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    await this.refreshTokenRepository.update(
      { token_hash: tokenHash },
      { isRevoked: true },
    );
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update({ userId }, { isRevoked: true });
  }

  async blacklistToken(token: string, reason?: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    try {
      const decoded = this.jwtService.decode(token) as any;
      const expiresAt = new Date(decoded.exp * 1000);
      await this.tokenBlacklistRepository.save({
        token_hash: tokenHash,
        expiresAt,
        reason,
      });
    } catch {
      await this.tokenBlacklistRepository.save({
        token_hash: tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        reason: reason || 'Invalid token',
      });
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);
    const blacklistedToken = await this.tokenBlacklistRepository.findOne({
      where: { token_hash: tokenHash },
    });
    return !!blacklistedToken;
  }

  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.refreshTokenRepository.delete({ expiresAt: now });
    await this.tokenBlacklistRepository.delete({ expiresAt: now });
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async getUserSessions(userId: string): Promise<RefreshToken[]> {
    return this.refreshTokenRepository.find({
      where: { userId, isRevoked: false },
      order: { createdAt: 'DESC' },
    });
  }

  // --- 🔐 FORGOT / RESET PASSWORD LOGIC BELOW ---

  /**
   * Generate password reset token (JWT)
   */
  async generatePasswordResetToken(userId: string): Promise<string> {
    return this.jwtService.sign(
      { userId },
      {
        secret: process.env.PASSWORD_RESET_SECRET || 'RESET_SECRET',
        expiresIn: '15m',
      },
    );
  }

  /**
   * Verify reset token and return payload (contains userId)
   */
  async verifyPasswordResetToken(token: string): Promise<{ userId: string }> {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.PASSWORD_RESET_SECRET || 'RESET_SECRET',
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired password reset token');
    }
  }

  /**
   * Optional: blacklist or invalidate reset token
   */
  async invalidateToken(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    await this.tokenBlacklistRepository.save({
      token_hash: tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      reason: 'Used password reset token',
    });
  }
}
