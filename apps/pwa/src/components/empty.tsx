"use client";

import { useColor } from "@/modules/theme/use-color";
import { Trans } from "@lingui/react/macro";
import { alpha, Stack, StackProps, Text } from "@mantine/core";
import { Icon } from "@tabler/icons-react";
import { FC, LegacyRef, ReactNode } from "react";
import { BoxIllustration } from "./illustrations/box";

export interface EmptyProps extends StackProps {
  message?: string | ReactNode;
  icon?: Icon;
  color?: string;
  visible?: boolean;
  ref?: LegacyRef<HTMLDivElement> | undefined;
  hideBorder?: boolean;
}

export const Empty: FC<EmptyProps> = (props) => {
  const { message, icon, color: colorProp, visible, ref, hideBorder, ...rest } = props;

  const color = useColor();

  const Icon = props.icon;
  const _color = color(colorProp || "gray.5");

  if (typeof props.visible === "boolean" && props.visible === false) return null;

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
      {Icon ? <Icon size={32} color={_color} strokeWidth={1.3} /> : <BoxIllustration height={32} />}

      <Text fz="xs" fw={300} c={_color}>
        {message ?? <Trans>No data</Trans>}
      </Text>

      {props.children}
    </Stack>
  );
};
