"use client";

import { useColor } from "@/modules/theme/use-color";
import { onError } from "@/utils/exceptions.utils";
import { classNames } from "@/utils/ui.utils";
import { alpha, Button as ButtonMantine, ButtonProps as ButtonPropsMantine } from "@mantine/core";
import { Icon } from "@tabler/icons-react";
import { FC, MouseEvent, ReactNode, useMemo, useState } from "react";

import styles from "./button.module.css";

type ButtonSize = NonNullable<ButtonPropsMantine["size"]>;

export interface ButtonProps extends Omit<ButtonPropsMantine, "fz"> {
  id?: string;
  children?: ReactNode;
  component?: any;
  href?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => unknown;
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
      fontWeight?: number | string;
    }
  >
> = {
  "compact-xs": {
    iconSize: 12,
    iconSpacing: -7,
    iconStrokeWidth: 2.2,
    fontSize: 11,
  },
  xs: {
    iconSize: 14,
    iconSpacing: -6,
    iconStrokeWidth: 2.2,
    fontSize: 11,
    fontWeight: "600",
  },
  "compact-sm": {
    iconSize: 16,
    iconSpacing: -6,
    iconStrokeWidth: 2.2,
    fontSize: 12,
  },
  sm: {
    iconSize: 16,
    iconSpacing: -4,
    iconStrokeWidth: 1.8,
    fontSize: 12,
  },
  md: {
    iconSize: 18,
    iconSpacing: -6,
    iconStrokeWidth: 1.8,
    fontSize: 14,
  },
  "compact-md": {
    iconSize: 18,
    iconSpacing: -6,
    iconStrokeWidth: 1.8,
    fontSize: 14,
  },
  lg: {
    iconSize: 20,
    iconSpacing: -6,
    iconStrokeWidth: 1.8,
    fontSize: 16,
  },
  "compact-lg": {
    iconSize: 20,
    iconSpacing: -6,
    iconStrokeWidth: 1.8,
    fontSize: 16,
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

  const buttonColor = useMemo(() => {
    if (rest.variant === "light" && rest.color && rest.color.startsWith("#")) {
      return alpha(color(rest.color), 0.15);
    }

    if (rest.variant === "subtle" && !rest.color) {
      return "primary.5";
    }

    return rest.color;
  }, [rest.color, rest.variant]);

  const contentColor = useMemo(() => {
    if (rest.color) {
      if (rest.variant === "light") {
        return color(rest.color);
      }

      return rest.c;
    }

    if (rest.variant === "light") {
      return color("primary.6");
    }

    return rest.c;
  }, [rest.color, rest.variant]);

  if (visible === false) return null;

  return (
    <ButtonMantine
      {...rest}
      component={component}
      className={classNames(styles.Button, rest.className, {
        [styles.isLink]: "href" in rest && !!rest.href,
      })}
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
          fontWeight: buttonStyle?.fontWeight,
          ...(rest.styles && "label" in rest.styles ? rest.styles.label : {}),
        },
        root: {
          ...overrideStyle,
          ...(rest.styles && "root" in rest.styles ? rest.styles.root : {}),
        },
        ...rest.styles,
      }}
      color={buttonColor}
      c={contentColor}
    >
      {label ?? children}
    </ButtonMantine>
  );
};
