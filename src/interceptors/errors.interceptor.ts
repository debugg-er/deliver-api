import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    BadGatewayException,
    CallHandler,
    HttpException,
    Logger,
    BadRequestException,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
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
                }
                if (Array.isArray(err) && err[0] instanceof ValidationError) {
                    return throwError(
                        () =>
                            new BadRequestException(
                                err.reduce(
                                    (acc, cur) => [...acc, ...Object.values(cur.constraints)],
                                    [],
                                ),
                            ),
                    );
                }
                console.log(err);
                return throwError(() => new BadGatewayException());
            }),
        );
    }
}
