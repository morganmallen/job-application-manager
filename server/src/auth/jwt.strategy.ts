import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenService } from '../services/token.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private tokenService: TokenService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'supersecret',
      ignoreExpiration: false,
    });
  }

  async validate(payload: any, req: Request) {
    if (!payload.sub || !payload.email || payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token payload');
    }

    return { userId: payload.sub, email: payload.email };
  }
}
