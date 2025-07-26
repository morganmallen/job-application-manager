import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ClientInfoMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extract real IP address (handles proxy/load balancer scenarios)
    const clientIp =
      (req.headers['x-forwarded-for'] as string) ||
      (req.headers['x-real-ip'] as string) ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      'unknown';

    // Clean up IP address (remove IPv6 prefix if present)
    const cleanIp = clientIp.startsWith('::ffff:')
      ? clientIp.substring(7)
      : clientIp;

    // Add client info to request object
    (req as any).clientIp = cleanIp;

    next();
  }
}
