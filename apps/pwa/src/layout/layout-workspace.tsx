"use client";

import { useRouteRule } from "@/hooks/use-router";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { nonLoading } from "@/utils/non-loading";
import { Stack } from "@mantine/core";
import dynamic from "next/dynamic";
import { Fragment, type FC } from "react";
import { useNavigationWidth, workspaceLayoutConfig } from "./hooks/use-workspace-layout";
import { useLayout } from "./layout-context";
import styles from "./layout-workspace.module.css";

const WorkspaceNavigation = dynamic(
  () => import("./navigation/workspace-navigation").then((m) => m.WorkspaceNavigation),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const WorkspaceHeader = dynamic(
  () => import("./header/workspace-header").then((m) => m.WorkspaceHeader),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const HorizontalLayoutResizing = dynamic(
  () =>
    import("../components/layout-resizing/HorizontalLayoutResizing").then(
      (m) => m.HorizontalLayoutResizing,
    ),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const LayoutWorkspaceHeadroom = dynamic(
  () => import("./layout-workspace-helper").then((m) => m.LayoutWorkspaceHeadroom),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const LayoutWorkspaceCssVariables = dynamic(
  () => import("./layout-workspace-css-variables").then((m) => m.LayoutWorkspaceCssVariables),
  {
    ssr: false,
    loading: nonLoading,
  },
);

const WorkspaceLayoutResizing = () => {
  const { navigationWidth, setNavigationWidth } = useNavigationWidth();

  return (
    <HorizontalLayoutResizing
      value={navigationWidth}
      onFinished={(width) => setNavigationWidth(width)}
      onResizing={(width) => {
        document.documentElement.style.setProperty("--app-layout-navigation-width", `${width}px`);
      }}
      min={workspaceLayoutConfig.minNavigationWidth}
      max={workspaceLayoutConfig.maxNavigationWidth}
    />
  );
};

export const LayoutWorkspace: FC = () => {
  const layout = useLayout();
  const workspace = useWorkspace();
  const routeRule = useRouteRule();

  if (!routeRule.workspace) return null;

  return (
    <Fragment>
      <LayoutWorkspaceCssVariables />
      <LayoutWorkspaceHeadroom />

      {!routeRule.isHideHeader && (
        <Stack gap={0} id="workspace-header" className={styles.WorkspaceHeader}>
          {workspace.isAvailable && <WorkspaceHeader />}
        </Stack>
      )}

      <Stack id="workspace-navigation" className={styles.WorkspaceNavigation}>
        {workspace.isAvailable && <WorkspaceNavigation />}
      </Stack>

      {layout.view !== "mobile" && <WorkspaceLayoutResizing />}
    </Fragment>
  );
};
