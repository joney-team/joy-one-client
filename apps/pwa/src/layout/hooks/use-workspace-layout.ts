"use client";

import { StorageKey } from "@/constants/storage-key";
import { useLocalStorage } from "@mantine/hooks";

export const workspaceLayoutConfig = {
  defaultNavigationExpandedWidth: 200,
  mobileNavigationHeight: 55,
  standaloneNavigationHeight: 75,
  headerHeight: 48,
  minNavigationWidth: 62,
  maxNavigationWidth: 400,
};

export const useNavigationWidth = () => {
  const [navigationWidthStorage, setNavigationWidth] = useLocalStorage({
    key: StorageKey.LAYOUT_NAVIGATION_WIDTH,
    defaultValue: workspaceLayoutConfig.defaultNavigationExpandedWidth,
  });

  const navigationWidth = +navigationWidthStorage;

  return {
    navigationWidth,
    setNavigationWidth: (value: number) => {
      const clampedValue = Math.max(
        workspaceLayoutConfig.minNavigationWidth,
        Math.min(workspaceLayoutConfig.maxNavigationWidth, value),
      );
      setNavigationWidth(clampedValue);
    },
    isNavbarCollapsed: navigationWidth <= workspaceLayoutConfig.minNavigationWidth * 1.5,
  };
};
