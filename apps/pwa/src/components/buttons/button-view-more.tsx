import { FC } from "react";
import { ButtonProps, Button } from "./button";
import { IconArrowDown } from "@tabler/icons-react";
import { Center, em, MantineSize } from "@mantine/core";
import { tl } from "@/modules/lang/lang-service";

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
        {tl("view_more")}
      </Button>
    </Center>
  );
};
