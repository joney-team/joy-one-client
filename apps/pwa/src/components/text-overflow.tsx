"use client";

import { Group, Text, TextProps } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { FC, PropsWithChildren } from "react";

export const TextOverflow: FC<PropsWithChildren<TextProps>> = (props) => {
  const size = useElementSize();

  return (
    <Group ref={size.ref} flex={1} align="center">
      <Text truncate="end" {...props} maw={size.width} />
    </Group>
  );
};
