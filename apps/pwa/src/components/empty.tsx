"use client";

import { tl } from "@/modules/lang/lang-service";
import { useColor } from "@/modules/theme/use-color";
import { String } from "@/utils/string.utils";
import { t } from "@lingui/core/macro";
import { alpha, Stack, StackProps, Text } from "@mantine/core";
import { Icon } from "@tabler/icons-react";
import { FC, LegacyRef } from "react";
import { BoxIllustration } from "./illustrations/box";

export interface EmptyProps extends StackProps {
  message?: string;
  entity?: string;
  icon?: Icon;
  color?: string;
  visible?: boolean;
  ref?: LegacyRef<HTMLDivElement> | undefined;
  hideBorder?: boolean;
}

export const Empty: FC<EmptyProps> = (props) => {
  const {
    message: messageProp,
    entity,
    icon,
    color: colorProp,
    visible,
    ref,
    hideBorder,
    ...rest
  } = props;

  const color = useColor();

  const Icon = props.icon;
  const _color = color(colorProp || "gray.5");

  if (typeof props.visible === "boolean" && !!!props.visible) return null;

  const message = messageProp
    ? tl(messageProp)
    : entity
    ? tl(`empty_entity`, { entity: tl(entity) })
    : t`No data`;

  return (
    <Stack
      ref={props.ref}
      justify="center"
      align="center"
      gap={5}
      p={20}
      style={{
        borderRadius: 8,
        border: hideBorder ? "none" : `1px dashed ${alpha(_color, 0.5)}`,
      }}
      {...rest}
    >
      {Icon ? <Icon width={50} color={_color} /> : <BoxIllustration width={45} />}

      <Text fz="xs" fw={300} c={_color}>
        {String.capitalizeFirstLetter(message)}
      </Text>

      {props.children}
    </Stack>
  );
};
