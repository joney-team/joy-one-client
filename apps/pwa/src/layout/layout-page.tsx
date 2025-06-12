"use client";

import { useCloseAppLoading } from "@/components/app-loading";
import { PageLoading } from "@/components/lazy-load";
import { useRouteRule } from "@/hooks/use-router";
import { useAuth } from "@/modules/auth/auth-context";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { Stack } from "@mantine/core";
import dynamic, { DynamicOptions, Loader } from "next/dynamic";
import { ComponentType, Fragment, PropsWithChildren, Suspense, type FC } from "react";
import { useWorkspaceLayout } from "./hooks/use-workspace-layout";
import { useLayout } from "./layout-context";

export interface PageProps extends PropsWithChildren {}

interface LayoutProps<P = {}> {
  component: FC<P> | ComponentType<P>;
  props?: Omit<P, "children">;
  children?: React.ReactNode;
  nested?: boolean;
}

export function Layout<P>({ component: Component, nested, ...props }: LayoutProps<P>) {
  const layout = useLayout();
  const routeRule = useRouteRule();
  const auth = useAuth();
  const workspace = useWorkspace();
  const workspaceLayout = useWorkspaceLayout();
  const componentProps = props.props as any;
  useCloseAppLoading(!!workspace.userMember);

  if (!workspace.userMember && routeRule.auth === "workspace") return props.children;
  if (!auth.user && routeRule.auth === "auth") return props.children;
  if (nested) return <Component {...componentProps}>{props.children}</Component>;

  return (
    <Fragment>
      <Stack
        id="layout-root"
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
                transition: workspaceLayout.transition("padding-left"),
              }
        }
      >
        <Suspense>
          <Component {...componentProps} />
        </Suspense>

        {props.children}
      </Stack>
    </Fragment>
  );
}

export function renderPage<P>(dynamicOptions: DynamicOptions<P> | Loader<P>) {
  return dynamic<P>(dynamicOptions, {
    ssr: false,
    loading: PageLoading,
  });
}
