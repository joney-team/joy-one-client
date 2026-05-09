import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Provider,
} from '@nestjs/common';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { map, Observable } from 'rxjs';
import { logger } from './app.logger';
import { AppService } from './app.service';
import { AppRequest, Metadata } from './app.types';
import { restrictCustomerContact } from './customers/customers.interceptor';

abstract class BaseInterceptor implements NestInterceptor {
  constructor(
    protected reflector: Reflector,
    protected service: AppService,
  ) {}

  abstract intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any>;
}

@Injectable()
export class RestInterceptor extends BaseInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const time = Date.now();
    const request = context.switchToHttp().getRequest<AppRequest>();

    // Only handle REST API routes
    if (!request || request.url?.startsWith('/graphql')) {
      return next.handle(); // Let GraphQL interceptor handle it
    }

    const isRestrictCustomerContact = this.reflector.get<boolean>(
      Metadata.RESTRICT_CUSTOMER_CONTACT,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((responseData) => {
        if (this.service.debug.router) {
          logger.info(
            `${request.method.padEnd(5)} ${request.url} (${Date.now() - time}ms)`,
          );
        }
        if (isRestrictCustomerContact) {
          return restrictCustomerContact({ request, responseData });
        }
        return responseData;
      }),
    );
  }
}

@Injectable()
export class GraphQLInterceptor extends BaseInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const time = Date.now();
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req as AppRequest;

    // Only handle GraphQL context
    if (!request) {
      return next.handle();
    }

    const isRestrictCustomerContact = this.reflector.get<boolean>(
      Metadata.RESTRICT_CUSTOMER_CONTACT,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((responseData) => {
        if (this.service.debug.router) {
          console.log(
            `GraphQL ${request.url || 'query'} (${Date.now() - time}ms)`,
          );
        }
        if (isRestrictCustomerContact) {
          return restrictCustomerContact({ request, responseData });
        }
        return responseData;
      }),
    );
  }
}

@Injectable()
export class CombinedInterceptor implements NestInterceptor {
  private restInterceptor: RestInterceptor;
  private graphqlInterceptor: GraphQLInterceptor;

  constructor(reflector: Reflector, service: AppService) {
    // Create instances directly with injected dependencies
    this.restInterceptor = new RestInterceptor(reflector, service);
    this.graphqlInterceptor = new GraphQLInterceptor(reflector, service);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    try {
      const request = context.switchToHttp().getRequest();
      if (request && !request.url?.startsWith('/graphql')) {
        return this.restInterceptor.intercept(context, next);
      }
    } catch {
      // Not HTTP context, try GraphQL
    }

    try {
      const gqlContext = GqlExecutionContext.create(context);
      if (gqlContext.getContext().req) {
        return this.graphqlInterceptor.intercept(context, next);
      }
    } catch {
      // Not GraphQL context
    }

    // Fallback to REST interceptor
    return this.restInterceptor.intercept(context, next);
  }
}

export const RestInterceptorProvider: Provider = {
  provide: APP_INTERCEPTOR,
  useClass: RestInterceptor,
};

export const GraphQLInterceptorProvider: Provider = {
  provide: APP_INTERCEPTOR,
  useClass: GraphQLInterceptor,
};

// Combined provider that routes to the appropriate interceptor
export const AppInterceptorProvider: Provider = {
  provide: APP_INTERCEPTOR,
  useClass: CombinedInterceptor,
};
