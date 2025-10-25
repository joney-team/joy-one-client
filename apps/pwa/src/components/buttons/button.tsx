"use client";

import { useColor } from "@/modules/theme/use-color";
import { onError } from "@/utils/exceptions.utils";
import {
  Button as ButtonMantine,
  ButtonProps as ButtonPropsMantine,
  MantineSize,
} from "@mantine/core";
import { Icon } from "@tabler/icons-react";
import React, { FC, useMemo, useState } from "react";

type ButtonSize = MantineSize | `compact-${MantineSize}` | (string & {});

export interface ButtonProps extends Omit<ButtonPropsMantine, "isGradient"> {
  id?: string;
  children?: React.ReactNode;
  component?: any;
  href?: string;
  onClick?: (e: any) => any;
  weight?: string | number;
  type?: "button" | "submit" | "reset";
  isGradient?: boolean;
  leftIcon?: Icon;
  rightIcon?: Icon;
  iconSize?: number;
  iconSpacing?: number;
  iconStrokeWidth?: number;
  action?: boolean;
  visible?: boolean;
  label?: string;
}

const defaultIconSizes: Partial<Record<ButtonSize, number>> = {
  xs: 16,
  "compact-xs": 16,
  sm: 18,
  "compact-sm": 18,
  default: 20,
};

const defaultIconSpacings: Partial<Record<ButtonSize, number>> = {
  xs: -3,
  "compact-xs": -8,
  sm: -5,
  "compact-sm": -5,
  default: -3,
};

const defaultFontSizes: Partial<Record<ButtonSize, number>> = {
  xs: 13,
  "compact-xs": 12,
  sm: 13,
  "compact-sm": 13,
  default: 14,
};

const defaultSconStrokeWidth: Partial<Record<ButtonSize, number>> = {
  xs: 1.8,
  default: 1.6,
};

export const Button: FC<ButtonProps> = (props) => {
  const {
    id,
    children,
    component,
    href,
    onClick: propsOnClick,
    weight,
    isGradient,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    iconSize: propsIconSize,
    iconSpacing: propsIconSpacing,
    iconStrokeWidth: propsIconStrokeWidth,
    action,
    visible,
    label,
    ...rest
  } = props;

  const [funcLoading, setFuncLoading] = useState(false);
  const color = useColor();

  const onClick = async (e: any) => {
    if (!propsOnClick) return;
    setFuncLoading(true);

    try {
      await propsOnClick(e);
    } catch (error) {
      onError(error);
    }

    setFuncLoading(false);
  };

  const isLoading = props.loading || funcLoading;

  if (visible === false) return null;

  const h = props.h;
  const miw = props.miw || (action || props.type === "submit" ? 180 : props.miw);
  const radius = props.radius;

  const iconSpacing = useMemo(() => {
    if (typeof propsIconSpacing === "number") return propsIconSpacing;
    return defaultIconSpacings[props.size || "default"];
  }, [propsIconSpacing, props.size]);

  const iconSize = useMemo(() => {
    if (typeof props.iconSize === "number") return props.iconSize;
    return defaultIconSizes[props.size || "default"];
  }, [props.iconSize, props.size]);

  const fontSize = useMemo(() => {
    if (typeof props.fz !== "undefined") return props.fz;
    return defaultFontSizes[props.size || "default"];
  }, [props.fz, props.size]);

  const iconStrokeWidth = useMemo(() => {
    if (typeof propsIconStrokeWidth === "number") return propsIconStrokeWidth;
    return defaultSconStrokeWidth[props.size || "default"];
  }, [propsIconStrokeWidth, props.size]);

  const getColor = (c?: string) => {
    if (c === "joyone") return "primary";
    return color(c || "primary");
  };

  return (
    <ButtonMantine
      {...rest}
      component={component}
      href={href}
      leftSection={
        LeftIcon ? (
          <LeftIcon
            size={iconSize}
            strokeWidth={iconStrokeWidth}
            style={{ marginRight: iconSpacing }}
          />
        ) : (
          props.leftSection
        )
      }
      rightSection={
        RightIcon ? (
          <RightIcon
            size={iconSize}
            strokeWidth={iconStrokeWidth}
            style={{ marginLeft: iconSpacing }}
          />
        ) : (
          props.rightSection
        )
      }
      h={h}
      miw={miw}
      radius={radius}
      loading={isLoading}
      disabled={isLoading || props.disabled}
      onClick={onClick}
      gradient={
        isGradient
          ? {
              from: color("primary.8"),
              to: color("primary.6"),
              deg: 45,
            }
          : props.gradient
      }
      variant={isGradient ? "gradient" : props.variant}
      styles={{
        ...props.styles,
        label: {
          fontSize,
          ...(props.styles || ({} as any)).label,
        },
      }}
      color={getColor(props.color)}
    >
      {props.label ?? children}
    </ButtonMantine>
  );
};
