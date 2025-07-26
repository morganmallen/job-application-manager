import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        message = Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message[0]
          : exceptionResponse.message;
      } else {
        message = exception.message;
      }
    }

    // Handle specific authentication errors
    if (status === HttpStatus.UNAUTHORIZED) {
      return response.status(status).json({
        statusCode: status,
        message: message,
        error: 'Unauthorized',
        timestamp: new Date().toISOString(),
      });
    }

    // Handle validation errors
    if (status === HttpStatus.BAD_REQUEST) {
      return response.status(status).json({
        statusCode: status,
        message: message,
        error: 'Bad Request',
        timestamp: new Date().toISOString(),
      });
    }

    // Handle conflict errors (e.g., duplicate email)
    if (status === HttpStatus.CONFLICT) {
      return response.status(status).json({
        statusCode: status,
        message: message,
        error: 'Conflict',
        timestamp: new Date().toISOString(),
      });
    }

    // Default error response
    return response.status(status).json({
      statusCode: status,
      message: message,
      error: 'Internal Server Error',
      timestamp: new Date().toISOString(),
    });
  }
}
