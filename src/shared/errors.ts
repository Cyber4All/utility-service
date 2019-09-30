import { reportError } from './SentryConnector';

/**
 * The reasons for which a ResourceError may be thrown.
 */
export enum ResourceErrorReason {
    FORBIDDEN = 'Forbidden',
    INVALID_ACCESS = 'InvalidAccess',
    NOT_FOUND = 'NotFound',
    BAD_REQUEST = 'BadRequest',
    CONFLICT = 'Conflict',
}

/**
 * The reasons for which a ServiceError may be thrown.
 */
export enum ServiceErrorReason {
    INTERNAL = 'InternalServiceError',
}

/**
 * Takes an error object of any kind, and maps it to a status code.
 *
 * Any error that is not a service or resource error will default to be an
 * Internal Service Error. If the error parameter is not of type of error it will
 * default to be an Internal Service Error.
 * @param error the Error to map to HTTP information.
 * @return the status code for the HTTP response.
 */

export function mapErrorToResponseData(
    error: Error,
) {
    if (!(error instanceof Error)) {
        reportError(error);
        return 500;
    }
    let status = 500;

    switch (error.name) {
        case ResourceErrorReason.BAD_REQUEST:
            status = 400;
            break;
        case ResourceErrorReason.INVALID_ACCESS:
            status = 401;
            break;
        case ResourceErrorReason.FORBIDDEN:
            status = 401;
            break;
        case ResourceErrorReason.NOT_FOUND:
            status = 404;
            break;
        case ResourceErrorReason.CONFLICT:
            status = 409;
            break;
        case ServiceErrorReason.INTERNAL:
            status = 500;
            break;
        default:
            reportError(error);
            status = 500;
    }
    return status;
}