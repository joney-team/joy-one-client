"use client";

import OverlayLoading from "@/components/overlay-loading";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { useWorkspace } from "@/modules/workspaces/workspace-context";
import { backgroundColors, backgroundPatternColors } from "@joy-one-client/config/colors";
import { zIndexes } from "@joy-one-client/config/layout";
import { Stack } from "@mantine/core";
import { useHeadroom } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { Fragment, Suspense, useEffect, type FC } from "react";
import { useWorkspaceLayout } from "./hooks/use-workspace-layout";
import { useLayout } from "./layout-context";
import { WorkspaceNavigationSplitter } from "./navigation/navigation-splitter";

const AppNavigation = dynamic(
  () => import("./navigation/navigation").then((m) => m.AppNavigation),
  {
    ssr: false,
  }
);

const HeaderWorkspace = dynamic(
  () => import("./header/header-workspace").then((m) => m.HeaderWorkspace),
  {
    ssr: false,
  }
);

export const LayoutWorkspace: FC = () => {
  const layout = useLayout();
  const workspace = useWorkspace();
  const workspaceLayout = useWorkspaceLayout();
  const colorScheme = useColorScheme();

  const _pinned = useHeadroom({
    fixedAt:
      layout.view === "mobile"
        ? workspaceLayout.navigationHeight / 2
        : workspaceLayout.headerHeight / 2,
  });

  const pinned =
    layout.view === "mobile" && !layout.isStandalone ? !layout.isBrowerCollapsed : _pinned;

  useEffect(() => {
    const backgroundColor = backgroundColors[colorScheme];
    const patternColor = backgroundPatternColors[colorScheme];

    document.body.style.backgroundColor = backgroundColor;
    document.body.style.backgroundImage = `radial-gradient(${patternColor} 0.6px, ${backgroundColor} 0.6px)`;
    document.body.style.backgroundSize = "12px 12px";

    return () => {
      document.body.style.backgroundColor = "var(--mantine-color-body)";
      document.body.style.backgroundImage = "none";
      document.body.style.backgroundSize = "none";
    };
  }, [colorScheme]);

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
                  transform: `translate3d(0, ${pinned ? 0 : "-110px"}, 0)`,
                }
              : {
                  top: 0,
                  left: 0,
                  width: "100dvw",
                  height: workspaceLayout.headerHeight,
                  paddingLeft: workspaceLayout.navigationWidth,
                  zIndex: zIndexes.pannel,
                  borderBottom: `1px solid ${workspaceLayout.dividerColor}`,
                }
          }
        >
          {workspace.isAvailable && (
            <Suspense>
              <HeaderWorkspace />
            </Suspense>
          )}
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
                  transform: `translate3d(0, ${pinned ? 0 : "110px"}, 0)`,
                  transition: workspaceLayout.transition("all"),
                  borderTop: `1px solid ${workspaceLayout.dividerColor}`,
                  background: "red",
                  boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
                }
              : {
                  top: 0,
                  left: 0,
                  width: workspaceLayout.navigationWidth,
                  height: workspaceLayout.navigationHeight,
                  zIndex: zIndexes.pannel,
                  borderRight: `1px solid ${workspaceLayout.dividerColor}`,
                }
          }
        >
          {workspace.isAvailable ? (
            <Suspense>
              <AppNavigation />
            </Suspense>
          ) : (
            <Suspense>
              <OverlayLoading enabled />
            </Suspense>
          )}
        </Stack>
      )}

      {layout.view !== "mobile" && <WorkspaceNavigationSplitter />}
    </Fragment>
  );
};
