"use client";

import { Stack } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import type { FC, Ref } from "react";

interface FlexSizeProps {
  debug?: boolean;
  id?: string;
  className?: string;
  children: (size: { width: number; height: number; ref: Ref<HTMLDivElement> }) => React.ReactNode;
}

export const FlexSizeLegacy: FC<FlexSizeProps> = (props) => {
  const rootSize = useElementSize();
  const { debug, children, ...rest } = props;

  return (
    <Stack
      ref={rootSize.ref}
      flex={1}
      gap={0}
      align="center"
      justify="center"
      className="AppFlexSize"
      pos="relative"
      {...rest}
    >
      <Stack
        align="center"
        justify="center"
        gap={0}
        style={{
          height: rootSize.height,
          maxHeight: rootSize.height,
          width: "100%",
          overflow: "visible",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
        }}
      >
        <Stack
          pos="relative"
          top={0}
          left={0}
          right={0}
          style={{
            width: "100%",
            height: rootSize.height,
            maxHeight: rootSize.height,
          }}
        >
          {rootSize.width || rootSize.height > 0 ? children(rootSize) : null}
        </Stack>
      </Stack>
    </Stack>
  );
};
