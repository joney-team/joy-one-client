"use client";

import { useHover } from "@mantine/hooks";
import { FC, ReactNode, RefCallback } from "react";

export interface HoveredProps {
  children: (props: { hovered: boolean; ref: RefCallback<any> }) => ReactNode;
  disabled?: boolean;
}

export const Hovered: FC<HoveredProps> = (props) => {
  const { hovered, ref } = useHover();

  return props.children({
    hovered: !!props.disabled ? false : hovered,
    ref,
  });
};
