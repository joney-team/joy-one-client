"use client";

import { useColor } from "@/modules/theme/use-color";
import { Badge as MantineBadge, alpha } from "@mantine/core";
import { FC, Ref, useMemo } from "react";

export const Badge: FC<
  Omit<MantineBadge.Props, "color"> & {
    onClick?: () => void;
    color?: string | null;
    ref?: Ref<HTMLDivElement> | undefined;
  }
> = ({ children, onClick, ...rest }) => {
  const color = useColor();

  const badgeColor = useMemo(() => {
    if (rest.color && rest.variant === "light") {
      return alpha(color(rest.color), 0.1);
    }

    return rest.color || undefined;
  }, [rest.color, rest.variant]);

  const contentColor = useMemo(() => {
    if (rest.color && rest.variant === "light") {
      return color(rest.color);
    }
  }, [rest.color]);

  return (
    <MantineBadge {...rest} color={badgeColor} c={contentColor} onClick={onClick}>
      {children}
    </MantineBadge>
  );
};
