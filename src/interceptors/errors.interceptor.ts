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
import getValidationErrorMessage from '@utils/getValidationErrorMessage';
import { Observable, catchError, map } from 'rxjs';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
    private readonly logger = new Logger(ErrorsInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                if (!data) return data;
                if (data.url) {
                    return data;
                }
                return {
                    statusCode: context.switchToHttp().getResponse().statusCode,
                    data: data,
                };
            }),
            catchError((err) => {
                console.log(err);

                if (err instanceof HttpException) {
                    throw err;
                }
                if (Array.isArray(err) && err[0] instanceof ValidationError) {
                    throw new BadRequestException(getValidationErrorMessage(err));
                }
                throw new BadGatewayException();
            }),
        );
    }
}
