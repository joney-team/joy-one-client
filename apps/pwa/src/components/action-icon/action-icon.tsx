import { onError } from "@/utils/exceptions.utils";
import {
  ActionIcon as ActionIconMantine,
  ActionIconProps as ActionIconPropsMantine,
} from "@mantine/core";
import { FC, MouseEvent, useState } from "react";

interface ActionIconProps extends Omit<ActionIconPropsMantine, "onClick"> {
  onClick?: (event: MouseEvent<HTMLElement>) => unknown;
}

export const ActionIcon: FC<ActionIconProps> = ({ onClick, ...rest }) => {
  const [isLoading, setIsLoading] = useState(false);
  const loading = rest.loading ?? isLoading;

  const handleOnClick = async (event: MouseEvent<HTMLElement>) => {
    try {
      if (!onClick || loading) return;
      setIsLoading(true);
      await onClick(event);
    } catch (error) {
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return <ActionIconMantine {...rest} onClick={handleOnClick} loading={loading} />;
};
