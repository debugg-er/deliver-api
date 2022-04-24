import { ValidationError } from 'class-validator';

export function isValidationError(err: unknown): err is ValidationError | Array<ValidationError> {
    return Array.isArray(err) ? err[0] instanceof ValidationError : err instanceof ValidationError;
}

export default function getValidationErrorMessage(
    err: ValidationError | Array<ValidationError>,
): Array<string> {
    return (Array.isArray(err) ? err : [err]).reduce(
        (acc, cur) => [...acc, ...(cur.constraints ? Object.values(cur.constraints) : [])],
        <Array<string>>[],
    );
}
