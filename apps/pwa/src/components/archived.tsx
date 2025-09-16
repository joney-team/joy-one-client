"use client";

import { useLayout } from "@/layout/layout-context";
import { t } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { StringUtils } from "@/utils/string.utils";
import { alpha, Group, Text, ThemeIcon } from "@mantine/core";
import { Icon, IconBackground } from "@tabler/icons-react";
import { FC } from "react";

export interface ArchivedProps {
  entity: string;
  icon?: Icon;
  enabled?: any;
}

export const Archived: FC<ArchivedProps> = (props) => {
  const color = useColor();

  const Icon = props.icon || IconBackground;
  const _color = color("red.5");

  if (props.enabled === false) return null;

  const message = t(`archived_entity`, { entity: t(props.entity) });

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
        {StringUtils.capitalizeFirstLetter(message)}
      </Text>
    </Group>
  );
};
