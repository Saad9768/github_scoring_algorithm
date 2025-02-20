import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  
  @Injectable()
  export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);
    /**
     *
     * @param context
     * @param next
     * @returns
     */
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      this.logger.log(
        'Before...  url :: ' + context.getArgByIndex(0).originalUrl,
      );
      const now = Date.now();
      return next.handle().pipe(
        tap(() => {
          this.logger.log(`After... ${Date.now() - now}ms`);
        }),
      );
    }
  }