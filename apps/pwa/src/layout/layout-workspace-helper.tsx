"use client";

import { useHeadroom } from "@mantine/hooks";
import { useLayout } from "./layout-context";

export const LayoutWorkspaceHeadroom = () => {
  const layout = useLayout();

  const getElements = () => {
    return {
      navigation: document.getElementById("workspace-navigation") as HTMLDivElement | null,
      header: document.getElementById("workspace-header") as HTMLDivElement | null,
    };
  };

  useHeadroom({
    onPin: () => {
      const { navigation, header } = getElements();
      header?.style.removeProperty("transform");
      navigation?.style.removeProperty("transform");
    },
    onFix: () => {
      const { navigation, header } = getElements();
      header?.style.removeProperty("transform");
      navigation?.style.removeProperty("transform");
    },
    onRelease: () => {
      const { navigation, header } = getElements();

      if (layout.view === "mobile") {
        header?.style.setProperty("transform", `translate3d(0, -110px, 0)`);
        navigation?.style.setProperty("transform", `translate3d(0, 110px, 0)`);
      } else {
        header?.style.setProperty("transform", `translate3d(0, -110px, 0)`);
      }
    },
  });

  return null;
};
