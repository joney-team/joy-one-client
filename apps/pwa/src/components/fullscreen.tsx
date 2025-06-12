import { Stack } from "@mantine/core";
import { type FC, type PropsWithChildren } from "react";

interface FullscreenProps extends PropsWithChildren {
  zIndex?: number;
}

export const Fullscreen: FC<FullscreenProps> = (props) => {
  return (
    <Stack
      bg="var(--mantine-color-body)"
      h="100dvh"
      w="100dvw"
      pos="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      style={{
        zIndex: typeof props.zIndex === "number" ? props.zIndex : 10,
        overflowY: "scroll",
        overflowX: "hidden",
      }}
    >
      {props.children}
    </Stack>
  );
};
