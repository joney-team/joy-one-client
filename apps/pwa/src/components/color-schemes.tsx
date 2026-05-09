"use client";

import { useColor } from "@/modules/theme/use-color";
import { zIndexes } from "@joy-one/config/layout";
import { Trans } from "@lingui/react/macro";
import { ActionIcon, Menu, useMantineColorScheme } from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { IconBrightnessAutoFilled, IconMoon, IconSun } from "@tabler/icons-react";
import { FC } from "react";

export const ColorSchemes: FC = () => {
  const { setColorScheme, clearColorScheme, colorScheme } = useMantineColorScheme();
  const actualColorScheme = useColorScheme();
  const color = useColor();

  return (
    <Menu zIndex={zIndexes.requireAuth + 1}>
      <Menu.Target>
        <ActionIcon
          size={30}
          c="var(--mantine-color-text)"
          variant="subtle"
          aria-label="Toggle color scheme"
        >
          {actualColorScheme === "light" && <IconSun size={20} />}
          {actualColorScheme === "dark" && <IconMoon size={20} />}
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          c={colorScheme === "light" ? color("primary") : undefined}
          leftSection={<IconSun size={18} />}
          onClick={() => setColorScheme("light")}
        >
          <Trans>Light mode</Trans>
        </Menu.Item>

        <Menu.Item
          c={colorScheme === "dark" ? color("primary") : undefined}
          leftSection={<IconMoon size={18} />}
          onClick={() => setColorScheme("dark")}
        >
          <Trans>Dark mode</Trans>
        </Menu.Item>

        <Menu.Item
          c={colorScheme === "auto" ? color("primary") : undefined}
          leftSection={<IconBrightnessAutoFilled size={18} />}
          onClick={() => clearColorScheme()}
        >
          <Trans>Auto</Trans>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
