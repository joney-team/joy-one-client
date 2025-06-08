export type RouteRule = {
  auth?: "auth" | "workspace" | "public";
  workspace?: boolean;
};

export const defaultRouteRule: RouteRule = {
  auth: 'workspace',
  workspace: true,
};

export const routeRules: Record<string, RouteRule> = {
  '/connect': {
    auth: 'public',
    workspace: false,
  },
  '/customer-forms/new': {
    auth: 'public',
    workspace: false,
  },
  '/plugins/zalo-oas/connect-callback': {
    auth: 'workspace',
    workspace: false,
  },
  '/bank-transactions/callback': {
    auth: 'workspace',
    workspace: false,
  },
}