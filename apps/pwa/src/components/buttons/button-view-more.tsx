"use client";

import { Trans } from "@lingui/react/macro";
import { Center } from "@mantine/core";
import { IconArrowDown } from "@tabler/icons-react";
import { FC } from "react";
import { Button, ButtonProps } from "./button";

export interface ButtonViewMoreProps extends ButtonProps {
  visible?: boolean;
}

export const ButtonViewMore: FC<ButtonViewMoreProps> = ({ visible, ...props }) => {
  if (typeof visible === "boolean" && !visible) return null;

  return (
    <Center mt={props.mt ?? 10}>
      <Button
        size={props.size ?? "compact-xs"}
        variant="outline"
        rightIcon={IconArrowDown}
        {...props}
      >
        <Trans>View more</Trans>
      </Button>
    </Center>
  );
};
