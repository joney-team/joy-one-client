"use client";

import { Text, TextProps } from "@mantine/core";
import { FC, PropsWithChildren, useRef } from "react";

interface TextEllipsisProps extends TextProps {}

export const TextEllipsis: FC<PropsWithChildren<TextEllipsisProps>> = (props) => {
  const ref = useRef<HTMLParagraphElement>(null);

  return (
    <Text ref={ref} truncate="end">
      {props.children}
    </Text>
  );
};
