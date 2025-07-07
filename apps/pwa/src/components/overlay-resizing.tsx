"use client";

import { useColor } from "@/modules/theme/use-color";
import { useLayout } from "@/layout/layout-context";
import { t } from "@/modules/lang/lang-service";
import { Stack, Text, ThemeIcon } from "@mantine/core";
import { IconResize } from "@tabler/icons-react";
import { FC } from "react";
import { zIndexes } from "@joy-one-client/config/layout";

const OverlayResizing: FC = () => {
  const layout = useLayout();
  const color = useColor();

  if (!layout.isResizing || layout.view !== "desktop") return null;

  return (
    <Stack
      justify="center"
      align="center"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100dvw",
        height: "100dvh",
        zIndex: zIndexes.screenOverlay,
        background: "var(--mantine-color-body)",
      }}
    >
      <ThemeIcon
        size="xl"
        variant="light"
        color={color("primary")}
        className="animPulse"
        radius={100}
      >
        <IconResize />
      </ThemeIcon>

      <Stack gap={0}>
        <Text ta="center" c={color("primary")}>
          {t("resizing")}
        </Text>

        <Text ta="center" fz={12} c="gray">
          {t("resizing_msg")}
        </Text>
      </Stack>
    </Stack>
  );
};

export default OverlayResizing;
