"use client";

import { Tooltip, TooltipProps } from "@mantine/core";
import { Icon, IconProps } from "@tabler/icons-react";
import { FC, PropsWithChildren } from "react";

interface TooltipIconProps extends IconProps {
  icon: Icon;
  label: string;
  tooltip?: TooltipProps;
  disabled?: boolean;
}

export const TooltipIcon: FC<PropsWithChildren<TooltipIconProps>> = (props) => {
  if (props.disabled) return null;
  return (
    <Tooltip label={props.label} {...props.tooltip}>
      <props.icon size={18} {...props} />
    </Tooltip>
  );
};
