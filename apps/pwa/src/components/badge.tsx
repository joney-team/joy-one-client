"use client";

import { Badge as MantineBadge } from "@mantine/core";
import { FC, Ref } from "react";

export const Badge: FC<
  MantineBadge.Props & {
    onClick?: () => void;
    ref?: Ref<HTMLDivElement> | undefined;
  }
> = ({ children, onClick, ...rest }) => {
  return (
    <MantineBadge {...rest} onClick={onClick}>
      {children}
    </MantineBadge>
  );
};
