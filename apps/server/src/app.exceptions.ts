import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Provider,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GqlArgumentsHost, GqlContextType } from '@nestjs/graphql';
import { AxiosError } from 'axios';
import { Request, Response } from 'express';
import { logger } from './app.logger';
import { AppMessage } from './app.message';
import type { AppRequest } from './app.types';
import { AppLocale } from './lang/lang.types';
import { translate } from './lang/lang.utils';
import { ValidationError } from 'class-validator';

export interface InvalidField {
  [key: string]: string;
}

export class PayloadException extends HttpException {
  constructor(invalidFields: InvalidField, message?: string) {
    let errors: { [key: string]: string } = {};

    Object.keys(invalidFields).map((key) => {
      const keyMessage = invalidFields[key];

      if (Array.isArray(keyMessage)) {
        errors[key] = keyMessage.map((v) => v.replace(key, '').trim())[0];
      } else {
        errors[key] = keyMessage.replace(key, '').trim();
      }
    });

    const _message =
      message || Object.keys(errors).length === 1
        ? Object.values(errors)[0]
        : AppMessage.INVALID_PAYLOAD;

    const response = {
      errors,
      message: _message,
      statusCode: HttpStatus.BAD_REQUEST,
    };

    super(response, response.statusCode);
  }
}

abstract class BaseExceptionFilter implements ExceptionFilter {
  get config() {
    return {
      ignoreStatus: [404, 401, 403, 429],
      ignoreRegex: ['queues', 'robots.txt', 'favicon.ico'],
    };
  }

  getMessage(exception: any): string {
    const status = exception.status || 500;
    if (status === 429) return AppMessage.TOO_MANY_REQUESTS;
    if (exception?.message) return exception?.message;
    return AppMessage.INTERNAL_SERVER_ERROR;
  }

  translateErrors(errors: any, locale: AppLocale) {
    return Object.keys(errors).reduce((output, key) => {
      output[key] = translate(errors[key], locale);
      return output;
    }, {});
  }

  abstract catch(exception: any, host: ArgumentsHost): void;
}

@Catch()
@Injectable()
export class RestExceptionFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    try {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      const request = ctx.getRequest<Request>() as AppRequest;

      // Only handle REST API routes (under /api)
      if (!request || !response || request.url?.startsWith('/graphql')) {
        return; // Let GraphQL filter handle it
      }

      const status = exception.status || 500;
      const message = this.getMessage(exception);
      const errors = exception?.response?.errors || {};
      const description = exception?.options?.description;
      const cause = exception?.cause;

      const isIgnored =
        this.config.ignoreRegex.some(
          (v) => message.includes(v) || request.url.includes(v),
        ) || this.config.ignoreStatus.includes(status);

      if (!isIgnored) logger.error(exception, { request });

      response.status(status).json({
        message: translate(message, request.locale, cause),
        statusCode: status,
        errors: this.translateErrors(errors, request.locale),
        description,
        cause,
      });
    } catch (error) {
      logger.error(error);
    }
  }
}

@Catch()
@Injectable()
export class GraphQLExceptionFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const request = gqlHost.getContext();

    // For GraphQL, we let the exception propagate so GraphQL can format it properly
    // But we still log it
    const status = exception.status || 500;
    const message = this.getMessage(exception);
    const isIgnored =
      this.config.ignoreRegex.some((v) => message.includes(v)) ||
      this.config.ignoreStatus.includes(status);

    if (!isIgnored) {
      logger.error(exception);
    }

    // Translate message
    if (exception && typeof exception === 'object' && 'message' in exception) {
      exception.message = translate(
        exception.message,
        request.req.locale,
        exception?.cause,
      );
    }

    // Re-throw the exception so GraphQL can handle it
    throw exception;
  }
}

@Catch()
@Injectable()
export class CombinedExceptionFilter implements ExceptionFilter {
  private restFilter: RestExceptionFilter;
  private graphqlFilter: GraphQLExceptionFilter;

  constructor() {
    // Create instances directly instead of injecting
    this.restFilter = new RestExceptionFilter();
    this.graphqlFilter = new GraphQLExceptionFilter();
  }

  catch(exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const contextType = gqlHost.getType<GqlContextType>();

    if (contextType === 'graphql') {
      return this.graphqlFilter.catch(exception, host);
    } else {
      return this.restFilter.catch(exception, host);
    }
  }
}

export const RestExceptionProvider: Provider = {
  provide: APP_FILTER,
  useClass: RestExceptionFilter,
};

export const GraphQLExceptionProvider: Provider = {
  provide: APP_FILTER,
  useClass: GraphQLExceptionFilter,
};

// Combined provider that routes to the appropriate filter
export const AppExceptionProvider: Provider = {
  provide: APP_FILTER,
  useClass: CombinedExceptionFilter,
};

export const axiosError = (error: any) => {
  if (error instanceof AxiosError) {
    return new HttpException(
      error.response?.data,
      error.response?.status || 500,
      {
        description: error.response?.data,
      },
    );
  } else {
    return new HttpException(error.message, 500, {
      description: error,
    });
  }
};

export function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
  result: Record<string, string[]> = {},
) {
  for (const error of errors) {
    const propertyPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.constraints) {
      result[propertyPath] = Object.values(error.constraints);
    }

    if (error.children && error.children.length > 0) {
      flattenValidationErrors(error.children, propertyPath, result);
    }
  }

  return result;
}
