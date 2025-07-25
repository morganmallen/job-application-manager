import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenService } from './token.service';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(private tokenService: TokenService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredTokens() {
    try {
      this.logger.log('Starting token cleanup...');
      await this.tokenService.cleanupExpiredTokens();
      this.logger.log('Token cleanup completed successfully');
    } catch (error) {
      this.logger.error('Error during token cleanup:', error);
    }
  }
}
