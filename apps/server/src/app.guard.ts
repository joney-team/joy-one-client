import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
  Provider,
  UnauthorizedException,
} from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { DevicesService } from 'src/devices/devices.service';
import { AppMessage } from './app.message';
import { type AppRequest, Metadata } from './app.types';
import { AuthService } from './auth/auth.service';
import { configs } from './config/config';
import { CustomersService } from './customers/customers.service';
import { detectLanguage } from './lang/lang.utils';
import { UserRole } from './users/users.types';
import { WorkspaceApiAppsService } from './workspace-api-apps/workspace-api-apps.service';
import { WorkspaceMembersService } from './workspace-members/workspace-members.service';
import { WorkspacePermission } from './workspace-roles/workspace-roles.types';
import { WorkspaceSdksService } from './workspace-sdks/workspace-sdks.service';
import { WorkspacesService } from './workspaces/workspaces.service';

abstract class BaseGuard implements CanActivate {
  constructor(
    protected reflector: Reflector,
    protected auth: AuthService,
    protected devices: DevicesService,
    protected workspaces: WorkspacesService,
    protected workspaceMembers: WorkspaceMembersService,
    protected workspaceSdks: WorkspaceSdksService,
    protected workspaceApps: WorkspaceApiAppsService,
    protected customers: CustomersService,
  ) {}

  abstract canActivate(context: ExecutionContext): Promise<boolean>;
}

@Injectable()
export class RestGuard extends BaseGuard {
  constructor(
    reflector: Reflector,
    auth: AuthService,
    devices: DevicesService,
    workspaces: WorkspacesService,
    workspaceMembers: WorkspaceMembersService,
    workspaceSdks: WorkspaceSdksService,
    workspaceApps: WorkspaceApiAppsService,
    customers: CustomersService,
  ) {
    super(
      reflector,
      auth,
      devices,
      workspaces,
      workspaceMembers,
      workspaceSdks,
      workspaceApps,
      customers,
    );
  }

  async canActivate(context: ExecutionContext) {
    let request = context.switchToHttp().getRequest() as AppRequest;

    // Only handle REST API routes
    if (!request || request.url?.startsWith('/graphql')) {
      return true; // Let GraphQL guard handle it
    }

    // Locale
    request.locale = detectLanguage(request);

    // Required SDK Auth
    const isRequireSdkAuth = this.reflector.get<boolean>(
      Metadata.REQUIRED_SDK_AUTH,
      context.getHandler(),
    );

    if (isRequireSdkAuth) {
      const sdkKey = request.headers['x-sdk-key'] as string;
      if (!sdkKey) throw new ForbiddenException(AppMessage.SDK_KEY_REQUIRED);

      try {
        const auth = await this.workspaceSdks.auth(sdkKey);
        request.workspace = auth.workspace;
        request.sdk = auth.sdk;
      } catch (error) {
        throw new ForbiddenException(AppMessage.INVALID_SDK_KEY);
      }

      return true;
    }

    // Headers values
    const userAgent = request.headers['user-agent'];
    const deviceId = request.headers['x-device-id'];
    const workspaceId = request.headers['x-workspace-id'];
    const accessToken = (request.headers.authorization?.split(' ') || [])[1];

    // Device
    const isRequiredDevice = this.reflector.get<boolean>(
      Metadata.REQUIRED_DEVICE,
      context.getHandler(),
    );

    if (deviceId) {
      request.device = await this.devices
        .validate({ deviceId, userAgent })
        .catch(() => null);
    }

    if (isRequiredDevice && !request.device) {
      throw new ForbiddenException(AppMessage.INVALID_DEVICE);
    }

    // Require Auth
    const isRequiredAuth = this.reflector.get<boolean>(
      Metadata.REQUIRE_AUTH,
      context.getHandler(),
    );

    if (isRequiredAuth) {
      // User
      if (!accessToken) throw new UnauthorizedException();

      // Required Workspace App
      const isWorkspaceAppSecretKey = accessToken.startsWith('app_');

      const isRequireWorkspaceApp = this.reflector.get<boolean>(
        Metadata.REQUIRED_WORKSPACE_APP,
        context.getHandler(),
      );

      if (isRequireWorkspaceApp && !isWorkspaceAppSecretKey) {
        throw new UnauthorizedException();
      }

      if (isWorkspaceAppSecretKey) {
        const { workspace, workspaceApp, member, user } =
          await this.workspaceApps.verifyKey(accessToken);

        request.workspaceApp = workspaceApp;
        request.member = member;
        request.workspace = workspace;
        request.user = user;
      }

      // User Authentication
      if (!request.user) {
        request.user = await this.auth.verifyAccessToken(accessToken);
      }

      // User Roles
      const requireUserRoles = this.reflector.get<UserRole[]>(
        Metadata.REQUIRE_USER_ROLES,
        context.getHandler(),
      );

      if (
        request.user.role !== UserRole.SYS_ADMIN &&
        requireUserRoles &&
        !requireUserRoles.includes(request.user.role)
      ) {
        throw new ForbiddenException(AppMessage.ACCESS_DENIED);
      }

      // Workspace
      if (!request.workspace && workspaceId) {
        request.workspace = await this.workspaces
          .get(String(workspaceId))
          .catch(() => null);
      }

      const isRequireWorkspace = this.reflector.get<boolean>(
        Metadata.REQUIRE_WORKSPACE,
        context.getHandler(),
      );

      if (isRequireWorkspace && !request.workspace) {
        throw new HttpException(AppMessage.AUTH_WORKSPACE_REQUIRED, 403);
      }

      if (request.workspace) {
        // Workspace member
        if (!request.member && request.user) {
          request.member = await this.workspaceMembers
            .get({
              userId: request.user._id.toString(),
              workspaceId: request.workspace._id.toString(),
            })
            .catch((error) => {
              if (error instanceof NotFoundException)
                throw new ForbiddenException(
                  AppMessage.NOT_BEEN_GRANTED_ACCESS_WITHIN_WORKSPACE,
                );
              throw error;
            });
        }

        // Require Permission
        const requirePermission = this.reflector.get<
          WorkspacePermission | WorkspacePermission[]
        >(Metadata.REQUIRE_PERMISSION, context.getHandler());

        if (requirePermission) {
          if (
            typeof requirePermission === 'string' &&
            (!request.member ||
              !request.member.permissions.includes(requirePermission))
          ) {
            throw new ForbiddenException(AppMessage.ACCESS_DENIED);
          }

          if (Array.isArray(requirePermission)) {
            const hasPermission = requirePermission.some((permission) =>
              request.member.permissions.includes(permission),
            );

            if (!hasPermission)
              throw new ForbiddenException(AppMessage.ACCESS_DENIED);
          }
        }
      }
    }

    // Customer
    const customerAccessToken = request.headers['x-customer-token'];
    const isRequireCustomer = this.reflector.get<boolean>(
      Metadata.REQUIRE_CUSTOMER,
      context.getHandler(),
    );

    if (customerAccessToken) {
      request.customer = await this.customers
        .auth({ accessToken: customerAccessToken as string })
        .catch(() => null);
    }

    if (isRequireCustomer && !request.customer) {
      throw new UnauthorizedException();
    }

    // Portal
    const isRequirePortalKey = this.reflector.get<boolean>(
      Metadata.REQUIRE_PORTAL_KEY,
      context.getHandler(),
    );
    if (isRequirePortalKey) {
      const portalKey = request.headers['x-portal-key'];
      const allowedPortalKeys = configs.PORTAL_KEYS.split(',')
        .map((v) => v.trim())
        .filter((v) => !!v && v !== 'none');
      if (!portalKey || !allowedPortalKeys.includes(portalKey.toString())) {
        throw new UnauthorizedException();
      }

      const isRequireWorkspace = this.reflector.get<boolean>(
        Metadata.REQUIRE_WORKSPACE,
        context.getHandler(),
      );

      const workspaceId =
        request.headers['x-workspace-id'] ||
        request.params['workspace-id'] ||
        request.query['workspace-id'];
      if (workspaceId)
        request.workspace = await this.workspaces
          .get(String(workspaceId))
          .catch(() => null);

      if (isRequireWorkspace && !request.workspace) {
        throw new HttpException(AppMessage.AUTH_WORKSPACE_REQUIRED, 404);
      }
    }
    return true;
  }
}

@Injectable()
export class GraphQLGuard extends BaseGuard {
  constructor(
    reflector: Reflector,
    auth: AuthService,
    devices: DevicesService,
    workspaces: WorkspacesService,
    workspaceMembers: WorkspaceMembersService,
    workspaceSdks: WorkspaceSdksService,
    workspaceApps: WorkspaceApiAppsService,
    customers: CustomersService,
  ) {
    super(
      reflector,
      auth,
      devices,
      workspaces,
      workspaceMembers,
      workspaceSdks,
      workspaceApps,
      customers,
    );
  }

  async canActivate(context: ExecutionContext) {
    // Only handle GraphQL context
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req as AppRequest;

    if (!request) {
      return true;
    }

    // Locale
    request.locale = detectLanguage(request);

    // Required SDK Auth
    const isRequireSdkAuth = this.reflector.get<boolean>(
      Metadata.REQUIRED_SDK_AUTH,
      context.getHandler(),
    );

    if (isRequireSdkAuth) {
      const sdkKey = request.headers['x-sdk-key'] as string;
      if (!sdkKey) throw new ForbiddenException(AppMessage.SDK_KEY_REQUIRED);

      try {
        const auth = await this.workspaceSdks.auth(sdkKey);
        request.workspace = auth.workspace;
        request.sdk = auth.sdk;
      } catch (error) {
        throw new ForbiddenException(AppMessage.INVALID_SDK_KEY);
      }

      return true;
    }

    // Headers values
    const userAgent = request.headers['user-agent'];
    const deviceId = request.headers['x-device-id'];
    const workspaceId = request.headers['x-workspace-id'];
    const accessToken = (request.headers.authorization?.split(' ') || [])[1];

    // Device
    const isRequiredDevice = this.reflector.get<boolean>(
      Metadata.REQUIRED_DEVICE,
      context.getHandler(),
    );

    if (deviceId) {
      request.device = await this.devices
        .validate({ deviceId, userAgent })
        .catch(() => null);
    }

    if (isRequiredDevice && !request.device) {
      throw new ForbiddenException(AppMessage.INVALID_DEVICE);
    }

    // Require Auth
    const isRequiredAuth = this.reflector.get<boolean>(
      Metadata.REQUIRE_AUTH,
      context.getHandler(),
    );

    if (isRequiredAuth) {
      // User
      if (!accessToken) throw new UnauthorizedException();

      // Required Workspace App
      const isWorkspaceAppSecretKey = accessToken.startsWith('app_');

      const isRequireWorkspaceApp = this.reflector.get<boolean>(
        Metadata.REQUIRED_WORKSPACE_APP,
        context.getHandler(),
      );

      if (isRequireWorkspaceApp && !isWorkspaceAppSecretKey) {
        throw new UnauthorizedException();
      }

      if (isWorkspaceAppSecretKey) {
        const { workspace, workspaceApp, member, user } =
          await this.workspaceApps.verifyKey(accessToken);

        request.workspaceApp = workspaceApp;
        request.member = member;
        request.workspace = workspace;
        request.user = user;
      }

      // User Authentication
      if (!request.user) {
        request.user = await this.auth.verifyAccessToken(accessToken);
      }

      // User Roles
      const requireUserRoles = this.reflector.get<UserRole[]>(
        Metadata.REQUIRE_USER_ROLES,
        context.getHandler(),
      );

      if (
        request.user.role !== UserRole.SYS_ADMIN &&
        requireUserRoles &&
        !requireUserRoles.includes(request.user.role)
      ) {
        throw new ForbiddenException(AppMessage.ACCESS_DENIED);
      }

      // Workspace
      if (!request.workspace && workspaceId) {
        request.workspace = await this.workspaces
          .get(String(workspaceId))
          .catch(() => null);
      }

      const isRequireWorkspace = this.reflector.get<boolean>(
        Metadata.REQUIRE_WORKSPACE,
        context.getHandler(),
      );

      if (isRequireWorkspace && !request.workspace) {
        throw new HttpException(AppMessage.AUTH_WORKSPACE_REQUIRED, 403);
      }

      if (request.workspace) {
        // Workspace member
        if (!request.member && request.user) {
          request.member = await this.workspaceMembers
            .get({
              userId: request.user._id.toString(),
              workspaceId: request.workspace._id.toString(),
            })
            .catch((error) => {
              if (error instanceof NotFoundException)
                throw new ForbiddenException(
                  AppMessage.NOT_BEEN_GRANTED_ACCESS_WITHIN_WORKSPACE,
                );
              throw error;
            });
        }

        // Require Permission
        const requirePermission = this.reflector.get<
          WorkspacePermission | WorkspacePermission[]
        >(Metadata.REQUIRE_PERMISSION, context.getHandler());

        if (requirePermission) {
          if (
            typeof requirePermission === 'string' &&
            (!request.member ||
              !request.member.permissions.includes(requirePermission))
          ) {
            throw new ForbiddenException(AppMessage.ACCESS_DENIED);
          }

          if (Array.isArray(requirePermission)) {
            const hasPermission = requirePermission.some((permission) =>
              request.member.permissions.includes(permission),
            );

            if (!hasPermission)
              throw new ForbiddenException(AppMessage.ACCESS_DENIED);
          }
        }
      }
    }

    // Customer
    const customerAccessToken = request.headers['x-customer-token'];
    const isRequireCustomer = this.reflector.get<boolean>(
      Metadata.REQUIRE_CUSTOMER,
      context.getHandler(),
    );

    if (customerAccessToken) {
      request.customer = await this.customers
        .auth({ accessToken: customerAccessToken as string })
        .catch(() => null);
    }

    if (isRequireCustomer && !request.customer) {
      throw new UnauthorizedException();
    }

    // Portal
    const isRequirePortalKey = this.reflector.get<boolean>(
      Metadata.REQUIRE_PORTAL_KEY,
      context.getHandler(),
    );
    if (isRequirePortalKey) {
      const portalKey = request.headers['x-portal-key'];
      const allowedPortalKeys = configs.PORTAL_KEYS.split(',')
        .map((v) => v.trim())
        .filter((v) => !!v && v !== 'none');
      if (!portalKey || !allowedPortalKeys.includes(portalKey.toString())) {
        throw new UnauthorizedException();
      }

      const isRequireWorkspace = this.reflector.get<boolean>(
        Metadata.REQUIRE_WORKSPACE,
        context.getHandler(),
      );

      const workspaceId =
        request.headers['x-workspace-id'] ||
        request.params['workspace-id'] ||
        request.query['workspace-id'];

      if (workspaceId)
        request.workspace = await this.workspaces
          .get(String(workspaceId))
          .catch(() => null);

      if (isRequireWorkspace && !request.workspace) {
        throw new HttpException(AppMessage.AUTH_WORKSPACE_REQUIRED, 404);
      }
    }
    return true;
  }
}

@Injectable()
export class CombinedGuard implements CanActivate {
  private restGuard: RestGuard;
  private graphqlGuard: GraphQLGuard;

  constructor(
    reflector: Reflector,
    auth: AuthService,
    devices: DevicesService,
    workspaces: WorkspacesService,
    workspaceMembers: WorkspaceMembersService,
    workspaceSdks: WorkspaceSdksService,
    workspaceApps: WorkspaceApiAppsService,
    customers: CustomersService,
  ) {
    // Create instances directly with injected dependencies
    this.restGuard = new RestGuard(
      reflector,
      auth,
      devices,
      workspaces,
      workspaceMembers,
      workspaceSdks,
      workspaceApps,
      customers,
    );
    this.graphqlGuard = new GraphQLGuard(
      reflector,
      auth,
      devices,
      workspaces,
      workspaceMembers,
      workspaceSdks,
      workspaceApps,
      customers,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      if (request && !request.url?.startsWith('/graphql')) {
        return this.restGuard.canActivate(context);
      }
    } catch {
      // Not HTTP context, try GraphQL
    }

    try {
      const gqlContext = GqlExecutionContext.create(context);
      if (gqlContext.getContext().req) {
        return this.graphqlGuard.canActivate(context);
      }
    } catch {
      // Not GraphQL context
    }

    // Fallback to REST guard
    return this.restGuard.canActivate(context);
  }
}

export const RestGuardProvider: Provider = {
  provide: APP_GUARD,
  useClass: RestGuard,
};

export const GraphQLGuardProvider: Provider = {
  provide: APP_GUARD,
  useClass: GraphQLGuard,
};

// Combined provider that routes to the appropriate guard
export const AppGuard: Provider = {
  provide: APP_GUARD,
  useClass: CombinedGuard,
};
