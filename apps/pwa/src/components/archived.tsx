"use client";

import { useColor } from "@/modules/theme/use-color";
import { Trans } from "@lingui/react/macro";
import { alpha, Group, Text, ThemeIcon } from "@mantine/core";
import { Icon, IconBackground } from "@tabler/icons-react";
import { FC, ReactNode } from "react";

export interface ArchivedProps {
  entity: ReactNode;
  icon?: Icon;
  enabled?: any;
}

export const Archived: FC<ArchivedProps> = (props) => {
  const color = useColor();

  const Icon = props.icon || IconBackground;
  const _color = color("red.5");

  if (props.enabled === false) return null;

  return (
    <Group
      justify="center"
      align="center"
      gap={0}
      p={16}
      style={{
        borderRadius: 8,
        border: `1px dashed ${alpha(_color || "", 0.5)}`,
      }}
    >
      <ThemeIcon variant="transparent" color={_color}>
        <Icon strokeWidth={1.1} size={18} />
      </ThemeIcon>

      <Text fz="xs" c={_color}>
        <Trans>Archived {props.entity}</Trans>
      </Text>
    </Group>
  );
};
