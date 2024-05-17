import {Injectable, NestMiddleware} from '@nestjs/common';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const requestArrivalTime = Date.now();
    res.on('finish', () => {
      const endTime = Date.now();
      const elapsedTime = endTime - requestArrivalTime;
      console.log(`${new Date(requestArrivalTime).toISOString()} - Request ${req.method} ${req.url}  completed in ${elapsedTime} ms`);
    });
    next();
  }
}
