import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenService } from '../services/token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private tokenService: TokenService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'supersecret',
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    if (!payload.sub || !payload.email || payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Check if token is blacklisted
    const request = this.getRequest();
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (token && (await this.tokenService.isTokenBlacklisted(token))) {
      throw new UnauthorizedException('Token has been revoked');
    }

    return { userId: payload.sub, email: payload.email };
  }

  private getRequest(): any {
    const args = arguments[0];
    return args?.args?.[0] || args;
  }
}
