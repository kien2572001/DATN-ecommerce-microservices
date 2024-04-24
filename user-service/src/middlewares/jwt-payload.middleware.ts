// jwt-payload.middleware.ts
import {Injectable, NestMiddleware} from '@nestjs/common';
import {Request, Response, NextFunction} from 'express';
import * as jwt from 'jsonwebtoken';

declare module 'express' {
  interface Request {
    jwtPayload?: any;
  }
}

@Injectable()
export class JwtPayloadMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7); // Remove 'Bearer ' prefix
      try {
        const decoded = jwt.decode(token);
        req.jwtPayload = decoded; // Add decoded payload to request object
      } catch (error) {
        // Handle invalid token
      }
    }
    next();
  }
}
