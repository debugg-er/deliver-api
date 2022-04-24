import { HttpException } from '@nestjs/common';
import getValidationErrorMessage, { isValidationError } from '@utils/getValidationErrorMessage';

export default function getErrorResponse(err: unknown): { error: any } {
    if (isValidationError(err)) {
        return { error: getValidationErrorMessage(err) };
    } else if (err instanceof HttpException) {
        return { error: err.message };
    } else {
        console.log(err);
        return { error: 'Internal server error' };
    }
}
