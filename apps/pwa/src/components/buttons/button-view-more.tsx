import { Trans } from "@lingui/react/macro";
import { Center, em, MantineSize } from "@mantine/core";
import { IconArrowDown } from "@tabler/icons-react";
import { FC } from "react";
import { Button, ButtonProps } from "./button";

export interface ButtonViewMoreProps extends ButtonProps {
  mt?: number;
  mb?: number;
  size?:
    | MantineSize
    | "compact-xs"
    | "compact-sm"
    | "compact-md"
    | "compact-lg"
    | "compact-xl"
    | undefined;
  visible?: boolean;
}

export const ButtonViewMore: FC<ButtonViewMoreProps> = (props) => {
  if (typeof props.visible === "boolean" && !props.visible) return null;

  let _props = { ...props };
  delete _props.visible;

  return (
    <Center mt={props.mt || 10} mb={props.mb || 0}>
      <Button
        size={props.size || "compact-xs"}
        fz={props.fz || em(13)}
        variant="outline"
        rightIcon={IconArrowDown}
        {..._props}
      >
        <Trans>View more</Trans>
      </Button>
    </Center>
  );
};
