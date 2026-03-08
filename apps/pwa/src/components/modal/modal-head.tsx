"use client";

import { useColor } from "@/modules/theme/use-color";
import { Group, Text, ThemeIcon } from "@mantine/core";
import { Icon, IconX } from "@tabler/icons-react";
import { FC, ReactNode, useMemo } from "react";
import { ActionIcon } from "../action-icon/action-icon";

interface Props {
  icon?: Icon;
  name: ReactNode;
  px?: number;
  color?: any;
  onClose?: () => void;
  rightSection?: React.ReactNode;
}

export const ModalHead: FC<Props> = (props) => {
  const color = useColor();

  const modalColor = useMemo(() => {
    return color(props.color ?? "primary");
  }, [props.color, color]);

  return (
    <Group px={props.px} gap={8} w="100%" flex={1}>
      <Group gap="xs" flex={1}>
        <ThemeIcon color={modalColor} radius="md">
          {props.icon && <props.icon stroke={1.8} size={18} />}
        </ThemeIcon>

        <Text fw="700" fz={16} c={modalColor} style={{ flex: 1 }}>
          {props.name}
        </Text>
      </Group>

      {props.rightSection}

      {props.onClose && (
        <ActionIcon
          variant="subtle"
          color="gray"
          onClick={props.onClose}
          style={{ alignSelf: "end" }}
          className="removeOutline"
          component="div"
        >
          <IconX size={18} />
        </ActionIcon>
      )}
    </Group>
  );
};
