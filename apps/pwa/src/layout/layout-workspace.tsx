"use client";

import { Fragment, Suspense, useEffect, type FC } from "react";
import { useWorkspaceLayout } from "./hooks/use-workspace-layout";
import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { Stack } from "@mantine/core";
import { useLayout } from "./layout-context";
import { WorkspaceNavigationSplitter } from "./navigation/navigation-splitter";
import dynamic from "next/dynamic";

const AppNavigation = dynamic(() => import("./navigation/navigation").then((m) => m.AppNavigation), {
  ssr: false,
});

const WorkspaceHeader = dynamic(() => import("./header/header").then((m) => m.WorkspaceHeader), {
  ssr: false,
});

export const backgroundColors = {
  light: "#f3f3f3",
  dark: "#242424",
};

export const backgroundPatternColors = {
  light: "#bcbcbc",
  dark: "#3f3f3f",
};

export const LayoutWorkspace: FC = () => {
  const layout = useLayout();
  const workspaceLayout = useWorkspaceLayout();
  const colorScheme = useColorScheme();

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
      <Stack
        gap={0}
        bg={workspaceLayout.pannelBackground}
        style={
          layout.view === "mobile"
            ? {
                position: "fixed",
                top: 0,
                right: 0,
                width: "100dvw",
                height: workspaceLayout.headerHeight,
                zIndex: 10,
                borderBottom: `1px solid ${workspaceLayout.dividerColor}`,
              }
            : {
                position: "fixed",
                top: 0,
                left: 0,
                width: "100dvw",
                height: workspaceLayout.headerHeight,
                paddingLeft: workspaceLayout.navigationWidth,
                zIndex: 10,
                borderBottom: `1px solid ${workspaceLayout.dividerColor}`,
                transition: workspaceLayout.transition("width"),
              }
        }
      >
        <Suspense>
          <WorkspaceHeader />
        </Suspense>
      </Stack>

      <Stack
        gap={0}
        bg={workspaceLayout.pannelBackground}
        style={
          layout.view === "mobile"
            ? {
                position: "fixed",
                bottom: 0,
                left: 0,
                height: workspaceLayout.navigationHeight,
                width: "100dvw",
              }
            : {
                position: "fixed",
                top: 0,
                left: 0,
                width: workspaceLayout.navigationWidth,
                height: workspaceLayout.navigationHeight,
                zIndex: 10,
                borderRight: `1px solid ${workspaceLayout.dividerColor}`,
                transition: workspaceLayout.transition("width"),
              }
        }
      >
        <Suspense>
          <AppNavigation />
        </Suspense>
      </Stack>

      <WorkspaceNavigationSplitter />
    </Fragment>
  );
};
