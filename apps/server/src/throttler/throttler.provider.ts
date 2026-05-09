import { ExecutionContext, Injectable, Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  getRequest(context: ExecutionContext) {
    // Try to get GraphQL context first
    try {
      const gqlContext = GqlExecutionContext.create(context);
      const request = gqlContext.getContext().req;
      if (request) {
        return request;
      }
    } catch {
      // Not a GraphQL context, continue to HTTP
    }

    // Fallback to HTTP context
    return context.switchToHttp().getRequest();
  }

  getResponse(context: ExecutionContext) {
    // Try to get GraphQL context first
    try {
      const gqlContext = GqlExecutionContext.create(context);
      const response = gqlContext.getContext().res;
      if (response) {
        return response;
      }
    } catch {
      // Not a GraphQL context, continue to HTTP
    }

    // Fallback to HTTP context
    return context.switchToHttp().getResponse();
  }

  getTracker(req: Record<string, any>): Promise<string> {
    // Handle GraphQL context where req might be undefined or structured differently
    if (!req) {
      return Promise.resolve('unknown');
    }

    // Try to get IP from various possible locations
    const ip =
      req.ip ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      (req.headers &&
        (req.headers['x-forwarded-for'] || req.headers['x-real-ip'])) ||
      'unknown';

    // Handle x-forwarded-for which can be a comma-separated list
    if (typeof ip === 'string' && ip.includes(',')) {
      return Promise.resolve(ip.split(',')[0].trim());
    }

    return Promise.resolve(ip);
  }
}

export const ThrottlerProvider: Provider = {
  provide: APP_GUARD,
  useClass: CustomThrottlerGuard,
};
