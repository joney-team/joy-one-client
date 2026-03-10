"use client";

import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { StorageKey } from "@/constants/storage-key";
import { useLocalStorage } from "@mantine/hooks";
import { useMemo } from "react";
import { useLayout } from "../layout-context";
import { useColor } from "@/modules/theme/use-color";
import { useParams, usePathname } from "next/navigation";
import { useRouteRule } from "@/hooks/use-router";

interface WorkspaceLayoutState {
  navigationWidth: number;
  navigationHeight: number;
  headerHeight: number;
  headerWidth: number;
  dividerColor: string;
  isNavbarCollapsed: boolean;
  setNavigationWidth: (width: number) => void;
  bodyWidth: number;
  bodyHeight: number;
  pannelBackground: string;
  transition: (property?: string) => string;
}

export const workspaceLayoutConfig = {
  defaultNavigationExpandedWidth: 200,
  mobileNavigationHeight: 55,
  standaloneNavigationHeight: 75,
  headerHeight: 48,
  minNavigationWidth: 62,
  maxNavigationWidth: 400,
};

export const useWorkspaceLayout = (): WorkspaceLayoutState => {
  const pathname = usePathname();
  const params = useParams();
  const layout = useLayout();
  const color = useColor();
  const colorScheme = useColorScheme();
  const routeRule = useRouteRule();
  const [navigationWidthStorage, setNavigationWidthStorage] = useLocalStorage({
    key: StorageKey.LAYOUT_NAVIGATION_WIDTH,
  });

  const isDetailPage = useMemo(() => {
    if (pathname.startsWith("/tasks")) return false;
    return Object.keys(params).length > 0;
  }, [pathname, params]);

  const state = useMemo(() => {
    const headerHeight = routeRule.isHideHeader ? 0 : workspaceLayoutConfig.headerHeight;

    const navigationWidth = navigationWidthStorage
      ? +navigationWidthStorage
      : workspaceLayoutConfig.defaultNavigationExpandedWidth;

    const navigationHeight =
      layout.view === "mobile" && (isDetailPage || routeRule.isHideNavigation)
        ? 0
        : layout.isStandalone
        ? workspaceLayoutConfig.standaloneNavigationHeight
        : layout.view === "mobile"
        ? workspaceLayoutConfig.mobileNavigationHeight
        : layout.height;

    return {
      navigationWidth,
      navigationHeight,
      headerHeight: headerHeight,
      headerWidth: layout.width - navigationWidth,
      isNavbarCollapsed: navigationWidth <= workspaceLayoutConfig.minNavigationWidth * 1.5,
      bodyWidth: layout.width - navigationWidth,
      bodyHeight: layout.height - headerHeight,
    };
  }, [
    layout.width,
    layout.height,
    layout.isBrowerCollapsed,
    colorScheme,
    navigationWidthStorage,
    isDetailPage,
    routeRule,
  ]);

  return {
    ...state,
    setNavigationWidth: (width: number) => setNavigationWidthStorage(width.toString()),
    dividerColor: color({ light: "gray.2", dark: "dark.5" }),
    pannelBackground: color({ light: "white", dark: "dark.8" }),
    transition: (property) => `${property || "all"} 0.2s ease-out`,
  };
};
