import { Injectable, UnauthorizedException } from '@nestjs/common';
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

  /**
   * Generate a new token pair (access + refresh)
   */
  async generateTokenPair(
    user: User,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<TokenPair> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(
      user,
      userAgent,
      ipAddress,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * Generate a short-lived access token
   */
  private generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      expiresIn: '15m', // 15 minutes
    });
  }

  /**
   * Generate a long-lived refresh token and store it
   */
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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userAgent,
      ipAddress,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return refreshToken;
  }

  /**
   * Refresh access token using refresh token
   */
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

  /**
   * Revoke a refresh token
   */
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);

    await this.refreshTokenRepository.update(
      { token_hash: tokenHash },
      { isRevoked: true },
    );
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update({ userId }, { isRevoked: true });
  }

  /**
   * Blacklist an access token
   */
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
    } catch (error) {
      // If token is invalid, still blacklist it
      await this.tokenBlacklistRepository.save({
        token_hash: tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24 hours
        reason: reason || 'Invalid token',
      });
    }
  }

  /**
   * Check if a token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);

    const blacklistedToken = await this.tokenBlacklistRepository.findOne({
      where: { token_hash: tokenHash },
    });

    return !!blacklistedToken;
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();

    // Clean up expired refresh tokens
    await this.refreshTokenRepository.delete({
      expiresAt: now,
    });

    // Clean up expired blacklisted tokens
    await this.tokenBlacklistRepository.delete({
      expiresAt: now,
    });
  }

  /**
   * Hash a token for secure storage
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Get user's active sessions
   */
  async getUserSessions(userId: string): Promise<RefreshToken[]> {
    return this.refreshTokenRepository.find({
      where: { userId, isRevoked: false },
      order: { createdAt: 'DESC' },
    });
  }
}
