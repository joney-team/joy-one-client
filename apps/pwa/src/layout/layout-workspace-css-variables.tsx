"use client";

import { StorageKey } from "@/constants/storage-key";
import { useRouteRule } from "@/hooks/use-router";
import { workspaceLayoutConfig } from "@/layout/hooks/use-workspace-layout";
import { useLayout } from "@/layout/layout-context";
import { zIndexes } from "@joy-one-client/config/layout";
import { useLocalStorage } from "@mantine/hooks";
import { useParams, usePathname } from "next/navigation";
import { FC, useEffect, useMemo } from "react";
import { useColor } from "../modules/theme/use-color";

export const LayoutWorkspaceCssVariables: FC = () => {
  const color = useColor();
  const layout = useLayout();

  const routeRule = useRouteRule();
  const pathname = usePathname();
  const params = useParams();

  const [navigationWidthStorage] = useLocalStorage({
    key: StorageKey.LAYOUT_NAVIGATION_WIDTH,
  });

  const isDetailPage = useMemo(() => {
    if (pathname.startsWith("/tasks")) return false;

    return Object.keys(params).length > 0;
  }, [pathname, params]);

  useEffect(() => {
    const navigationHeight =
      layout.view === "mobile" && (isDetailPage || routeRule.isHideNavigation)
        ? 0
        : layout.isStandalone
          ? workspaceLayoutConfig.standaloneNavigationHeight
          : layout.view === "mobile"
            ? workspaceLayoutConfig.mobileNavigationHeight
            : "100dvh";

    const navigationWidth =
      navigationWidthStorage || workspaceLayoutConfig.defaultNavigationExpandedWidth;

    const headerHeight = routeRule.isHideHeader ? 0 : workspaceLayoutConfig.headerHeight;

    const layoutWidth = `calc(100dvw - ${navigationWidth}px)`;
    const layoutHeight = `calc(100dvh - ${headerHeight}px)`;

    const variables = {
      "--app-layout-navigation-width": `${navigationWidth}px`,
      "--app-layout-navigation-height": `${navigationHeight}px`,
      "--app-layout-header-height": `${headerHeight}px`,
      "--app-layout-navigation-display": navigationHeight === 0 ? "none" : "flex",
      "--app-layout-body-width": layoutWidth,
      "--app-layout-body-height": layoutHeight,
    };

    Object.entries(variables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    return () => {
      Object.entries(variables).forEach(([key]) => {
        document.documentElement.style.removeProperty(key);
      });
    };
  }, [routeRule, pathname, params, navigationWidthStorage]);

  useEffect(() => {
    const zIndexVariables = Object.entries(zIndexes).reduce(
      (acc, [key, value]) => {
        const indexKey = `--app-layout-z-index-${key.toLowerCase()}`;
        acc[indexKey] = value.toString();
        return acc;
      },
      {} as Record<string, string>,
    );

    const variables = {
      "--app-primary-color": color("primary"),
      "--app-divider-color": color({ light: "gray.2", dark: "dark.5" }),
      "--app-panel-background": color({ light: "white", dark: "dark.8" }),
      "--app-background-color": color({ light: "#f3f3f3", dark: "#242424" }),
      "--app-background-pattern-color": color({ light: "#bcbcbc", dark: "#3f3f3f" }),
      ...zIndexVariables,
    };

    Object.entries(variables).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    return () => {
      Object.entries(variables).forEach(([key]) => {
        document.documentElement.style.removeProperty(key);
      });
    };
  }, [color]);

  useEffect(() => {
    const backgroundColor = `var(--app-background-color)`;
    const patternColor = `var(--app-background-pattern-color)`;

    document.body.style.setProperty("background-color", backgroundColor);
    document.body.style.setProperty(
      "background-image",
      `radial-gradient(${patternColor} 0.6px, ${backgroundColor} 0.6px)`,
    );
    document.body.style.setProperty("background-size", "12px 12px");

    return () => {
      document.body.style.removeProperty("background-color");
      document.body.style.removeProperty("background-image");
      document.body.style.removeProperty("background-size");
    };
  }, []);

  return null;
};
