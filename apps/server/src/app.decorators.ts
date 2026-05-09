import {
  ExecutionContext,
  SetMetadata,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common';
import { Metadata, type AppRequest } from './app.types';
import { UserRole } from './users/users.types';
import { WorkspacePermission } from './workspace-roles/workspace-roles.types';
import { GqlExecutionContext } from '@nestjs/graphql';

export const getRequest = (ctx: ExecutionContext): AppRequest => {
  // Try to get GraphQL context first
  try {
    const gqlContext = GqlExecutionContext.create(ctx);
    const request = gqlContext.getContext().req;
    if (request) {
      return request as AppRequest;
    }
  } catch {
    // Not a GraphQL context, continue to HTTP
  }

  // Fallback to HTTP context
  return ctx.switchToHttp().getRequest() as AppRequest;
};

interface AuthArgs {
  userRoles?: UserRole[];
  permission?: WorkspacePermission | WorkspacePermission[];
  member?: boolean;
  customerContact?: boolean;
  customer?: boolean;
}

export const Auth = (args?: AuthArgs) => {
  const decorators: (ClassDecorator | PropertyDecorator | MethodDecorator)[] = [
    SetMetadata(Metadata.REQUIRE_AUTH, true),
  ];

  if (!args) return applyDecorators(...decorators);

  if (args.customer) {
    decorators.push(SetMetadata(Metadata.REQUIRE_CUSTOMER, true));
    decorators.push(SetMetadata(Metadata.REQUIRE_AUTH, true));
    decorators.push(SetMetadata(Metadata.REQUIRE_WORKSPACE, true));
  }

  // User related
  if (args.userRoles)
    decorators.push(SetMetadata(Metadata.REQUIRE_USER_ROLES, args.userRoles));

  // Workspace related
  const isRequireWorkspace = args.member || args.permission;

  if (isRequireWorkspace) {
    decorators.push(SetMetadata(Metadata.REQUIRE_WORKSPACE, true));
  }

  if (args.permission) {
    decorators.push(SetMetadata(Metadata.REQUIRE_PERMISSION, args.permission));
  }

  if (args.customerContact)
    decorators.push(
      SetMetadata(Metadata.RESTRICT_CUSTOMER_CONTACT, args.customerContact),
    );

  return applyDecorators(...decorators);
};

export const Portal = (args?: { requireWorkspace?: boolean }) => {
  const decorators: (ClassDecorator | PropertyDecorator | MethodDecorator)[] = [
    SetMetadata(Metadata.REQUIRE_PORTAL_KEY, true),
  ];

  if (args?.requireWorkspace) {
    decorators.push(SetMetadata(Metadata.REQUIRE_WORKSPACE, true));
  }

  return applyDecorators(...decorators);
};

export const SdkOnly = () => {
  return applyDecorators(SetMetadata(Metadata.REQUIRED_SDK_AUTH, true));
};

export const SDK = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const request = getRequest(ctx);
  return request.sdk;
});

export const Workspace = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = getRequest(ctx);
    return request.workspace;
  },
);

export const User = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = getRequest(ctx);
    return request.user;
  },
);

export const Member = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = getRequest(ctx);
    return request.member;
  },
);

export const Device = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = getRequest(ctx);
    return request.device;
  },
);

export const WorkspaceApp = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = getRequest(ctx);
    return request.workspaceApp;
  },
);

export const RequireDevice = () => {
  return applyDecorators(SetMetadata(Metadata.REQUIRED_DEVICE, true));
};

export const RequireWorkspaceApp = () => {
  return applyDecorators(
    SetMetadata(Metadata.REQUIRE_AUTH, true),
    SetMetadata(Metadata.REQUIRED_WORKSPACE_APP, true),
  );
};

export const RequestLocale = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = getRequest(ctx);
    return request.locale;
  },
);

export const Customer = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = getRequest(ctx);
    return request.customer;
  },
);
