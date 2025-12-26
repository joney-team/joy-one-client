"use client";

import {
  Container as MantineContainer,
  ContainerProps as MantineContainerProps,
  Stack,
} from "@mantine/core";
import { FC } from "react";

export interface ContainerProps extends MantineContainerProps {}

export const Container: FC<ContainerProps> = ({ children, ...rest }) => {
  return (
    <MantineContainer w="100%" {...rest}>
      <Stack w="100%">{children}</Stack>
    </MantineContainer>
  );
};
