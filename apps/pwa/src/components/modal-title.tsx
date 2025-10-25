"use client";

import { useColor } from "@/modules/theme/use-color";
import { tl } from "@/modules/lang/lang-service";
import { Group, Text, ThemeIcon } from "@mantine/core";
import { Icon } from "@tabler/icons-react";
import { FC } from "react";

interface Props {
  icon?: Icon;
  title: string;
  px?: number;
  color?: any;
  rightSection?: React.ReactNode;
}

export const ModalTitle: FC<Props> = (props) => {
  const color = useColor();

  return (
    <Group px={props.px} gap={8} style={{ width: "100%" }} flex={1}>
      <ThemeIcon color={color(props.color || "primary")} radius={100}>
        {props.icon && <props.icon stroke={1.8} size={18} />}
      </ThemeIcon>

      <Text fw="700" fz={16} c={color(props.color || "primary")}>
        {tl(props.title)}
      </Text>

      {props.rightSection}
    </Group>
  );
};
