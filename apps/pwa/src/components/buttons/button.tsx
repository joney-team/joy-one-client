"use client";

import { useColor } from "@/modules/theme/use-color";
import { onError } from "@/utils/exceptions.utils";
import { alpha, Button as ButtonMantine, ButtonProps as ButtonPropsMantine } from "@mantine/core";
import { Icon } from "@tabler/icons-react";
import { FC, MouseEvent, ReactNode, useMemo, useState } from "react";

type ButtonSize = NonNullable<ButtonPropsMantine["size"]>;

export interface ButtonProps extends Omit<ButtonPropsMantine, "fz"> {
  id?: string;
  children?: ReactNode;
  component?: any;
  href?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => unknown;
  weight?: string | number;
  type?: "button" | "submit" | "reset";
  leftIcon?: Icon;
  rightIcon?: Icon;
  visible?: boolean;
  label?: ReactNode;
  fz?: number;
}

const defaultStyle: Partial<
  Record<
    ButtonSize,
    {
      iconSize?: number;
      iconSpacing?: number;
      iconStrokeWidth?: number;
      fontSize?: number;
    }
  >
> = {
  "compact-xs": {
    iconSize: 12,
    iconSpacing: -8,
    iconStrokeWidth: 2.2,
    fontSize: 11,
  },
  xs: {
    iconSize: 14,
    iconSpacing: -6,
    iconStrokeWidth: 2.2,
    fontSize: 11,
  },
  "compact-sm": {
    iconSize: 16,
    iconSpacing: -6,
    iconStrokeWidth: 2.2,
    fontSize: 12,
  },
  sm: {
    iconSize: 16,
    iconSpacing: -5,
    iconStrokeWidth: 1.8,
    fontSize: 12,
  },
  md: {
    iconSize: 18,
    iconSpacing: -6,
    iconStrokeWidth: 1.8,
    fontSize: 14,
  },
};

export const Button: FC<ButtonProps> = ({
  id,
  children,
  component,
  href,
  onClick: propsOnClick,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  visible,
  label,
  ...rest
}) => {
  const [funcLoading, setFuncLoading] = useState(false);
  const color = useColor();

  const onClick = async (e: MouseEvent<HTMLButtonElement>) => {
    if (!propsOnClick || isLoading || rest.disabled) return;

    try {
      setFuncLoading(true);
      await propsOnClick(e);
    } catch (error) {
      onError(error);
    } finally {
      setFuncLoading(false);
    }
  };

  const isLoading = rest.loading || funcLoading;

  const buttonStyle = useMemo(() => {
    if (!rest.size) return defaultStyle["sm"];
    return defaultStyle[rest.size];
  }, [rest.size]);

  const overrideStyle = useMemo(() => {
    if (rest.color === "gray" && rest.variant === "outline") {
      return {
        borderColor: alpha(color("gray"), 0.3),
      };
    }
    return {};
  }, [rest.color]);

  if (visible === false) return null;

  return (
    <ButtonMantine
      {...rest}
      component={component}
      href={href}
      leftSection={
        LeftIcon ? (
          <LeftIcon
            size={buttonStyle?.iconSize}
            strokeWidth={buttonStyle?.iconStrokeWidth}
            style={{ marginRight: buttonStyle?.iconSpacing }}
          />
        ) : (
          rest.leftSection
        )
      }
      rightSection={
        RightIcon ? (
          <RightIcon
            size={buttonStyle?.iconSize}
            strokeWidth={buttonStyle?.iconStrokeWidth}
            style={{ marginLeft: buttonStyle?.iconSpacing }}
          />
        ) : (
          rest.rightSection
        )
      }
      loading={isLoading}
      disabled={isLoading || rest.disabled}
      onClick={onClick}
      styles={{
        label: {
          fontSize: rest.fz || buttonStyle?.fontSize,
          ...(rest.styles && "label" in rest.styles ? rest.styles.label : {}),
        },
        root: {
          ...overrideStyle,
          ...(rest.styles && "root" in rest.styles ? rest.styles.root : {}),
        },
        ...rest.styles,
      }}
      color={color(rest.color ?? "primary")}
    >
      {label ?? children}
    </ButtonMantine>
  );
};
