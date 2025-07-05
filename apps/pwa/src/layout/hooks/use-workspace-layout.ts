import { useColorScheme } from "@/modules/theme/use-color-scheme";
import { StorageKey } from "@/types";
import { useLocalStorage } from "@mantine/hooks";
import { useMemo } from "react";
import { useLayout } from "../layout-context";
import { useColor } from "@/modules/theme/use-color";
import { useParams } from "next/navigation";

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
  defaultNavigationCollapsedWidth: 60,
  mobileNavigationHeight: 55,
  standaloneNavigationHeight: 75,
};

export const useWorkspaceLayout = (): WorkspaceLayoutState => {
  const params = useParams();
  const layout = useLayout();
  const color = useColor();
  const colorScheme = useColorScheme();
  const [navigationWidthStorage, setNavigationWidthStorage] = useLocalStorage({ key: StorageKey.LAYOUT_NAVIGATION_WIDTH });

  const isDetailPage = Object.keys(params).length > 0;

  const state = useMemo(() => {
    const headerHeight = layout.view === "mobile" ? 48 : 48;

    const navigationWidth = navigationWidthStorage
      ? +navigationWidthStorage
      : workspaceLayoutConfig.defaultNavigationExpandedWidth;

    const navigationHeight = layout.isStandalone
      ? workspaceLayoutConfig.standaloneNavigationHeight
      : layout.view === "mobile"
        ? isDetailPage ? 0 : workspaceLayoutConfig.mobileNavigationHeight
        : layout.height;

    return {
      navigationWidth,
      navigationHeight,
      headerHeight,
      headerWidth: layout.width - navigationWidth,
      isNavbarCollapsed: navigationWidth <= workspaceLayoutConfig.defaultNavigationCollapsedWidth * 2,
      bodyWidth: layout.width - navigationWidth,
      bodyHeight: layout.height - headerHeight,
    };
  }, [layout.width, layout.height, layout.isBrowerCollapsed, colorScheme, navigationWidthStorage, isDetailPage]);

  return {
    ...state,
    setNavigationWidth: (width: number) => setNavigationWidthStorage(width.toString()),
    dividerColor: color({ light: "gray.2", dark: "dark.5" }),
    pannelBackground: color({ light: "white", dark: "dark.8" }),
    transition: (property) => `${property || "all"} 0.2s ease-out`,
  };
};
