import { Tooltip, TooltipProps } from "@mantine/core";
import { FC } from "react";

export const AutoTooltip: FC<TooltipProps> = (props) => {
  return <Tooltip label={props.label}>{props.children}</Tooltip>;
};
