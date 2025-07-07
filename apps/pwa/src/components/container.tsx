"use client";

import {
  Container as MantineContainer,
  ContainerProps as MantineContainerProps,
  Stack,
} from "@mantine/core";
import { FC } from "react";

export interface ContainerProps extends MantineContainerProps {}

export const Container: FC<ContainerProps> = (props) => {
  return (
    <MantineContainer w="100%" {...{ ...props, children: undefined }}>
      <Stack>{props.children}</Stack>
    </MantineContainer>
  );
};
