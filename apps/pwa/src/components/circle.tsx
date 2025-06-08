import { em, ThemeIcon, ThemeIconProps } from "@mantine/core";
import React, { FC } from "react";

interface CircleProps extends ThemeIconProps {
  label?: React.ReactNode;
  c?: any;
  disabled?: boolean;
}

export const Circle: FC<CircleProps> = (props) => {
  const size = props.size || 18;
  const color = props.color || "primary";

  if (props.disabled) return null;

  return (
    <ThemeIcon fz={em(10)} bg={color} radius={100} size={size} fw={700} c={props.c} {...props}>
      {props.label}
    </ThemeIcon>
  );
};
