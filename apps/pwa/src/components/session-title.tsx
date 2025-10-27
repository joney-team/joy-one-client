"use client";

import { useColor } from "@/modules/theme/use-color";
import { Group, Text, ThemeIcon } from "@mantine/core";
import { Icon } from "@tabler/icons-react";
import { FC, PropsWithChildren } from "react";

export interface SessionTitleProps {
  id?: string;
  name: string;
  icon?: Icon;
  iconColor?: string;
  onViewAll?: () => void;
  mb?: number;
}

export const SectionTitle: FC<PropsWithChildren<SessionTitleProps>> = (props) => {
  const color = useColor();

  return (
    <Group id={props.id} wrap="nowrap" gap={16} mb={props.mb}>
      <Group gap={3} wrap="nowrap" ml={-3}>
        {!!props.icon && (
          <ThemeIcon
            variant="transparent"
            size="md"
            color={color(props.iconColor || "var(--mantine-color-text)")}
          >
            <props.icon strokeWidth={1.5} />
          </ThemeIcon>
        )}

        <Text fw={500}>{props.name}</Text>
      </Group>

      {props.children}
    </Group>
  );
};
