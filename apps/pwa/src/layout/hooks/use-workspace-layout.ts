import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { StorageKey } from "@/types";
import { useLocalStorage } from "@mantine/hooks";
import { useMemo } from "react";
import { useLayout } from "../layout-context";
import { useColor } from "@/modules/theme/use-color";

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
  pannelZIndex: number;
  transition: (property?: string) => string;
}

export const defaultWorkspaceLayoutConfig = {
  defaultNavigationExpandedWidth: 200,
  defaultNavigationCollapsedWidth: 60,
};

export const useWorkspaceLayout = (): WorkspaceLayoutState => {
  const layout = useLayout();
  const color = useColor();
  const colorScheme = useColorScheme();
  const [navigationWidthStorage, setNavigationWidthStorage] = useLocalStorage({ key: StorageKey.LAYOUT_NAVIGATION_WIDTH });

  const state = useMemo(() => {
    const navigationWidth = navigationWidthStorage
      ? +navigationWidthStorage
      : defaultWorkspaceLayoutConfig.defaultNavigationExpandedWidth;

    const headerHeight = layout.isBrowerCollapsed ? 0 : 48;

    return {
      navigationWidth,
      navigationHeight: layout.view === "mobile" ? headerHeight : layout.height,
      headerHeight,
      headerWidth: layout.width - navigationWidth,
      isNavbarCollapsed: navigationWidth <= defaultWorkspaceLayoutConfig.defaultNavigationCollapsedWidth * 2,
      bodyWidth: layout.width - navigationWidth,
      bodyHeight: layout.height - headerHeight,
    };
  }, [layout.width, layout.height, layout.isBrowerCollapsed, colorScheme, navigationWidthStorage]);

  return {
    ...state,
    setNavigationWidth: (width: number) => setNavigationWidthStorage(width.toString()),
    dividerColor: color({ light: "gray.2", dark: "dark.5" }),
    pannelBackground: color({ light: "white", dark: "dark.8" }),
    pannelZIndex: 100,
    transition: (property) => `${property || "all"} 0.2s ease-out`,
  };
};
