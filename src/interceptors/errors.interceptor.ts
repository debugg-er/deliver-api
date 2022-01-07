import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    BadGatewayException,
    CallHandler,
    HttpException,
    Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
    private readonly logger = new Logger(ErrorsInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        context.getClass().name;
        return next.handle().pipe(
            catchError((err) => {
                if (err instanceof HttpException) {
                    return throwError(() => err);
                } else {
                    this.logger.error(err);
                    return throwError(() => new BadGatewayException());
                }
            }),
        );
    }
}
