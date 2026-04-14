"use client";

import { Badge as MantineBadge } from "@mantine/core";
import { FC, Ref } from "react";

export const Badge: FC<
  Omit<MantineBadge.Props, "color"> & {
    onClick?: () => void;
    ref?: Ref<HTMLDivElement> | undefined;
    color?: string | null;
  }
> = ({ children, onClick, ...rest }) => {
  return (
    <MantineBadge {...rest} color={rest.color || undefined} onClick={onClick}>
      {children}
    </MantineBadge>
  );
};
