import { Stack } from "@mantine/core";
import { type FC, type PropsWithChildren } from "react";

export const Fullscreen: FC<PropsWithChildren> = (props) => {
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
      style={{ zIndex: 500, overflowY: "scroll", overflowX: "hidden" }}
    >
      {props.children}
    </Stack>
  );
};
