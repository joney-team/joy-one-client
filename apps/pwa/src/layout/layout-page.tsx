"use client";

import { PageLazyLoad, PageLoading } from "@/components/lazy-load";
import { useRouteRule } from "@/hooks/use-router";
import { useAuth } from "@/modules/auth/auth-context";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Stack } from "@mantine/core";
import dynamic, { DynamicOptions, Loader } from "next/dynamic";
import { ComponentType, PropsWithChildren, Suspense, type FC } from "react";
import { useWorkspaceLayout } from "./hooks/use-workspace-layout";
import { LayoutAdmin } from "./layout-admin";
import { useLayout } from "./layout-context";

export interface PageProps extends PropsWithChildren {}

interface LayoutProps<P = {}> {
  component: FC<P> | ComponentType<P>;
  props?: Omit<P, "children">;
  children?: React.ReactNode;
  nested?: boolean;
  isPageLayout?: boolean;
}

export function Layout<P>({
  component: Component,
  nested,
  isPageLayout,
  ...props
}: LayoutProps<P>) {
  const layout = useLayout();
  const routeRule = useRouteRule();
  const auth = useAuth();
  const workspace = useWorkspace();
  const workspaceLayout = useWorkspaceLayout();
  const componentProps = props.props as any;
  const isRequireAuth = routeRule.auth !== "public";

  if (!workspace.userMember && routeRule.auth === "workspace") return props.children;
  if (!auth.user && isRequireAuth) return props.children;

  if (routeRule.auth === "admin") {
    return (
      <LayoutAdmin>
        <Component {...componentProps} />
      </LayoutAdmin>
    );
  }

  if (nested) {
    if (!workspace.isAvailable) return props.children;
    return <Component {...componentProps}>{props.children}</Component>;
  }

  return (
    <Stack
      id="LayoutPage"
      miw={0}
      mih={0}
      gap={0}
      style={
        layout.view === "mobile"
          ? {
              paddingTop: workspaceLayout.headerHeight,
              paddingBottom: workspaceLayout.navigationHeight,
            }
          : {
              paddingTop: workspaceLayout.headerHeight,
              paddingLeft: workspaceLayout.navigationWidth,
            }
      }
    >
      {workspace.isAvailable ? (
        <Suspense fallback={<PageLazyLoad />}>
          <Component {...componentProps} children={isPageLayout ? props.children : undefined} />
        </Suspense>
      ) : (
        <PageLazyLoad />
      )}

      {isPageLayout ? null : props.children}
    </Stack>
  );
}

export function renderPage<P>(dynamicOptions: DynamicOptions<P> | Loader<P>) {
  return dynamic<P>(dynamicOptions, {
    ssr: false,
    loading: PageLoading,
  });
}
