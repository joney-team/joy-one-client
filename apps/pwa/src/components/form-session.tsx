"use client";

import { t } from "@/modules/lang/lang-service";
import { Group, Stack, Text, ThemeIcon, Tooltip } from "@mantine/core";
import { Icon } from "@tabler/icons-react";
import type { FC, ReactNode } from "react";

export const FormSession: FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => {
  return (
    <Group align="start" w="100%">
      <Stack gap={3} w="30%">
        <Text fw={500} fz={14}>
          {t(title)}
        </Text>
        {description && (
          <Text fz={12} c="gray">
            {t(description)}
          </Text>
        )}
      </Stack>

      <Stack flex={1}>{children}</Stack>
    </Group>
  );
};

export const FormSessionIcon: FC<{
  icon: Icon;
  description?: string;
  children: ReactNode;
  visible?: boolean;
}> = ({ icon: Icon, description, children, visible = true }) => {
  if (!visible) return null;

  return (
    <Group align="start" w="100%">
      <Tooltip label={t(description ?? "")} disabled={!description}>
        <ThemeIcon variant="transparent" color="gray">
          <Icon strokeWidth={1.3} />
        </ThemeIcon>
      </Tooltip>

      <Stack flex={1}>{children}</Stack>
    </Group>
  );
};
