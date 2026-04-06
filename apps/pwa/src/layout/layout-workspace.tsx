"use client";

import OverlayLoading from "@/components/overlay-loading";
import { useColor } from "@/modules/theme/use-color";
import { useWorkspaceStyles } from "@/modules/theme/use-workspace-styles";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { nonLoading } from "@/utils/non-loading";
import { zIndexes } from "@joy-one-client/config/layout";
import { Stack } from "@mantine/core";
import { useHeadroom } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { Fragment, useEffect, type FC } from "react";
import { useWorkspaceLayout } from "./hooks/use-workspace-layout";
import { useLayout } from "./layout-context";
import { useRouteRule } from "@/hooks/use-router";

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

const WorkspaceNavigationSplitter = dynamic(
  () => import("./navigation/navigation-splitter").then((m) => m.WorkspaceNavigationSplitter),
  {
    ssr: false,
    loading: nonLoading,
  },
);

export const LayoutWorkspace: FC = () => {
  const layout = useLayout();
  const color = useColor();
  const workspace = useWorkspace();
  const workspaceLayout = useWorkspaceLayout();
  const routeRule = useRouteRule();
  const isEnabled = !!routeRule.workspace;

  useWorkspaceStyles(isEnabled);

  const headroom = useHeadroom({
    fixedAt:
      layout.view === "mobile"
        ? workspaceLayout.navigationHeight / 2
        : workspaceLayout.headerHeight / 2,
  });

  const headPinned =
    layout.view === "mobile" && !layout.isStandalone ? !layout.isBrowerCollapsed : headroom;

  useEffect(() => {
    if (!isEnabled) return;

    window.document.body.style.setProperty("--app-primary-color", color("primary"));
    return () => {
      window.document.body.style.removeProperty("--app-primary-color");
    };
  }, [color, workspace, isEnabled]);

  if (!isEnabled) return null;

  return (
    <Fragment>
      {workspaceLayout.headerHeight > 0 && (
        <Stack
          gap={0}
          bg={workspaceLayout.pannelBackground}
          pos="fixed"
          style={
            layout.view === "mobile"
              ? {
                  top: 0,
                  right: 0,
                  width: "100dvw",
                  height: workspaceLayout.headerHeight,
                  zIndex: zIndexes.pannel,
                  borderBottom: `1px solid ${workspaceLayout.dividerColor}`,
                  transform: `translate3d(0, ${
                    headPinned ? 0 : `${-workspaceLayout.headerHeight}px`
                  }, 0)`,
                }
              : {
                  top: 0,
                  left: 0,
                  width: "100dvw",
                  height: workspaceLayout.headerHeight,
                  paddingLeft: workspaceLayout.navigationWidth,
                  zIndex: zIndexes.pannel,
                  borderBottom: `1px solid ${workspaceLayout.dividerColor}`,
                  transform: `translate3d(0, ${headPinned ? 0 : "-110px"}, 0)`,
                  transition: "transform 0.2s ease-out",
                }
          }
        >
          {workspace.isAvailable && <WorkspaceHeader />}
        </Stack>
      )}

      {workspaceLayout.navigationHeight > 0 && (
        <Stack
          gap={0}
          bg={workspaceLayout.pannelBackground}
          pos="fixed"
          style={
            layout.view === "mobile"
              ? {
                  bottom: 0,
                  left: 0,
                  zIndex: zIndexes.pannel,
                  height: workspaceLayout.navigationHeight,
                  width: "100dvw",
                  transform: `translate3d(0, ${headPinned ? 0 : "110px"}, 0)`,
                  transition: workspaceLayout.transition("all"),
                  borderTop: `1px solid ${workspaceLayout.dividerColor}`,
                  background: "red",
                  boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
                }
              : {
                  top: 0,
                  left: 0,
                  width: workspaceLayout.navigationWidth,
                  height: "100dvh",
                  zIndex: zIndexes.pannel,
                  borderRight: `1px solid ${workspaceLayout.dividerColor}`,
                }
          }
        >
          {workspace.isAvailable ? <WorkspaceNavigation /> : <OverlayLoading enabled />}
        </Stack>
      )}

      {layout.view !== "mobile" && <WorkspaceNavigationSplitter />}
    </Fragment>
  );
};
