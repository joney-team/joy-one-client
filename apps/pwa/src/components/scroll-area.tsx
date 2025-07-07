"use client";

import {
  ScrollArea as MantineScrollArea,
  ScrollAreaProps as MantineScrollAreaProps,
  Stack,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { FC, useRef } from "react";

export interface ScrollAreaProps extends MantineScrollAreaProps {
  reachBottom?: {
    offset?: number;
    onReach?: () => void;
  };
}

export const ScrollArea: FC<ScrollAreaProps> = (props) => {
  const { reachBottom, ...rest } = props;
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const onScroll = useDebouncedCallback((pos: { x: number; y: number }) => {
    if (!viewportRef.current || !contentRef.current) return;

    const viewportHeight = viewportRef.current.clientHeight;
    const contentHeight = contentRef.current.scrollHeight;

    if (reachBottom) {
      const isReachBottom =
        Math.ceil(pos.y + viewportHeight) + (reachBottom.offset ?? 0) >= contentHeight;
      if (isReachBottom) reachBottom.onReach?.();
    }
  }, 300);

  return (
    <MantineScrollArea
      {...rest}
      viewportRef={viewportRef}
      onScrollPositionChange={(pos) => {
        props.onScrollPositionChange?.(pos);
        onScroll(pos);
      }}
    >
      <Stack gap={0} ref={contentRef}>
        {props.children}
      </Stack>
    </MantineScrollArea>
  );
};
