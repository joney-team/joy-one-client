"use client";

import { useColor } from "@/modules/theme/use-color";
import { Group, Text, ThemeIcon } from "@mantine/core";
import { Icon } from "@tabler/icons-react";
import { FC, ReactNode, useMemo } from "react";

interface Props {
  icon?: Icon;
  name: ReactNode;
  px?: number;
  color?: any;
  rightSection?: React.ReactNode;
}

export const ModalHead: FC<Props> = (props) => {
  const color = useColor();

  const modalColor = useMemo(() => {
    return color(props.color ?? "primary");
  }, [props.color, color]);

  return (
    <Group px={props.px} gap={8} style={{ width: "100%" }} flex={1}>
      <ThemeIcon color={modalColor} radius={8}>
        {props.icon && <props.icon stroke={1.8} size={18} />}
      </ThemeIcon>

      <Text fw="700" fz={16} c={modalColor}>
        {props.name}
      </Text>

      {props.rightSection}
    </Group>
  );
};
